import 'dotenv/config';
import { connectToDatabase, disconnectFromDatabase } from '../config/database';
import { ProductModel } from '../models/Product';

async function run(): Promise<void> {
  try {
    await connectToDatabase();
    const count = await ProductModel.countDocuments();
    if (count > 0) {
      console.log('Productos ya existentes, omitiendo seed.');
      await disconnectFromDatabase();
      return;
    }

    const products = [
      {
        name: 'Dell XPS 13',
        brand: 'Dell',
        category: 'laptop',
        price: 1299,
        stock: 8,
        specifications: { processor: 'Intel i7', ram: '16GB', storage: '512GB SSD' },
        images: [],
        description: 'Ultrabook premium de 13"',
        rating: 4.7,
        reviews: 250,
        tags: ['ultrabook', 'premium'],
        sku: 'DELL-XPS13-001',
        isActive: true,
      },
      {
        name: 'MacBook Air M2',
        brand: 'Apple',
        category: 'laptop',
        price: 1199,
        stock: 5,
        specifications: { processor: 'Apple M2', ram: '8GB', storage: '256GB SSD' },
        images: [],
        description: 'Portátil ligero con chip M2',
        rating: 4.8,
        reviews: 300,
        tags: ['apple', 'm2'],
        sku: 'APPLE-MBA-M2-001',
        isActive: true,
      },
      {
        name: 'HP Pavilion 15',
        brand: 'HP',
        category: 'laptop',
        price: 649,
        stock: 12,
        specifications: { processor: 'Intel i5', ram: '8GB', storage: '512GB SSD' },
        images: [],
        description: 'Laptop versátil para uso diario',
        rating: 4.3,
        reviews: 120,
        tags: ['equilibrada'],
        sku: 'HP-PAV-15-001',
        isActive: true,
      },
    ];

    await ProductModel.insertMany(products);
    console.log(`Seed completado: ${products.length} productos insertados.`);
    await disconnectFromDatabase();
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
}

run();


