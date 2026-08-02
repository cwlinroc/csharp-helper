import vscode from "vscode";
import os from "os";
import path from "path";

export function fixFileName() {
    const document = vscode.window.activeTextEditor?.document;
    if (typeof document === "undefined") {
        return;
    }

    const regexes = [
        /class\s(\w+)/g,
        /interface\s(\w+)/g,
        /record\s(\w+)/g,
        /enum\s(\w+)/g,
    ];

    let destinationFilename = "";

    for (let i = 0; i < regexes.length; i++) {
        const regex = new RegExp(regexes[i]);
        for (let i = 0; i < document.lineCount; i++) {
            const documentLine = document.lineAt(i);
            const match = regex.exec(documentLine.text);
            if (match) {
                destinationFilename = match[1];
                break;
            }
        }

        if (destinationFilename !== "") {
            break;
        }
    }

    if (destinationFilename === "") {
        vscode.window.showInformationMessage(
            "Couldn't find class/interface/enum"
        );
        return;
    }

    let pathSeparator = "/";
    if (os.platform() === "win32") {
        pathSeparator = "\\";
    }

    const destination =
        path.dirname(document.fileName) +
        pathSeparator +
        destinationFilename +
        ".cs";
    if (destination !== document.fileName) {
        const sourceUri = vscode.Uri.file(document.fileName);
        const destinationUri = vscode.Uri.file(destination);
        vscode.workspace.fs.rename(sourceUri, destinationUri);
    }
}
