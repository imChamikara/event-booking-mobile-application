import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initDb } from './db';

// Load environment variables
dotenv.config();

// Import Routes
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import eventsRoutes from './routes/events';
import bookingsRoutes from './routes/bookings';
import organizersRoutes from './routes/organizers';
import notificationsRoutes from './routes/notifications';
import categoriesRoutes from './routes/categories';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
// Add a delay in development to show loading states
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    setTimeout(next, 300);
  });
}
app.use(morgan('dev'));

// Initialize Database
initDb();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/organizers', organizersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/categories', categoriesRoutes);

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'An unexpected error occurred' } });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
