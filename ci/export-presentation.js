const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const {
    downloadAndUnzipVSCode,
    runTests
} = require('@vscode/test-electron');

const inputFile = process.argv[2];

if (!inputFile) {
    throw new Error(
        'Usage: node ci/export-presentation.js <input.adoc>'
    );
}

const repositoryRoot = path.resolve(
    __dirname,
    '..'
);

const inputPath = path.resolve(
    repositoryRoot,
    inputFile
);

// Все относительные пути в pipeline считаются
// относительно корня репозитория.
process.chdir(repositoryRoot);

const extensionDevelopmentPath =
    path.resolve(
        __dirname,
        'fake_extension'
    );

const extensionTestsPath =
    path.resolve(
        __dirname,
        'export-runner.js'
    );

const presentationExtensionId =
    'bzzzil.vscode-asciidoc-presentation';

const asciidoctorExtensionId =
    'asciidoctor.asciidoctor-vscode';

const extensionsDir =
    path.resolve(
        repositoryRoot,
        '.vscode-test',
        'extensions'
    );

async function installExtensions(
    vscodeExecutablePath
) {
    console.log(
        'Installing VS Code extensions...'
    );

    console.log(
        `Extensions directory: ${extensionsDir}`
    );

    fs.mkdirSync(
        extensionsDir,
        {
            recursive: true
        }
    );

    const vscodeDir =
        path.dirname(
            vscodeExecutablePath
        );

    const cliPath =
        path.join(
            vscodeDir,
            'bin',
            'code'
        );

    console.log(
        `VS Code CLI: ${cliPath}`
    );

    if (!fs.existsSync(cliPath)) {
        throw new Error(
            `VS Code CLI does not exist: ${cliPath}`
        );
    }

    const extensions = [
        presentationExtensionId,
        asciidoctorExtensionId
    ];

    const result =
        cp.spawnSync(
            cliPath,
            [
                '--extensions-dir',
                extensionsDir,
                '--install-extension',
                ...extensions,
                '--force'
            ],
            {
                encoding: 'utf8',
                stdio: 'inherit',
                cwd: repositoryRoot
            }
        );

    console.log(
        `Extension installer exit code: ${result.status}`
    );

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(
            'Failed to install VS Code extensions'
        );
    }

    console.log(
        'Contents of extensions directory:'
    );

    for (const entry of fs.readdirSync(
        extensionsDir
    )) {
        console.log(
            `  ${entry}`
        );
    }
}

async function main() {
    console.log(
        `Repository root: ${repositoryRoot}`
    );

    console.log(
        `Input file: ${inputPath}`
    );

    if (!fs.existsSync(inputPath)) {
        throw new Error(
            `Input file does not exist: ${inputPath}`
        );
    }

    console.log(
        'Downloading VS Code...'
    );

    const vscodeExecutablePath =
        await downloadAndUnzipVSCode();

    console.log(
        `VS Code downloaded: ${vscodeExecutablePath}`
    );

    await installExtensions(
        vscodeExecutablePath
    );

    console.log(
        'Starting VS Code test instance...'
    );

    await runTests({
        vscodeExecutablePath,
        extensionDevelopmentPath,
        extensionTestsPath,
        launchArgs: [
            inputPath,
            '--extensions-dir',
            extensionsDir
        ]
    });

    console.log(
        'VS Code test instance finished'
    );
}

main().catch(error => {
    console.error(
        'Export failed:'
    );

    console.error(error);

    process.exit(1);
});