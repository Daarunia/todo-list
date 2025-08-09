// build.js
import path from 'path';
import pc from 'picocolors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { build } from 'vite';
import compile from './private/tsc.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function buildRenderer() {
    return build({
        configFile: path.join(__dirname, '..', 'vite.config.mjs'),
        base: './',
        mode: 'production'
    });
}

function buildMain() {
    const mainPath = path.join(__dirname, '..', 'src', 'main');
    return compile(mainPath);
}

// Suppression du dossier build
fs.rmSync(path.join(__dirname, '..', 'build'), {
    recursive: true,
    force: true,
});

console.log(pc.blue('Transpiling renderer & main...'));

Promise.allSettled([
    buildRenderer(),
    buildMain(),
]).then(() => {
    console.log(pc.green('Renderer & main successfully transpiled! (ready to be built with electron-builder)'));
});