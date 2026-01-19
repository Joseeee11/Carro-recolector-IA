const os = require("os");

class IPModule {
  constructor() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
      for (const iface of interfaces[name]) {
        // Ignorar interfaces internas y obtener solo IPv4
        if (iface.family === "IPv4" && !iface.internal) {
          this.ipLocal = iface.address;
        }
      }
    }
    if (!this.ipLocal) {
      this.ipLocal = "localhost"; // Fallback si no se encuentra ninguna IP
    }
  }
  getLocalIP() {
    return this.ipLocal;
  }
}

module.exports = IPModule;
