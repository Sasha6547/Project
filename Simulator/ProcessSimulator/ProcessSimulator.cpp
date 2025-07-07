#include "pch.h"
#include "ProcessSimulator.h"
#include <chrono>
#include <random>

// Конструктор симулятора напряжения
VoltageSimulator::VoltageSimulator()
    : running(false), interval(1000), minVoltage(0), maxVoltage(10),
    stepSize(0.1), currentVoltage(0), increasing(true) {
}

// Деструктор симулятора напряжения
VoltageSimulator::~VoltageSimulator() {
    stop();
}

// Запуск симулятора напряжения
void VoltageSimulator::start() {
    if (!running) {
        running = true;
        workerThread = std::thread(&VoltageSimulator::run, this);
    }
}

// Остановка симулятора напряжения
void VoltageSimulator::stop() {
    if (running) {
        running = false;
        if (workerThread.joinable()) {
            workerThread.join();
        }
    }
}

// Проверка, работает ли симулятор напряжения
bool VoltageSimulator::isRunning() const {
    return running;
}

// Установка интервала обновления напряжения (в миллисекундах)
void VoltageSimulator::setInterval(unsigned int milliseconds) {
    std::lock_guard<std::mutex> lock(mutex);
    interval = milliseconds;
}

// Получение текущего интервала обновления
unsigned int VoltageSimulator::getInterval() const {
    return interval;
}

// Установка минимального значения напряжения
void VoltageSimulator::setMinVoltage(double value) {
    std::lock_guard<std::mutex> lock(mutex);
    minVoltage = value;
}

// Установка максимального значения напряжения
void VoltageSimulator::setMaxVoltage(double value) {
    std::lock_guard<std::mutex> lock(mutex);
    maxVoltage = value;
}

// Установка шага изменения напряжения
void VoltageSimulator::setStepSize(double value) {
    std::lock_guard<std::mutex> lock(mutex);
    stepSize = value;
}

// Получение текущего значения напряжения
double VoltageSimulator::getCurrentVoltage() const {
    std::lock_guard<std::mutex> lock(mutex);
    return currentVoltage;
}

// Регистрация callback-функции для обновления напряжения
void VoltageSimulator::registerCallback(VoltageUpdateCallback callback) {
    this->callback = callback;
}

// Основной цикл работы симулятора напряжения
void VoltageSimulator::run() {
    // Инициализация генератора случайных чисел
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dist(-1, 1); // Возможные значения: -1, 0, 1

    while (running) {
        auto start = std::chrono::steady_clock::now();

        {
            std::lock_guard<std::mutex> lock(mutex);

            // Логика случайного изменения напряжения
            int randomStep = dist(gen); // Получаем случайное значение: -1, 0 или 1
            currentVoltage += randomStep * stepSize;

            // Ограничение напряжения в заданных пределах
            if (currentVoltage > maxVoltage) {
                currentVoltage = maxVoltage;
            }
            else if (currentVoltage < minVoltage) {
                currentVoltage = minVoltage;
            }

            // Вызов callback-функции, если она зарегистрирована
            if (callback) {
                callback(currentVoltage);
            }
        }

        // Расчет времени для следующего обновления
        auto end = std::chrono::steady_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();
        auto sleepTime = interval - elapsed;

        if (sleepTime > 0) {
            std::this_thread::sleep_for(std::chrono::milliseconds(sleepTime));
        }
    }
}

// Конструктор симулятора температуры
TemperatureSimulator::TemperatureSimulator()
    : running(false), interval(1000), minTemperature(20), maxTemperature(100),
    stepSize(0.5), currentTemperature(20), increasing(true) {
}

// Деструктор симулятора температуры
TemperatureSimulator::~TemperatureSimulator() {
    stop();
}

// Запуск симулятора температуры
void TemperatureSimulator::start() {
    if (!running) {
        running = true;
        workerThread = std::thread(&TemperatureSimulator::run, this);
    }
}

// Остановка симулятора температуры
void TemperatureSimulator::stop() {
    if (running) {
        running = false;
        if (workerThread.joinable()) {
            workerThread.join();
        }
    }
}

// Проверка, работает ли симулятор температуры
bool TemperatureSimulator::isRunning() const {
    return running;
}

// Установка интервала обновления температуры (в миллисекундах)
void TemperatureSimulator::setInterval(unsigned int milliseconds) {
    std::lock_guard<std::mutex> lock(mutex);
    interval = milliseconds;
}

// Получение текущего интервала обновления
unsigned int TemperatureSimulator::getInterval() const {
    return interval;
}

// Установка минимального значения температуры
void TemperatureSimulator::setMinTemperature(double value) {
    std::lock_guard<std::mutex> lock(mutex);
    minTemperature = value;
}

