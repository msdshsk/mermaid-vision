# Mermaid Preview 使い方ガイド

## 開発環境でのテスト方法

### 1. 拡張機能の起動

1. このプロジェクトをVSCodeで開く
2. `F5` キーを押すか、「実行とデバッグ」パネルから「拡張機能の実行」を選択
3. 新しいVSCodeウィンドウ（Extension Development Host）が開きます

### 2. サンプルファイルでテスト

1. Extension Development Hostウィンドウで `example.md` または `example.mmd` を開く
2. いずれかのMermaidコードブロック内にカーソルを配置
3. 以下のいずれかの方法でプレビューを表示:
   - **ショートカットキー**: `Ctrl+Shift+M` (Windows) / `Cmd+Shift+M` (Mac)
   - **コマンドパレット**: `Ctrl+Shift+P` → "Mermaid: Preview Diagram" を選択
   - **CodeLens**: コードブロック上の「👁 Preview」リンクをクリック
   - **コンテキストメニュー**: エディタ内で右クリック → "Mermaid: Preview Diagram" を選択
   - **エディタタイトルバー**: 右上の👁アイコンをクリック

### 3. プレビューパネルの操作

#### ツールバーボタン
- **🔍+**: ズームイン
- **🔍−**: ズームアウト
- **🔄 Reset**: 元のサイズ・位置にリセット
- **💾 SVG**: SVG形式でエクスポート
- **💾 PNG**: PNG形式でエクスポート

#### マウス操作
- **マウスホイール**: ズームイン/アウト
- **ドラッグ**: 図を移動（パン）

## コード検出の仕様

### 1. マークダウンコードブロック

最も一般的な形式です：

\`\`\`markdown
\`\`\`mermaid
graph TD
    A --> B
\`\`\`
\`\`\`

- コードブロック内にカーソルがあれば自動検出
- コードブロック全体を選択してもOK

### 2. 選択範囲からの抽出

生のMermaidコードを選択して実行：

\`\`\`
flowchart LR
    Start --> End
\`\`\`

選択範囲が以下の条件を満たす必要があります：
- Mermaidの開始キーワードを含む（graph, flowchart, sequenceDiagram等）
- \`\`\`マークが含まれていない

### 3. カーソル位置からの自動検出

マークダウンコードブロック外で、カーソル行がMermaidコードの場合：

1. 上下にスキャンして連続するコード範囲を検出
2. 空行または\`\`\`が見つかるまで展開
3. 検出範囲をプレビュー

### 4. .mmdファイル（Mermaid専用ファイル）

拡張子が`.mmd`のファイルは、ファイル全体がMermaidコードとして扱われます：

- コードブロック（\`\`\`）で囲む必要なし
- ファイルを開くだけで、CodeLensとエディタタイトルバーにプレビューボタンが自動表示
- ファイルのどこにカーソルがあっても、プレビュー実行でファイル全体を表示

例（example.mmd）:
\`\`\`
flowchart TD
    A[開始] --> B{条件分岐}
    B -->|Yes| C[処理A]
    B -->|No| D[処理B]
\`\`\`

## 対応するMermaidキーワード

以下のキーワードで始まる行を自動検出します：

- `graph` - グラフ（古い形式）
- `flowchart` - フローチャート
- `sequenceDiagram` - シーケンス図
- `classDiagram` - クラス図
- `stateDiagram` - 状態図
- `stateDiagram-v2` - 状態図v2
- `erDiagram` - ER図
- `journey` - ユーザージャーニー
- `gantt` - ガントチャート
- `pie` - 円グラフ
- `gitGraph` - Gitグラフ
- `mindmap` - マインドマップ
- `timeline` - タイムライン
- `quadrantChart` - 象限チャート
- `requirement` - 要件図
- `C4Context` - C4コンテキスト図

## エラーハンドリング

### Mermaidコードが見つからない場合

警告メッセージが表示されます：
\`\`\`
Mermaidコードが見つかりませんでした。
Mermaidコードブロック内にカーソルを配置するか、Mermaidコードを選択してください。
\`\`\`

**対処方法**:
1. カーソルがMermaidコードブロック内にあるか確認
2. または、Mermaidコードを選択してから実行
3. Mermaidキーワードが正しく記述されているか確認

### Mermaid構文エラーの場合

プレビューパネルにエラーメッセージが表示されます：

\`\`\`
Mermaid構文エラー
[エラーメッセージ]
[問題のあるコード]
\`\`\`

**対処方法**:
1. エラーメッセージを確認
2. Mermaid公式ドキュメントで正しい構文を確認: https://mermaid.js.org/
3. コードを修正して再度プレビュー

## 開発Tips

### ウォッチモードでの開発

変更を自動的にコンパイル：

\`\`\`bash
npm run watch
\`\`\`

ウォッチモード中は、TypeScriptファイルを保存すると自動的にコンパイルされます。
Extension Development Hostウィンドウをリロード（`Ctrl+R`）して変更を反映します。

### デバッグ

1. `src/extension.ts` などにブレークポイントを設定
2. `F5` で拡張機能を起動
3. 拡張機能のコマンドを実行するとブレークポイントで停止

### ビルドとパッケージング

\`\`\`bash
# コンパイル
npm run compile

# VSIXパッケージの作成（事前にvsce をインストール）
npm install -g @vscode/vsce
vsce package
\`\`\`

## クロスプラットフォーム対応

この拡張機能は以下の環境で動作します：

- **Windows**: ネイティブ環境
- **WSL**: Windows Subsystem for Linux
- **macOS**: ネイティブ環境
- **Linux**: ネイティブ環境

VSCode APIのみを使用しているため、プラットフォーム固有のコードは含まれていません。

## トラブルシューティング

### 拡張機能が起動しない

1. `npm install` が正常に完了したか確認
2. `npm run compile` でエラーが出ていないか確認
3. `out/` ディレクトリにJSファイルが生成されているか確認

### プレビューパネルが表示されない

1. ブラウザコンソールを開く: `Help` → `Toggle Developer Tools`
2. エラーメッセージを確認
3. Webview のセキュリティポリシー（CSP）エラーがないか確認

### Mermaidの描画がおかしい

1. ブラウザコンソールでJavaScriptエラーを確認
2. Mermaid.jsのバージョンを確認（現在はv10を使用）
3. インターネット接続を確認（CDNからMermaid.jsを読み込むため）

## 参考資料

- [VSCode Extension API](https://code.visualstudio.com/api)
- [Mermaid.js公式ドキュメント](https://mermaid.js.org/)
- [Webview API Guide](https://code.visualstudio.com/api/extension-guides/webview)
