const { app, BrowserWindow, webContents, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { showError } = require('./utils/errors');
require('@electron/remote/main').initialize();

let win;

function createWindow () {
    win = new BrowserWindow({
      width: 800,
      height: 600,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInSubFrames: true,
        enableRemoteModule: true,
        nodeIntegrationInWorker: true,
        contextIsolation: false,
        sandbox: false
      }
    })
  
    win.loadFile(path.join(__dirname, '/public/index.html'))
}

app.whenReady().then(() => {
    createWindow();
})

// handle renderer calls here
const sendFolderDetails = ( selectedFolder ) => {
    fs.readdir( selectedFolder, (err, files) => {
        // create custom object for frontend
        let data = [];
        files.forEach(file => {
            let obj = {};
            if( fs.lstatSync( path.join( selectedFolder, file ) ).isDirectory() ) {
                Object.assign( obj, { isFolder: true, file } )
            } else {
                Object.assign( obj, { isFolder: false, file } )
            }
            data.push( obj );
        });
        // send data to renderer
        console.log(data)
        win.webContents.send( 'chosenFolderDetails', data );
    });
}

ipcMain.on( 'renderer', async ( evt, msg ) => {
    console.log( msg );
    if( msg.type == 'chooseFolder' ) {
        const result = await dialog.showOpenDialog({ properties: [ 'openDirectory' ] })
        // get selected Folder
        if( !result.canceled ) {
            // start reading through the dir
            console.log(result)
            win.webContents.send( 'folder', result.filePaths[0] );
            const selectedFolder = result.filePaths[0]
            sendFolderDetails( selectedFolder );
        }
    }

    // create directory, filesystem
    if( msg.type == 'createDir' ) {
        if( msg.folderName != '' ) {
            // ! create folder
            let folderPath = path.join( msg.rootFolder, msg.folderName );
            if (!fs.existsSync( path.join( folderPath ) )){
                fs.mkdirSync( path.join( folderPath ) );
                win.webContents.send( 'folderStatus', { status: "success", message: "Folder Created Successfully" } );
                sendFolderDetails( msg.rootFolder )
            } else {
                win.webContents.send( 'folderStatus', { status: "failure", message: "Folder Already Exists" } );
            }
        } else {
            // semd error
            showError( 'error', 'Empty Folder', 'kindly enter a valid folder name' );
        }
    }

    if( msg.type == 'createFile' ) {
        if( msg.fileName != '' ) {
            let filePath = path.join( msg.rootFolder, msg.fileName );
            if (!fs.existsSync( path.join( filePath ) )){
                fs.writeFile( path.join( msg.rootFolder, msg.fileName), '', (err) => {
                    console.log('suc')
                    win.webContents.send( 'fileStatus', { status: "success", message: "File Created Successfully" } );
                    sendFolderDetails( msg.rootFolder )
                } )
                
            } else {
                console.log('error3')
                win.webContents.send( 'fileStatus', { status: "failure", message: "File Already Exists" } );
            }
        } else {
            // semd error
            showError( 'error', 'Empty File', 'kindly enter a valid file name' );
        }
    }
} )

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})