// src/api/auth/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserDAO } from '../user/user.service.js';
import { prisma } from '../../config/prisma.js';

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

  async loginGuest(name: string, id: string) {
    // We sign a token exactly like a real user, but with a 'guest' flag
    const token = jwt.sign(
      { userId: id, role: 'GUEST' }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '24h' }
    );
    

    return {
      token,
      user: { id, name, email: 'guest@internal', isGuest: true }
    };
  },

  // TOKEN MANAGEMENT: Pure Domain Logic
  generateTokens(userId: string, role: string='USER') {
    const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  },

  // REFRESH: Verifying and rotating
  async refreshToken(token: string) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string , role: string};
      return this.generateTokens(payload.userId, payload.role);
    } catch (e) {
      throw new Error('Invalid refresh token');
    }
  },

  async verifyToken(token: string) {
    // 1. Check if token is blacklisted
    const isBlacklisted = await UserDAO.findTokenB(token);

    if (isBlacklisted) throw new Error('Token is no longer valid');

    // 2. Verify JWT signature and expiration
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string , role: string};
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  },

  async logout(token: string) {
    const decoded = jwt.decode(token) as { exp: number };
    
    // Add to blacklist until the token's original expiry time
    await UserDAO.blacklistToken(token, decoded.exp);
  },

  async getUserProfile(userId: string) {
    return await UserDAO.getUserById(userId);
  }
};