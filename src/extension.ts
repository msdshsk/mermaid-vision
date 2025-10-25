import * as vscode from 'vscode';
import { extractMermaidCode } from './mermaidExtractor';
import { MermaidPreviewPanel } from './mermaidPreview';
import { MermaidCodeLensProvider } from './mermaidCodeLens';

/**
 * 拡張機能のアクティベーション
 */
export function activate(context: vscode.ExtensionContext): void {
    console.log('Mermaid Preview extension is now active');

    // CodeLensプロバイダーを登録
    const codeLensProvider = new MermaidCodeLensProvider();
    const codeLensDisposable = vscode.languages.registerCodeLensProvider(
        [
            { language: 'markdown', scheme: 'file' },
            { language: 'markdown', scheme: 'untitled' },
            { pattern: '**/*.mmd' }
        ],
        codeLensProvider
    );

    // コマンド登録: Mermaidプレビュー
    const previewCommand = vscode.commands.registerCommand(
        'mermaid-preview.previewSelectedBlock',
        () => {
            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                vscode.window.showWarningMessage('エディタが開かれていません。');
                return;
            }

            // Mermaidコードを抽出
            const mermaidBlock = extractMermaidCode(editor);

            if (!mermaidBlock) {
                vscode.window.showWarningMessage(
                    'Mermaidコードが見つかりませんでした。\n' +
                    'Mermaidコードブロック内にカーソルを配置するか、Mermaidコードを選択してください。'
                );
                return;
            }

            // プレビューパネルを表示
            try {
                MermaidPreviewPanel.createOrShow(context.extensionUri, mermaidBlock.code);
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Mermaidプレビューの表示に失敗しました: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }
    );

    context.subscriptions.push(codeLensDisposable, previewCommand);
}

/**
 * 拡張機能の非アクティベーション
 */
export function deactivate(): void {
    console.log('Mermaid Preview extension is now deactivated');
}
