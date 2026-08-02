import fs from 'fs';
import os from 'os';
import path from 'path';

export function findCsProjFile(fileDirect: string) {
    for (let n = 0; n < 10; n++) {

        const pathItems = fs.readdirSync(fileDirect, { withFileTypes: true });
        for (let i = 0; i < pathItems.length; i++) {
            const item = pathItems[i];

            if (!item.isFile()) {
                continue;
            }

            if (item.name.endsWith('.csproj')) {
                return fileDirect;
            }
        }

        fileDirect = path.join(fileDirect, '..');
    }

    return undefined;
}

export function generateNamespace(projectPath: string, currentPath: string) {
    const rootNamespace = projectPath.substring(projectPath.lastIndexOf('\\'));
    let namespace = rootNamespace + currentPath.replace(projectPath, '');

    let pathSepRegEx = /\//g;
    if (os.platform() === "win32") {
        pathSepRegEx = /\\/g;
    }

    namespace = namespace.replace(pathSepRegEx, '.');
    namespace = namespace.replace(/\s+/g, "_");
    namespace = namespace.replace(/-/g, "_");
    if (namespace.startsWith('.')) {
        namespace = namespace.substring(1);
    }

    return namespace;
}