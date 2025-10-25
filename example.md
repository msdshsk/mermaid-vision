# Mermaid Preview テストファイル

このファイルは、Mermaid Preview拡張機能のテスト用サンプルです。

## フローチャートの例

```mermaid
flowchart TD
    Start[開始] --> Input[データ入力]
    Input --> Process{処理が必要?}
    Process -->|Yes| Calculate[計算実行]
    Process -->|No| Skip[スキップ]
    Calculate --> Output[結果出力]
    Skip --> Output
    Output --> End[終了]
```

## シーケンス図の例

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as サーバー
    participant DB as データベース

    User->>Browser: ページアクセス
    Browser->>Server: HTTPリクエスト
    Server->>DB: データ取得
    DB-->>Server: データ返却
    Server-->>Browser: HTMLレスポンス
    Browser-->>User: ページ表示
```

## クラス図の例

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }

    class Dog {
        +String breed
        +bark()
    }

    class Cat {
        +String color
        +meow()
    }

    Animal <|-- Dog
    Animal <|-- Cat
```

## ガントチャートの例

```mermaid
gantt
    title プロジェクトスケジュール
    dateFormat  YYYY-MM-DD
    section 設計フェーズ
    要件定義           :a1, 2024-01-01, 30d
    基本設計           :a2, after a1, 20d
    section 開発フェーズ
    実装               :a3, after a2, 45d
    テスト             :a4, after a3, 20d
    section リリース
    デプロイ           :a5, after a4, 5d
```

## 円グラフの例

```mermaid
pie title プログラミング言語の使用率
    "JavaScript" : 42.5
    "Python" : 30.2
    "TypeScript" : 15.8
    "Go" : 7.3
    "Rust" : 4.2
```

## 状態図の例

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : start()
    Processing --> Success : complete()
    Processing --> Failed : error()
    Success --> [*]
    Failed --> Idle : retry()
    Failed --> [*] : cancel()
```

## ER図の例

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
        string phone
    }
    ORDER {
        int orderNumber
        date orderDate
        string status
    }
    LINE-ITEM {
        int quantity
        float price
    }
    PRODUCT ||--o{ LINE-ITEM : includes
    PRODUCT {
        string productName
        float unitPrice
        int stock
    }
```

## マインドマップの例

```mermaid
mindmap
  root((VSCode拡張機能))
    機能
      プレビュー
      ズーム
      パン
      エクスポート
    技術
      TypeScript
      Webview API
      Mermaid.js
    対応図
      フローチャート
      シーケンス図
      クラス図
      ガントチャート
```

## 使い方

1. 上記のいずれかのMermaidコードブロック内にカーソルを配置
2. `Ctrl+Shift+M` (Windows) または `Cmd+Shift+M` (Mac) を押す
3. プレビューパネルが表示されます

または、コードブロック全体を選択してからショートカットキーを押すこともできます。
