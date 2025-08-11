"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function main() {
    await (0, database_1.connectToDatabase)();
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@marker-tech.com';
    const pwd = process.env.SEED_ADMIN_PASSWORD || 'admin1124';
    const exists = await User_1.UserModel.findOne({ email });
    if (exists) {
        await User_1.UserModel.updateOne({ email }, { role: 'admin', isActive: true });
        console.log('✅ Admin ya existía; rol actualizado');
    }
    else {
        const hash = await bcrypt_1.default.hash(pwd, 10);
        await User_1.UserModel.create({ email, password: hash, firstName: 'Admin', lastName: 'Root', role: 'admin', isActive: true });
        console.log('✅ Admin creado');
    }
    await (0, database_1.disconnectFromDatabase)();
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=createAdmin.js.map