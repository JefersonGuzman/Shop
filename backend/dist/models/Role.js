"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleModel = void 0;
const mongoose_1 = require("mongoose");
const roleSchema = new mongoose_1.Schema({
    key: { type: String, enum: ['admin', 'employee', 'customer'], required: true, unique: true },
    name: { type: String, required: true },
    permissions: { type: [String], default: [] },
});
roleSchema.index({ key: 1 }, { unique: true });
exports.RoleModel = (0, mongoose_1.model)('Role', roleSchema);
//# sourceMappingURL=Role.js.map