const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к файлу базы данных
const DB_PATH = path.join(__dirname, 'perfumes.db');

let db;

// Инициализация базы данных
const init = () => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Ошибка подключения к базе данных:', err.message);
                reject(err);
            } else {
                console.log('✅ Подключение к SQLite базе данных установлено');
                createTables().then(resolve).catch(reject);
            }
        });
    });
};

// Создание таблиц
const createTables = () => {
    return new Promise((resolve, reject) => {
        const perfumesTable = `
            CREATE TABLE IF NOT EXISTS perfumes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                brand TEXT NOT NULL,
                description TEXT,
                price DECIMAL(10, 2),
                volume INTEGER,
                category TEXT,
                notes_top TEXT,
                notes_middle TEXT,
                notes_base TEXT,
                gender TEXT DEFAULT 'unisex',
                image_url TEXT,
                stock_quantity INTEGER DEFAULT 0,
                is_available BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        db.run(perfumesTable, (err) => {
            if (err) {
                console.error('Ошибка создания таблицы perfumes:', err.message);
                reject(err);
            } else {
                console.log('✅ Таблица perfumes создана/проверена');
                resolve();
            }
        });
    });
};

// Получение всех ароматов
const getAllPerfumes = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT * FROM perfumes 
            WHERE is_available = 1 
            ORDER BY created_at DESC
        `;
        
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Получение аромата по ID
const getPerfumeById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM perfumes WHERE id = ? AND is_available = 1`;
        
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Создание нового аромата
const createPerfume = (perfumeData) => {
    return new Promise((resolve, reject) => {
        const {
            name, brand, description, price, volume, category,
            notes_top, notes_middle, notes_base, gender,
            image_url, stock_quantity
        } = perfumeData;

        const sql = `
            INSERT INTO perfumes (
                name, brand, description, price, volume, category,
                notes_top, notes_middle, notes_base, gender,
                image_url, stock_quantity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(sql, [
            name, brand, description, price, volume, category,
            notes_top, notes_middle, notes_base, gender,
            image_url, stock_quantity
        ], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, ...perfumeData });
            }
        });
    });
};

// Обновление аромата
const updatePerfume = (id, perfumeData) => {
    return new Promise((resolve, reject) => {
        const {
            name, brand, description, price, volume, category,
            notes_top, notes_middle, notes_base, gender,
            image_url, stock_quantity, is_available
        } = perfumeData;

        const sql = `
            UPDATE perfumes SET
                name = ?, brand = ?, description = ?, price = ?, volume = ?,
                category = ?, notes_top = ?, notes_middle = ?, notes_base = ?,
                gender = ?, image_url = ?, stock_quantity = ?, is_available = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        db.run(sql, [
            name, brand, description, price, volume, category,
            notes_top, notes_middle, notes_base, gender,
            image_url, stock_quantity, is_available, id
        ], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ changes: this.changes });
            }
        });
    });
};

// Удаление аромата (мягкое удаление)
const deletePerfume = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE perfumes SET is_available = 0 WHERE id = ?`;
        
        db.run(sql, [id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ changes: this.changes });
            }
        });
    });
};

// Поиск ароматов
const searchPerfumes = (searchTerm) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT * FROM perfumes 
            WHERE is_available = 1 AND (
                name LIKE ? OR 
                brand LIKE ? OR 
                description LIKE ? OR 
                category LIKE ?
            )
            ORDER BY created_at DESC
        `;
        
        const searchPattern = `%${searchTerm}%`;
        
        db.all(sql, [searchPattern, searchPattern, searchPattern, searchPattern], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Закрытие соединения с базой данных
const close = () => {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('📴 Соединение с базой данных закрыто');
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
};

module.exports = {
    init,
    getAllPerfumes,
    getPerfumeById,
    createPerfume,
    updatePerfume,
    deletePerfume,
    searchPerfumes,
    close
}; 