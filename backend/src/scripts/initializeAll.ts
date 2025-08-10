import mongoose from 'mongoose';
import { initializeCategories } from './initCategories';
import { initializeOrders } from './initOrders';
import { initializeOffers } from './initializeOffers';

async function initializeAll() {
  try {
    console.log('🚀 Iniciando inicialización completa de la base de datos...\n');
    
    // Conectar a MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/makers-tech-chatbot';
    
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Conectado a MongoDB\n');
    
    // Ejecutar scripts en orden de dependencias
    console.log('📋 Orden de ejecución:');
    console.log('   1. Categorías (base para productos y ofertas)');
    console.log('   2. Órdenes (requiere usuarios y productos)');
    console.log('   3. Ofertas (requiere productos y categorías)\n');
    
    // 1. Inicializar categorías primero
    console.log('='.repeat(50));
    console.log('1️⃣ INICIALIZANDO CATEGORÍAS');
    console.log('='.repeat(50));
    await initializeCategories();
    
    // 2. Inicializar órdenes
    console.log('\n' + '='.repeat(50));
    console.log('2️⃣ INICIALIZANDO ÓRDENES');
    console.log('='.repeat(50));
    await initializeOrders();
    
    // 3. Inicializar ofertas
    console.log('\n' + '='.repeat(50));
    console.log('3️⃣ INICIALIZANDO OFERTAS');
    console.log('='.repeat(50));
    await initializeOffers();
    
    console.log('\n' + '🎉 ¡INICIALIZACIÓN COMPLETA EXITOSA! 🎉');
    console.log('\n📊 Resumen de la base de datos:');
    
    // Mostrar resumen final
    const CategoryModel = (await import('../models/Category')).CategoryModel;
    const OrderModel = (await import('../models/Order')).OrderModel;
    const OfferModel = (await import('../models/Offer')).OfferModel;
    const UserModel = (await import('../models/User')).UserModel;
    const ProductModel = (await import('../models/User')).UserModel;
    
    try {
      const totalCategories = await CategoryModel.countDocuments();
      const totalOrders = await OrderModel.countDocuments();
      const totalOffers = await OfferModel.countDocuments();
      
      console.log(`   📁 Categorías: ${totalCategories}`);
      console.log(`   📦 Órdenes: ${totalOrders}`);
      console.log(`   🎯 Ofertas: ${totalOffers}`);
      
    } catch (error) {
      console.log('   ⚠️ No se pudo obtener el resumen completo');
    }
    
    console.log('\n✨ La base de datos está lista para usar');
    console.log('   Puedes acceder a las vistas administrativas:');
    console.log('   - /admin/categories - Gestión de categorías');
    console.log('   - /admin/orders - Gestión de órdenes');
    console.log('   - /admin/offers - Gestión de ofertas');
    console.log('   - /admin/users - Gestión de usuarios');
    console.log('   - /admin/products - Gestión de productos');
    
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Conexión a la base de datos cerrada');
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeAll();
}

export { initializeAll };
