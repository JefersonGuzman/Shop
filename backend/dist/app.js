"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const admin_1 = __importDefault(require("./routes/admin"));
const products_1 = __importDefault(require("./routes/products"));
const offers_1 = __importDefault(require("./routes/offers"));
const categories_1 = __importDefault(require("./routes/categories"));
const brands_1 = __importDefault(require("./routes/brands"));
function createApp() {
    const app = (0, express_1.default)();
    // Middlewares base
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || '*' }));
    app.use((0, compression_1.default)());
    app.use(express_1.default.json({ limit: '1mb' }));
    // Archivos estáticos subidos (siempre desde backend/uploads)
    app.use('/uploads', express_1.default.static(path_1.default.resolve(__dirname, '..', 'uploads')));
    // Health check minimal
    app.get('/health', (_req, res) => {
        res.json({ status: 'OK', service: 'Makers Tech API', timestamp: new Date().toISOString() });
    });
    // Rutas API
    app.use('/api/products', products_1.default);
    app.use('/api/categories', categories_1.default);
    app.use('/api/brands', brands_1.default);
    app.use('/api/auth', auth_1.default);
    app.use('/api/chat', chat_1.default);
    app.use('/api/admin', admin_1.default);
    app.use('/api/offers', offers_1.default);
    return app;
}
exports.default = createApp;
//# sourceMappingURL=app.js.map