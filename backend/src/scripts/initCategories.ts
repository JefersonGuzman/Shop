import mongoose, { Types } from 'mongoose';
import { CategoryModel } from '../models/Category';

const categoriesData = [
  {
    name: 'Electrónicos',
    description: 'Productos electrónicos y tecnológicos',
    icon: 'laptop',
    color: '#3B82F6',
    sortOrder: 1,
    isFeatured: true,
    subcategories: [
      {
        name: 'Computadoras',
        description: 'Laptops, desktops y accesorios',
        icon: 'laptop',
        color: '#1E40AF',
        sortOrder: 1,
      },
      {
        name: 'Smartphones',
        description: 'Teléfonos móviles y accesorios',
        icon: 'smartphone',
        color: '#1E40AF',
        sortOrder: 2,
      },
      {
        name: 'Tablets',
        description: 'Tablets y iPads',
        icon: 'tablet',
        color: '#1E40AF',
        sortOrder: 3,
      },
      {
        name: 'Audio',
        description: 'Auriculares, altavoces y sistemas de sonido',
        icon: 'headphones',
        color: '#1E40AF',
        sortOrder: 4,
      }
    ]
  },
  {
    name: 'Ropa y Accesorios',
    description: 'Moda y accesorios para todas las edades',
    icon: 'shirt',
    color: '#EC4899',
    sortOrder: 2,
    isFeatured: true,
    subcategories: [
      {
        name: 'Ropa Masculina',
        description: 'Camisetas, pantalones, chaquetas para hombres',
        icon: 'user',
        color: '#BE185D',
        sortOrder: 1,
      },
      {
        name: 'Ropa Femenina',
        description: 'Vestidos, blusas, faldas para mujeres',
        icon: 'user',
        color: '#BE185D',
        sortOrder: 2,
      },
      {
        name: 'Calzado',
        description: 'Zapatos, zapatillas y botas',
        icon: 'footprints',
        color: '#BE185D',
        sortOrder: 3,
      },
      {
        name: 'Accesorios',
        description: 'Bolsos, cinturones, joyería',
        icon: 'bag',
        color: '#BE185D',
        sortOrder: 4,
      }
    ]
  },
  {
    name: 'Hogar y Jardín',
    description: 'Productos para el hogar y jardinería',
    icon: 'home',
    color: '#10B981',
    sortOrder: 3,
    isFeatured: false,
    subcategories: [
      {
        name: 'Muebles',
        description: 'Muebles para todas las habitaciones',
        icon: 'chair',
        color: '#047857',
        sortOrder: 1,
      },
      {
        name: 'Decoración',
        description: 'Elementos decorativos para el hogar',
        icon: 'image',
        color: '#047857',
        sortOrder: 2,
      },
      {
        name: 'Jardinería',
        description: 'Herramientas y plantas para el jardín',
        icon: 'flower',
        color: '#047857',
        sortOrder: 3,
      },
      {
        name: 'Cocina',
        description: 'Utensilios y electrodomésticos de cocina',
        icon: 'utensils',
        color: '#047857',
        sortOrder: 4,
      }
    ]
  },
  {
    name: 'Deportes y Aire Libre',
    description: 'Equipamiento deportivo y actividades al aire libre',
    icon: 'activity',
    color: '#F59E0B',
    sortOrder: 4,
    isFeatured: false,
    subcategories: [
      {
        name: 'Fitness',
        description: 'Equipamiento para gimnasio y ejercicio',
        icon: 'dumbbell',
        color: '#D97706',
        sortOrder: 1,
      },
      {
        name: 'Running',
        description: 'Zapatillas y ropa para correr',
        icon: 'zap',
        color: '#D97706',
        sortOrder: 2,
      },
      {
        name: 'Camping',
        description: 'Equipamiento para camping y senderismo',
        icon: 'tent',
        color: '#D97706',
        sortOrder: 3,
      },
      {
        name: 'Deportes de Equipo',
        description: 'Balones, raquetas y equipamiento deportivo',
        icon: 'target',
        color: '#D97706',
        sortOrder: 4,
      }
    ]
  },
  {
    name: 'Libros y Entretenimiento',
    description: 'Libros, música, películas y juegos',
    icon: 'book',
    color: '#8B5CF6',
    sortOrder: 5,
    isFeatured: false,
    subcategories: [
      {
        name: 'Libros',
        description: 'Ficción, no ficción y libros educativos',
        icon: 'book-open',
        color: '#7C3AED',
        sortOrder: 1,
      },
      {
        name: 'Música',
        description: 'CDs, vinilos y instrumentos musicales',
        icon: 'music',
        color: '#7C3AED',
        sortOrder: 2,
      },
      {
        name: 'Películas y Series',
        description: 'DVDs, Blu-rays y streaming',
        icon: 'video',
        color: '#7C3AED',
        sortOrder: 3,
      },
      {
        name: 'Videojuegos',
        description: 'Consolas, juegos y accesorios gaming',
        icon: 'gamepad-2',
        color: '#7C3AED',
        sortOrder: 4,
      }
    ]
  }
];

async function initializeCategories() {
  try {
    console.log('🔄 Inicializando categorías...');
    
    // Limpiar categorías existentes
    await CategoryModel.deleteMany({});
    console.log('✅ Categorías existentes eliminadas');
    
    // Crear categorías principales
    for (const categoryData of categoriesData) {
      const { subcategories, ...mainCategoryData } = categoryData;
      
      // Crear categoría principal
      const mainCategory = await CategoryModel.create(mainCategoryData);
      console.log(`✅ Categoría creada: ${mainCategory.name}`);
      
      // Crear subcategorías
      for (const subcategoryData of subcategories) {
        const subcategory = await CategoryModel.create({
          ...subcategoryData,
          parentCategory: mainCategory._id,
          level: 1
        });
        console.log(`  └─ Subcategoría creada: ${subcategory.name}`);
        
        // Agregar subcategoría a la categoría principal
        if (!mainCategory.subcategories) {
          mainCategory.subcategories = [];
        }
        mainCategory.subcategories.push(subcategory._id as Types.ObjectId);
      }
      
      // Guardar la categoría principal con las referencias a subcategorías
      await mainCategory.save();
    }
    
    console.log('🎉 Todas las categorías han sido inicializadas exitosamente');
    
    // Mostrar resumen
    const totalCategories = await CategoryModel.countDocuments();
    const mainCategories = await CategoryModel.countDocuments({ level: 0 });
    const subCategories = await CategoryModel.countDocuments({ level: 1 });
    
    console.log(`\n📊 Resumen:`);
    console.log(`   Total de categorías: ${totalCategories}`);
    console.log(`   Categorías principales: ${mainCategories}`);
    console.log(`   Subcategorías: ${subCategories}`);
    
  } catch (error) {
    console.error('❌ Error al inicializar categorías:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  // Conectar a MongoDB
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/makers-tech-chatbot';
  
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('🔌 Conectado a MongoDB');
      return initializeCategories();
    })
    .catch((error) => {
      console.error('❌ Error de conexión:', error);
      process.exit(1);
    });
}

export { initializeCategories };
