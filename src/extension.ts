import vscode from 'vscode';
import { fixNameSpace } from './features/namespace-fixer';
import { toggleAsync } from './features/method-async-toggler';
import { fixFileName } from './features/filename-fixer';
import { createTemplate , TemplateType } from './features/template-creator';
import { createRazorPage } from './features/razorpage-creator';

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.fix-namespace', fixNameSpace));

    context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.fix-filename', fixFileName));

    context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.toggle-method-sync', toggleAsync));

    context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.create-class-template', () => createTemplate(TemplateType.Class)));
    context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.create-interface-template', () => createTemplate(TemplateType.Interface)));
    context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.create-enum-template', () => createTemplate(TemplateType.Enum)));
    context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.create-struct-template', () => createTemplate(TemplateType.Struct)));
    context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.create-record-template', () => createTemplate(TemplateType.Record)));
    context.subscriptions.push(vscode.commands.registerCommand('csharp-helper.create-razor-page', createRazorPage));
}

export function deactivate() { }