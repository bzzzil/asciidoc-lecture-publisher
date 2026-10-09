
const fs = require('fs');
const path = require('path');

function copyDirectory(sourceDir, targetDir) {
    if (!fs.existsSync(sourceDir)) {
        throw new Error(
            `Directory does not exist: ${sourceDir}`
        );
    }

    fs.cpSync(
        sourceDir,
        targetDir,
        {
            recursive: true
        }
    );

    console.log(
        `Copied directory: ${sourceDir} -> ${targetDir}`
    );
}

function collectImages(inputFile, outputDir) {
    const sourceDir = path.dirname(inputFile);

    const data = fs.readFileSync(
        inputFile,
        'utf8'
    );

    const imagePattern = /image::?([^\[\s]+)\[/g;
    const images = new Set();

    for (const match of data.matchAll(imagePattern)) {
        images.add(match[1]);
    }

    for (const imagePath of images) {
        const source = path.resolve(
            sourceDir,
            imagePath
        );

        const target = path.resolve(
            outputDir,
            imagePath
        );

        if (!fs.existsSync(source)) {
            throw new Error(
                `Referenced image does not exist: ${imagePath}`
            );
        }

        if (!fs.statSync(source).isFile()) {
            throw new Error(
                `Referenced image is not a file: ${imagePath}`
            );
        }

        fs.mkdirSync(
            path.dirname(target),
            {
                recursive: true
            }
        );

        fs.copyFileSync(source, target);

        console.log(`Copied image: ${imagePath}`);
    }

    console.log(`Collected ${images.size} image(s)`);
}

function collectStyles(outputDir, workspaceRoot) {
    const sourceDir = path.join(
        workspaceRoot,
        'styles'
    );

    const targetDir = path.join(
        outputDir,
        'styles'
    );

    copyDirectory(sourceDir, targetDir);
}

function collectExtensionLibs(extension, outputDir) {
    const extensionDir = extension.extensionPath;

    const sourceDir = path.join(
        extensionDir,
        'libs'
    );

    const targetDir = path.join(
        outputDir,
        'libs'
    );

    copyDirectory(sourceDir, targetDir);
}

function collectAssets(
    inputFile,
    outputDir,
    extension,
    workspaceRoot
) {
    collectImages(
        inputFile,
        outputDir
    );

    collectStyles(
        outputDir,
        workspaceRoot
    );

    collectExtensionLibs(
        extension,
        outputDir
    );
}

module.exports = {
    collectAssets
};

