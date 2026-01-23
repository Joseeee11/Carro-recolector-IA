#include <WiFiManager.h> // https://github.com/tzapu/WiFiManager
#include <SocketIoClient.h> // https://github.com/timum-viw/socket.io-client
#include <ArduinoJson.h>   // https://arduinojson.org/?utm_source=meta&utm_medium=library.properties

/* ====================================================================
   --- CONFIGURACIÓN DE MOTORES (Tu código original) ---
   ==================================================================== */
// Motor Izquierdo (LEFT)
const int pin_L_IN1 = 26; 
const int pin_L_IN2 = 25; 
const int pin_L_PWM = 33; 

// Motor Derecho (RIGHT)
const int pin_R_IN1 = 18; 
const int pin_R_IN2 = 19; 
const int pin_R_PWM = 32; 

// Configuración PWM
const int freqPWM = 5000;
const int resolutionPWM = 8;

/* ====================================================================
   --- CONFIGURACIÓN DE RED Y SOCKET.IO ---
   ==================================================================== */
char server[] = "192.168.1.36"; // <--- IP DEL SERVIDOR AQUÍ
int port = 3000;

SocketIoClient socket;
WiFiManager wm;

/* ====================================================================
   --- FUNCIONES DE HARDWARE (Motores) ---
   ==================================================================== */
void setMotorSpeed(int motor, int speed) {
  int in1, in2, pinPWM;
  if (motor == 0) { in1 = pin_L_IN1; in2 = pin_L_IN2; pinPWM = pin_L_PWM; } // Izquierdo
  else            { in1 = pin_R_IN1; in2 = pin_R_IN2; pinPWM = pin_R_PWM; } // Derecho

  if (speed > 255) speed = 255; else if (speed < -255) speed = -255;

  if (speed > 0) {
    digitalWrite(in1, HIGH); digitalWrite(in2, LOW); ledcWrite(pinPWM, speed);
  } else if (speed < 0) {
    digitalWrite(in1, LOW); digitalWrite(in2, HIGH); ledcWrite(pinPWM, -speed);
  } else {
    digitalWrite(in1, LOW); digitalWrite(in2, LOW); ledcWrite(pinPWM, 0);
  }
}
/* ====================================================================
   --- FUNCIONES DE SOCKET.IO ---
   ==================================================================== */
  
void onCarMove(const char* payload, size_t length) {
  JsonDocument doc;
  deserializeJson(doc, payload);

  int leftSpeed = doc["l"];
  int rightSpeed = doc["r"];

  // Actualizar ambos motores "al mismo tiempo"
  setMotorSpeed(1, leftSpeed);
  setMotorSpeed(0, rightSpeed);
}

void setupPWM() {
  ledcAttach(pin_L_PWM, freqPWM, resolutionPWM);
  ledcAttach(pin_R_PWM, freqPWM, resolutionPWM);
  pinMode(pin_L_IN1, OUTPUT); pinMode(pin_L_IN2, OUTPUT);
  pinMode(pin_R_IN1, OUTPUT); pinMode(pin_R_IN2, OUTPUT);

}

void setup() {
  Serial.begin(115200);
  

  bool res = wm.autoConnect("CARRO_BOT", "12345678");

  if(!res) {
      Serial.println("Error al conectar WiFi. Reiniciando...");
      // ESP.restart();
  } 
  Serial.println("\n Conectado al WiFi exitosamente");

  WiFi.setSleep(false);

  // 1. Configurar Hardware
  setupPWM();

  socket.on("CarManual", onCarMove);

  socket.on("disconnect", [](const char* payload, size_t length) {
    setMotorSpeed(0, 0);
    setMotorSpeed(1, 0);
  });

  // 3. INICIAR CONEXIÓN
  socket.begin(server, port);

}

void loop() {
  socket.loop();
}
