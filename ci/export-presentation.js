const fs = require('fs');
const path = require('path');
const os = require('os');
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

// Репозиторий с лекциями.
const workspaceRoot =
    process.env.GITHUB_WORKSPACE ||
    process.cwd();

// Репозиторий с реализацией Action.
const actionRoot =
    process.env.GITHUB_ACTION_PATH ||
    path.resolve(__dirname, '..');

const inputPath = path.resolve(
    workspaceRoot,
    inputFile
);

// Все относительные пути сборки относятся
// к репозиторию с лекциями.
process.chdir(workspaceRoot);

const extensionDevelopmentPath = path.join(
    actionRoot,
    'ci',
    'fake_extension'
);

const extensionTestsPath = path.join(
    actionRoot,
    'ci',
    'export-runner.js'
);

const presentationExtensionId =
    'bzzzil.vscode-asciidoc-presentation';

const asciidoctorExtensionId =
    'asciidoctor.asciidoctor-vscode';

const extensionsDir = path.join(
    process.env.RUNNER_TEMP || os.tmpdir(),
    'asciidoc-lecture-publisher',
    'extensions'
);

async function installExtensions(vscodeExecutablePath) {
    console.log('Installing VS Code extensions...');
    console.log(`Extensions directory: ${extensionsDir}`);

    fs.mkdirSync(extensionsDir, {
        recursive: true
    });

    const vscodeDir = path.dirname(
        vscodeExecutablePath
    );

    const cliPath = path.join(
        vscodeDir,
        'bin',
        'code'
    );

    console.log(`VS Code CLI: ${cliPath}`);

    if (!fs.existsSync(cliPath)) {
        throw new Error(
            `VS Code CLI does not exist: ${cliPath}`
        );
    }

    const extensions = [
        presentationExtensionId,
        asciidoctorExtensionId
    ];

    const result = cp.spawnSync(
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
            cwd: workspaceRoot
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

    console.log('Contents of extensions directory:');

    for (const entry of fs.readdirSync(extensionsDir)) {
        console.log(`  ${entry}`);
    }
}

async function main() {
    console.log(`Workspace root: ${workspaceRoot}`);
    console.log(`Action root: ${actionRoot}`);
    console.log(`Input file: ${inputPath}`);

    if (!fs.existsSync(inputPath)) {
        throw new Error(
            `Input file does not exist: ${inputPath}`
        );
    }

    if (!fs.statSync(inputPath).isFile()) {
        throw new Error(
            `Input path is not a file: ${inputPath}`
        );
    }

    if (!fs.existsSync(extensionDevelopmentPath)) {
        throw new Error(
            `Fake extension does not exist: ${extensionDevelopmentPath}`
        );
    }

    if (!fs.existsSync(extensionTestsPath)) {
        throw new Error(
            `Export runner does not exist: ${extensionTestsPath}`
        );
    }

    console.log('Downloading VS Code...');

    const vscodeExecutablePath =
        await downloadAndUnzipVSCode();

    console.log(
        `VS Code downloaded: ${vscodeExecutablePath}`
    );

    await installExtensions(vscodeExecutablePath);

    console.log('Starting VS Code test instance...');

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

    console.log('VS Code test instance finished');
}

main().catch(error => {
    console.error('Export failed:');
    console.error(error);
    process.exit(1);
});
