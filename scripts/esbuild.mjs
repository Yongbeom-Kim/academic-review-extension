
import * as esbuild from 'esbuild'
import {getFiles} from './file_utils.mjs'

const src_path = './src'
const dist_path = './dist'

const entryPoints = getFiles(src_path).map(path => {return {in: path, out: path.replace(src_path, "")}})

console.log(`Building:`)
entryPoints.forEach((x) => console.log('> ' + x.in));

esbuild.build({
  entryPoints,
  bundle: true,
  write: true,
  outdir: dist_path,
  format: 'iife'
})

// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
// print green yay
console.info("\x1b[32m%s\x1b[0m", "\nBuild Done")
