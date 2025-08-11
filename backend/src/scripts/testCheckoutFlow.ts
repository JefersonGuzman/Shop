import 'dotenv/config';
import { createServer } from 'http';
import supertest from 'supertest';
import { randomUUID } from 'crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { createApp } from '../app';
import { connectToDatabase, disconnectFromDatabase } from '../config/database';
import { ProductModel } from '../models/Product';
import { OrderModel } from '../models/Order';
import { UserModel } from '../models/User';

async function run(): Promise<void> {
  // Asegurar secretos JWT durante la prueba
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';

  // Levantar Mongo en memoria para no depender de Atlas
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  await connectToDatabase();

  const app = createApp();
  const server = createServer(app);
  const request = supertest(server);

  const unique = randomUUID().slice(0, 8);
  const email = `test_checkout_${unique}@example.com`;
  const password = 'Test1234!';

  let accessToken = '';
  let createdProductId = '';
  let createdOrderId = '';
  let createdUserId = '';

  try {
    // 1) Registrar usuario de prueba
    const regRes = await request
      .post('/api/auth/register')
      .send({ firstName: 'Test', lastName: 'Checkout', email, password });
    if (regRes.status !== 201 && regRes.status !== 200) {
      throw new Error(`Fallo registro: ${regRes.status} ${JSON.stringify(regRes.body)}`);
    }

    // 2) Login para obtener token
    const loginRes = await request.post('/api/auth/login').send({ email, password });
    if (loginRes.status !== 200) {
      throw new Error(`Fallo login: ${loginRes.status} ${JSON.stringify(loginRes.body)}`);
    }
    accessToken = loginRes.body?.accessToken || '';
    createdUserId = loginRes.body?.user?._id || loginRes.body?.user?.id || '';
    if (!accessToken) throw new Error('No se obtuvo accessToken en login');

    // 3) Crear un producto directamente en DB para el pedido
    const product = await ProductModel.create({
      name: `Producto Test ${unique}`,
      description: 'Producto de prueba para checkout',
      price: 19990,
      stock: 10,
      images: [],
      category: 'TestCategory',
      brand: 'TestBrand',
      sku: `TEST-SKU-${unique}`,
      isActive: true,
    } as any);
    createdProductId = String(product._id);

    // 4) Crear orden vía API autenticada
    const payload = {
      items: [{ productId: createdProductId, quantity: 2 }],
      shippingAddress: {
        street: 'Calle 123',
        city: 'Ciudad',
        state: 'Estado',
        zipCode: '00000',
        country: 'CO',
      },
      paymentMethod: 'card',
    };

    const orderRes = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload);

    if (orderRes.status !== 201) {
      throw new Error(`Esperado 201 al crear orden, recibido ${orderRes.status}: ${JSON.stringify(orderRes.body)}`);
    }

    const orderNumber = orderRes.body?.data?.orderNumber;
    createdOrderId = orderRes.body?.data?.orderId;
    if (!orderNumber || !createdOrderId) {
      throw new Error(`Respuesta de orden inválida: ${JSON.stringify(orderRes.body)}`);
    }

    // 5) Verificar que la orden exista en DB
    const orderDb = await OrderModel.findById(createdOrderId).lean();
    if (!orderDb) throw new Error('La orden no se guardó en la base de datos');

    // 6) Verificar que stock disminuyó
    const productAfter = await ProductModel.findById(createdProductId).lean();
    if (!productAfter || (productAfter.stock as number) !== 8) {
      throw new Error(`El stock no disminuyó correctamente. Stock actual: ${productAfter?.stock}`);
    }

    console.log('✅ Prueba de checkout OK. Orden creada:', orderNumber);
  } finally {
    // Cleanup
    try {
      if (createdOrderId) await OrderModel.deleteOne({ _id: createdOrderId });
    } catch {}
    try {
      if (createdProductId) await ProductModel.deleteOne({ _id: createdProductId });
    } catch {}
    try {
      if (createdUserId) await UserModel.deleteOne({ _id: createdUserId });
      else await UserModel.deleteOne({ email });
    } catch {}

    await disconnectFromDatabase();
    try { await mongoServer.stop(); } catch {}
    server.close();
  }
}

run().catch((err) => {
  console.error('❌ Error en prueba de checkout:', err?.message || err);
  process.exit(1);
});


