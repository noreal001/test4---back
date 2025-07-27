# Perfume Backend API

Бэкенд API для сайта с ароматами, построенный на Node.js, Express и SQLite.

## Возможности

- ✅ CRUD операции с ароматами
- ✅ Загрузка и управление изображениями
- ✅ Поиск по ароматам
- ✅ Валидация данных
- ✅ CORS для работы с React фронтендом
- ✅ Rate limiting для безопасности
- ✅ SQLite база данных

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Запустите сервер в режиме разработки:
```bash
npm run dev
```

3. Или запустите в продакшн режиме:
```bash
npm start
```

Сервер будет доступен по адресу: `http://localhost:5000`

## API Endpoints

### Ароматы

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/perfumes` | Получить все ароматы |
| GET | `/api/perfumes?search=query` | Поиск ароматов |
| GET | `/api/perfumes/:id` | Получить аромат по ID |
| POST | `/api/perfumes` | Создать новый аромат |
| PUT | `/api/perfumes/:id` | Обновить аромат |
| DELETE | `/api/perfumes/:id` | Удалить аромат |

### Загрузка изображений

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/upload/image` | Загрузить одно изображение |
| POST | `/api/upload/multiple` | Загрузить несколько изображений |
| GET | `/api/upload/list` | Список всех изображений |
| DELETE | `/api/upload/:filename` | Удалить изображение |

### Служебные

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/health` | Проверка состояния сервера |

## Структура данных аромата

```json
{
  "name": "Название аромата",
  "brand": "Бренд",
  "description": "Описание аромата",
  "price": 5990.00,
  "volume": 100,
  "category": "niche",
  "notes_top": "Бергамот, Лимон",
  "notes_middle": "Роза, Жасмин",
  "notes_base": "Сандал, Мускус",
  "gender": "unisex",
  "image_url": "/uploads/perfume_123.jpg",
  "stock_quantity": 10,
  "is_available": true
}
```

### Категории ароматов
- `niche` - Нишевые
- `designer` - Дизайнерские
- `natural` - Натуральные
- `oriental` - Восточные
- `fresh` - Свежие
- `woody` - Древесные
- `floral` - Цветочные
- `citrus` - Цитрусовые
- `gourmand` - Гурманские
- `other` - Другие

### Гендер
- `male` - Мужской
- `female` - Женский
- `unisex` - Унисекс

## Примеры использования

### Создание нового аромата
```javascript
const response = await fetch('http://localhost:5000/api/perfumes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: "Ambre Vanille",
    brand: "Maison Francis Kurkdjian",
    description: "Теплый восточный аромат с нотами ванили и амбры",
    price: 12900.00,
    volume: 70,
    category: "niche",
    notes_top: "Миндаль",
    notes_middle: "Ваниль",
    notes_base: "Амбра, Сандал",
    gender: "unisex",
    stock_quantity: 5
  })
});
```

### Загрузка изображения
```javascript
const formData = new FormData();
formData.append('image', file);

const response = await fetch('http://localhost:5000/api/upload/image', {
  method: 'POST',
  body: formData
});
```

### Получение всех ароматов
```javascript
const response = await fetch('http://localhost:5000/api/perfumes');
const data = await response.json();
console.log(data.data); // Массив ароматов
```

### Поиск ароматов
```javascript
const response = await fetch('http://localhost:5000/api/perfumes?search=vanilla');
const data = await response.json();
```

## Интеграция с React

В вашем React приложении используйте следующий базовый URL:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Пример сервиса для работы с API
export const perfumeService = {
  // Получить все ароматы
  async getAllPerfumes() {
    const response = await fetch(`${API_BASE_URL}/perfumes`);
    return response.json();
  },

  // Создать аромат
  async createPerfume(perfumeData) {
    const response = await fetch(`${API_BASE_URL}/perfumes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(perfumeData)
    });
    return response.json();
  },

  // Загрузить изображение
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }
};
```

## Безопасность

- Rate limiting: 100 запросов за 15 минут
- Валидация всех входящих данных
- Проверка типов загружаемых файлов
- CORS настроен для работы с React
- Helmet для базовых заголовков безопасности

## Файлы и папки

```
perfume-backend/
├── server.js              # Главный файл сервера
├── package.json           # Зависимости проекта
├── database/
│   ├── db.js              # Модуль для работы с БД
│   └── perfumes.db        # База данных SQLite
├── routes/
│   ├── perfumes.js        # API роуты для ароматов
│   └── upload.js          # API роуты для загрузки файлов
├── uploads/               # Папка для изображений
└── README.md             # Документация
```

## Статус проекта

Бэкенд готов к работе! 🚀 Теперь вы можете:

1. Добавлять новые ароматы через API
2. Загружать изображения
3. Управлять каталогом через React фронтенд
4. Искать по ароматам

Для добавления ароматов используйте POST запросы к `/api/perfumes` или создайте админ-панель в React. 