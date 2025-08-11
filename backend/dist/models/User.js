"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin', 'employee', 'customer'], default: 'customer' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
}, { timestamps: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
exports.UserModel = (0, mongoose_1.model)('User', userSchema);
//# sourceMappingURL=User.js.map