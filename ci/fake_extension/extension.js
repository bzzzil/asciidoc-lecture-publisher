const vscode = require('vscode');

async function activate() {
    const runner = require('../export-runner');

    try {
        await runner.run();

        vscode.window.showInformationMessage(
            'Presentation export completed'
        );
    } catch (error) {
        console.error(error);

        vscode.window.showErrorMessage(
            `Presentation export failed: ${error.message}`
        );

        throw error;
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};