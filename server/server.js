import express from 'express';
import pg from 'pg';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-dashboard-2026';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || '192.168.9.121',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Jame@123',
  database: process.env.DB_NAME || 'mio1',
});

// Initialize database table
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        employee_id INT4,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        position_name VARCHAR(255),
        role VARCHAR(50),
        work_group VARCHAR(255)
      );
    `);
    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};
initDb();

// Register Endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { 
      employee_id, 
      username, 
      password, 
      first_name, 
      last_name, 
      position_name, 
      role, 
      work_group 
    } = req.body;

    // Validate password
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว' });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว' });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({ error: 'รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว' });
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username นี้ถูกใช้งานแล้ว' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const newUser = await pool.query(
      `INSERT INTO users 
      (employee_id, username, password_hash, first_name, last_name, position_name, role, work_group) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING user_id, username, first_name, last_name, role`,
      [employee_id || null, username, password_hash, first_name, last_name, position_name, role || 'user', work_group]
    );

    res.status(201).json({ 
      message: 'สมัครสมาชิกสำเร็จ', 
      user: newUser.rows[0] 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Username หรือ Password ไม่ถูกต้อง' });
    }

    const user = userResult.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Username หรือ Password ไม่ถูกต้อง' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        username: user.username,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// Verify Token Endpoint
app.get('/api/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
