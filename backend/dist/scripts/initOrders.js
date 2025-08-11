"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeOrders = initializeOrders;
const mongoose_1 = __importDefault(require("mongoose"));
const Order_1 = require("../models/Order");
const User_1 = require("../models/User");
const Product_1 = require("../models/Product");
const sampleOrders = [
    {
        customer: null, // Se asignará dinámicamente
        items: [], // Se asignará dinámicamente
        status: 'delivered',
        total: 1299.99,
        subtotal: 1199.99,
        tax: 60.00,
        shippingCost: 40.00,
        shippingAddress: {
            street: 'Av. Principal 123',
            city: 'Ciudad de México',
            state: 'CDMX',
            zipCode: '06000',
            country: 'México'
        },
        paymentStatus: 'paid',
        paymentMethod: 'Tarjeta de Crédito',
        paymentTransactionId: 'TXN-001-2024',
        notes: 'Entregar en horario de oficina',
        estimatedDeliveryDate: new Date('2024-12-20'),
        trackingNumber: 'TRK-123456789',
        isActive: true
    },
    {
        customer: null,
        items: [],
        status: 'shipped',
        total: 899.50,
        subtotal: 849.50,
        tax: 42.48,
        shippingCost: 7.52,
        shippingAddress: {
            street: 'Calle Secundaria 456',
            city: 'Guadalajara',
            state: 'Jalisco',
            zipCode: '44100',
            country: 'México'
        },
        paymentStatus: 'paid',
        paymentMethod: 'PayPal',
        paymentTransactionId: 'TXN-002-2024',
        notes: 'Fragil - Manejar con cuidado',
        estimatedDeliveryDate: new Date('2024-12-22'),
        trackingNumber: 'TRK-987654321',
        isActive: true
    },
    {
        customer: null,
        items: [],
        status: 'processing',
        total: 2450.00,
        subtotal: 2300.00,
        tax: 115.00,
        shippingCost: 35.00,
        shippingAddress: {
            street: 'Boulevard Norte 789',
            city: 'Monterrey',
            state: 'Nuevo León',
            zipCode: '64000',
            country: 'México'
        },
        paymentStatus: 'paid',
        paymentMethod: 'Transferencia Bancaria',
        paymentTransactionId: 'TXN-003-2024',
        notes: 'Productos de alta prioridad',
        estimatedDeliveryDate: new Date('2024-12-25'),
        isActive: true
    },
    {
        customer: null,
        items: [],
        status: 'pending',
        total: 599.99,
        subtotal: 549.99,
        tax: 27.50,
        shippingCost: 22.50,
        shippingAddress: {
            street: 'Plaza Central 321',
            city: 'Puebla',
            state: 'Puebla',
            zipCode: '72000',
            country: 'México'
        },
        paymentStatus: 'pending',
        paymentMethod: 'Efectivo contra entrega',
        notes: 'Verificar identificación del cliente',
        estimatedDeliveryDate: new Date('2024-12-28'),
        isActive: true
    },
    {
        customer: null,
        items: [],
        status: 'confirmed',
        total: 1799.99,
        subtotal: 1699.99,
        tax: 85.00,
        shippingCost: 15.00,
        shippingAddress: {
            street: 'Avenida Sur 654',
            city: 'Tijuana',
            state: 'Baja California',
            zipCode: '22000',
            country: 'México'
        },
        paymentStatus: 'paid',
        paymentMethod: 'Tarjeta de Débito',
        paymentTransactionId: 'TXN-004-2024',
        notes: 'Cliente VIP - Servicio prioritario',
        estimatedDeliveryDate: new Date('2024-12-30'),
        isActive: true
    }
];
async function initializeOrders() {
    try {
        console.log('🔄 Inicializando órdenes...');
        // Limpiar órdenes existentes
        await Order_1.OrderModel.deleteMany({});
        console.log('✅ Órdenes existentes eliminadas');
        // Obtener usuarios cliente
        const customers = await User_1.UserModel.find({ role: 'customer', isActive: true }).limit(5);
        if (customers.length === 0) {
            console.log('⚠️ No se encontraron usuarios cliente. Creando usuarios de ejemplo...');
            // Crear usuarios cliente de ejemplo
            const sampleCustomers = [
                {
                    email: 'cliente1@ejemplo.com',
                    password: 'password123',
                    firstName: 'Juan',
                    lastName: 'Pérez',
                    role: 'customer',
                    isActive: true
                },
                {
                    email: 'cliente2@ejemplo.com',
                    password: 'password123',
                    firstName: 'María',
                    lastName: 'García',
                    role: 'customer',
                    isActive: true
                },
                {
                    email: 'cliente3@ejemplo.com',
                    password: 'password123',
                    firstName: 'Carlos',
                    lastName: 'López',
                    role: 'customer',
                    isActive: true
                },
                {
                    email: 'cliente4@ejemplo.com',
                    password: 'password123',
                    firstName: 'Ana',
                    lastName: 'Martínez',
                    role: 'customer',
                    isActive: true
                },
                {
                    email: 'cliente5@ejemplo.com',
                    password: 'password123',
                    firstName: 'Luis',
                    lastName: 'Rodríguez',
                    role: 'customer',
                    isActive: true
                }
            ];
            for (const customerData of sampleCustomers) {
                await User_1.UserModel.create(customerData);
            }
            const newCustomers = await User_1.UserModel.find({ role: 'customer', isActive: true }).limit(5);
            customers.push(...newCustomers);
            console.log(`✅ ${newCustomers.length} usuarios cliente creados`);
        }
        // Obtener productos
        const products = await Product_1.ProductModel.find({ isActive: true }).limit(10);
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
                    name: 'Smartphone Ultra',
                    brand: 'MobileTech',
                    category: 'Electrónicos',
                    price: 899.50,
                    stock: 30,
                    specifications: { ram: '8GB', storage: '256GB', camera: '48MP' },
                    images: ['https://via.placeholder.com/300x200?text=Smartphone'],
                    description: 'Smartphone de última generación',
                    rating: 4.3,
                    reviews: 18,
                    tags: ['smartphone', 'mobile', 'camera'],
                    sku: 'PHN-001',
                    isActive: true
                },
                {
                    name: 'Tablet Pro',
                    brand: 'TabletTech',
                    category: 'Electrónicos',
                    price: 599.99,
                    stock: 20,
                    specifications: { ram: '6GB', storage: '128GB', screen: '10.1"' },
                    images: ['https://via.placeholder.com/300x200?text=Tablet'],
                    description: 'Tablet profesional para trabajo y entretenimiento',
                    rating: 4.2,
                    reviews: 12,
                    tags: ['tablet', 'professional', 'work'],
                    sku: 'TAB-001',
                    isActive: true
                }
            ];
            for (const productData of sampleProducts) {
                await Product_1.ProductModel.create(productData);
            }
            const newProducts = await Product_1.ProductModel.find({ isActive: true }).limit(10);
            products.push(...newProducts);
            console.log(`✅ ${newProducts.length} productos creados`);
        }
        // Crear órdenes con datos reales
        for (let i = 0; i < sampleOrders.length; i++) {
            const orderData = sampleOrders[i];
            const customer = customers[i % customers.length];
            // Crear items de ejemplo para cada orden
            const orderItems = [];
            const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items por orden
            for (let j = 0; j < numItems; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 unidades
                const price = product.price;
                const subtotal = price * quantity;
                orderItems.push({
                    product: product._id,
                    quantity,
                    price,
                    subtotal
                });
            }
            // Crear la orden
            const order = await Order_1.OrderModel.create({
                ...orderData,
                customer: customer._id,
                items: orderItems
            });
            console.log(`✅ Orden creada: #${order.orderNumber} - ${customer.firstName} ${customer.lastName}`);
        }
        console.log('🎉 Todas las órdenes han sido inicializadas exitosamente');
        // Mostrar resumen
        const totalOrders = await Order_1.OrderModel.countDocuments();
        const pendingOrders = await Order_1.OrderModel.countDocuments({ status: 'pending' });
        const processingOrders = await Order_1.OrderModel.countDocuments({ status: 'processing' });
        const shippedOrders = await Order_1.OrderModel.countDocuments({ status: 'shipped' });
        const deliveredOrders = await Order_1.OrderModel.countDocuments({ status: 'delivered' });
        console.log(`\n📊 Resumen de Órdenes:`);
        console.log(`   Total de órdenes: ${totalOrders}`);
        console.log(`   Pendientes: ${pendingOrders}`);
        console.log(`   Procesando: ${processingOrders}`);
        console.log(`   Enviadas: ${shippedOrders}`);
        console.log(`   Entregadas: ${deliveredOrders}`);
    }
    catch (error) {
        console.error('❌ Error al inicializar órdenes:', error);
    }
}
// Ejecutar si se llama directamente
if (require.main === module) {
    // Conectar a MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/makers-tech-chatbot';
    mongoose_1.default.connect(MONGODB_URI)
        .then(() => {
        console.log('🔌 Conectado a MongoDB');
        return initializeOrders();
    })
        .catch((error) => {
        console.error('❌ Error de conexión:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=initOrders.js.map