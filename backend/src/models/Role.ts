import { Schema, model, Document } from 'mongoose';

export interface RoleDocument extends Document {
  key: 'admin' | 'employee' | 'customer';
  name: string;
  permissions: string[];
}

const roleSchema = new Schema<RoleDocument>({
  key: { type: String, enum: ['admin', 'employee', 'customer'], required: true, unique: true },
  name: { type: String, required: true },
  permissions: { type: [String], default: [] },
});

roleSchema.index({ key: 1 }, { unique: true });

export const RoleModel = model<RoleDocument>('Role', roleSchema);








