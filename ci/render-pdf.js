const path = require('path');
const { chromium } = require('playwright');

async function renderPdf(htmlFile) {
    const htmlPath = path.resolve(htmlFile);

    const pdfFile = path.join(
        path.dirname(htmlPath),
        `${path.basename(
            htmlPath,
            path.extname(htmlPath)
        )}.pdf`
    );

    const browser = await chromium.launch();

    try {
        const page = await browser.newPage();

        const url =
            `file://${htmlPath}?print-pdf`;

        console.log(`Opening: ${url}`);

        await page.goto(url, {
            waitUntil: 'networkidle'
        });

        await page.pdf({
            path: pdfFile,
            printBackground: true
        });

        console.log(`PDF created: ${pdfFile}`);
    } finally {
        await browser.close();
    }
}

const inputFile = process.argv[2];

if (!inputFile) {
    throw new Error(
        'Usage: node ci/render-pdf.js <presentation.html>'
    );
}

renderPdf(inputFile).catch(error => {
    console.error(error);
    process.exit(1);
});
