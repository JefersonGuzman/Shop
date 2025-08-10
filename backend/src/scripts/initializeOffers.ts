import mongoose, { Types } from 'mongoose';
import { OfferModel } from '../models/Offer';
import { ProductModel } from '../models/Product';
import { CategoryModel } from '../models/Category';

const sampleOffers = [
  {
    title: 'Descuento de Lanzamiento',
    description: '¡Gran descuento para nuevos productos!',
    discountPercent: 20,
    startsAt: new Date('2024-01-01'),
    endsAt: new Date('2024-12-31'),
    isActive: true,
    type: 'percentage' as const,
    maxUses: 1000,
    currentUses: 0,
    minOrderValue: 50,
    isFeatured: true,
    priority: 1,
    conditions: 'Válido solo para productos seleccionados',
    terms: 'No acumulable con otras ofertas'
  },
  {
    title: 'Oferta Flash - Smartphones',
    description: 'Descuento especial en smartphones por tiempo limitado',
    discountPercent: 15,
    startsAt: new Date('2024-12-01'),
    endsAt: new Date('2024-12-15'),
    isActive: true,
    type: 'percentage' as const,
    maxUses: 500,
    currentUses: 0,
    minOrderValue: 200,
    isFeatured: true,
    priority: 2,
    conditions: 'Solo para smartphones',
    terms: 'Oferta válida hasta agotar existencias'
  },
  {
    title: 'Descuento Fijo en Laptops',
    description: 'Ahorra $100 en todas las laptops',
    priceOff: 100,
    startsAt: new Date('2024-01-01'),
    endsAt: new Date('2024-06-30'),
    isActive: true,
    type: 'fixed' as const,
    maxUses: 200,
    currentUses: 0,
    minOrderValue: 500,
    isFeatured: false,
    priority: 3,
    conditions: 'Aplicable solo en laptops',
    terms: 'No válido en productos en oferta'
  },
  {
    title: 'Oferta de Verano',
    description: 'Descuentos especiales para la temporada de verano',
    discountPercent: 25,
    startsAt: new Date('2024-06-01'),
    endsAt: new Date('2024-08-31'),
    isActive: true,
    type: 'percentage' as const,
    maxUses: 1500,
    currentUses: 0,
    minOrderValue: 75,
    isFeatured: true,
    priority: 1,
    conditions: 'Válido en productos seleccionados',
    terms: 'Descuento máximo de $500 por orden'
  },
  {
    title: 'Descuento para Estudiantes',
    description: 'Oferta especial para estudiantes con credencial válida',
    discountPercent: 10,
    startsAt: new Date('2024-01-01'),
    endsAt: new Date('2024-12-31'),
    isActive: true,
    type: 'percentage' as const,
    maxUses: 2000,
    currentUses: 0,
    minOrderValue: 25,
    isFeatured: false,
    priority: 4,
    conditions: 'Requiere credencial de estudiante',
    terms: 'Válido solo para compras en línea'
  }
];

