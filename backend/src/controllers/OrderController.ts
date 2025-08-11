import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth';
import { OrderCreateSchema } from '../schemas/order';
import { OrderModel } from '../models/Order';
import { ProductModel } from '../models/Product';

export class OrderController {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = (req.user as any)?.userId || (req.user as any)?.id;
      if (!currentUserId) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const payload = OrderCreateSchema.parse(req.body);

      // Cargar productos y validar stock
      const productIds = payload.items.map((i) => i.productId);
      const products = await ProductModel.find({ _id: { $in: productIds } });
      const productMap = new Map(products.map((p) => [String(p._id), p]));

      for (const it of payload.items) {
        const p = productMap.get(it.productId);
        if (!p) {
          res.status(400).json({ error: `Producto no encontrado: ${it.productId}` });
          return;
        }
        if (p.stock < it.quantity) {
          res.status(400).json({ error: `Stock insuficiente para ${p.name}` });
          return;
        }
      }

      // Construir items y subtotales con precio actual
      const items = payload.items.map((it) => {
        const p = productMap.get(it.productId)!;
        const price = p.price;
        const subtotal = price * it.quantity;
        return {
          product: new Types.ObjectId(it.productId),
          quantity: it.quantity,
          price,
          subtotal,
        };
      });

      const subtotal = items.reduce((s, i) => s + i.subtotal, 0);

      // Crear orden
      const order = await OrderModel.create({
        customer: new Types.ObjectId(currentUserId),
        items,
        subtotal,
        total: subtotal,
        shippingAddress: payload.shippingAddress,
        paymentMethod: payload.paymentMethod,
        paymentStatus: 'paid',
        status: 'confirmed',
      });

      // Disminuir stock (en paralelo)
      await Promise.all(
        payload.items.map((it) =>
          ProductModel.updateOne({ _id: it.productId }, { $inc: { stock: -it.quantity } })
        )
      );

      res.status(201).json({ success: true, data: { orderNumber: order.orderNumber, orderId: order._id } });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Bad request' });
    }
  }

  async myOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = (req.user as any)?.userId || (req.user as any)?.id;
      if (!currentUserId) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const orders = await OrderModel.find({ customer: currentUserId })
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .lean();
      res.json({ success: true, data: orders });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener órdenes' });
    }
  }
}

export default OrderController;


