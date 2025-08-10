import { Schema, model, Document, Types } from 'mongoose';

export interface OrderItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderDocument extends Document {
  orderNumber: string;
  customer: Types.ObjectId;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  shippingAddress: ShippingAddress;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentTransactionId?: string;
  notes?: string;
  estimatedDeliveryDate?: Date;
  trackingNumber?: string;
  isActive: boolean;
}

const orderItemSchema = new Schema<OrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
});

const shippingAddressSchema = new Schema<ShippingAddress>({
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zipCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
});

const orderSchema = new Schema<OrderDocument>(
  {
    orderNumber: { 
      type: String, 
      required: false, 
      unique: true, 
      trim: true 
    },
    customer: { 
      type: Schema.Types.ObjectId, 
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
  },
  { timestamps: true }
);

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
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const lastOrder = await (this.constructor as any).findOne({}, {}, { sort: { 'createdAt': -1 } });
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

export const OrderModel = model<OrderDocument>('Order', orderSchema);
