import fs from 'fs';
import * as esbuild from 'esbuild'
import CssModulesPlugin from 'esbuild-css-modules-plugin';

// build entries
const entryPoints = [
    {in: 'src/content_script/inject_html.tsx', out: 'content_script/inject_html'}
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