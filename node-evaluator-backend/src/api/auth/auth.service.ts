// src/api/auth/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserDAO } from '../user/user.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-sparing-partner';

export const AuthService = {
  // SIGNUP: Domain logic + DAO coordination + Auto login
  async signup(userData: any) {
    const existing = await UserDAO.findByEmail(userData.email);
    if (existing) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await UserDAO.createUser({
      ...userData,
      password: hashedPassword
    });

    return this.generateTokens(user.id);
  },

  // LOGIN: Verification logic
  async login(credentials: any) {
    const user = await UserDAO.findByEmail(credentials.email);
    if (!user) throw new Error('Invalid credentials');

    const isValid = await bcrypt.compare(credentials.password, user.password);
    if (!isValid) throw new Error('Invalid credentials');

    return this.generateTokens(user.id);
  },

  // TOKEN MANAGEMENT: Pure Domain Logic
  generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  },

  // REFRESH: Verifying and rotating
  async refreshToken(token: string) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      return this.generateTokens(payload.userId);
    } catch (e) {
      throw new Error('Invalid refresh token');
    }
  }
};