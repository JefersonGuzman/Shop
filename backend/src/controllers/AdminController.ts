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
        .populate('items.product', 'name price images')
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


