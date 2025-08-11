import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AIConfigSchema, AdminCreateEmployeeSchema, AdminUpdateUserSchema } from '../schemas/admin';
import { AIConfigService } from '../services/AIConfigService';
import { UserModel } from '../models/User';
import { OrderModel } from '../models/Order';
import bcrypt from 'bcrypt';

export class AdminController {
  async upsertAIConfig(req: Request, res: Response): Promise<void> {
    try {
      const payload = AIConfigSchema.parse(req.body);
      await AIConfigService.upsertConfig(payload);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Bad request' });
    }
  }

  async getSalesAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { from, to } = req.query as { from?: string; to?: string };
      const toDate = to ? new Date(to) : new Date();
      const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Normalizar horas
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);

      const matchStage = {
        $match: {
          createdAt: { $gte: start, $lte: end },
          paymentStatus: 'paid',
          status: { $nin: ['cancelled'] },
        },
      } as const;

      // Ventas por día (a nivel orden)
      const perDay = await OrderModel.aggregate([
        matchStage,
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]).exec();

      // Ventas por categoría y por producto (a nivel item)
      const itemAgg = await OrderModel.aggregate([
        matchStage,
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        {
          $project: {
            productId: '$product._id',
            productName: '$product.name',
            category: '$product.category',
            quantity: '$items.quantity',
            subtotal: '$items.subtotal',
          },
        },
      ]).exec();

      const byCategoryMap = new Map<string, { category: string; total: number; quantity: number }>();
      const byProductMap = new Map<string, { productId: string; name: string; total: number; quantity: number }>();

      for (const r of itemAgg as any[]) {
        const catKey = String(r.category || 'Uncategorized');
        const cat = byCategoryMap.get(catKey) || { category: catKey, total: 0, quantity: 0 };
        cat.total += r.subtotal || 0;
        cat.quantity += r.quantity || 0;
        byCategoryMap.set(catKey, cat);

        const prodKey = String(r.productId);
        const prod = byProductMap.get(prodKey) || { productId: prodKey, name: r.productName || 'Unnamed', total: 0, quantity: 0 };
        prod.total += r.subtotal || 0;
        prod.quantity += r.quantity || 0;
        byProductMap.set(prodKey, prod);
      }

      const salesByDay = (perDay as any[]).map((d) => ({ date: d._id, total: d.total, orders: d.orders }));
      const salesByCategory = Array.from(byCategoryMap.values()).sort((a, b) => b.total - a.total);
      const salesByProduct = Array.from(byProductMap.values()).sort((a, b) => b.total - a.total);

      res.json({
        success: true,
        data: {
          range: { from: start.toISOString(), to: end.toISOString() },
          salesByDay,
          salesByCategory,
          salesByProduct,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener analítica de ventas' });
    }
  }

  async getAIConfig(req: Request, res: Response): Promise<void> {
    try {
      const provider = (req.query.provider as 'groq' | 'openai') || undefined;
      const cfg = await AIConfigService.getActiveConfig(provider);
      res.json({ success: true, data: cfg });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  // ---- Users (Admin) ----
  async listUsers(req: Request, res: Response): Promise<void> {
    const { role, q } = req.query as { role?: string; q?: string };
    const filter: any = {};
    if (role) filter.role = role;
    if (q) filter.$or = [
      { email: { $regex: q, $options: 'i' } },
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
    ];
    const users = await UserModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: users });
  }

  async createEmployee(req: Request, res: Response): Promise<void> {
    const payload = AdminCreateEmployeeSchema.parse(req.body);
    const exists = await UserModel.findOne({ email: payload.email });
    if (exists) {
      res.status(409).json({ error: 'Email ya registrado' });
      return;
    }
    const hash = await bcrypt.hash(payload.password, 10);
    const user = await UserModel.create({ ...payload, password: hash, role: 'employee', isActive: true });
    res.status(201).json({ success: true, data: user });
  }

  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const updates = AdminUpdateUserSchema.parse(req.body);
    // Hardening: solo un admin puede asignar role 'admin'
    if (updates.role === 'admin' && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'No autorizado para elevar a admin' });
      return;
    }
    const user = await UserModel.findByIdAndUpdate(id, updates, { new: true });
    res.json({ success: true, data: user });
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await UserModel.findByIdAndUpdate(id, { isActive: false });
    res.json({ success: true });
  }

  // ---- Orders (Admin) ----
  async listOrders(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder, q, status, paymentStatus } = req.query as {
        page?: string;
        limit?: string;
        sortBy?: string;
        sortOrder?: string;
        q?: string;
        status?: string;
        paymentStatus?: string;
      };

      // Validar parámetros requeridos
      if (!page || !limit) {
        res.status(400).json({ error: 'Los parámetros page y limit son requeridos' });
        return;
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = {};
      if (q) {
        filter.$or = [
          { orderNumber: { $regex: q, $options: 'i' } },
          { 'customer.firstName': { $regex: q, $options: 'i' } },
          { 'customer.lastName': { $regex: q, $options: 'i' } },
          { 'customer.email': { $regex: q, $options: 'i' } },
        ];
      }
      if (status && status !== 'all') filter.status = status;
      if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus;

      // Build sort
      const sort: any = {};
      const sortByField = sortBy || 'createdAt';
      const sortOrderField = sortOrder || 'desc';
      sort[sortByField] = sortOrderField === 'asc' ? 1 : -1;

      // Get total count
      const total = await OrderModel.countDocuments(filter);
      const totalPages = Math.ceil(total / limitNum);

      // Get orders with pagination
      const orders = await OrderModel.find(filter)
        .populate('customer', 'firstName lastName email role')
        .populate('items.product', 'name price category images')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean();

      res.json({
        success: true,
        data: orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener las órdenes' });
    }
  }

  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, paymentStatus, notes } = req.body;

      const updates: any = {};
      if (status) updates.status = status;
      if (paymentStatus) updates.paymentStatus = paymentStatus;
      if (notes !== undefined) updates.notes = notes;

      const order = await OrderModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      ).populate('customer', 'firstName lastName email')
        .populate('items.product', 'name price images');

      if (!order) {
        res.status(404).json({ error: 'Orden no encontrada' });
        return;
      }

      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al actualizar la orden' });
    }
  }

  async deleteOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await OrderModel.findByIdAndDelete(id);
      
      if (!order) {
        res.status(404).json({ error: 'Orden no encontrada' });
        return;
      }

      res.json({ success: true, message: 'Orden eliminada exitosamente' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al eliminar la orden' });
    }
  }
}
export default AdminController;


