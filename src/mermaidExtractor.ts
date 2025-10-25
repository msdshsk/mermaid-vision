import * as vscode from 'vscode';

export interface MermaidBlock {
    code: string;
    startLine: number;
    endLine: number;
}

/**
 * エディタからMermaidコードブロックを抽出する
 * @param editor アクティブなテキストエディタ
 * @returns Mermaidコードブロック、または見つからない場合はundefined
 */
export function extractMermaidCode(editor: vscode.TextEditor): MermaidBlock | undefined {
    const document = editor.document;
    const selection = editor.selection;

    // .mmdファイルの場合、ファイル全体をMermaidコードとして扱う
    if (document.fileName.toLowerCase().endsWith('.mmd')) {
        const fullText = document.getText();
        if (fullText.trim().length > 0) {
            return {
                code: fullText,
                startLine: 0,
                endLine: document.lineCount - 1
            };
        }
    }

    // 選択範囲がある場合
    if (!selection.isEmpty) {
        return extractFromSelection(document, selection);
    }

    // 選択範囲がない場合、カーソル位置からブロックを検出
    return extractFromCursorPosition(document, selection.active);
}

/**
 * 選択範囲からMermaidコードを抽出
 */
function extractFromSelection(document: vscode.TextDocument, selection: vscode.Selection): MermaidBlock | undefined {
    const selectedText = document.getText(selection);

    // マークダウンコードブロック形式（```mermaid ... ```）の場合
    const markdownMatch = selectedText.match(/```mermaid\s+([\s\S]*?)```/);
    if (markdownMatch) {
        return {
            code: markdownMatch[1].trim(),
            startLine: selection.start.line,
            endLine: selection.end.line
        };
    }

    // 生のMermaidコードとして扱う（```が含まれていない場合）
    if (!selectedText.includes('```')) {
        const trimmedCode = selectedText.trim();
        // Mermaidの開始キーワードを含んでいるかチェック
        if (isMermaidCode(trimmedCode)) {
            return {
                code: trimmedCode,
                startLine: selection.start.line,
                endLine: selection.end.line
            };
        }
    }

    return undefined;
}

/**
 * カーソル位置からMermaidコードブロックを検出
 */
function extractFromCursorPosition(document: vscode.TextDocument, position: vscode.Position): MermaidBlock | undefined {
    const currentLine = position.line;
    let startLine = currentLine;
    let endLine = currentLine;
    let inCodeBlock = false;
    let codeBlockType = '';

    // 現在行から上方向にスキャンしてコードブロックの開始を探す
    for (let i = currentLine; i >= 0; i--) {
        const lineText = document.lineAt(i).text;

        if (lineText.trim().startsWith('```mermaid')) {
            startLine = i;
            inCodeBlock = true;
            codeBlockType = 'markdown';
            break;
        }

        if (lineText.trim() === '```') {
            // Mermaidブロックではない
            return undefined;
        }
    }

    if (!inCodeBlock) {
        // マークダウンコードブロックが見つからない場合、
        // カーソル位置の行がMermaidコードかチェック
        return extractRawMermaidAtCursor(document, position);
    }

    // 下方向にスキャンしてコードブロックの終了を探す
    for (let i = startLine + 1; i < document.lineCount; i++) {
        const lineText = document.lineAt(i).text;

        if (lineText.trim() === '```') {
            endLine = i;
            break;
        }
    }

    // コードブロック内のコードを抽出
    const lines: string[] = [];
    for (let i = startLine + 1; i < endLine; i++) {
        lines.push(document.lineAt(i).text);
    }

    const code = lines.join('\n').trim();

    if (code.length === 0) {
        return undefined;
    }

    return {
        code,
        startLine,
        endLine
    };
}

/**
 * カーソル位置から生のMermaidコードを抽出（マークダウンコードブロック外）
 */
function extractRawMermaidAtCursor(document: vscode.TextDocument, position: vscode.Position): MermaidBlock | undefined {
    const currentLine = position.line;
    const currentText = document.lineAt(currentLine).text.trim();

    // 現在行がMermaidのキーワードで始まっているかチェック
    if (!isMermaidCode(currentText)) {
        return undefined;
    }

    // 上下に展開してMermaidコードの範囲を特定
    let startLine = currentLine;
    let endLine = currentLine;

    // 上方向にスキャン
    for (let i = currentLine - 1; i >= 0; i--) {
        const lineText = document.lineAt(i).text.trim();
        if (lineText === '' || lineText.startsWith('```')) {
            break;
        }
        startLine = i;
    }

    // 下方向にスキャン
    for (let i = currentLine + 1; i < document.lineCount; i++) {
        const lineText = document.lineAt(i).text.trim();
        if (lineText === '' || lineText.startsWith('```')) {
            break;
        }
        endLine = i;
    }

    const lines: string[] = [];
    for (let i = startLine; i <= endLine; i++) {
        lines.push(document.lineAt(i).text);
    }

    const code = lines.join('\n').trim();

    return {
        code,
        startLine,
        endLine
    };
}

/**
 * テキストがMermaidコードかどうかを判定
 */
function isMermaidCode(text: string): boolean {
    const mermaidKeywords = [
        'graph',
        'flowchart',
        'sequenceDiagram',
        'classDiagram',
        'stateDiagram',
        'stateDiagram-v2',
        'erDiagram',
        'journey',
        'gantt',
        'pie',
        'gitGraph',
        'mindmap',
        'timeline',
        'quadrantChart',
        'requirement',
        'C4Context'
    ];

    const firstLine = text.split('\n')[0].trim();

    return mermaidKeywords.some(keyword =>
        firstLine.startsWith(keyword) ||
        firstLine.includes(keyword + ' ') ||
        firstLine.includes(keyword + ':')
    );
}
