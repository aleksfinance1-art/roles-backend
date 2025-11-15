// Railway запускает этот файл
// Импортируем приложение из src/index.ts используя динамический import
// Но так как это CommonJS, нужно использовать другой подход

// Простое решение: переписываем на CommonJS или используем ts-node
// Для Railway лучше использовать скомпилированный код или ts-node

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Импортируем роуты (если они в CommonJS)
// Но так как они в TypeScript, нужно либо скомпилировать, либо использовать ts-node

// ВРЕМЕННОЕ РЕШЕНИЕ: Создаем сервер прямо здесь с правильными роутами
const app = express();
const PORT = process.env.PORT || 3000;

// CORS конфигурация
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
      'https://poehali.dev',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
    ];
    
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Логирование
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Импортируем роуты из TypeScript файла
// Для этого нужен ts-node или скомпилированный код
// Пока используем прямой импорт через require с ts-node
try {
  // Пытаемся использовать ts-node если установлен
  if (require.resolve('ts-node')) {
    require('ts-node/register');
    const rolesRouter = require('./src/routes/roles.ts').default;
    app.use('/api/v1/roles', rolesRouter);
  } else {
    // Если ts-node нет, используем скомпилированный код
    const rolesRouter = require('./dist/routes/roles.js').default;
    app.use('/api/v1/roles', rolesRouter);
  }
} catch (error) {
  console.error('Error loading routes:', error);
  // Fallback: создаем простой роут для теста
  app.post('/api/v1/roles/calculate', (req, res) => {
    res.status(500).json({ 
      status: 'error', 
      message: 'Routes not loaded. Please ensure TypeScript is compiled or ts-node is installed.',
      error: error.message 
    });
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api/v1/roles/calculate`);
});

module.exports = app;
