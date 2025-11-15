import express from 'express';
import cors from 'cors';
import rolesRouter from './routes/roles';
import { logger } from './config/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS конфигурация - разрешаем запросы с poehali.dev и localhost
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
      'https://poehali.dev',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
    ];
    
    // Разрешаем запросы без origin (например, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // В development разрешаем все, в production только разрешенные
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
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
