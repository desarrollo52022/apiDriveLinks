const express = require('express');
const routes = require('./src/routes/route');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;


// Middleware para procesar JSON
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Permite solicitudes desde cualquier origen
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Métodos HTTP permitidos
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Encabezados permitidos
  next();
});



// Rutas
app.use('/api', routes);



// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});



