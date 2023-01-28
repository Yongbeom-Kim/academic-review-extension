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
    {in: 'src/extension_page/index.tsx', out: 'extension_page/index'}
]

const toCopy = [
    //static files
    {in: 'static/', out: '/'},

    //extension page
    {in: 'src/extension_page/index.html', out: 'extension_page/index.html'}
]

esbuild.build({
    entryPoints,
    bundle: true,
    write: true,
    outdir: OUT_DIR,
    format: 'iife',
    plugins: [CssModulesPlugin()]
})

toCopy.forEach((x) => {
    fs.cpSync(x.in, OUT_DIR+x.out, {recursive: true})
})
