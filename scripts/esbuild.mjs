
import * as esbuild from 'esbuild'

// build entries
const entryPoints = [
    {in: 'src/content_script/inject_html.tsx', out: 'content_script/inject_html.js'}
]

esbuild.build({
    entryPoints,
    bundle: true,
    write: true,
    outdir: './dist',
    format: 'iife'
})
