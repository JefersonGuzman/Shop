"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCloudinary = configureCloudinary;
exports.uploadImage = uploadImage;
exports.deleteImage = deleteImage;
const cloudinary_1 = require("cloudinary");
function configureCloudinary() {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}
async function uploadImage(bufferOrPath, folder = 'makers-tech/brands') {
    const res = await cloudinary_1.v2.uploader.upload(typeof bufferOrPath === 'string' ? bufferOrPath : bufferOrPath, {
        folder,
        resource_type: 'image',
    });
    return { url: res.secure_url, publicId: res.public_id };
}
async function deleteImage(publicId) {
    const res = await cloudinary_1.v2.uploader.destroy(publicId, { resource_type: 'image' });
    return res.result === 'ok' || res.result === 'not found';
}
//# sourceMappingURL=CloudinaryService.js.map