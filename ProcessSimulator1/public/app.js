// Глобальные переменные для хранения данных и состояний
let voltageChart = null; // Объект графика Chart.js
let socket = null; // WebSocket соединение
let voltageData = []; // Массив для хранения данных напряжения
let temperatureData = []; // Массив для хранения данных температуры
let temperature2Data = []; // Массив для хранения данных второй температуры
let timeLabels = []; // Массив для хранения меток времени
let reconnectAttempts = 0; // Счетчик попыток переподключения
const MAX_RECONNECT_ATTEMPTS = 5; // Максимальное количество попыток переподключения
const RECONNECT_DELAY = 1000; // Задержка между попытками переподключения (мс)

// Обработчик события загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    initTabs(); // Инициализация вкладок
    initChart(); // Инициализация графика
    connectWebSocket(); // Подключение WebSocket

    // Назначение обработчиков кнопок
    document.getElementById('update-voltage-btn').addEventListener('click', updateVoltageSettings);
    document.getElementById('update-temp-btn').addEventListener('click', updateTempSettings);
    document.getElementById('update-temp2-btn').addEventListener('click', updateTemp2Settings);
});

// Функция инициализации вкладок
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Удаление класса active у всех кнопок
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Добавление класса active текущей кнопке
            this.classList.add('active');

            // Получение ID вкладки из атрибута data-tab
            const tabId = this.getAttribute('data-tab');
            // Скрытие всех вкладок
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            // Показ выбранной вкладки
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Функция инициализации графика
function initChart() {
    const ctx = document.getElementById('process-chart').getContext('2d');
    voltageChart = new Chart(ctx, {
        type: 'line', // Тип графика - линейный
        data: {
            labels: timeLabels, // Метки времени
            datasets: [
                {
                    label: 'Напряжение (В)', // Подпись для данных напряжения
                    data: voltageData, // Данные напряжения
                    borderColor: '#4361ee', // Цвет линии
                    backgroundColor: 'rgba(67, 97, 238, 0.1)', // Цвет заливки
                    borderWidth: 2, // Толщина линии
                    tension: 0.4, // Натяжение кривой
                    pointRadius: 4, // Размер точек
                    pointHoverRadius: 6, // Размер точек при наведении
                    pointBackgroundColor: '#4361ee', // Цвет точек
                    pointBorderColor: '#fff', // Цвет границы точек
                    pointBorderWidth: 1 // Толщина границы точек
                },
                {
                    label: 'Температура 1 (°C)', // Подпись для данных температуры
                    data: temperatureData, // Данные температуры
                    borderColor: '#f72585', // Цвет линии
                    backgroundColor: 'rgba(247, 37, 133, 0.1)', // Цвет заливки
                    borderWidth: 2, // Толщина линии
                    tension: 0.4, // Натяжение кривой
                    pointRadius: 4, // Размер точек
                    pointHoverRadius: 6, // Размер точек при наведении
                    pointBackgroundColor: '#f72585', // Цвет точек
                    pointBorderColor: '#fff', // Цвет границы точек
                    pointBorderWidth: 1 // Толщина границы точек
                },
                {
                    label: 'Температура 2 (°C)', // Подпись для данных второй температуры
                    data: temperature2Data, // Данные второй температуры
                    borderColor: '#4cc9f0', // Цвет линии (новый цвет для второго датчика)
                    backgroundColor: 'rgba(76, 201, 240, 0.1)', // Цвет заливки
                    borderWidth: 2, // Толщина линии
                    tension: 0.4, // Натяжение кривой
                    pointRadius: 4, // Размер точек
                    pointHoverRadius: 6, // Размер точек при наведении
                    pointBackgroundColor: '#4cc9f0', // Цвет точек
                    pointBorderColor: '#fff', // Цвет границы точек
                    pointBorderWidth: 1 // Толщина границы точек
                }
            ]
        },
        options: {
            responsive: true, // Адаптивность графика
            animation: {
                duration: 1000, // Длительность анимации
                easing: 'easeOutQuart', // Функция сглаживания анимации
                animateScale: true, // Анимация масштабирования
                animateRotate: true // Анимация вращения
            },
            transitions: {
                show: {
                    animations: {
                        x: {
                            from: 0 // Анимация по оси X при появлении
                        },
                        y: {
                            from: 0 // Анимация по оси Y при появлении
                        }
                    }
                },
                hide: {
                    animations: {
                        x: {
                            to: 0 // Анимация по оси X при скрытии
                        },
                        y: {
                            to: 0 // Анимация по оси Y при скрытии
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false // Не начинать ось Y с нуля
                }
            },
            plugins: {
                legend: {
                    display: true, // Показывать легенду
                    labels: {
                        color: '#333', // Цвет текста легенды
                        font: {
                            size: 14 // Размер шрифта легенды
                        }
                    }
                },
                tooltip: {
                    mode: 'index', // Режим подсказки
                    intersect: false, // Не требовать точного наведения
                    bodyFont: {
                        size: 14 // Размер шрифта тела подсказки
                    },
                    titleFont: {
                        size: 16 // Размер шрифта заголовка подсказки
                    }
                }
            },
            hover: {
                mode: 'nearest', // Режим при наведении
                intersect: true // Требовать пересечения с точкой
            }
        }
    });
}

// Функция подключения WebSocket
function connectWebSocket() {
    // Закрытие существующего соединения, если оно открыто
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
    }

    // Определение протокола (ws или wss)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Создание нового WebSocket соединения
    socket = new WebSocket(`${protocol}//${window.location.host}`);

    // Обработчик открытия соединения
    socket.onopen = function() {
        console.log('WebSocket подключен');
        reconnectAttempts = 0; // Сброс счетчика попыток переподключения
        // Обновление статусов на UI
        document.getElementById('voltage-status').textContent = 'Активна';
        document.getElementById('temp-status').textContent = 'Активна';
        document.getElementById('temp2-status').textContent = 'Активна';
    };

    // Обработчик входящих сообщений
    socket.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data); // Парсинг JSON данных
            updateDashboard(data); // Обновление дашборда
            document.getElementById('last-update').textContent = new Date().toLocaleTimeString(); // Обновление времени последнего обновления
        } catch (e) {
            console.error('Ошибка обработки сообщения WebSocket:', e);
        }
    };

    // Обработчик ошибок
    socket.onerror = function(error) {
        console.error('Ошибка WebSocket:', error);
        // Обновление статусов на UI
        document.getElementById('voltage-status').textContent = 'Ошибка';
        document.getElementById('temp-status').textContent = 'Ошибка';
    };

    // Обработчик закрытия соединения
    socket.onclose = function() {
        console.log('WebSocket отключен');
        // Обновление статусов на UI
        document.getElementById('voltage-status').textContent = 'Переподключение...';
        document.getElementById('temp-status').textContent = 'Переподключение...';

        // Попытка переподключения, если не достигнуто максимальное количество попыток
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            console.log(`Попытка переподключения (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
            setTimeout(connectWebSocket, RECONNECT_DELAY); // Повторная попытка через заданную задержку
        } else {
            console.error('Достигнуто максимальное количество попыток переподключения');
            // Обновление статусов на UI
            document.getElementById('voltage-status').textContent = 'Отключен';
            document.getElementById('temp-status').textContent = 'Отключен';
        }
    };
}

// Функция обновления дашборда
function updateDashboard(data) {
    // Обновление текущих значений на UI
    document.getElementById('current-voltage').textContent = data.voltage.toFixed(2);
    document.getElementById('current-temperature').textContent = data.temperature.toFixed(2);
    document.getElementById('current-temperature2').textContent = data.temperature2.toFixed(2);

    // Добавление новых данных в массивы
    const now = new Date();
    timeLabels.push(now.toLocaleTimeString());
    voltageData.push(data.voltage);
    temperatureData.push(data.temperature);
    temperature2Data.push(data.temperature2);

    // Ограничение количества отображаемых точек данных
    const maxDataPoints = 20;
    if (timeLabels.length > maxDataPoints) {
        timeLabels.shift(); // Удаление самой старой метки времени
        voltageData.shift(); // Удаление самого старого значения напряжения
        temperatureData.shift(); // Удаление самого старого значения температуры
        temperature2Data.shift(); // Удаление самого старого значения второй температуры
    }

    // Обновление данных графика
    voltageChart.data.labels = timeLabels;
    voltageChart.data.datasets[0].data = voltageData;
    voltageChart.data.datasets[1].data = temperatureData;
    voltageChart.data.datasets[2].data = temperature2Data;
    voltageChart.update('none'); // Обновление графика без анимации
}

// Функция обновления настроек второй температуры
async function updateTemp2Settings() {
    const btn = document.getElementById('update-temp2-btn');
    btn.disabled = true; // Блокировка кнопки во время запроса
    btn.textContent = 'Обновление...'; // Изменение текста кнопки

    // Получение значений из формы
    const settings = {
        min: parseFloat(document.getElementById('temp2-min').value),
        max: parseFloat(document.getElementById('temp2-max').value),
        step: parseFloat(document.getElementById('temp2-step').value),
        interval: parseInt(document.getElementById('temp-interval').value)
    };

    try {
        // Отправка запроса на сервер
        const response = await fetch('/api/temperature2/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP! статус: ${response.status}`);
        }

        showNotification('Настройки температуры 2 успешно обновлены!', 'success'); // Показ уведомления об успехе
    } catch (error) {
        console.error('Ошибка обновления настроек температуры 2:', error);
        showNotification('Не удалось обновить настройки температуры 2', 'error'); // Показ уведомления об ошибке
    } finally {
        btn.disabled = false; // Разблокировка кнопки
        btn.textContent = 'Обновить настройки температуры 2'; // Восстановление текста кнопки
    }
}

