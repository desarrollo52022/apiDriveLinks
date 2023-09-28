const express = require('express');
const linkController = require('./linkController');
const app = express();
const port = 3000; // Puedes cambiar el puerto según tus necesidades

// Middleware para procesar JSON
app.use(express.json());

app.post('/api/LinkList', async (req, res) => {

  try {

    const solicitud = req.query.numSolicitud; 
    if(!solicitud){
        return res.status(400).json({error:'Parametro numSolicitud Oblogatorio'})
    }
    // Llama a la función main del controlador con el parámetro recibido
    const links = await linkController.main(solicitud);
  
    res.json(links);
    
  } catch (error) {
    res.status(500).json({error})
  }

  
  });

// Iniciar el servidor
app.listen(port, () => {
  console.log(`La aplicación está corriendo en http://localhost:${port}`);
});
