import vscode from 'vscode';
import path from 'path';
import { findCsProjFile, generateNamespace } from '../utility';

export async function createTemplate(templateType: TemplateType) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const document = editor.document;
    const fileName = document.fileName;

    const csProjFile = findCsProjFile(path.dirname(fileName));
    if (typeof csProjFile === 'undefined') {
        return;
    }

    const namespace = generateNamespace(csProjFile, path.dirname(fileName));

    const baseFileName = path.basename(fileName);

    const itemName = baseFileName
        .replace(/\.cs$/, '');

    const template = getTemplate(templateType, itemName, namespace);

    const success = await editor.edit((editBuilder: vscode.TextEditorEdit) => {
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );
        editBuilder.delete(fullRange);
        editBuilder.insert(new vscode.Position(0, 0), template);
    });

    if (!success) {
        vscode.window.showErrorMessage('Failed to apply template.');
        return;
    }

    await document.save();

    const newFileName = itemName + '.cs';

    const oldUri = document.uri; // URI of the current document

    if (newFileName !== baseFileName) {
        const newFileDiskPath = path.join(path.dirname(oldUri.fsPath), newFileName);
        const newUri = vscode.Uri.file(newFileDiskPath);

        try {
            await vscode.workspace.fs.rename(oldUri, newUri);
            await vscode.window.showTextDocument(newUri, { preview: false, preserveFocus: false, viewColumn: editor.viewColumn });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            vscode.window.showErrorMessage(`Failed to rename file to ${newFileName}: ${errorMessage}`);
        } finally {
            await vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
        }
    }
}

export enum TemplateType {
    Class,
    Interface,
    Enum,
    Struct,
    Record
}

function getTemplate(templateType: TemplateType, itemName: string, namespace: string): string {
    switch (templateType) {
        case TemplateType.Class:
            return `namespace ${namespace};

public class ${itemName}
{

}`;
        case TemplateType.Interface:
            return `namespace ${namespace};

public interface I${itemName}
{

}`;
        case TemplateType.Enum:
            return `namespace ${namespace};

public enum ${itemName}
{

}`;
        case TemplateType.Struct:
            return `namespace ${namespace};

public struct ${itemName}
{

}`;
        case TemplateType.Record:
            return `namespace ${namespace};
            
public record ${itemName}
{

}`;
        default:
            return '';
    }
}
