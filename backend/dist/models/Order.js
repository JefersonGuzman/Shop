"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModel = void 0;
const mongoose_1 = require("mongoose");
const orderItemSchema = new mongoose_1.Schema({
    product: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
});
const shippingAddressSchema = new mongoose_1.Schema({
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
});
const orderSchema = new mongoose_1.Schema({
    orderNumber: {
        type: String,
        required: false,
        unique: true,
        trim: true
    },
    customer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    shippingCost: {
        type: Number,
        default: 0,
        min: 0
    },
    shippingAddress: {
        type: shippingAddressSchema,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        trim: true
    },
    paymentTransactionId: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    estimatedDeliveryDate: {
        type: Date
    },
    trackingNumber: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });
// Índices para optimizar consultas
// orderNumber ya es unique, no necesita índice adicional
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.product': 1 });
orderSchema.index({ total: 1 });
orderSchema.index({ isActive: 1 });
// Middleware para generar número de orden automáticamente
orderSchema.pre('save', async function (next) {
    if (this.isNew && !this.orderNumber) {
        const lastOrder = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
        const lastNumber = lastOrder ? parseInt(lastOrder.orderNumber.replace('ORD-', '')) : 0;
        this.orderNumber = `ORD-${String(lastNumber + 1).padStart(6, '0')}`;
    }
    // Calcular total si no está establecido
    if (this.items && this.items.length > 0) {
        this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
        this.total = this.subtotal + this.tax + this.shippingCost;
    }
    next();
});
exports.OrderModel = (0, mongoose_1.model)('Order', orderSchema);
//# sourceMappingURL=Order.js.map