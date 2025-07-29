// Конфигурация API
const API_BASE_URL = 'http://localhost:3001/api';

// Состояние приложения
let currentProducts = [];
let isLoading = false;
let currentView = 'table'; // 'table' или 'grid'

// Элементы DOM
const elements = {
    sidebar: document.querySelector('.sidebar'),
    navItems: document.querySelectorAll('.nav-item'),
    contentSections: document.querySelectorAll('.content-section'),
    pageTitle: document.getElementById('page-title'),
    breadcrumbCurrent: document.getElementById('breadcrumb-current'),
    addProductBtn: document.getElementById('add-product-btn'),
    addProductModal: document.getElementById('add-product-modal'),
    addProductForm: document.getElementById('add-product-form'),
    productsTable: document.getElementById('products-tbody'),
    searchInput: document.getElementById('search-input'),
    categoryFilter: document.getElementById('category-filter'),
    genderFilter: document.getElementById('gender-filter'),
    loading: document.getElementById('loading'),
    emptyState: document.getElementById('empty-state'),
    productImage: document.getElementById('product-image'),
    imagePreview: document.getElementById('image-preview'),
    notifications: document.getElementById('notifications'),
    tableView: document.getElementById('table-view'),
    gridView: document.getElementById('grid-view'),
    viewControls: document.querySelectorAll('[data-view]')
};

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Инициализация приложения
function initializeApp() {
    console.log('🚀 Инициализация админ-панели');
    
    // Загрузка товаров
    loadProducts();
    
    // Событие навигации
    elements.navItems.forEach(item => {
        item.addEventListener('click', handleNavigation);
    });
    
    // Событие добавления товара
    elements.addProductBtn.addEventListener('click', openAddProductModal);
    
    // Событие формы
    elements.addProductForm.addEventListener('submit', handleProductSubmit);
    
    // События поиска и фильтрации
    elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
    elements.categoryFilter.addEventListener('change', handleFilter);
    elements.genderFilter.addEventListener('change', handleFilter);
    
    // Событие превью изображения
    elements.productImage.addEventListener('change', handleImagePreview);
    
    // События переключения видов
    elements.viewControls.forEach(control => {
        control.addEventListener('click', handleViewChange);
    });
    
    // Закрытие модального окна по клику вне его
    elements.addProductModal.addEventListener('click', function(e) {
        if (e.target === elements.addProductModal) {
            closeAddProductModal();
        }
    });
    
    // Закрытие модального окна по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && elements.addProductModal.classList.contains('active')) {
            closeAddProductModal();
        }
    });
}

// Навигация между секциями
function handleNavigation(e) {
    e.preventDefault();
    
    const clickedItem = e.currentTarget;
    const sectionName = clickedItem.dataset.section;
    
    // Убираем активный класс со всех элементов навигации
    elements.navItems.forEach(item => item.classList.remove('active'));
    
    // Добавляем активный класс к кликнутому элементу
    clickedItem.classList.add('active');
    
    // Скрываем все секции
    elements.contentSections.forEach(section => section.classList.remove('active'));
    
    // Показываем нужную секцию
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Обновляем заголовок и breadcrumb
    const sectionTitles = {
        products: 'Товары',
        orders: 'Заказы',
        collections: 'Коллекции',
        analytics: 'Аналитика'
    };
    
    elements.pageTitle.textContent = sectionTitles[sectionName];
    elements.breadcrumbCurrent.textContent = sectionTitles[sectionName];
    
    // Загружаем данные для секции если нужно
    if (sectionName === 'products') {
        loadProducts();
    }
}

