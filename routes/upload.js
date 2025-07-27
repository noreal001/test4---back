const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Создание папки uploads если её нет
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Генерируем уникальное имя файла
        const uniqueId = uuidv4();
        const extension = path.extname(file.originalname).toLowerCase();
        const filename = `perfume_${uniqueId}${extension}`;
        cb(null, filename);
    }
});

// Фильтр для проверки типов файлов
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Недопустимый тип файла. Разрешены только JPEG, PNG и WebP'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Максимум 5MB
        files: 1 // Максимум 1 файл за раз
    }
});

// POST /api/upload/image - Загрузка изображения аромата
router.post('/image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Файл не был загружен',
                message: 'Пожалуйста, выберите изображение для загрузки'
            });
        }

        // Генерируем URL для доступа к файлу
        const imageUrl = `/uploads/${req.file.filename}`;
        
        res.json({
            success: true,
            message: 'Изображение успешно загружено',
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                url: imageUrl,
                fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`
            }
        });
    } catch (error) {
        console.error('Ошибка загрузки изображения:', error);
        res.status(500).json({
            success: false,
            error: 'Не удалось загрузить изображение',
            message: error.message
        });
    }
});

// POST /api/upload/multiple - Загрузка нескольких изображений
router.post('/multiple', upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Файлы не были загружены',
                message: 'Пожалуйста, выберите изображения для загрузки'
            });
        }

        const uploadedFiles = req.files.map(file => {
            const imageUrl = `/uploads/${file.filename}`;
            return {
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                url: imageUrl,
                fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`
            };
        });
        
        res.json({
            success: true,
            message: `${req.files.length} изображение(й) успешно загружено`,
            data: uploadedFiles,
            count: uploadedFiles.length
        });
    } catch (error) {
        console.error('Ошибка загрузки изображений:', error);
        res.status(500).json({
            success: false,
            error: 'Не удалось загрузить изображения',
            message: error.message
        });
    }
});

// DELETE /api/upload/:filename - Удаление изображения
router.delete('/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        
        if (!filename) {
            return res.status(400).json({
                success: false,
                error: 'Имя файла не указано'
            });
        }

        const filePath = path.join(uploadsDir, filename);
        
        // Проверяем существование файла
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'Файл не найден'
            });
        }

        // Удаляем файл
        fs.unlinkSync(filePath);
        
        res.json({
            success: true,
            message: 'Изображение успешно удалено'
        });
    } catch (error) {
        console.error('Ошибка удаления изображения:', error);
        res.status(500).json({
            success: false,
            error: 'Не удалось удалить изображение',
            message: error.message
        });
    }
});

// GET /api/upload/list - Список всех загруженных изображений
router.get('/list', (req, res) => {
    try {
        const files = fs.readdirSync(uploadsDir);
        const imageFiles = files.filter(file => {
            const extension = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp'].includes(extension);
        });

        const fileList = imageFiles.map(file => {
            const filePath = path.join(uploadsDir, file);
            const stats = fs.statSync(filePath);
            const imageUrl = `/uploads/${file}`;
            
            return {
                filename: file,
                size: stats.size,
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime,
                url: imageUrl,
                fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`
            };
        });

        res.json({
            success: true,
            data: fileList,
            count: fileList.length
        });
    } catch (error) {
        console.error('Ошибка получения списка файлов:', error);
        res.status(500).json({
            success: false,
            error: 'Не удалось получить список файлов',
            message: error.message
        });
    }
});

// Обработка ошибок multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'Файл слишком большой',
                message: 'Максимальный размер файла: 5MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Слишком много файлов',
                message: 'Максимальное количество файлов: 5'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: 'Неожиданное поле файла',
                message: 'Используйте поле "image" или "images"'
            });
        }
    }
    
    res.status(400).json({
        success: false,
        error: 'Ошибка загрузки файла',
        message: error.message
    });
});

module.exports = router; 