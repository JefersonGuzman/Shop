import 'dotenv/config';
import { createServer } from 'http';

import { createApp } from './app';
import { connectToDatabase } from './config/database';

const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI || '';

async function start(): Promise<void> {
  try {
    if (!MONGODB_URI) {
      console.warn('MONGODB_URI no está configurado. El servidor arrancará sin DB.');
    } else {
      await connectToDatabase();
      console.log('✅ MongoDB conectado');
    }

    const app = createApp();
    const server = createServer(app);

    server.listen(PORT, () => {
      console.log(`🚀 API escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error iniciando el servidor:', error);
    process.exit(1);
  }
}

start();


