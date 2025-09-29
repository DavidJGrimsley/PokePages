"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySupabaseAuth = verifySupabaseAuth;
exports.verifyResourceOwnership = verifyResourceOwnership;
exports.requireAdmin = requireAdmin;
const supabaseServerClient_1 = require("../utils/supabaseServerClient");
async function verifySupabaseAuth(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Access denied. Please provide a valid authorization token.'
        });
    }
    const token = authHeader.slice(7);
    try {
        const { data: { user }, error } = await supabaseServerClient_1.supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'user'
        };
        next();
    }
    catch (error) {
        console.error('Auth verification error:', error);
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
}
function verifyResourceOwnership(req, res, next) {
    const requestedUserId = req.params.userId;
    const authenticatedUserId = req.user?.id;
    if (!authenticatedUserId) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    if (requestedUserId === authenticatedUserId || req.user?.role === 'admin') {
        return next();
    }
    return res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own resources.'
    });
}
function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
    next();
}
