"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAll = initializeAll;
const mongoose_1 = __importDefault(require("mongoose"));
const initCategories_1 = require("./initCategories");
const initOrders_1 = require("./initOrders");
const initializeOffers_1 = require("./initializeOffers");
async function initializeAll() {
    try {
        console.log('🚀 Iniciando inicialización completa de la base de datos...\n');
        // Conectar a MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/makers-tech-chatbot';
        await mongoose_1.default.connect(MONGODB_URI);
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
        await (0, initCategories_1.initializeCategories)();
        // 2. Inicializar órdenes
        console.log('\n' + '='.repeat(50));
        console.log('2️⃣ INICIALIZANDO ÓRDENES');
        console.log('='.repeat(50));
        await (0, initOrders_1.initializeOrders)();
        // 3. Inicializar ofertas
        console.log('\n' + '='.repeat(50));
        console.log('3️⃣ INICIALIZANDO OFERTAS');
        console.log('='.repeat(50));
        await (0, initializeOffers_1.initializeOffers)();
        console.log('\n' + '🎉 ¡INICIALIZACIÓN COMPLETA EXITOSA! 🎉');
        console.log('\n📊 Resumen de la base de datos:');
        // Mostrar resumen final
        const CategoryModel = (await Promise.resolve().then(() => __importStar(require('../models/Category')))).CategoryModel;
        const OrderModel = (await Promise.resolve().then(() => __importStar(require('../models/Order')))).OrderModel;
        const OfferModel = (await Promise.resolve().then(() => __importStar(require('../models/Offer')))).OfferModel;
        const UserModel = (await Promise.resolve().then(() => __importStar(require('../models/User')))).UserModel;
        const ProductModel = (await Promise.resolve().then(() => __importStar(require('../models/User')))).UserModel;
        try {
            const totalCategories = await CategoryModel.countDocuments();
            const totalOrders = await OrderModel.countDocuments();
            const totalOffers = await OfferModel.countDocuments();
            console.log(`   📁 Categorías: ${totalCategories}`);
            console.log(`   📦 Órdenes: ${totalOrders}`);
            console.log(`   🎯 Ofertas: ${totalOffers}`);
        }
        catch (error) {
            console.log('   ⚠️ No se pudo obtener el resumen completo');
        }
        console.log('\n✨ La base de datos está lista para usar');
        console.log('   Puedes acceder a las vistas administrativas:');
        console.log('   - /admin/categories - Gestión de categorías');
        console.log('   - /admin/orders - Gestión de órdenes');
        console.log('   - /admin/offers - Gestión de ofertas');
        console.log('   - /admin/users - Gestión de usuarios');
        console.log('   - /admin/products - Gestión de productos');
    }
    catch (error) {
        console.error('❌ Error durante la inicialización:', error);
        process.exit(1);
    }
    finally {
        // Cerrar conexión
        if (mongoose_1.default.connection.readyState === 1) {
            await mongoose_1.default.connection.close();
            console.log('\n🔌 Conexión a la base de datos cerrada');
        }
    }
}
// Ejecutar si se llama directamente
if (require.main === module) {
    initializeAll();
}
//# sourceMappingURL=initializeAll.js.map