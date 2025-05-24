# mcp-google-search

Google 検索機能を提供する MCP（Model Context Protocol）サーバーです。

## 機能

- Google Custom Search API を使用した Web 検索
- MCP プロトコルを通じて検索結果を提供
- 検索結果数のカスタマイズ（最大 10 件）

## セットアップ

### 1. Google Custom Search API の設定

#### 1.1 Google Cloud Project の作成と API の有効化

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択
3. 左側メニューから「API とサービス」→「ライブラリ」を選択
4. 「Custom Search API」を検索して選択
5. 「有効にする」ボタンをクリック

#### 1.2 API キーの作成

1. 左側メニューから「API とサービス」→「認証情報」を選択
2. 「+ 認証情報を作成」→「API キー」をクリック
3. 作成された API キーをコピー（後で.env ファイルに設定）
4. セキュリティのため、「キーを制限」をクリックして以下を設定：
   - アプリケーションの制限：なし（ローカル使用の場合）
   - API 制限：「キーを制限」を選択し、「Custom Search API」のみを選択

#### 1.3 Programmable Search Engine の設定

1. [Programmable Search Engine](https://programmablesearchengine.google.com/)にアクセス
2. 「Get started」または「新しい検索エンジン」をクリック
3. 以下を設定：
   - 検索するサイト：「ウェブ全体を検索」を選択
   - 検索エンジンの名前：任意の名前（例：「MCP Google Search」）
4. 「作成」をクリック
5. 作成後、「コントロールパネル」から「検索エンジン ID」（cx）をコピー

### 2. 環境変数の設定

環境変数の設定方法は 2 つあります：

#### オプション 1: .env ファイルを使用（開発時）

開発やテスト時に使用する場合：

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```env
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

#### オプション 2: 直接環境変数を設定（Claude Desktop 使用時）

Claude Desktop で使用する場合は、設定ファイルに直接記載するため`.env`ファイルは不要です（下記の「Claude Desktop 設定」を参照）。

### 3. 依存関係のインストール

```bash
bun install
```

## 使用方法

### MCP サーバーとして実行

```bash
bun start
```

### 開発モード（ファイル変更の監視）

```bash
bun dev
```

### Claude Desktop 設定

Claude Desktop でこの MCP サーバーを使用するには、`~/Library/Application Support/Claude/claude_desktop_config.json`に以下を追加してください：

```json
{
  "mcpServers": {
    "google-search": {
      "command": "/Users/gorosun/.bun/bin/bun",
      "args": [
        "run",
        "/Users/gorosun/projects/gorosun/mcp-google-search/src/index.ts"
      ],
      "env": {
        "GOOGLE_API_KEY": "your_google_api_key_here",
        "GOOGLE_SEARCH_ENGINE_ID": "your_search_engine_id_here"
      }
    }
  }
}
```

または、Node.js を使用する場合：

```json
{
  "mcpServers": {
    "google-search": {
      "command": "node",
      "args": [
        "/Users/gorosun/projects/gorosun/mcp-google-search/src/index.ts"
      ],
      "env": {
        "GOOGLE_API_KEY": "your_google_api_key_here",
        "GOOGLE_SEARCH_ENGINE_ID": "your_search_engine_id_here"
      }
    }
  }
}
```

**注意**:

- 上記の例では実際のパス（`/Users/gorosun/projects/gorosun/mcp-google-search/`）を使用しています。ご自身の環境に合わせてパスを調整してください
- `env`セクションに直接 API キーを設定するため、`.env`ファイルは不要です
- この設定ファイルは Git にコミットしないよう注意してください
- Bun がインストールされていない環境では、Node.js オプションを使用してください
- `spawn bun ENOENT`エラーが出る場合は、フルパス（`/Users/[username]/.bun/bin/bun`）を使用してください

## 利用可能なツール

### search

Google 検索を実行します。

パラメータ：

- `query` (必須): 検索クエリ
- `num` (オプション): 返す結果の数（デフォルト: 10、最大: 10）

### get_usage

現在のAPI使用状況と残りクォータを確認します。

パラメータ：なし

## 使用例

Claude Desktop で MCP サーバーが正しく設定されている場合、以下のようなプロンプトで検索機能を利用できます：

### 基本的な検索

```text
「TypeScript の最新バージョンについて検索してください」
```

### 検索結果数を指定

```text
「React のベストプラクティスについて5件検索して」
```

### 具体的な情報を探す

```text
「Next.js 14 の App Router の使い方について検索してください」
```

### エラーの解決方法を探す

```text
「npm ERR! EACCES permission denied エラーの解決方法を検索して」
```

### 最新の技術トレンドを調べる

```text
「2025年の AI 開発トレンドについて検索してください」
```

### API使用状況を確認

```text
「Google Search APIの使用状況を確認してください」
```

### 返される結果の例

#### 検索結果（search）

```json
[
  {
    "title": "TypeScript: JavaScript With Syntax For Types",
    "link": "https://www.typescriptlang.org/",
    "snippet": "TypeScript is a strongly typed programming language that builds on JavaScript..."
  },
  {
    "title": "TypeScript - Wikipedia",
    "link": "https://en.wikipedia.org/wiki/TypeScript",
    "snippet": "TypeScript is a free and open-source high-level programming language..."
  }
]
```

#### 使用状況確認（get_usage）

```text
Google Custom Search API Usage:

Used today: 2/100
Remaining: 98

Note: This is a local estimate. Check Google Cloud Console for accurate usage.
```

## 注意事項

- Google Custom Search API には無料枠があります（1 日 100 クエリまで）
- 無料枠を超える場合は、Google Cloud Console で課金設定が必要です
- API キーは公開リポジトリにコミットしないよう注意してください
- `get_usage`ツールによる使用状況はローカルでの推定値です。正確な使用状況は[Google Cloud Console](https://console.cloud.google.com/)で確認してください
- 複数の環境から同じAPIキーを使用している場合、ローカルカウントは実際の使用量と異なります

## ライセンス

Apache License 2.0
