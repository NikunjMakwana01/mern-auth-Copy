const jwt = require('jsonwebtoken');

class JWTUtils {
  static generateToken(payload, expiresIn = '24h') {
    try {
      return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    } catch (error) {
      throw new Error('Failed to generate token');
    }
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  static generateRefreshToken(payload) {
    try {
      return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    } catch (error) {
      throw new Error('Failed to generate refresh token');
    }
  }

  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new Error('Failed to decode token');
    }
  }

  static isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return true;
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  static generateOTPToken(payload, expiresIn = '10m') {
    try {
      return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    } catch (error) {
      throw new Error('Failed to generate OTP token');
    }
  }

  static extractUserIdFromToken(token) {
    try {
      const decoded = this.verifyToken(token);
      return decoded.userId || decoded.id;
    } catch (error) {
      throw new Error('Failed to extract user ID from token');
    }
  }

  static getTokenExpiration(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return null;
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }
}

module.exports = JWTUtils;
