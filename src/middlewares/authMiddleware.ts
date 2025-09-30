import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabaseServerClient.js';

// Extend Express Request interface to include authenticated user
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email?: string;
      role?: string;
    };
  }
}

/**
 * Middleware to verify Supabase JWT tokens
 * Expects Authorization header with "Bearer <token>" format
 */
export async function verifySupabaseAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      error: 'Access denied. Please provide a valid authorization token.' 
    });
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid or expired token' 
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      // You can add role from user metadata if needed
      role: user.user_metadata?.role || 'user'
    };

    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ 
      success: false,
      error: 'Authentication failed' 
    });
  }
}

/**
 * Middleware to check if user owns the resource or is admin
 * Should be used after verifySupabaseAuth
 */
export function verifyResourceOwnership(req: Request, res: Response, next: NextFunction) {
  const requestedUserId = req.params.userId;
  const authenticatedUserId = req.user?.id;

  if (!authenticatedUserId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // Allow if user is accessing their own resource or is admin
  if (requestedUserId === authenticatedUserId || req.user?.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Access denied. You can only access your own resources.'
  });
}

/**
 * Optional middleware for admin-only routes
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
}