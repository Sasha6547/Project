#pragma once

// ������ ��� ��������/������� ������� DLL
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

// ����� ���������� ����������
class PROCESS_SIMULATOR_API VoltageSimulator {
public:
    VoltageSimulator();
    ~VoltageSimulator();

    void start();  // ������ ����������
    void stop();   // ��������� ����������
    bool isRunning() const;  // �������� ���������

    void setInterval(unsigned int milliseconds);  // ��������� ���������
    unsigned int getInterval() const;  // ��������� ���������

    void setMinVoltage(double value);  // ��������� ���. ����������
    void setMaxVoltage(double value);  // ��������� ����. ����������
    void setStepSize(double value);    // ��������� ���� ���������

    double getCurrentVoltage() const;  // ��������� �������� ����������

    // ��� callback-������� ��� ���������� ����������
    typedef void (*VoltageUpdateCallback)(double voltage);
    void registerCallback(VoltageUpdateCallback callback);  // ����������� callback

private:
    void run();  // �������� ������� ����

    std::atomic<bool> running;  // ���� ������ ����������
    std::thread workerThread;   // ������� �����
    mutable std::mutex mutex;   // ������� ��� �������������

    unsigned int interval;      // �������� ���������� (��)
    double minVoltage;          // ����������� ����������
    double maxVoltage;          // ������������ ����������
    double stepSize;            // ��� ���������
    double currentVoltage;      // ������� ����������
    bool increasing;            // ���� ����������� ���������
    VoltageUpdateCallback callback;  // Callback-�������
};

// ����� ���������� ����������� (���������� ���������� ����������)
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

// C-��������� ��� �������� �������
extern "C" {
    // ������� ��� ������ � ����������� ����������
    PROCESS_SIMULATOR_API VoltageSimulator* createVoltageSimulator();
    PROCESS_SIMULATOR_API void destroyVoltageSimulator(VoltageSimulator* instance);
    PROCESS_SIMULATOR_API void startVoltageSimulator(VoltageSimulator* instance);
    PROCESS_SIMULATOR_API void stopVoltageSimulator(VoltageSimulator* instance);
    PROCESS_SIMULATOR_API void setVoltageInterval(VoltageSimulator* instance, unsigned int milliseconds);
    PROCESS_SIMULATOR_API void setVoltageRange(VoltageSimulator* instance, double min, double max);
    PROCESS_SIMULATOR_API void setVoltageStep(VoltageSimulator* instance, double step);
    PROCESS_SIMULATOR_API double getCurrentVoltage(VoltageSimulator* instance);
    PROCESS_SIMULATOR_API void registerVoltageCallback(VoltageSimulator* instance, VoltageSimulator::VoltageUpdateCallback callback);

    // ������� ��� ������ � ����������� �����������
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