// Функция обновления настроек напряжения
async function updateVoltageSettings() {
    const btn = document.getElementById('update-voltage-btn');
    btn.disabled = true; // Блокировка кнопки во время запроса
    btn.textContent = 'Обновление...'; // Изменение текста кнопки

    // Получение значений из формы
    const settings = {
        min: parseFloat(document.getElementById('voltage-min').value),
        max: parseFloat(document.getElementById('voltage-max').value),
        step: parseFloat(document.getElementById('voltage-step').value),
        interval: parseInt(document.getElementById('voltage-interval').value)
    };

    try {
        // Отправка запроса на сервер
        const response = await fetch('/api/voltage/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP! статус: ${response.status}`);
        }

        showNotification('Настройки напряжения успешно обновлены!', 'success'); // Показ уведомления об успехе
    } catch (error) {
        console.error('Ошибка обновления настроек напряжения:', error);
        showNotification('Не удалось обновить настройки напряжения', 'error'); // Показ уведомления об ошибке
    } finally {
        btn.disabled = false; // Разблокировка кнопки
        btn.textContent = 'Обновить настройки напряжения'; // Восстановление текста кнопки
    }
}

// Функция обновления настроек температуры
async function updateTempSettings() {
    const btn = document.getElementById('update-temp-btn');
    btn.disabled = true; // Блокировка кнопки во время запроса
    btn.textContent = 'Обновление...'; // Изменение текста кнопки

    // Получение значений из формы
    const settings = {
        min: parseFloat(document.getElementById('temp-min').value),
        max: parseFloat(document.getElementById('temp-max').value),
        step: parseFloat(document.getElementById('temp-step').value),
        interval: parseInt(document.getElementById('temp-interval').value)
    };

    try {
        // Отправка запроса на сервер
        const response = await fetch('/api/temperature/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP! статус: ${response.status}`);
        }

        showNotification('Настройки температуры успешно обновлены!', 'success'); // Показ уведомления об успехе
    } catch (error) {
        console.error('Ошибка обновления настроек температуры:', error);
        showNotification('Не удалось обновить настройки температуры', 'error'); // Показ уведомления об ошибке
    } finally {
        btn.disabled = false; // Разблокировка кнопки
        btn.textContent = 'Обновить настройки температуры'; // Восстановление текста кнопки
    }
}

// Функция показа уведомлений
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`; // Добавление классов для стилизации
    notification.textContent = message; // Установка текста уведомления
    document.body.appendChild(notification); // Добавление уведомления в DOM

    // Плавное появление уведомления
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);

    // Автоматическое скрытие уведомления через 3 секунды
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}