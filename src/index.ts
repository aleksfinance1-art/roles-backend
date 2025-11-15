import express from 'express';
import cors from 'cors';
import rolesRouter from './routes/roles';
import { logger } from './config/logger';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/v1/roles', rolesRouter);

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Not found' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server started on port ${PORT}`);
});

export default app;
