import vscode from 'vscode';
import path from 'path';
import { findCsProjFile, generateNamespace } from '../utility';

export async function createRazorPage() {
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
        .replace(/\.cshtml.cs$/, '')
        .replace(/\.cs$/, '')
        .replace(/\.cshtml$/, '');

    const { csTemplate, pageTemplate } = getTemplate(itemName, namespace);

    const success = await editor.edit((editBuilder: vscode.TextEditorEdit) => {
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );
        editBuilder.delete(fullRange);
        editBuilder.insert(new vscode.Position(0, 0), csTemplate);
    });

    if (!success) {
        vscode.window.showErrorMessage('Failed to apply template.');
        return;
    }

    await document.save();

    const newFileName = itemName + '.cshtml.cs';

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

    const pageFileName = itemName + '.cshtml';
    const pageFileDiskPath = path.join(path.dirname(oldUri.fsPath), pageFileName);

    try {
        await vscode.workspace.fs.writeFile(vscode.Uri.file(pageFileDiskPath), Buffer.from(pageTemplate));
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        vscode.window.showErrorMessage(`Failed to create file ${pageFileName}: ${errorMessage}`);
    } finally {
        await vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
    }

}

export enum TemplateType {
    Class,
    Interface,
    Enum,
    Struct,
    Record
}

function getTemplate(itemName: string, namespace: string) {

    const csTemplate = `using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ${namespace};

public class ${itemName}Model : PageModel
{
    public void OnGet()
    {
    }
}
`;

    const pageTemplate = `@page
@model ${namespace}.${itemName}Model
@{
}`;

    return { csTemplate, pageTemplate };

}
