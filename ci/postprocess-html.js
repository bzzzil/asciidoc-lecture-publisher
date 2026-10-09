const fs = require('fs');

function postprocessHtml(file) {
    let data = fs.readFileSync(
        file,
        'utf8'
    );

    data = data.replace(
        /(["'])\/.+?libs\//g,
        '$1libs/'
    );

    data = data.replace(
        /(["'])\/.+?styles\//g,
        '$1styles/'
    );

    data = data.replace(
        /(["'])\/.+?images\//g,
        '$1images/'
    );

    fs.writeFileSync(
        file,
        data,
        'utf8'
    );
}

module.exports = {
    postprocessHtml
};