import { Router, RequestHandler } from 'express';

import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();
const controller = new AuthController();

router.post('/register', controller.register.bind(controller));
router.post('/login', controller.login.bind(controller));
router.get('/me', authenticateToken as unknown as RequestHandler, controller.me.bind(controller));
router.post('/refresh', controller.refresh.bind(controller));
router.post('/logout', controller.logout.bind(controller));

// Endpoint simple para firmar direct uploads desde el frontend (opcional)
router.get('/cloudinary-signature', (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const requestedFolder = (req.query.folder as string) || 'makers-tech/brands';
  // Seguridad básica: limitar a nuestra raíz de proyecto
  const safeFolder = requestedFolder.startsWith('makers-tech/') ? requestedFolder : 'makers-tech/brands';
  const paramsToSign = { timestamp, folder: safeFolder } as any;
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET || ''
  );
  res.json({
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: safeFolder,
  });
});

export default router;


