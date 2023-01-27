import fs from 'fs';
import * as esbuild from 'esbuild'

// build entries
const entryPoints = [
    {in: 'src/content_script/inject_html.tsx', out: 'content_script/inject_html'}
]

esbuild.build({
    entryPoints,
    bundle: true,
    write: true,
    outdir: './dist',
    format: 'iife'
})

// copy static files
fs.cpSync('static/', 'dist/', {recursive: true, force: true})