import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt'; // ← ADD

dotenv.config();

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Cari user berdasarkan username
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Bandingkan password input vs hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log(
      `[LOGIN SUCCESS] User ID: ${user.id}, Role: ${user.role}, Username: ${user.username}`
    );

    res.json({
      token,
      role: user.role,
      username: user.username,
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
};