async function initializeOffers() {
  try {
    console.log('🔄 Inicializando ofertas...');
    
    // Limpiar ofertas existentes
    await OfferModel.deleteMany({});
    console.log('✅ Ofertas existentes eliminadas');
    
    // Obtener productos para asignar a las ofertas
    const products = await ProductModel.find({ isActive: true }).limit(20);
    if (products.length === 0) {
      console.log('⚠️ No se encontraron productos. Creando productos de ejemplo...');
      // Crear productos de ejemplo
      const sampleProducts = [
        {
          name: 'Laptop Gaming Pro',
          brand: 'TechBrand',
          category: 'Electrónicos',
          price: 1299.99,
          stock: 15,
          specifications: { ram: '16GB', storage: '512GB SSD', processor: 'Intel i7' },
          images: ['https://via.placeholder.com/300x200?text=Laptop'],
          description: 'Laptop gaming de alto rendimiento',
          rating: 4.5,
          reviews: 25,
          tags: ['gaming', 'laptop', 'high-performance'],
          sku: 'LAP-001',
          isActive: true
        },
        {
          name: 'Smartphone Galaxy S24',
          brand: 'Samsung',
          category: 'Electrónicos',
          price: 899.99,
          stock: 30,
          specifications: { ram: '8GB', storage: '128GB', camera: '50MP' },
          images: ['https://via.placeholder.com/300x200?text=Smartphone'],
          description: 'Smartphone de última generación',
          rating: 4.8,
          reviews: 150,
          tags: ['smartphone', 'android', 'camera'],
          sku: 'PHN-001',
          isActive: true
        },
        {
          name: 'Tablet iPad Pro',
          brand: 'Apple',
          category: 'Electrónicos',
          price: 1099.99,
          stock: 20,
          specifications: { ram: '8GB', storage: '256GB', screen: '12.9"' },
          images: ['https://via.placeholder.com/300x200?text=Tablet'],
          description: 'Tablet profesional para creativos',
          rating: 4.9,
          reviews: 89,
          tags: ['tablet', 'apple', 'creative'],
          sku: 'TAB-001',
          isActive: true
        }
      ];
      
      for (const productData of sampleProducts) {
        await ProductModel.create(productData);
      }
      
      const newProducts = await ProductModel.find({ isActive: true }).limit(20);
      products.push(...newProducts);
      console.log(`✅ ${newProducts.length} productos creados`);
    }
    
    // Obtener categorías para asignar a las ofertas
    const categories = await CategoryModel.find({ isActive: true }).limit(10);
    
    // Crear ofertas con productos y categorías asignados
    for (let i = 0; i < sampleOffers.length; i++) {
      const offerData = sampleOffers[i];
      
      // Asignar productos aleatorios a cada oferta
      const numProducts = Math.floor(Math.random() * 5) + 1; // 1-5 productos
      const selectedProducts: Types.ObjectId[] = [];
      for (let j = 0; j < numProducts && j < products.length; j++) {
        const randomIndex = Math.floor(Math.random() * products.length);
        if (!selectedProducts.includes(products[randomIndex]._id as Types.ObjectId)) {
          selectedProducts.push(products[randomIndex]._id as Types.ObjectId);
        }
      }
      
      // Asignar categorías aleatorias si existen
      const selectedCategories: Types.ObjectId[] = [];
      if (categories.length > 0) {
        const numCategories = Math.floor(Math.random() * 3) + 1; // 1-3 categorías
        for (let j = 0; j < numCategories && j < categories.length; j++) {
          const randomIndex = Math.floor(Math.random() * categories.length);
          if (!selectedCategories.includes(categories[randomIndex]._id as Types.ObjectId)) {
            selectedCategories.push(categories[randomIndex]._id as Types.ObjectId);
          }
        }
      }
      
      // Crear la oferta
      const offer = await OfferModel.create({
        ...offerData,
        productIds: selectedProducts,
        applicableCategories: selectedCategories
      });
      
      console.log(`✅ Oferta creada: ${offer.title} - ${offer.type === 'percentage' ? `${offer.discountPercent}%` : `$${offer.priceOff}`}`);
      console.log(`   Productos asignados: ${selectedProducts.length}`);
      console.log(`   Categorías aplicables: ${selectedCategories.length}`);
    }
    
    console.log('🎉 Todas las ofertas han sido inicializadas exitosamente');
    
    // Mostrar resumen
    const totalOffers = await OfferModel.countDocuments();
    const activeOffers = await OfferModel.countDocuments({ isActive: true });
    const featuredOffers = await OfferModel.countDocuments({ isFeatured: true });
    const percentageOffers = await OfferModel.countDocuments({ type: 'percentage' });
    const fixedOffers = await OfferModel.countDocuments({ type: 'fixed' });
    
    console.log(`\n📊 Resumen de Ofertas:`);
    console.log(`   Total de ofertas: ${totalOffers}`);
    console.log(`   Ofertas activas: ${activeOffers}`);
    console.log(`   Ofertas destacadas: ${featuredOffers}`);
    console.log(`   Descuentos porcentuales: ${percentageOffers}`);
    console.log(`   Descuentos fijos: ${fixedOffers}`);
    
  } catch (error) {
    console.error('❌ Error al inicializar ofertas:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  // Conectar a MongoDB
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/makers-tech-chatbot';
  
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('🔌 Conectado a MongoDB');
      return initializeOffers();
    })
    .catch((error) => {
      console.error('❌ Error de conexión:', error);
      process.exit(1);
    });
}

export { initializeOffers };
