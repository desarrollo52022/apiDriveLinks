const express = require('express');
const linkController = require('./linkController');
const clientesController = require('./clientesController');
const app = express();
const port = 3000; 

// Middleware para procesar JSON
app.use(express.json());

//ACCIONES PUT

app.get('/api/create', async(req, res)=>{

  try {
    const parentId = req.query.parentId; 
    const name = req.query.name

    if(!parentId || !name){
      return res.status(400).json({error:'Faltan Parametros Obligatorios'})
    } 

    const ok = await clientesController.createFolder(name, parentId)

    return res.status(200).json(ok);

  } catch (error) {
    res.status(500).json({error})
  }

})


app.get('/api/findFile', async(req, res)=>{

  try {
    const FileId = req.query.FileId; 

    if(!FileId){
      return res.status(400).json({error:'Faltan Parametros Obligatorios'})
    } 

    const ok = await clientesController.findFilesinFolder(FileId)

    return res.status(200).json(ok);

  } catch (error) {
    res.status(500).json({error})
  }

})


//ACIONES GET

app.get('/api/SubfolderId', async (req, res)=>{
  try {
    const name = req.query.name;

    if(!name){
      return res.status(400).json({error: 'Hacen falta parametros obligatorios'})
    }

    const link = await clientesController.findSubfolderId(name)

    if(link == undefined){
      return res.status(400).json({error: 'No se escontro la subcarpeta'})
    }

    return res.status(200).json(link)
  } catch (error) {
    res.status(500).json({error})
  }
})




app.get('/api/folders', async (req, res)=>{

  try {
    const subfolderId = req.query.findSubfolders;

    if(!subfolderId){
      return res.status(400).json({error: 'Hacen falta parametros obligatorios'})
    }

    const links = await clientesController.findSubfolders(subfolderId)

    return res.status(200).json(links)

  } catch (error) {
    res.status(500).json({error})
  }

})




//ACCIONES POST
app.post('/api/LinkList', async (req, res) => {

  try {

    const solicitud = req.query.numSolicitud; 
    
    if(!solicitud){
        return res.status(400).json({error:'Parametro numSolicitud Oblogatorio'})
    }
    // Llama a la función main del controlador con el parámetro recibido
    const links = await linkController.main(solicitud);
    
    return res.status(200).json(links);

  } catch (error) {
    res.status(500).json({error})
  }

  
});




// Iniciar el servidor
app.listen(port, () => {
  console.log(`La aplicación está corriendo en http://localhost:${port}`);
});
