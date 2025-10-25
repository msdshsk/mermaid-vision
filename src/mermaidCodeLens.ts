import * as vscode from 'vscode';

/**
 * MermaidコードブロックにCodeLens（プレビューリンク）を提供
 */
export class MermaidCodeLensProvider implements vscode.CodeLensProvider {
    private onDidChangeCodeLensesEmitter = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses = this.onDidChangeCodeLensesEmitter.event;

    /**
     * CodeLensを提供
     */
    public provideCodeLenses(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const codeLenses: vscode.CodeLens[] = [];

        // .mmdファイルの場合、ファイル全体に対してCodeLensを提供
        if (document.fileName.toLowerCase().endsWith('.mmd')) {
            const firstLine = document.lineAt(0);
            const range = new vscode.Range(0, 0, 0, firstLine.text.length);

            codeLenses.push(
                new vscode.CodeLens(range, {
                    title: '$(eye) Preview Mermaid Diagram',
                    command: 'mermaid-preview.previewSelectedBlock',
                    tooltip: 'Mermaidダイアグラムをプレビュー'
                })
            );

            return codeLenses;
        }

        // Markdownファイルなどで```mermaidブロックを検索
        const text = document.getText();
        const regex = /```mermaid\s*\n/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const line = document.lineAt(startPos.line);
            const range = new vscode.Range(
                startPos.line,
                0,
                startPos.line,
                line.text.length
            );

            codeLenses.push(
                new vscode.CodeLens(range, {
                    title: '$(eye) Preview',
                    command: 'mermaid-preview.previewSelectedBlock',
                    tooltip: 'Mermaidダイアグラムをプレビュー'
                })
            );
        }

        return codeLenses;
    }

    /**
     * CodeLensを解決（オプション）
     */
    public resolveCodeLens(
        codeLens: vscode.CodeLens,
        token: vscode.CancellationToken
    ): vscode.CodeLens | Thenable<vscode.CodeLens> {
        return codeLens;
    }

    /**
     * CodeLensの更新を通知
     */
    public refresh(): void {
        this.onDidChangeCodeLensesEmitter.fire();
    }
}
