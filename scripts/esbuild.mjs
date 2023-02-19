import fs, { watch } from 'fs';
import * as esbuild from 'esbuild'
import CssModulesPlugin from 'esbuild-css-modules-plugin';

const OUT_DIR = './dist/'

// build entries
const entryPoints = [
    // extension
    {in: 'src/extension/content_script/inject_html.tsx', out: 'content_script/inject_html'},
    {in: 'src/extension/background_script/detect_browser_actions.ts', out: 'background_script/detect_browser_actions'},

    // extension page
    {in: 'src/extension_page/pdf_parser/index.tsx', out: 'extension_page/pdf_parser/index'}
]

const toCopy = [
    //static files
    {in: 'static/', out: '/'},

    //extension page
    {in: 'src/extension_page/pdf_parser/index.html', out: 'extension_page/pdf_parser/index.html'},

    //pdfjs worker src
    // {in: 'node_modules/pdfjs-dist/build/pdf.worker.js', out: 'bin/pdfjs/pdf.worker.js'}
]

toCopy.forEach((x) => {
    fs.cpSync(x.in, OUT_DIR+x.out, {recursive: true})
})

esbuild.build({
    entryPoints,
    bundle: true,
    write: true,
    outdir: OUT_DIR,
    format: 'iife',
    plugins: [CssModulesPlugin()]
})

