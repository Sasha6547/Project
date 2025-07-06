// Импорт необходимых модулей
const express = require('express'); // Фреймворк для создания веб-сервера
const WebSocket = require('ws'); // Модуль для работы с WebSocket
const dll = require('./dll-interface'); // Пользовательский модуль для работы с DLL

// Создание Express приложения
const app = express();
const port = 3000; // Порт, на котором будет работать сервер

// Инициализация DLL
dll.start();

// Создание WebSocket сервера
const wss = new WebSocket.Server({ noServer: true }); // noServer: true - сервер будет привязан позже

// Обработчик подключений WebSocket
wss.on('connection', (ws) => {
    console.log('Новое подключение');

    // Установка интервала для отправки данных клиенту каждые 500 мс
    const interval = setInterval(() => {
        // Формирование объекта с данными
        const data = {
            voltage: dll.getVoltage(), // Получение напряжения из DLL
            temperature: dll.getTemperature(), // Получение температуры из DLL
            timestamp: new Date().toISOString() // Текущая метка времени
        };
        // Отправка данных клиенту в формате JSON
        ws.send(JSON.stringify(data));
    }, 500);

    // Обработчик закрытия соединения
    ws.on('close', () => {
        clearInterval(interval); // Очистка интервала при закрытии соединения
    });
});

// Настройка REST API
app.use(express.json()); // Парсинг JSON в теле запросов

// Роут для обновления настроек напряжения
app.post('/api/voltage/settings', (req, res) => {
    // Извлечение параметров из тела запроса
    const { min, max, step, interval } = req.body;
    // Установка новых настроек через DLL
    dll.setVoltageSettings(min, max, step, interval);
    // Отправка успешного ответа
    res.json({ status: 'success' });
});

// Роут для обновления настроек температуры
app.post('/api/temperature/settings', (req, res) => {
    // Извлечение параметров из тела запроса
    const { min, max, step, interval } = req.body;
    // Установка новых настроек через DLL
    dll.setTemperatureSettings(min, max, step, interval);
    // Отправка успешного ответа
    res.json({ status: 'success' });
});

// Настройка статического сервера для файлов из папки public
app.use(express.static('public'));

// Запуск HTTP сервера
const server = app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});

// Обработчик апгрейда соединения до WebSocket
server.on('upgrade', (request, socket, head) => {
    // Обработка апгрейда соединения
    wss.handleUpgrade(request, socket, head, (ws) => {
        // Эмитирование события connection после успешного апгрейда
        wss.emit('connection', ws, request);
    });
});

// Обработчик сигнала завершения работы (Ctrl+C)
process.on('SIGINT', () => {
    dll.cleanup(); // Очистка ресурсов DLL
    process.exit(); // Завершение процесса
});