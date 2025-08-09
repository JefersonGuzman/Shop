import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { UserModel } from '../models/User';
import type { LoginDTO, RegisterDTO } from '../schemas/auth';

export class AuthService {
  static async register(data: RegisterDTO): Promise<{ id: string }> {
    const exists = await UserModel.findOne({ email: data.email });
    if (exists) throw new Error('Email ya registrado');
    const hash = await bcrypt.hash(data.password, 10);
    const user = await UserModel.create({
      email: data.email,
      password: hash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'customer',
    });
    return { id: (user._id as any).toString() };
  }
  static async login(credentials: LoginDTO): Promise<{ accessToken: string; refreshToken: string } | null> {
    const user = await UserModel.findOne({ email: credentials.email, isActive: true });
    if (!user) return null;

    const ok = await bcrypt.compare(credentials.password, user.password);
    if (!ok) return null;

    const accessToken = jwt.sign({ userId: (user._id as any).toString(), role: user.role }, process.env.JWT_SECRET || '', {
      expiresIn: (process.env.JWT_EXPIRES_IN as any) || '15m',
    } as jwt.SignOptions);

    const refreshToken = jwt.sign({ userId: (user._id as any).toString() }, process.env.JWT_REFRESH_SECRET || '', {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as any) || '7d',
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }
}


