const { dialog } = require('electron');

const showError = ( title, message, detail ) => {
    console.log('error called');
    const options = {
        type: 'error',
        buttons: ['Ok'],
        defaultId: 0,
        title,
        message,
        detail
    };
    
    dialog.showMessageBox(null, options, (response, checkboxChecked) => {
        console.log(response);
        console.log(checkboxChecked);
    });
}

module.exports = {
    showError
};