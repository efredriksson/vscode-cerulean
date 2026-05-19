import {
    languages,
    Range,
    TextEdit,
    window,
    type ExtensionContext,
} from "vscode";
import { Formatter } from "./formatter";

export function activate(context: ExtensionContext): void {
    const output = window.createOutputChannel("Cerulean");
    const formatter = new Formatter(output, (message) => {
        window.showErrorMessage(`Cerulean: ${message}`);
    });
    context.subscriptions.push(output, formatter);

    context.subscriptions.push(
        languages.registerDocumentFormattingEditProvider("teal", {
            async provideDocumentFormattingEdits(document) {
                const original = document.getText();
                const result = await formatter.format(original);

                if (!result.ok) {
                    window.showWarningMessage(`Cerulean: ${result.error}`);
                    return [];
                }
                if (result.text === original) return [];

                const fullRange = new Range(
                    document.positionAt(0),
                    document.positionAt(original.length)
                );
                return [TextEdit.replace(fullRange, result.text)];
            },
        })
    );
}

export function deactivate(): void {}
