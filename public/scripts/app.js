const { ipcRenderer } = require('electron')

const pickDir = () => {
    try {
        ipcRenderer.send( 'renderer', { type: 'chooseFolder' } );
        console.log('sent')
    } catch(e) {
        console.log('exception', e);
        document.querySelector('.error').innerHTML = "<p class='alert alert-danger'>Sorry! Some Exception Occured</p>"
    }

}

const createDir = () => {
    let folderModal = document.querySelector('.folderModalError');
    try {
        let folderName = document.getElementById('folder').value;
        let rootFolder = document.querySelector('.rootFolder').value;
        if( folderName.length == 0 ) {
            folderModal.innerHTML = "<p class='alert alert-danger'>Please Enter A Valid Folder Name.</p>"
        } else {
            ipcRenderer.send( 'renderer', { type: 'createDir', folderName, rootFolder  } );
            console.log('sent')
        }
    } catch(e) {
        console.log('exception', e);
        folderModal.innerHTML = "<p class='alert alert-danger'>Sorry! Some Exception Occured</p>"
    }
}
const createFile = () => {
    let fileModal = document.querySelector('.fileModalError');
    try {
        let fileName = document.getElementById('file').value;
        let rootFolder = document.querySelector('.rootFolder').value;
        if( fileName.length == 0 ) {
            fileModal.innerHTML = "<p class='alert alert-danger'>Please Enter A Valid File Name.</p>"
        } else {
            ipcRenderer.send( 'renderer', { type: 'createFile', fileName, rootFolder  } );
            console.log('sent')
        }
    } catch(e) {
        console.log('exception', e);
        fileModal.innerHTML = "<p class='alert alert-danger'>Sorry! Some Exception Occured</p>"
    }
}

// listen from main process
ipcRenderer.on( 'folder', function( evt, folderDetails ) {
    console.log(folderDetails)
    document.querySelector('.selectedFolder').innerText = folderDetails;
    document.querySelector('.rootFolder').value = folderDetails;
    document.querySelector('.result').style.display = 'inline-block';
    document.querySelector('.dirBtn').removeAttribute('disabled');
    document.querySelector('.fileBtn').removeAttribute('disabled');

} );

ipcRenderer.on( 'chosenFolderDetails', function( evt, fileDetails ) {
    console.log(fileDetails)
    let list = document.querySelector('.list')
    list.innerHTML = ''
    if( fileDetails.length > 0 ) {
        // show ui with files
        document.querySelector('.inAppError').style.display = 'none';
        list.style.display = '';
        fileDetails.map( fileDetails => {
            list.innerHTML += `
                <div class="col-xl-1 col-lg-2 col-md-3 col-sm-4">
                    <i class="icons fas ${ fileDetails.isFolder ? 'fa-folder-open' : 'fa-file-alt' }"></i>
                    <p class="mt-2">${ fileDetails.file }</p>
                </div>
            `;
        }) 
    } else {
        console.log('no file')
        document.querySelector('.errMsg').innerHTML = "<p class='mt-4 alert alert-danger'>No Files Found</p>"
        document.querySelector('.inAppError').style.display = 'inline';

    }
} );

ipcRenderer.on( 'folderStatus', function( evt, msg ) {
    console.log(msg)
    let folderModalMsg = document.querySelector('.folderModalMsg');
    if( msg.status == 'success' ) {
        folderModalMsg.innerHTML = `<p class='alert alert-success'>${ msg.message }</p>`;
        // reload all files
        setTimeout( function() {
            bootstrap.Modal.getInstance(document.getElementById('exampleModal')).hide();
        }, 500)
    } else {
        folderModalMsg.innerHTML = `<p class='alert alert-danger'>${ msg.message }</p>`;
    }
} );

ipcRenderer.on( 'fileStatus', function( evt, msg ) {
    console.log(msg)
    let folderModalMsg = document.querySelector('.fileModalMsg');
    if( msg.status == 'success' ) {
        folderModalMsg.innerHTML = `<p class='alert alert-success'>${ msg.message }</p>`;
        // reload all files
        setTimeout( function() {
            bootstrap.Modal.getInstance(document.getElementById('fileModal')).hide();
        }, 500)
    } else {
        folderModalMsg.innerHTML = `<p class='alert alert-danger'>${ msg.message }</p>`;
    }
} );