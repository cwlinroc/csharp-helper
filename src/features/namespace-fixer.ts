import vscode from 'vscode';
import path from 'path';
import { findCsProjFile, generateNamespace } from '../utility';

export async function fixNameSpace() {
    const document = vscode.window.activeTextEditor?.document;

    if (!document) {
        return;
    }

    const csProjFile = findCsProjFile(path.dirname(document.fileName));
    
    if (!csProjFile) {
        return;
    }

    const namespace : string = generateNamespace(csProjFile, path.dirname(document.fileName));
    const namespaceRegex = new RegExp(/namespace\s/g);

    let namespaceLine = -1;
    let haveSemicolon = false;
    
    for (let i = 0; i < document!.lineCount; i++) {
        const text = document?.lineAt(i)?.text;
        if (text && namespaceRegex.test(text)) {
            namespaceLine = i;
            haveSemicolon = text.includes(';');
            break;
        }
    }

    if (namespaceLine === -1) {
        vscode.window.showInformationMessage('Couldn\'t find namespace');
        return;
    }

    await vscode.window.activeTextEditor?.edit((editBuilder: vscode.TextEditorEdit) => {
        editBuilder.delete(new vscode.Range(namespaceLine, 0, namespaceLine + 1, 0));

        if (haveSemicolon) {
            editBuilder.insert(new vscode.Position(namespaceLine, 0), `namespace ${namespace};\n`);
        }
        else {
            editBuilder.insert(new vscode.Position(namespaceLine, 0), `namespace ${namespace}\n`);
        }
    });
}

