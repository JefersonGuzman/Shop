"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = require("http");
const database_1 = require("./config/database");
const app_1 = require("./app");
const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI || '';
async function start() {
    try {
        if (!MONGODB_URI) {
            console.warn('MONGODB_URI no está configurado. El servidor arrancará sin DB.');
        }
        else {
            await (0, database_1.connectToDatabase)();
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