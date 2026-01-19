import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import passport from 'passport';
import fs from 'fs';
import https from 'https';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import path from 'path';
import { parse as dotenvParse } from 'dotenv';

// 1. Load Environment Variables
dotenv.config({ override: true });
try {
  const envPath = path.resolve(process.cwd(), '.env');
  const raw = fs.readFileSync(envPath, 'utf8');
  const parsed = dotenvParse(raw);
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === '') {
    process.env.GOOGLE_CLIENT_ID = parsed.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  }
  if (!process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET === '') {
    process.env.GOOGLE_CLIENT_SECRET = parsed.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  }
} catch {}
console.log('ENV GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'set' : 'missing', 'ENV GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? 'set' : 'missing');
console.log('ENV keys containing GOOGLE:', Object.keys(process.env).filter(k => k.toUpperCase().includes('GOOGLE')).join(', ') || 'none');
console.log('ENV keys containing GITHUB:', Object.keys(process.env).filter(k => k.toUpperCase().includes('GITHUB')).join(', ') || 'none');
console.log('VAL GOOGLE_CLIENT_ID:', JSON.stringify(process.env['GOOGLE_CLIENT_ID']));
console.log('VAL GOOGLE_CLIENT_SECRET:', JSON.stringify(process.env['GOOGLE_CLIENT_SECRET']));
await import('./config/passport.js');

// 2. Connect to MongoDB
connectDB();

const app = express();

// 3. Middlewares
app.use(express.json()); // To parse JSON bodies
app.use(cookieParser()); // To parse cookies
app.use(cors({
  origin: (origin, cb) => {
    const allow = [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean);
    if (!origin || allow.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true
}));
app.use(passport.initialize());

// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('API is running successfully... 🚀');
});

// 5. Port Configuration
const PORT = 8000;
const enableMtls = process.env.ENABLE_MTLS === 'true';

if (enableMtls) {
  try {
    const key = fs.readFileSync(process.env.TLS_KEY_PATH);
    const cert = fs.readFileSync(process.env.TLS_CERT_PATH);
    const server = https.createServer({ key, cert, ca, requestCert: true, rejectUnauthorized: true }, app);
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`HTTPS server with mTLS on https://0.0.0.0:${PORT}`);
    });
  } catch (e) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
} else {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