// Загрузка товаров
async function loadProducts() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/perfumes`);
        const data = await response.json();
        
        if (data.success) {
            currentProducts = data.data;
            renderProducts(currentProducts);
        } else {
            showNotification('error', 'Ошибка', 'Не удалось загрузить товары');
        }
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        showNotification('error', 'Ошибка', 'Проблема с подключением к серверу');
    } finally {
        showLoading(false);
    }
}

// Показать/скрыть загрузку
function showLoading(show) {
    isLoading = show;
    elements.loading.style.display = show ? 'block' : 'none';
    elements.emptyState.style.display = 'none';
    
    if (show) {
        elements.productsTable.innerHTML = '';
    }
}

// Переключение видов
function handleViewChange(e) {
    const view = e.currentTarget.dataset.view;
    
    // Обновляем активные кнопки
    elements.viewControls.forEach(control => {
        control.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
    
    // Переключаем вид
    currentView = view;
    renderProducts(currentProducts);
}

// Универсальная функция рендеринга
function renderProducts(products) {
    if (currentView === 'table') {
        renderProductsTable(products);
        elements.tableView.classList.remove('hidden');
        elements.tableView.classList.add('visible');
        elements.gridView.classList.remove('visible');
        elements.gridView.classList.add('hidden');
    } else {
        renderProductsGrid(products);
        elements.gridView.classList.remove('hidden');
        elements.gridView.classList.add('visible');
        elements.tableView.classList.remove('visible');
        elements.tableView.classList.add('hidden');
    }
}

// Отображение таблицы товаров
function renderProductsTable(products) {
    const tbody = elements.productsTable;
    
    if (products.length === 0) {
        tbody.innerHTML = '';
        elements.emptyState.style.display = 'block';
        return;
    }
    
    elements.emptyState.style.display = 'none';
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                ${product.image_url 
                    ? `<img src="${API_BASE_URL.replace('/api', '')}${product.image_url}" alt="${product.name}" class="product-image">`
                    : '<div class="product-image" style="background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af;"><i class="fas fa-image"></i></div>'
                }
            </td>
            <td>
                <div style="font-weight: 500; color: #1f2937;">${product.name}</div>
                <div style="font-size: 12px; color: #6b7280;">${product.volume ? product.volume + ' мл' : ''}</div>
            </td>
            <td>${product.brand}</td>
            <td style="font-weight: 500;">
                ${product.price ? product.price.toLocaleString('ru-RU') + ' ₽' : '—'}
            </td>
            <td>
                <span style="font-weight: 500; color: ${product.stock_quantity > 0 ? '#059669' : '#dc2626'};">
                    ${product.stock_quantity || 0}
                </span>
            </td>
            <td>
                <span class="category-tag">${getCategoryName(product.category)}</span>
                <span class="gender-tag">${getGenderName(product.gender)}</span>
            </td>
            <td>
                <span class="status-badge ${product.is_available ? 'status-active' : 'status-inactive'}">
                    ${product.is_available ? 'Активный' : 'Неактивный'}
                </span>
            </td>
            <td style="font-size: 13px; color: #6b7280;">
                ${formatDate(product.created_at)}
            </td>
            <td>
                <div class="actions">
                    <button class="action-btn edit-btn" onclick="editProduct(${product.id})" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Отображение flip-карточек товаров
function renderProductsGrid(products) {
    const gridContainer = elements.gridView;
    
    if (products.length === 0) {
        gridContainer.innerHTML = '';
        elements.emptyState.style.display = 'block';
        return;
    }
    
    elements.emptyState.style.display = 'none';
    
    gridContainer.innerHTML = products.map(product => `
        <div class="product-flip-card">
            <div class="product-flip-card-inner">
                <!-- Лицевая сторона -->
                <div class="product-flip-card-front">
                    <div class="flip-card-category">${getCategoryName(product.category)}</div>
                    <div class="flip-card-status ${product.is_available ? 'active' : 'inactive'}">
                        ${product.is_available ? 'Активный' : 'Неактивный'}
                    </div>
                    
                    ${product.image_url 
                        ? `<img src="${API_BASE_URL.replace('/api', '')}${product.image_url}" alt="${product.name}" class="flip-card-image">`
                        : '<div class="flip-card-image-placeholder"><i class="fas fa-image"></i></div>'
                    }
                    
                    <div class="flip-card-front-content">
                        <div class="flip-card-title">${product.name}</div>
                        <div class="flip-card-brand">${product.brand}</div>
                        <div class="flip-card-price">
                            ${product.price ? product.price.toLocaleString('ru-RU') + ' ₽' : 'Цена не указана'}
                        </div>
                    </div>
                </div>
                
                <!-- Обратная сторона -->
                <div class="product-flip-card-back">
                    <div class="flip-card-back-header">
                        <div class="flip-card-back-title">${product.name}</div>
                        <div class="flip-card-back-brand">${product.brand}</div>
                    </div>
                    
                    <div class="flip-card-details">
                        <div class="flip-card-detail-row">
                            <span class="flip-card-detail-label">Объем</span>
                            <span class="flip-card-detail-value">${product.volume ? product.volume + ' мл' : '—'}</span>
                        </div>
                        <div class="flip-card-detail-row">
                            <span class="flip-card-detail-label">Пол</span>
                            <span class="flip-card-detail-value">${getGenderName(product.gender)}</span>
                        </div>
                        <div class="flip-card-detail-row">
                            <span class="flip-card-detail-label">В наличии</span>
                            <span class="flip-card-detail-value" style="color: ${product.stock_quantity > 0 ? '#059669' : '#dc2626'};">
                                ${product.stock_quantity || 0} шт.
                            </span>
                        </div>
                        <div class="flip-card-detail-row">
                            <span class="flip-card-detail-label">Добавлен</span>
                            <span class="flip-card-detail-value">${formatDate(product.created_at)}</span>
                        </div>
                    </div>
                    
                    ${(product.notes_top || product.notes_middle || product.notes_base) ? `
                        <div class="flip-card-notes">
                            <h4>Пирамида аромата</h4>
                            ${product.notes_top ? `<p><strong>Верх:</strong> ${product.notes_top}</p>` : ''}
                            ${product.notes_middle ? `<p><strong>Сердце:</strong> ${product.notes_middle}</p>` : ''}
                            ${product.notes_base ? `<p><strong>База:</strong> ${product.notes_base}</p>` : ''}
                        </div>
                    ` : ''}
                    
                    <div class="flip-card-actions">
                        <button class="flip-card-btn flip-card-btn-edit" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i> Редактировать
                        </button>
                        <button class="flip-card-btn flip-card-btn-delete" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Поиск товаров
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm === '') {
        renderProducts(currentProducts);
        return;
    }
    
    const filteredProducts = currentProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
    );
    
    renderProducts(filteredProducts);
}

