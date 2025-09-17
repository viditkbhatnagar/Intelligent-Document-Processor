import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        res.status(409).json({ message: 'User already exists' });
        return;
      }

      // Create new user
      const user = new UserModel({
        email,
        password,
        firstName,
        lastName
      });

      await user.save();

      // Generate JWT token
      const userData = user as any;
      const token = this.generateToken(userData._id.toString(), userData.email, userData.role);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: userData._id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role
        }
      });

    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Failed to register user' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await UserModel.findOne({ email });
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const userData = user as any;
      
      // Check password
      const isPasswordValid = await userData.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Update last login
      userData.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = this.generateToken(userData._id.toString(), userData.email, userData.role);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: userData._id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          lastLogin: userData.lastLogin
        }
      });

    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(401).json({ message: 'Token required' });
        return;
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        res.status(500).json({ message: 'JWT secret not configured' });
        return;
      }

      // Verify and decode token (even if expired)
      const decoded = jwt.verify(token, jwtSecret, { ignoreExpiration: true }) as {
        userId: string;
        email: string;
        role: string;
      };

      // Check if user still exists
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        res.status(401).json({ message: 'User not found or inactive' });
        return;
      }

      // Generate new token
      const userData = user as any;
      const newToken = this.generateToken(userData._id.toString(), userData.email, userData.role);

      res.json({
        message: 'Token refreshed successfully',
        token: newToken
      });

    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(401).json({ message: 'Invalid token' });
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const userData = user as any;

      res.json({
        user: {
          id: userData._id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          lastLogin: userData.lastLogin,
          createdDate: userData.createdDate
        }
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const { firstName, lastName } = req.body;

      const user = await UserModel.findByIdAndUpdate(
        req.user.userId,
        { firstName, lastName },
        { new: true }
      );

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const userData = user as any;

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: userData._id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role
        }
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }

  private generateToken(userId: string, email: string, role: string): string {
    const jwtSecret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    return jwt.sign(
      { userId, email, role },
      jwtSecret,
      { expiresIn } as jwt.SignOptions
    );
  }
}