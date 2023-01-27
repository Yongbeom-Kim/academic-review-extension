import fs from 'node:fs';
export function getFiles(path) {
    let files = []
    
    fs.readdirSync(path).forEach(file => {
        const newPath = `${path}/${file}`;
        if (fs.lstatSync(newPath).isDirectory()) {
            files.push(...getFiles(newPath))
        }

        if (fs.lstatSync(newPath).isFile()) {
            // build all typescript files
            if (newPath.endsWith('.ts') || newPath.endsWith('.tsx')) {
                files.push(newPath);
            }
        }
    })

    return files
}