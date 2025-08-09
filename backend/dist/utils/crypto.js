"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto_1 = __importDefault(require("crypto"));
const SECRET = process.env.CRYPTO_SECRET_KEY || 'default-32-char-secret-default-1234567';
function encrypt(value) {
    const iv = crypto_1.default.randomBytes(16);
    const key = crypto_1.default.createHash('sha256').update(SECRET).digest();
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}
function decrypt(payload) {
    const [ivHex, dataHex] = payload.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const data = Buffer.from(dataHex, 'hex');
    const key = crypto_1.default.createHash('sha256').update(SECRET).digest();
    const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
}
//# sourceMappingURL=crypto.js.map