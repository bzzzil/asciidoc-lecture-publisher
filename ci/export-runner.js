const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

const {
    collectAssets
} = require('./collect-assets');

const {
    postprocessHtml
} = require('./postprocess-html');

async function run() {
    console.log('Extension Host started');

    const workspaceRoot =
        process.env.GITHUB_WORKSPACE ||
        process.cwd();

    console.log(`Workspace root: ${workspaceRoot}`);

    const presentationExtension =
        vscode.extensions.getExtension(
            'bzzzil.vscode-asciidoc-presentation'
        );

    if (!presentationExtension) {
        throw new Error(
            'bzzzil.vscode-asciidoc-presentation is not installed'
        );
    }

    await presentationExtension.activate();

    console.log('Presentation extension activated');

    const commands = await vscode.commands.getCommands(true);

    if (!commands.includes('asciiDocPresentation.exportHtml')) {
        throw new Error(
            'asciiDocPresentation.exportHtml command is not available'
        );
    }

    console.log('exportHtml command found');

    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        throw new Error('No active editor');
    }

    const inputFile = path.resolve(
        editor.document.uri.fsPath
    );

    console.log(`Input: ${inputFile}`);

    if (!fs.existsSync(inputFile)) {
        throw new Error(
            `Input file does not exist: ${inputFile}`
        );
    }

    const lectureName = path.basename(
        inputFile,
        path.extname(inputFile)
    );

    const outputDir = path.join(
        workspaceRoot,
        'build',
        lectureName
    );

    const outputFile = path.join(
        outputDir,
        `${lectureName}.html`
    );

    fs.mkdirSync(outputDir, {
        recursive: true
    });

    console.log(`Output directory: ${outputDir}`);
    console.log(`Output HTML: ${outputFile}`);

    await vscode.commands.executeCommand(
        'asciiDocPresentation.exportHtml',
        [outputFile]
    );

    if (!fs.existsSync(outputFile)) {
        throw new Error(
            `HTML export did not produce the expected file: ${outputFile}`
        );
    }

    console.log('HTML export completed');

    postprocessHtml(outputFile);

    console.log('HTML postprocessing completed');

    collectAssets(
        inputFile,
        outputDir,
        presentationExtension,
        workspaceRoot
    );

    console.log('Asset collection completed');
    console.log('Export completed successfully');
}

module.exports = {
    run
};

