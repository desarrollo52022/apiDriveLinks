const { google } = require('googleapis')
const path = require('path')
const fs = require('fs')
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN


const oath2Cliente = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
)

oath2Cliente.setCredentials({refresh_token: REFRESH_TOKEN})


const drive = google.drive({
  version: "v3", 
  auth: oath2Cliente
})


const listaLinks = []


const filePath = path.join(__dirname, 'girasoles.jpg')


// Función para renovar el token de acceso si es necesario
// async function renewAccessToken() {
//   const currentTime = new Date();

//   const expirationTime = new Date(oath2Cliente.credentials.expiry_date);

//   // Compara la hora actual con la fecha de vencimiento del token
//   if (currentTime >= expirationTime) {
//     try {
//       const { tokens } = await oath2Cliente.getAccessToken();
//       console.log('Token renovado:', tokens.access_token);
//     } catch (error) {
//       console.error('Error al renovar el token:', error.message);
//     }
//   } else {
//     console.log('El token de acceso aún es válido.');
//   }
//   const url = oath2Cliente.generateAuthUrl({
//     access_type: 'offline', // Esto solicitará un nuevo refresh token
//     scope: ['https://www.googleapis.com/auth/drive'],
//   });
//   console.log('Por favor, visite la siguiente URL para autorizar la aplicación:');
//   console.log(url);
// }

// Llama a esta función según tus necesidades, por ejemplo, antes de realizar una solicitud a la API de Google Drive



async function uploadFiles(){
    try {

        const response = await drive.files.create({
            requestBody:{
                name: 'Prueba',
                mimeType: 'image/jpg',
            },
            media: {
                mimeType: 'image/jpg',
                body: fs.createReadStream(filePath)
            }
        })

        console.log(response.data);
        
    } catch (error) {
        console.error(error.message)
    }
}


async function deleteFiles(){
    try {
        const response = await drive.files.delete({
            fileId: "1ZWZx0MZuKM_NJ9eQ8jyafN4ytr4yTbfK"
        })
        console.log(response.data, response.status);
    } catch (error) {
        console.error(error.message);
    }
}


async function getFileId() {
    const fileName = '1_DPI.jpg'
    const response = await drive.files.list({
      q: `name='${fileName}'`,
    });
  
    if (response.data.files.length === 0) {
      console.log('El archivo no se encontró en Google Drive.');
      return null;
    }
  
    const fileId = response.data.files[0].id;
    console.log(`El ID del archivo '${fileName}' es: ${fileId}`);
    return fileId;

    
  }

  async function generatePublicUrl(fileId, name){

    const partes = name.split('.');
    const resultado = partes[0];

    try {
        await drive.permissions.create({
            fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        })

        const response = await drive.files.get({
            fileId,
            fields: ['webViewLink', 'webContentLink']
        });

        //console.log(response.data);
        listaLinks.push({
            Name: resultado,
            Link : response.data.webViewLink
        })
        return true
    } catch (error) {
        console.log(error.message);
        return false
    }
}



  // Busca el ID de la carpeta por nombre
async function findFolderId() {
    var nombreCarpeta = 'SOLICITUDES'
    try {
      const response = await drive.files.list({
        q: `name='${nombreCarpeta}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id)',
      });
  
      if (response.data.files.length > 0) {
        const carpeta = response.data.files[0];
        console.log(`ID de la carpeta '${nombreCarpeta}': ${carpeta.id}`);
      } else {
        console.log(`No se encontró la carpeta con el nombre '${nombreCarpeta}'.`);
      }
    } catch (error) {
      console.error('Error al buscar la carpeta:', error.message);
    }
  }

  

  async function listFilesInFolder(folderId) {
    try {
      const response = await drive.files.list({
        q: `'${folderId}' in parents`,
        fields: 'files(id, name)',
      });
  
      const files = response.data.files;
      if (files.length > 0) {
        //console.log(`Archivos en la carpeta:`);
        
        for(const element of files)
        {
            const resp = await generatePublicUrl(element.id, element.name)
            //console.log('          Name: ', element.name);
            //console.log('          --------------------------');
        }
        
        // files.forEach(async(file) => {
        //     const resp = await generatePublicUrl(file.id)
        //     console.log('          Name: ', file.name);
        //     console.log('          --------------------------');
        // });
      } else {
        //console.log('No se encontraron archivos en la carpeta.');
      }
      return true
    } catch (error) {
      console.error('Error al obtener el listado de archivos:', error.message);
      return false
    }
  }



  async function findSubfolderId(nombreSubcarpeta) {
    const principalFolderId = '10CPGwrYwOgV4XjyoTWxkrG29Lv9hkeeK'
    try {
        // Busca el ID de la subcarpeta dentro de la carpeta principal
        const subfolderResponse = await drive.files.list({
          q: `name='${nombreSubcarpeta}' and mimeType='application/vnd.google-apps.folder' and '${principalFolderId}' in parents`,
          fields: 'files(id)',
        });
  
        if (subfolderResponse.data.files.length > 0) {
          const subfolder = subfolderResponse.data.files[0];
          //console.log(`ID de la subcarpeta '${nombreSubcarpeta}': ${subfolder.id}`);

          const subfolderId = subfolder.id

            const filesResponse = await drive.files.list({
                q: `'${subfolderId}' in parents`,
                fields: 'files(webViewLink, id, name, webContentLink)',
            });
  
            if (filesResponse.data.files.length > 0) {
                //console.log(`Enlaces de archivos en la subcarpeta '${nombreSubcarpeta}':`);
                
                for(const element of filesResponse.data.files)
                {
                    const resp = await listFilesInFolder(element.id)
                    //console.log('ID ', file.id);
                    //console.log('Name ', element.name);
                    //console.log('--------------------------');
                }

                // await filesResponse.data.files.forEach(async(file) => {
                // //console.log(`Nombre: ${file.name}`);
                // //console.log(`Enlace: ${file.webViewLink}`);
                //     const resp = await listFilesInFolder(file.id)
                // //console.log('ID ', file.id);
                //     console.log('Name ', file.name);
                //     console.log('--------------------------');
                // });
                return true

            } else {
                console.log(`No se encontraron archivos en la subcarpeta '${nombreSubcarpeta}'.`);
                return false
            }

        } else {
          console.log(`No se encontró la subcarpeta con el nombre '${nombreSubcarpeta}'.`);
          return false
        }
        
    } catch (error) {
      console.error('Error al buscar la subcarpeta: ', error.message);
      return false
    }
  }
  


async function main(numSolicitud){

    try {
        //await renewAccessToken();

        const resp = await findSubfolderId(numSolicitud);
        console.log(listaLinks);
        return listaLinks;
    } catch (error) {
        console.log(error);
    }
}

//uploadFiles();
//deleteFiles()
//generatePublicUrl()

//getFileId()

//findFolderId()
//generatePublicUrl()

module.exports = {
  main
};
