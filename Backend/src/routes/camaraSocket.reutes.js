const { Router } = require("express");
const router = Router();
const path = require("path");
const io = require("socket.io")


router.get("/", (req, res) => {
  console.log("Nueva conexión al frontend de la cámara");
  res.sendFile(path.join(__dirname, "../../public/camaraHTML.html"));
});

router.get("/monitor", (req, res) => {
  console.log("Nueva conexión al frontend del monitor");
  res.sendFile(path.join(__dirname, "../../public/monitor.html"));
});
module.exports = router;
