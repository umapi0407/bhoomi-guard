import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from './user.model.js';

export class AuthController {
  private static JWT_SECRET = process.env.JWT_SECRET || 'bhoomi_guard_super_secret_jwt_key_2026';

  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role = 'CITIZEN', regionCode, phone } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ error: 'Name, email, and password are required' });
        return;
      }

      // Check if user already exists
      const existing = await UserModel.findOne({ email });
      if (existing) {
        res.status(400).json({ error: 'Email already registered' });
        return;
      }

      // Create user
      const user = await UserModel.create({
        name,
        email,
        passwordHash: password, // In production use bcrypt, plain for quick seed/demo
        role,
        regionCode,
        phone,
      });

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, name: user.name },
        AuthController.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password required' });
        return;
      }

      // Allow demo fast login
      let user = null;
      try {
        user = await UserModel.findOne({ email });
      } catch (e) {}

      if (!user) {
        // Fallback demo user for hackathon testing
        const role = email.includes('admin') ? 'ADMIN' : email.includes('officer') ? 'DISTRICT_OFFICER' : 'CITIZEN';
        user = {
          _id: 'usr_demo_123',
          name: email.split('@')[0].toUpperCase(),
          email,
          role,
        };
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, name: user.name },
        AuthController.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async me(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header provided' });
      return;
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, AuthController.JWT_SECRET);
      res.status(200).json({ user: decoded });
    } catch (e) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  }
}