// Установка максимального значения температуры
void TemperatureSimulator::setMaxTemperature(double value) {
    std::lock_guard<std::mutex> lock(mutex);
    maxTemperature = value;
}

// Установка шага изменения температуры
void TemperatureSimulator::setStepSize(double value) {
    std::lock_guard<std::mutex> lock(mutex);
    stepSize = value;
}

// Получение текущего значения температуры
double TemperatureSimulator::getCurrentTemperature() const {
    std::lock_guard<std::mutex> lock(mutex);
    return currentTemperature;
}

// Регистрация callback-функции для обновления температуры
void TemperatureSimulator::registerCallback(TemperatureUpdateCallback callback) {
    this->callback = callback;
}

// Основной цикл работы симулятора температуры
void TemperatureSimulator::run() {
    // Инициализация генератора случайных чисел
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<> dist(-1.0, 1.0); // Диапазон от -1.0 до 1.0

    while (running) {
        auto start = std::chrono::steady_clock::now();

        {
            std::lock_guard<std::mutex> lock(mutex);

            // Логика случайного изменения температуры
            double randomFactor = dist(gen); // Случайное значение от -1.0 до 1.0
            currentTemperature += randomFactor * stepSize;

            // Ограничение температуры в заданных пределах
            if (currentTemperature > maxTemperature) {
                currentTemperature = maxTemperature;
            }
            else if (currentTemperature < minTemperature) {
                currentTemperature = minTemperature;
            }

            // Вызов callback-функции, если она зарегистрирована
            if (callback) {
                callback(currentTemperature);
            }
        }

        // Расчет времени для следующего обновления
        auto end = std::chrono::steady_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();
        auto sleepTime = interval - elapsed;

        if (sleepTime > 0) {
            std::this_thread::sleep_for(std::chrono::milliseconds(sleepTime));
        }
    }
}

// C-интерфейс для работы с симулятором напряжения
extern "C" {
    // Создание экземпляра симулятора напряжения
    VoltageSimulator* createVoltageSimulator() { return new VoltageSimulator(); }

    // Удаление экземпляра симулятора напряжения
    void destroyVoltageSimulator(VoltageSimulator* instance) { delete instance; }

    // Запуск симулятора напряжения
    void startVoltageSimulator(VoltageSimulator* instance) { instance->start(); }

    // Остановка симулятора напряжения
    void stopVoltageSimulator(VoltageSimulator* instance) { instance->stop(); }

    // Установка интервала обновления
    void setVoltageInterval(VoltageSimulator* instance, unsigned int milliseconds) { instance->setInterval(milliseconds); }

    // Установка диапазона напряжения
    void setVoltageRange(VoltageSimulator* instance, double min, double max) {
        instance->setMinVoltage(min);
        instance->setMaxVoltage(max);
    }

    // Установка шага изменения напряжения
    void setVoltageStep(VoltageSimulator* instance, double step) { instance->setStepSize(step); }

    // Получение текущего значения напряжения
    double getCurrentVoltage(VoltageSimulator* instance) { return instance->getCurrentVoltage(); }

    // Регистрация callback-функции
    void registerVoltageCallback(VoltageSimulator* instance, VoltageSimulator::VoltageUpdateCallback callback) {
        instance->registerCallback(callback);
    }
}

// C-интерфейс для работы с симулятором температуры
extern "C" {
    // Создание экземпляра симулятора температуры
    TemperatureSimulator* createTemperatureSimulator() { return new TemperatureSimulator(); }

    // Удаление экземпляра симулятора температуры
    void destroyTemperatureSimulator(TemperatureSimulator* instance) { delete instance; }

    // Запуск симулятора температуры
    void startTemperatureSimulator(TemperatureSimulator* instance) { instance->start(); }

    // Остановка симулятора температуры
    void stopTemperatureSimulator(TemperatureSimulator* instance) { instance->stop(); }

    // Установка интервала обновления
    void setTemperatureInterval(TemperatureSimulator* instance, unsigned int milliseconds) { instance->setInterval(milliseconds); }

    // Установка диапазона температуры
    void setTemperatureRange(TemperatureSimulator* instance, double min, double max) {
        instance->setMinTemperature(min);
        instance->setMaxTemperature(max);
    }

    // Установка шага изменения температуры
    void setTemperatureStep(TemperatureSimulator* instance, double step) { instance->setStepSize(step); }

    // Получение текущего значения температуры
    double getCurrentTemperature(TemperatureSimulator* instance) { return instance->getCurrentTemperature(); }

    // Регистрация callback-функции
    void registerTemperatureCallback(TemperatureSimulator* instance, TemperatureSimulator::TemperatureUpdateCallback callback) {
        instance->registerCallback(callback);
    }
}