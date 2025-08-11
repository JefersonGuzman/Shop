import { v2 as cloudinary } from 'cloudinary';

export function configureCloudinary(): void {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadImage(bufferOrPath: string | Buffer, folder = 'makers-tech/brands'): Promise<{ url: string; publicId: string }>{
  const res = await cloudinary.uploader.upload(typeof bufferOrPath === 'string' ? bufferOrPath : (bufferOrPath as any), {
    folder,
    resource_type: 'image',
  } as any);
  return { url: res.secure_url, publicId: res.public_id };
}

export async function deleteImage(publicId: string): Promise<boolean> {
  const res = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' } as any);
  return res.result === 'ok' || res.result === 'not found';
}


