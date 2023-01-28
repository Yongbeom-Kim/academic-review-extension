import fs, { watch } from 'fs';
import * as esbuild from 'esbuild'
import CssModulesPlugin from 'esbuild-css-modules-plugin';

// build entries
const entryPoints = [
    {in: 'src/extension/content_script/inject_html.tsx', out: 'content_script/inject_html'},
    {in: 'src/extension/background_script/detect_browser_action.ts', out: 'background_script/detect_browser_action'},
]

esbuild.build({
    entryPoints,
    bundle: true,
    write: true,
    outdir: './dist',
    format: 'iife',
    plugins: [CssModulesPlugin()]
})

// copy static files
fs.cpSync('static/', 'dist/', {recursive: true, force: true})
