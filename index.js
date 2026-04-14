//importacion de librerias necesarias
const express = require("express"); //framework para crear el servidor
const jwt = require("jsonwebtoken"); //para generar y validar tokens JWT
const cookieParser = require("cookie-parser"); // permite leer cookies
const users = require("./users"); //usuario ficticio
const verificarToken = require("./middleware/authMiddleware"); //Midleware de autenticacion

//Configuración basica del servidor
const app = express();
const PORT = 3000;
const SECRET_KEY = "mi_clave_secreta_super_segura";

//Middlewares globales
app.use(express.json());
app.use(cookieParser());

//Ruta Login
//Permite autenticar al usuario y generar un token JWT
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  //Validar que se envien los datos
  if (!username || !password) {
    return res.status(400).json({
      message: "Por favor proporciona usuario y contraseña.",
    });
  }

//Buscar usuario en el arreglo
  const usuarioEncontrado = users.find(
    (u) => u.username === username && u.password === password
  );

  //si no existe, retornar error 401
  if (!usuarioEncontrado) {
    return res.status(401).json({
      message: "Credenciales incorrectas. No autorizado.",
    });
  }

  //Generar token JWT con duracion de 1 hora
  const token = jwt.sign(
    { id: usuarioEncontrado.id, username: usuarioEncontrado.username },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  //Enviar token como cookie segura
  res.cookie("token", token, {
    httpOnly: true, //No accesible desde JS(protege contra xss)
    secure: false, // En produccion deberia ser true (HTTPS)
    maxAge: 3600000, // 1 Hora
  });

  //Respuesta exitosa
  return res.status(200).json({
    message: `Bienvenido/a, ${usuarioEncontrado.username}!`,
  });
});

//Ruta Protegida
//Solo accesible si el token JWT es válido
app.get("/perfil", verificarToken, (req, res) => {
  return res.status(200).json({
    message: "Acceso autorizado a ruta protegida.",
    usuario: {
      id: req.usuario.id,
      username: req.usuario.username,
    },
  });
});

// Ruta de logout para cerrar sesión
//permite cerrar sesión eliminando la cookie del token
app.post('/logout', (req, res) => {
  console.log("Usuario cerró sesión"); // Registro en consola

//Elimina la coockie del navegador
  res.clearCookie('token');

  return res.status(200).json({
    message: 'Logout realizado correctamente.'
  });
});


//========================
//    RUTA PRINCIAL
//========================
//Ruta base del servidor
app.get("/", (req, res) => {
  res.send("Servidor Express con JWT funcionando ✅");
});

//========================
//    RUTA SESIÓN
//========================
//Verifica si el usuario tiene una sesión activa
app.get("/sesion", (req, res) => {
  const token = req.cookies.token;

  // Si no hay token, no hay sesión activa
  if (!token) {
    return res.status(401).json({
      message: "No hay sesión activa. Usuario no autenticado."
    });
  }

  // Si existe token, el usuario tiene sesión
  return res.status(200).json({
    message: "Sesión activa. Usuario autenticado correctamente."
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});