"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = require("http");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("./app");
const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI || '';
async function start() {
    try {
        if (!MONGODB_URI) {
            console.warn('MONGODB_URI no está configurado. El servidor arrancará sin DB.');
        }
        else {
            await mongoose_1.default.connect(MONGODB_URI, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log('✅ MongoDB conectado');
        }
        const app = (0, app_1.createApp)();
        const server = (0, http_1.createServer)(app);
        server.listen(PORT, () => {
            console.log(`🚀 API escuchando en http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('Error iniciando el servidor:', error);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=index.js.map