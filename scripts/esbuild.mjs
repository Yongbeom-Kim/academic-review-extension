import fs, { watch } from 'fs';
import * as esbuild from 'esbuild'
import CssModulesPlugin from 'esbuild-css-modules-plugin';

const OUT_DIR_V2 = './dist_v2/'
const OUT_DIR_V3 = './dist_v3/'

// build entries
const entryPoints = [
    // extension
    {in: 'src/extension/content_script/inject_html.tsx', out: 'content_script/inject_html'},
    {in: 'src/extension/background_script/detect_browser_actions.ts', out: 'background_script/detect_browser_actions'},

    // extension page
    {in: 'src/extension_page/pdf_parser/index.tsx', out: 'extension_page/pdf_parser/index'}
]

const toCopy = [
    //extension page
    {in: 'src/extension_page/pdf_parser/index.html', out: 'extension_page/pdf_parser/index.html'},

    //pdfjs worker src
    // {in: 'node_modules/pdfjs-dist/build/pdf.worker.js', out: 'bin/pdfjs/pdf.worker.js'}
]

// manifest v2 and v3 sigh
const toCopy_v2 = [
    //static files
    {in: 'static/manifestv2.json', out: '/manifest.json'},
]
const toCopy_v3 = [
    //static files
    {in: 'static/manifestv3.json', out: '/manifest.json'},
]

toCopy.concat(toCopy_v2).forEach((x) => {
    fs.cpSync(x.in, OUT_DIR_V2+x.out, {recursive: true})
})
toCopy.concat(toCopy_v3).forEach((x) => {
    fs.cpSync(x.in, OUT_DIR_V3+x.out, {recursive: true})
})


esbuild.build({
    entryPoints,
    bundle: true,
    write: true,
    outdir: OUT_DIR_V2,
    format: 'iife',
    plugins: [CssModulesPlugin()]
})


esbuild.build({
    entryPoints,
    bundle: true,
    write: true,
    outdir: OUT_DIR_V3,
    format: 'iife',
    plugins: [CssModulesPlugin()]
})

