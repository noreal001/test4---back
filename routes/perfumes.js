const express = require('express');
const Joi = require('joi');
const db = require('../database/db');

const router = express.Router();

// Схема валидации для аромата
const perfumeSchema = Joi.object({
    name: Joi.string().required().min(1).max(255),
    brand: Joi.string().required().min(1).max(255),
    description: Joi.string().allow('').max(1000),
    price: Joi.number().positive().precision(2),
    volume: Joi.number().integer().positive(),
    category: Joi.string().valid(
        'niche', 'designer', 'natural', 'oriental', 'fresh', 
        'woody', 'floral', 'citrus', 'gourmand', 'other'
    ),
    notes_top: Joi.string().allow('').max(500),
    notes_middle: Joi.string().allow('').max(500),
    notes_base: Joi.string().allow('').max(500),
    gender: Joi.string().valid('male', 'female', 'unisex').default('unisex'),
    image_url: Joi.string().allow('').uri(),
    stock_quantity: Joi.number().integer().min(0).default(0),
    is_available: Joi.boolean().default(true)
});

// GET /api/perfumes - Получить все ароматы
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        
        let perfumes;
        if (search) {
            perfumes = await db.searchPerfumes(search);
        } else {
            perfumes = await db.getAllPerfumes();
        }
        
        res.json({
            success: true,
            data: perfumes,
            count: perfumes.length
        });
    } catch (error) {
        console.error('Ошибка получения ароматов:', error);
        res.status(500).json({
            success: false,
            error: 'Не удалось получить ароматы',
            message: error.message
        });
    }
});

// GET /api/perfumes/:id - Получить аромат по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Некорректный ID аромата'
            });
        }
        
        const perfume = await db.getPerfumeById(id);
        
        if (!perfume) {
            return res.status(404).json({
                success: false,
                error: 'Аромат не найден'
            });
        }
        
        res.json({
            success: true,
            data: perfume
        });
    } catch (error) {
        console.error('Ошибка получения аромата:', error);
        res.status(500).json({
            success: false,
            error: 'Не удалось получить аромат',
            message: error.message
        });
    }
});

// POST /api/perfumes - Создать новый аромат
router.post('/', async (req, res) => {
    try {
        // Валидация данных
        const { error, value } = perfumeSchema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Ошибка валидации данных',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }
        
        const newPerfume = await db.createPerfume(value);
        
        res.status(201).json({
            success: true,
            message: 'Аромат успешно создан',
            data: newPerfume
        });
    } catch (error) {
        console.error('Ошибка создания аромата:', error);
        res.status(500).json({
            success: false,
            error: 'Не удалось создать аромат',
            message: error.message
        });
    }
});

// PUT /api/perfumes/:id - Обновить аромат
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Некорректный ID аромата'
            });
        }
        
        // Проверяем существование аромата
        const existingPerfume = await db.getPerfumeById(id);
        if (!existingPerfume) {
            return res.status(404).json({
                success: false,
                error: 'Аромат не найден'
            });
        }
        
        // Валидация данных
        const { error, value } = perfumeSchema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Ошибка валидации данных',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }
        
        const result = await db.updatePerfume(id, value);
        
        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'Аромат не найден или не был изменен'
            });
        }
        
        // Получаем обновленный аромат
        const updatedPerfume = await db.getPerfumeById(id);
        
        res.json({
            success: true,
            message: 'Аромат успешно обновлен',
            data: updatedPerfume
        });
    } catch (error) {
        console.error('Ошибка обновления аромата:', error);
        res.status(500).json({
            success: false,
            error: 'Не удалось обновить аромат',
            message: error.message
        });
    }
});

// DELETE /api/perfumes/:id - Удалить аромат
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Некорректный ID аромата'
            });
        }
        
        // Проверяем существование аромата
        const existingPerfume = await db.getPerfumeById(id);
        if (!existingPerfume) {
            return res.status(404).json({
                success: false,
                error: 'Аромат не найден'
            });
        }
        
        const result = await db.deletePerfume(id);
        
        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'Аромат не найден'
            });
        }
        
        res.json({
            success: true,
            message: 'Аромат успешно удален'
        });
    } catch (error) {
        console.error('Ошибка удаления аромата:', error);
        res.status(500).json({
            success: false,
            error: 'Не удалось удалить аромат',
            message: error.message
        });
    }
});

module.exports = router; 