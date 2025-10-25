import * as vscode from 'vscode';

export class MermaidPreviewPanel {
    private static currentPanel: MermaidPreviewPanel | undefined;
    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;
    private disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this.panel = panel;
        this.extensionUri = extensionUri;

        // パネルが閉じられたときのクリーンアップ
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    }

    /**
     * Mermaidプレビューパネルを作成または表示
     */
    public static createOrShow(extensionUri: vscode.Uri, mermaidCode: string): void {
        const column = vscode.window.activeTextEditor
            ? vscode.ViewColumn.Beside
            : vscode.ViewColumn.One;

        // 既存のパネルがある場合は再利用
        if (MermaidPreviewPanel.currentPanel) {
            MermaidPreviewPanel.currentPanel.panel.reveal(column);
            MermaidPreviewPanel.currentPanel.updateContent(mermaidCode);
            return;
        }

        // 新しいパネルを作成
        const panel = vscode.window.createWebviewPanel(
            'mermaidPreview',
            'Mermaid Preview',
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [extensionUri]
            }
        );

        MermaidPreviewPanel.currentPanel = new MermaidPreviewPanel(panel, extensionUri);
        MermaidPreviewPanel.currentPanel.updateContent(mermaidCode);
    }

    /**
     * コンテンツを更新
     */
    private updateContent(mermaidCode: string): void {
        this.panel.webview.html = this.getHtmlContent(mermaidCode);
    }

    /**
     * WebviewのHTMLコンテンツを生成
     */
    private getHtmlContent(mermaidCode: string): string {
        const nonce = this.getNonce();

        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}' https://cdn.jsdelivr.net; style-src 'unsafe-inline' https://cdn.jsdelivr.net; img-src data:;">
    <title>Mermaid Preview</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            font-family: var(--vscode-font-family);
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }

        #toolbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background-color: var(--vscode-editor-background);
            border-bottom: 1px solid var(--vscode-panel-border);
            padding: 8px;
            display: flex;
            gap: 8px;
            z-index: 1000;
        }

        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 12px;
            cursor: pointer;
            border-radius: 2px;
            font-size: 13px;
        }

        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        #container {
            position: absolute;
            top: 48px;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
        }

        #diagram-wrapper {
            transform-origin: 0 0;
            transition: transform 0.1s ease-out;
            cursor: grab;
            padding: 20px;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            position: absolute;
            left: 0;
            top: 0;
        }

        #diagram-wrapper.grabbing {
            cursor: grabbing;
            user-select: none;
        }

        #diagram-wrapper.no-transition {
            transition: none;
        }

        #mermaid-diagram {
            display: inline-block;
        }

        #error-message {
            color: var(--vscode-errorForeground);
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            padding: 16px;
            border-radius: 4px;
            margin: 20px;
            max-width: 600px;
        }

        #error-message h3 {
            margin-top: 0;
        }

        #error-message pre {
            background-color: rgba(0, 0, 0, 0.2);
            padding: 8px;
            border-radius: 2px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div id="toolbar">
        <button id="zoom-in" title="Zoom In">🔍+</button>
        <button id="zoom-out" title="Zoom Out">🔍−</button>
        <button id="reset-view" title="Reset View">🔄 Reset</button>
        <button id="export-svg" title="Export as SVG">💾 SVG</button>
        <button id="export-png" title="Export as PNG">💾 PNG</button>
    </div>

    <div id="container">
        <div id="diagram-wrapper">
            <div id="mermaid-diagram"></div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js" nonce="${nonce}"></script>
    <script nonce="${nonce}">
        (function() {
            const mermaidCode = ${JSON.stringify(mermaidCode)};
            let scale = 1;
            let translateX = 0;
            let translateY = 0;
            let isDragging = false;
            let startX = 0;
            let startY = 0;

            // 初期状態を保存（リセット用）
            let initialScale = 1;
            let initialTranslateX = 0;
            let initialTranslateY = 0;

            const diagramWrapper = document.getElementById('diagram-wrapper');
            const container = document.getElementById('container');

            // Mermaid初期化
            mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'loose',
                fontFamily: 'var(--vscode-font-family)',
                fontSize: 16,
                gantt: {
                    fontSize: 14,
                    numberSectionStyles: 4,
                    axisFormat: '%Y-%m-%d',
                    useWidth: 1200  // ガントチャートの最小幅を確保
                },
                flowchart: {
                    useMaxWidth: false,
                    htmlLabels: true
                },
                themeVariables: {
                    fontSize: '16px'
                }
            });

            // 図の描画
            async function renderDiagram() {
                const diagramDiv = document.getElementById('mermaid-diagram');

                try {
                    const { svg } = await mermaid.render('mermaid-graph', mermaidCode);
                    diagramDiv.innerHTML = svg;

                    // 初期表示時に自動フィット & 中央寄せを設定
                    setTimeout(() => {
                        const containerRect = container.getBoundingClientRect();
                        const wrapperRect = diagramWrapper.getBoundingClientRect();

                        // コンテナに対する図のサイズ比率を計算（余白を考慮）
                        const padding = 40; // 上下左右の余白
                        const availableWidth = containerRect.width - padding * 2;
                        const availableHeight = containerRect.height - padding * 2;

                        const scaleX = availableWidth / wrapperRect.width;
                        const scaleY = availableHeight / wrapperRect.height;

                        // 小さい方のスケールを採用（アスペクト比を維持）
                        // ただし、最大で1.0倍（拡大はしない）、最小で0.1倍
                        scale = Math.max(0.1, Math.min(1.0, Math.min(scaleX, scaleY)));

                        // コンテナの中央に図を配置
                        const scaledWidth = wrapperRect.width * scale;
                        const scaledHeight = wrapperRect.height * scale;
                        translateX = (containerRect.width - scaledWidth) / 2;
                        translateY = (containerRect.height - scaledHeight) / 2;

                        // 初期状態を保存
                        initialScale = scale;
                        initialTranslateX = translateX;
                        initialTranslateY = translateY;

                        updateTransform();
                    }, 0);
                } catch (error) {
                    showError(error);
                }
            }

            // エラー表示
            function showError(error) {
                const container = document.getElementById('container');
                container.innerHTML = \`
                    <div id="error-message">
                        <h3>Mermaid構文エラー</h3>
                        <p>\${error.message || 'Mermaidコードの解析に失敗しました。'}</p>
                        <pre>\${mermaidCode}</pre>
                    </div>
                \`;
            }

            // ビューの更新（CSS matrix使用）
            function updateTransform() {
                // matrix(scaleX, 0, 0, scaleY, translateX, translateY)
                diagramWrapper.style.transform =
                    \`matrix(\${scale}, 0, 0, \${scale}, \${translateX}, \${translateY})\`;
            }

            // ズーム機能
            document.getElementById('zoom-in').addEventListener('click', () => {
                scale = Math.min(scale * 1.2, 20);
                updateTransform();
            });

            document.getElementById('zoom-out').addEventListener('click', () => {
                scale = Math.max(scale / 1.2, 0.1);
                updateTransform();
            });

            document.getElementById('reset-view').addEventListener('click', () => {
                // 初期状態（自動フィット状態）に戻す
                scale = initialScale;
                translateX = initialTranslateX;
                translateY = initialTranslateY;

                updateTransform();
            });

            // マウスホイールでズーム（マウス位置を中心に）
            container.addEventListener('wheel', (e) => {
                e.preventDefault();

                // diagramWrapper基準でマウス位置を取得
                const rect = diagramWrapper.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // 現在のマウス位置のワールド座標（スケール前の座標）
                const worldX = mouseX / scale;
                const worldY = mouseY / scale;

                // ズーム実行
                const delta = e.deltaY > 0 ? 0.9 : 1.1;
                const oldScale = scale;
                const newScale = Math.max(0.1, Math.min(20, scale * delta));
                scale = newScale;

                // ズーム後もマウス位置が同じワールド座標を指すように translate を調整
                translateX = translateX + (worldX * oldScale - worldX * newScale);
                translateY = translateY + (worldY * oldScale - worldY * newScale);

                updateTransform();
            });

            // ドラッグでパン
            diagramWrapper.addEventListener('mousedown', (e) => {
                e.preventDefault(); // テキスト選択を防止
                isDragging = true;
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
                diagramWrapper.classList.add('grabbing');
                diagramWrapper.classList.add('no-transition'); // ブラー防止
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault(); // テキスト選択を防止
                translateX = e.clientX - startX;
                translateY = e.clientY - startY;
                updateTransform();
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
                diagramWrapper.classList.remove('grabbing');
                diagramWrapper.classList.remove('no-transition'); // transition を戻す
            });

            // テキスト選択を防止
            document.addEventListener('selectstart', (e) => {
                if (isDragging) {
                    e.preventDefault();
                }
            });

            // SVGエクスポート
            document.getElementById('export-svg').addEventListener('click', () => {
                const svg = document.querySelector('#mermaid-diagram svg');
                if (!svg) return;

                const svgData = new XMLSerializer().serializeToString(svg);
                const blob = new Blob([svgData], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = 'mermaid-diagram.svg';
                a.click();

                URL.revokeObjectURL(url);
            });

            // PNGエクスポート（高解像度: 4倍）
            document.getElementById('export-png').addEventListener('click', () => {
                const svg = document.querySelector('#mermaid-diagram svg');
                if (!svg) return;

                // 高解像度倍率（大きな図でも文字が読めるように）
                const highResScale = 4;

                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();

                img.onload = () => {
                    // 高解像度でキャンバスサイズを設定
                    canvas.width = img.width * highResScale;
                    canvas.height = img.height * highResScale;

                    // 背景を白で塗りつぶし
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // 高解像度で描画
                    ctx.scale(highResScale, highResScale);
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob((blob) => {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'mermaid-diagram-4x.png';
                        a.click();
                        URL.revokeObjectURL(url);
                    });
                };

                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
            });

            // 初期描画
            renderDiagram();
        })();
    </script>
</body>
</html>`;
    }

    /**
     * ランダムなnonceを生成（CSP用）
     */
    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    /**
     * リソースの破棄
     */
    private dispose(): void {
        MermaidPreviewPanel.currentPanel = undefined;

        this.panel.dispose();

        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
