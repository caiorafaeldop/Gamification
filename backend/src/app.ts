import express from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import tierRoutes from './routes/tier.routes';
import achievementRoutes from './routes/achievement.routes';
import adminRoutes from './routes/admin.routes';
import dashboardRoutes from './routes/dashboard.routes';
import activityRoutes from './routes/activity.routes';
import kanbanRoutes from './routes/kanban.routes';
import storeRoutes from './routes/store.routes';
import notificationRoutes from './routes/notification.routes';
import eventRoutes from './routes/event.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: config.corsOrigin }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/tiers', tierRoutes);
app.use('/api/v1/achievements', achievementRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/kanban', kanbanRoutes);
app.use('/api/v1/store', storeRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/admin', adminRoutes);

// Basic health check route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Connecta CI Backend is running!' });
});

// Error handling middleware
app.use(errorHandler);

export default app;