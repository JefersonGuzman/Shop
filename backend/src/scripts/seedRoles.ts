import 'dotenv/config';
import { connectToDatabase, disconnectFromDatabase } from '../config/database';
import { RoleModel } from '../models/Role';

async function main() {
  await connectToDatabase();
  const roles = [
    { key: 'admin', name: 'Administrador', permissions: ['*'] },
    { key: 'employee', name: 'Empleado', permissions: ['products:read', 'orders:read', 'offers:read', 'offers:write'] },
    { key: 'customer', name: 'Cliente', permissions: [] },
  ];
  for (const r of roles) {
    await RoleModel.updateOne({ key: r.key }, r, { upsert: true });
  }
  console.log('✅ Roles seed OK');
  await disconnectFromDatabase();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});






