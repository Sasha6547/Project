#pragma once

// Макрос для экспорта/импорта функций DLL
#ifdef PROCESS_SIMULATOR_EXPORTS
#define PROCESS_SIMULATOR_API __declspec(dllexport)
#else
#define PROCESS_SIMULATOR_API __declspec(dllimport)
#endif

#include <string>
#include <thread>
#include <atomic>
#include <mutex>
#include <functional>

// Класс симулятора напряжения
class PROCESS_SIMULATOR_API VoltageSimulator {
public:
    VoltageSimulator();
    ~VoltageSimulator();

    void start();  // Запуск симулятора
    void stop();   // Остановка симулятора
    bool isRunning() const;  // Проверка состояния

    void setInterval(unsigned int milliseconds);  // Установка интервала
    unsigned int getInterval() const;  // Получение интервала

    void setMinVoltage(double value);  // Установка мин. напряжения
    void setMaxVoltage(double value);  // Установка макс. напряжения
    void setStepSize(double value);    // Установка шага изменения

    double getCurrentVoltage() const;  // Получение текущего напряжения

    // Тип callback-функции для обновления напряжения
    typedef void (*VoltageUpdateCallback)(double voltage);
    void registerCallback(VoltageUpdateCallback callback);  // Регистрация callback

private:
    void run();  // Основной рабочий цикл

    std::atomic<bool> running;  // Флаг работы симулятора
    std::thread workerThread;   // Рабочий поток
    mutable std::mutex mutex;   // Мьютекс для синхронизации

    unsigned int interval;      // Интервал обновления (мс)
    double minVoltage;          // Минимальное напряжение
    double maxVoltage;          // Максимальное напряжение
    double stepSize;            // Шаг изменения
    double currentVoltage;      // Текущее напряжение
    bool increasing;            // Флаг направления изменения
    VoltageUpdateCallback callback;  // Callback-функция
};

// Класс симулятора температуры (аналогичен симулятору напряжения)
class PROCESS_SIMULATOR_API TemperatureSimulator {
public:
    TemperatureSimulator();
    ~TemperatureSimulator();

    void start();
    void stop();
    bool isRunning() const;

    void setInterval(unsigned int milliseconds);
    unsigned int getInterval() const;

    void setMinTemperature(double value);
    void setMaxTemperature(double value);
    void setStepSize(double value);

    double getCurrentTemperature() const;

    typedef void (*TemperatureUpdateCallback)(double temperature);
    void registerCallback(TemperatureUpdateCallback callback);

private:
    void run();

    std::atomic<bool> running;
    std::thread workerThread;
    mutable std::mutex mutex;

    unsigned int interval;
    double minTemperature;
    double maxTemperature;
    double stepSize;
    double currentTemperature;
    bool increasing;
    TemperatureUpdateCallback callback;
};

// C-интерфейс для экспорта функций
extern "C" {
    // Функции для работы с симулятором напряжения
    PROCESS_SIMULATOR_API VoltageSimulator* createVoltageSimulator();
    PROCESS_SIMULATOR_API void destroyVoltageSimulator(VoltageSimulator* instance);
    PROCESS_SIMULATOR_API void startVoltageSimulator(VoltageSimulator* instance);
    PROCESS_SIMULATOR_API void stopVoltageSimulator(VoltageSimulator* instance);
    PROCESS_SIMULATOR_API void setVoltageInterval(VoltageSimulator* instance, unsigned int milliseconds);
    PROCESS_SIMULATOR_API void setVoltageRange(VoltageSimulator* instance, double min, double max);
    PROCESS_SIMULATOR_API void setVoltageStep(VoltageSimulator* instance, double step);
    PROCESS_SIMULATOR_API double getCurrentVoltage(VoltageSimulator* instance);
    PROCESS_SIMULATOR_API void registerVoltageCallback(VoltageSimulator* instance, VoltageSimulator::VoltageUpdateCallback callback);

    // Функции для работы с симулятором температуры
    PROCESS_SIMULATOR_API TemperatureSimulator* createTemperatureSimulator();
    PROCESS_SIMULATOR_API void destroyTemperatureSimulator(TemperatureSimulator* instance);
    PROCESS_SIMULATOR_API void startTemperatureSimulator(TemperatureSimulator* instance);
    PROCESS_SIMULATOR_API void stopTemperatureSimulator(TemperatureSimulator* instance);
    PROCESS_SIMULATOR_API void setTemperatureInterval(TemperatureSimulator* instance, unsigned int milliseconds);
    PROCESS_SIMULATOR_API void setTemperatureRange(TemperatureSimulator* instance, double min, double max);
    PROCESS_SIMULATOR_API void setTemperatureStep(TemperatureSimulator* instance, double step);
    PROCESS_SIMULATOR_API double getCurrentTemperature(TemperatureSimulator* instance);
    PROCESS_SIMULATOR_API void registerTemperatureCallback(TemperatureSimulator* instance, TemperatureSimulator::TemperatureUpdateCallback callback);
}