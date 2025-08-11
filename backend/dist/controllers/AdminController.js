"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_1 = require("../schemas/admin");
const AIConfigService_1 = require("../services/AIConfigService");
const User_1 = require("../models/User");
const Order_1 = require("../models/Order");
const bcrypt_1 = __importDefault(require("bcrypt"));
class AdminController {
    async upsertAIConfig(req, res) {
        try {
            const payload = admin_1.AIConfigSchema.parse(req.body);
            await AIConfigService_1.AIConfigService.upsertConfig(payload);
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ error: error.message || 'Bad request' });
        }
    }
    async getAIConfig(req, res) {
        try {
            const provider = req.query.provider || undefined;
            const cfg = await AIConfigService_1.AIConfigService.getActiveConfig(provider);
            res.json({ success: true, data: cfg });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Server error' });
        }
    }
    // ---- Users (Admin) ----
    async listUsers(req, res) {
        const { role, q } = req.query;
        const filter = {};
        if (role)
            filter.role = role;
        if (q)
            filter.$or = [
                { email: { $regex: q, $options: 'i' } },
                { firstName: { $regex: q, $options: 'i' } },
                { lastName: { $regex: q, $options: 'i' } },
            ];
        const users = await User_1.UserModel.find(filter).sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: users });
    }
    async createEmployee(req, res) {
        const payload = admin_1.AdminCreateEmployeeSchema.parse(req.body);
        const exists = await User_1.UserModel.findOne({ email: payload.email });
        if (exists) {
            res.status(409).json({ error: 'Email ya registrado' });
            return;
        }
        const hash = await bcrypt_1.default.hash(payload.password, 10);
        const user = await User_1.UserModel.create({ ...payload, password: hash, role: 'employee', isActive: true });
        res.status(201).json({ success: true, data: user });
    }
    async updateUser(req, res) {
        const { id } = req.params;
        const updates = admin_1.AdminUpdateUserSchema.parse(req.body);
        // Hardening: solo un admin puede asignar role 'admin'
        if (updates.role === 'admin' && req.user?.role !== 'admin') {
            res.status(403).json({ error: 'No autorizado para elevar a admin' });
            return;
        }
        const user = await User_1.UserModel.findByIdAndUpdate(id, updates, { new: true });
        res.json({ success: true, data: user });
    }
    async deleteUser(req, res) {
        const { id } = req.params;
        await User_1.UserModel.findByIdAndUpdate(id, { isActive: false });
        res.json({ success: true });
    }
    // ---- Orders (Admin) ----
    async listOrders(req, res) {
        try {
            const { page, limit, sortBy, sortOrder, q, status, paymentStatus } = req.query;
            // Validar parámetros requeridos
            if (!page || !limit) {
                res.status(400).json({ error: 'Los parámetros page y limit son requeridos' });
                return;
            }
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;
            // Build filter
            const filter = {};
            if (q) {
                filter.$or = [
                    { orderNumber: { $regex: q, $options: 'i' } },
                    { 'customer.firstName': { $regex: q, $options: 'i' } },
                    { 'customer.lastName': { $regex: q, $options: 'i' } },
                    { 'customer.email': { $regex: q, $options: 'i' } },
                ];
            }
            if (status && status !== 'all')
                filter.status = status;
            if (paymentStatus && paymentStatus !== 'all')
                filter.paymentStatus = paymentStatus;
            // Build sort
            const sort = {};
            const sortByField = sortBy || 'createdAt';
            const sortOrderField = sortOrder || 'desc';
            sort[sortByField] = sortOrderField === 'asc' ? 1 : -1;
            // Get total count
            const total = await Order_1.OrderModel.countDocuments(filter);
            const totalPages = Math.ceil(total / limitNum);
            // Get orders with pagination
            const orders = await Order_1.OrderModel.find(filter)
                .populate('customer', 'firstName lastName email')
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
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Error al obtener las órdenes' });
        }
    }
    async updateOrder(req, res) {
        try {
            const { id } = req.params;
            const { status, paymentStatus, notes } = req.body;
            const updates = {};
            if (status)
                updates.status = status;
            if (paymentStatus)
                updates.paymentStatus = paymentStatus;
            if (notes !== undefined)
                updates.notes = notes;
            const order = await Order_1.OrderModel.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true }).populate('customer', 'firstName lastName email')
                .populate('items.product', 'name price images');
            if (!order) {
                res.status(404).json({ error: 'Orden no encontrada' });
                return;
            }
            res.json({ success: true, data: order });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Error al actualizar la orden' });
        }
    }
    async deleteOrder(req, res) {
        try {
            const { id } = req.params;
            const order = await Order_1.OrderModel.findByIdAndDelete(id);
            if (!order) {
                res.status(404).json({ error: 'Orden no encontrada' });
                return;
            }
            res.json({ success: true, message: 'Orden eliminada exitosamente' });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Error al eliminar la orden' });
        }
    }
}
exports.AdminController = AdminController;
exports.default = AdminController;
//# sourceMappingURL=AdminController.js.map