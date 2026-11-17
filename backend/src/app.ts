import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import patientRoutes from './routes/patients';
import doctorRoutes from './routes/doctors';
import hospitalRoutes from './routes/hospitals';
import recordRoutes from './routes/records';
import accessRoutes from './routes/access';
import auditRoutes from './routes/audit';
import notificationRoutes from './routes/notifications';
import adminRoutes from './routes/admin';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();

// Security and utility middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'MediChain Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Centralized error handler
app.use(errorHandler);

export default app;

