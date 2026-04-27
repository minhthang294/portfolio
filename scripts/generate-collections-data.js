const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const collectionsDir = path.join(rootDir, 'collections');
const outputFile = path.join(rootDir, 'collections-data.js');

const preferredOrder = [
    'Bộ sưu tập xuân hè',
    'Bộ sưu tập hè-Bầu',
    'Bộ sưu tập Tết-Bầu',
    'Bộ sưu tập thu đông',
    'Bộ sưu tập đồ ngủ',
    'Feedback'
];

const imageExtensionPattern = /\.(avif|gif|jpe?g|png|svg|webp)$/i;
const collator = new Intl.Collator('vi', {
    numeric: true,
    sensitivity: 'base'
});

function compareFolders(left, right) {
    const leftIndex = preferredOrder.indexOf(left);
    const rightIndex = preferredOrder.indexOf(right);

    if (leftIndex !== -1 || rightIndex !== -1) {
        const normalizedLeftIndex = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
        const normalizedRightIndex = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

        return normalizedLeftIndex - normalizedRightIndex;
    }

    return collator.compare(left, right);
}

const collectionData = fs.readdirSync(collectionsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(compareFolders)
    .map((folderName) => {
        const folderPath = path.join(collectionsDir, folderName);
        const images = fs.readdirSync(folderPath, { withFileTypes: true })
            .filter((entry) => entry.isFile() && imageExtensionPattern.test(entry.name))
            .map((entry) => entry.name)
            .sort((left, right) => collator.compare(left, right))
            .map((fileName) => `collections/${folderName}/${fileName}`);

        return {
            title: folderName,
            images
        };
    });

const output = `window.collectionData = ${JSON.stringify(collectionData, null, 4)};\n`;

fs.writeFileSync(outputFile, output, 'utf8');
console.log(`Wrote ${path.relative(rootDir, outputFile)}`);
