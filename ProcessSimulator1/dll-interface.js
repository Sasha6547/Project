// Импорт необходимых модулей для работы с DLL
const ffi = require('ffi-napi'); // Для работы с foreign function interface (FFI)
const ref = require('ref-napi'); // Для работы с указателями и типами данных C
const Struct = require('ref-struct-napi'); // Для работы со структурами C

// Определение типов данных, используемых в DLL
const double = ref.types.double; // Тип double (число с плавающей точкой)
const uint32 = ref.types.uint32; // Тип unsigned int (32-битное беззнаковое целое)
const voidPtr = ref.refType(ref.types.void); // Тип void* (указатель)

// Определение пути к DLL файлу
const path = require('path');
const dllPath = path.join(__dirname, 'Simulator.dll'); // Путь к DLL в той же папке

// Создание интерфейса для работы с DLL
const simulatorLib = ffi.Library(dllPath, {
    // Функции для симулятора напряжения
    'createVoltageSimulator': [voidPtr, []], // Создает симулятор, возвращает указатель
    'destroyVoltageSimulator': ['void', [voidPtr]], // Уничтожает симулятор
    'startVoltageSimulator': ['void', [voidPtr]], // Запускает симулятор
    'stopVoltageSimulator': ['void', [voidPtr]], // Останавливает симулятор
    'setVoltageInterval': ['void', [voidPtr, uint32]], // Устанавливает интервал обновления
    'setVoltageRange': ['void', [voidPtr, double, double]], // Устанавливает диапазон значений
    'setVoltageStep': ['void', [voidPtr, double]], // Устанавливает шаг изменения
    'getCurrentVoltage': [double, [voidPtr]], // Получает текущее значение напряжения

    // Функции для симулятора температуры
    'createTemperatureSimulator': [voidPtr, []], // Создает симулятор, возвращает указатель
    'destroyTemperatureSimulator': ['void', [voidPtr]], // Уничтожает симулятор
    'startTemperatureSimulator': ['void', [voidPtr]], // Запускает симулятор
    'stopTemperatureSimulator': ['void', [voidPtr]], // Останавливает симулятор
    'setTemperatureInterval': ['void', [voidPtr, uint32]], // Устанавливает интервал обновления
    'setTemperatureRange': ['void', [voidPtr, double, double]], // Устанавливает диапазон значений
    'setTemperatureStep': ['void', [voidPtr, double]], // Устанавливает шаг изменения
    'getCurrentTemperature': [double, [voidPtr]], // Получает текущее значение температуры
});

// Класс-обертка для удобной работы с DLL
class DllWrapper {
    constructor() {
        // Создаем экземпляры симуляторов
        this.voltageSim = simulatorLib.createVoltageSimulator();
        this.tempSim = simulatorLib.createTemperatureSimulator();
        this.tempSim2 = simulatorLib.createTemperatureSimulator();

        // Устанавливаем начальные параметры симуляторов
        simulatorLib.setVoltageRange(this.voltageSim, 0, 10); // Диапазон напряжения 0-10В
        simulatorLib.setVoltageStep(this.voltageSim, 0.1); // Шаг изменения напряжения 0.1В
        simulatorLib.setTemperatureRange(this.tempSim, 20, 100); // Диапазон температуры 20-100°C
        simulatorLib.setTemperatureStep(this.tempSim, 0.5); // Шаг изменения температуры 0.5°C
        simulatorLib.setTemperatureRange(this.tempSim2, 20, 100); // Диапазон температуры 20-100°C
        simulatorLib.setTemperatureStep(this.tempSim2, 0.5); // Шаг изменения температуры 0.5°C

        // Регистрируем обработчик для корректного завершения работы
        process.on('exit', () => this.cleanup());
    }

    // Метод для запуска симуляторов
    start() {
        simulatorLib.startVoltageSimulator(this.voltageSim);
        simulatorLib.startTemperatureSimulator(this.tempSim);
        simulatorLib.startTemperatureSimulator(this.tempSim2);
    }

    // Метод для очистки ресурсов
    cleanup() {
        try {
            // Останавливаем и уничтожаем симулятор напряжения, если он существует
            if (this.voltageSim) {
                simulatorLib.stopVoltageSimulator(this.voltageSim);
                simulatorLib.destroyVoltageSimulator(this.voltageSim);
                this.voltageSim = null;
            }
            // Останавливаем и уничтожаем симулятор температуры, если он существует
            if (this.tempSim) {
                simulatorLib.stopTemperatureSimulator(this.tempSim);
                simulatorLib.destroyTemperatureSimulator(this.tempSim);
                this.tempSim = null;
            }
            // Останавливаем и уничтожаем симулятор температуры, если он существует
            if (this.tempSim2) {
                simulatorLib.stopTemperatureSimulator(this.tempSim2);
                simulatorLib.destroyTemperatureSimulator(this.tempSim2);
                this.tempSim2 = null;
            }
        } catch (e) {
            console.error('Cleanup error:', e);
        }
    }

    // Метод для установки параметров симулятора напряжения
    setVoltageSettings(min, max, step, interval) {
        simulatorLib.setVoltageRange(this.voltageSim, min, max); // Установка диапазона
        simulatorLib.setVoltageStep(this.voltageSim, step); // Установка шага
        simulatorLib.setVoltageInterval(this.voltageSim, interval); // Установка интервала
    }

    // Метод для получения текущего значения напряжения
    getVoltage() {
        return simulatorLib.getCurrentVoltage(this.voltageSim);
    }

    // Метод для установки параметров симулятора температуры
    setTemperatureSettings(min, max, step, interval) {
        simulatorLib.setTemperatureRange(this.tempSim, min, max); // Установка диапазона
        simulatorLib.setTemperatureStep(this.tempSim, step); // Установка шага
        simulatorLib.setTemperatureInterval(this.tempSim, interval); // Установка интервала
    }

    // Метод для получения текущего значения температуры
    getTemperature() {
        return simulatorLib.getCurrentTemperature(this.tempSim);
    }

    // Метод для установки параметров симулятора температуры
    setTemperature2Settings(min, max, step, interval) {
        simulatorLib.setTemperatureRange(this.tempSim2, min, max); // Установка диапазона
        simulatorLib.setTemperatureStep(this.tempSim2, step); // Установка шага
        simulatorLib.setTemperatureInterval(this.tempSim2, interval); // Установка интервала
    }

    // Метод для получения текущего значения температуры
    getTemperature2() {
        return simulatorLib.getCurrentTemperature(this.tempSim2);
    }
}

// Экспортируем экземпляр класса (синглтон)
module.exports = new DllWrapper();