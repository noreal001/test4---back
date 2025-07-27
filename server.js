const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Импорт роутов
const perfumeRoutes = require('./routes/perfumes');
const uploadRoutes = require('./routes/upload');

// Инициализация приложения
const app = express();
const PORT = process.env.PORT || 5000;

// Создание папки для загрузок если её нет
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware для безопасности
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов с одного IP за 15 минут
    message: 'Слишком много запросов с этого IP, попробуйте позже.'
});
app.use(limiter);

// CORS настройки для работы с React фронтендом
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Разрешенные домены для React
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Парсинг JSON и URL-encoded данных
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Статические файлы для изображений
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API роуты
app.use('/api/perfumes', perfumeRoutes);
app.use('/api/upload', uploadRoutes);

// Проверка здоровья сервера
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Perfume Backend API'
    });
});

// Обработка 404 ошибок
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Endpoint не найден',
        message: `Путь ${req.originalUrl} не существует` 
    });
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err.stack);
    res.status(500).json({ 
        error: 'Внутренняя ошибка сервера',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так'
    });
});

// Инициализация базы данных и запуск сервера
const db = require('./database/db');
db.init().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Сервер запущен на порту ${PORT}`);
        console.log(`📱 API доступно по адресу: http://localhost:${PORT}/api`);
        console.log(`🖼️ Изображения доступны по адресу: http://localhost:${PORT}/uploads`);
    });
}).catch(err => {
    console.error('Ошибка инициализации базы данных:', err);
    process.exit(1);
});

module.exports = app; 