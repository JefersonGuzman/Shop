import 'dotenv/config';
import { connectToDatabase, disconnectFromDatabase } from '../config/database';
import { UserModel } from '../models/User';
import bcrypt from 'bcrypt';

async function main() {
  await connectToDatabase();
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@marker-tech.com';
  const pwd = process.env.SEED_ADMIN_PASSWORD || 'admin1124';
  const exists = await UserModel.findOne({ email });
  if (exists) {
    await UserModel.updateOne({ email }, { role: 'admin', isActive: true });
    console.log('✅ Admin ya existía; rol actualizado');
  } else {
    const hash = await bcrypt.hash(pwd, 10);
    await UserModel.create({ email, password: hash, firstName: 'Admin', lastName: 'Root', role: 'admin', isActive: true });
    console.log('✅ Admin creado');
  }
  await disconnectFromDatabase();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});








