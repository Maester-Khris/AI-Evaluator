// src/api/auth/auth.routes.ts
import { Router } from 'express';
import { AuthService } from './auth.service.js';
import { validate, isNonEmptyString } from '../../core/validation.js';
import { AppError } from '../../core/errors.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', validate('body', {
  email: (v) => isNonEmptyString(v) || 'email is required and must be a valid email address',
  password: (v) => isNonEmptyString(v) && v.length >= 6 || 'password is required and must be at least 6 characters',
}), async (req, res) => {
  try {
    const tokens = await AuthService.signup(req.body);
    res.status(201).json(tokens);
  } catch (error: any) {
    // preserve current behavior for conflict or validation errors from service
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', validate('body', {
  email: (v) => isNonEmptyString(v) || 'email is required and must be a valid email address',
  password: (v) => isNonEmptyString(v) || 'password is required',
}), async (req, res) => {
  try {
    const tokens = await AuthService.login(req.body);
    res.json(tokens);
  } catch (error: any) {
    // AuthService throws on invalid credentials; keep 401 for auth failures
    res.status(401).json({ error: error.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = await AuthService.verifyToken(token);
    const user = await AuthService.getUserProfile(decoded.userId);
    
    res.json(user);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});


router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (token) {
      await AuthService.logout(token);
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});
export default router;