// Фильтрация товаров
function handleFilter() {
    const category = elements.categoryFilter.value;
    const gender = elements.genderFilter.value;
    const searchTerm = elements.searchInput.value.toLowerCase();
    
    let filteredProducts = currentProducts;
    
    // Фильтр по категории
    if (category) {
        filteredProducts = filteredProducts.filter(product => product.category === category);
    }
    
    // Фильтр по полу
    if (gender) {
        filteredProducts = filteredProducts.filter(product => product.gender === gender);
    }
    
    // Поиск
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
    }
    
    renderProducts(filteredProducts);
}

// Открытие модального окна добавления товара
function openAddProductModal() {
    elements.addProductModal.classList.add('active');
    elements.addProductForm.reset();
    elements.imagePreview.classList.remove('active');
    
    // Фокус на первое поле
    setTimeout(() => {
        document.getElementById('product-name').focus();
    }, 100);
}

// Закрытие модального окна
function closeAddProductModal() {
    elements.addProductModal.classList.remove('active');
    elements.addProductForm.reset();
    elements.imagePreview.classList.remove('active');
}

// Превью изображения
function handleImagePreview(e) {
    const file = e.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            elements.imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            elements.imagePreview.classList.add('active');
        };
        reader.readAsDataURL(file);
    } else {
        elements.imagePreview.classList.remove('active');
    }
}

// Обработка отправки формы
async function handleProductSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        // Показываем загрузку
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
        submitBtn.disabled = true;
        
        // Подготовка данных
        const formData = new FormData();
        const form = elements.addProductForm;
        
        // Добавляем все поля формы
        const fields = ['name', 'brand', 'description', 'price', 'volume', 'category', 
                       'notes_top', 'notes_middle', 'notes_base', 'gender', 'stock_quantity'];
        
        fields.forEach(field => {
            const value = form[field].value;
            if (value) {
                formData.append(field, value);
            }
        });
        
        // Загружаем изображение если есть
        let imageUrl = '';
        const imageFile = elements.productImage.files[0];
        
        if (imageFile) {
            const uploadFormData = new FormData();
            uploadFormData.append('image', imageFile);
            
            const uploadResponse = await fetch(`${API_BASE_URL}/upload/image`, {
                method: 'POST',
                body: uploadFormData
            });
            
            const uploadData = await uploadResponse.json();
            
            if (uploadData.success) {
                imageUrl = uploadData.data.url;
            } else {
                throw new Error('Ошибка загрузки изображения');
            }
        }
        
        // Подготавливаем данные для отправки
        const productData = {};
        fields.forEach(field => {
            const value = form[field].value;
            if (value) {
                if (field === 'price' || field === 'volume' || field === 'stock_quantity') {
                    productData[field] = parseFloat(value) || 0;
                } else {
                    productData[field] = value;
                }
            }
        });
        
        if (imageUrl) {
            productData.image_url = imageUrl;
        }
        
        // Отправляем товар
        const response = await fetch(`${API_BASE_URL}/perfumes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('success', 'Успех!', 'Товар успешно добавлен');
            closeAddProductModal();
            loadProducts(); // Перезагружаем список товаров
        } else {
            throw new Error(data.error || 'Ошибка добавления товара');
        }
        
    } catch (error) {
        console.error('Ошибка добавления товара:', error);
        showNotification('error', 'Ошибка', error.message);
    } finally {
        // Возвращаем кнопку в исходное состояние
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Редактирование товара
function editProduct(id) {
    showNotification('info', 'В разработке', 'Функция редактирования будет добавлена позже');
}

// Удаление товара
async function deleteProduct(id) {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/perfumes/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('success', 'Удалено', 'Товар успешно удален');
            loadProducts(); // Перезагружаем список
        } else {
            throw new Error(data.error || 'Ошибка удаления товара');
        }
    } catch (error) {
        console.error('Ошибка удаления товара:', error);
        showNotification('error', 'Ошибка', error.message);
    }
}

// Уведомления
function showNotification(type, title, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="${iconMap[type]}"></i>
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;
    
    elements.notifications.appendChild(notification);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Вспомогательные функции
function getCategoryName(category) {
    const categories = {
        niche: 'Нишевые',
        designer: 'Дизайнерские',
        natural: 'Натуральные',
        oriental: 'Восточные',
        fresh: 'Свежие',
        woody: 'Древесные',
        floral: 'Цветочные',
        citrus: 'Цитрусовые',
        gourmand: 'Гурманские',
        other: 'Другие'
    };
    return categories[category] || category;
}

function getGenderName(gender) {
    const genders = {
        male: 'Мужской',
        female: 'Женский',
        unisex: 'Унисекс'
    };
    return genders[gender] || gender;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Добавляем стили для анимации выхода уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 