const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const users = require("./users");
const verificarToken = require("./middleware/authMiddleware");

const app = express();
const PORT = 3000;
const SECRET_KEY = "mi_clave_secreta_super_segura";

app.use(express.json());
app.use(cookieParser());

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Por favor proporciona usuario y contraseña.",
    });
  }

  const usuarioEncontrado = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!usuarioEncontrado) {
    return res.status(401).json({
      message: "Credenciales incorrectas. No autorizado.",
    });
  }

  const token = jwt.sign(
    { id: usuarioEncontrado.id, username: usuarioEncontrado.username },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    maxAge: 3600000,
  });

  return res.status(200).json({
    message: `Bienvenido/a, ${usuarioEncontrado.username}!`,
  });
});

app.get("/perfil", verificarToken, (req, res) => {
  return res.status(200).json({
    message: "Acceso autorizado a ruta protegida.",
    usuario: {
      id: req.usuario.id,
      username: req.usuario.username,
    },
  });
});

//Ruta de logout para cerrar sesión
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logout realizado correctamente.' });
  console.log("Usuario cerró sesión");
});

app.get("/", (req, res) => {
  res.send("Servidor Express con JWT funcionando ✅");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
// Ruta adicional: verificar si hay sesión activa
app.get("/sesion", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No hay sesión activa." });
  }

  return res.status(200).json({ message: "Sesión activa." });
});