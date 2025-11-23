import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from './mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  admin: boolean;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(request: NextRequest): Promise<{ user: JWTPayload } | { error: string; status: number }> {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  const payload = await verifyToken(token);
  if (!payload || !payload.admin) {
    return { error: 'Forbidden - Admin access required', status: 403 };
  }

  // Verify user still exists and is admin
  await connectDB();
  const user = await User.findById(payload.userId);
  if (!user || !user.admin) {
    return { error: 'Forbidden - Admin access required', status: 403 };
  }

  return { user: payload };
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

