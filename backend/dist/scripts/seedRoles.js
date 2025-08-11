"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const database_1 = require("../config/database");
const Role_1 = require("../models/Role");
async function main() {
    await (0, database_1.connectToDatabase)();
    const roles = [
        { key: 'admin', name: 'Administrador', permissions: ['*'] },
        { key: 'employee', name: 'Empleado', permissions: ['products:read', 'orders:read', 'offers:read', 'offers:write'] },
        { key: 'customer', name: 'Cliente', permissions: [] },
    ];
    for (const r of roles) {
        await Role_1.RoleModel.updateOne({ key: r.key }, r, { upsert: true });
    }
    console.log('✅ Roles seed OK');
    await (0, database_1.disconnectFromDatabase)();
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seedRoles.js.map