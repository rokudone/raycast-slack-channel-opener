# Slack Channel Opener for Raycast

RaycastからSlackチャンネルを素早く検索して開けるようにする拡張機能です。

![スクリーンショット 2025-06-20 13 27 47](https://github.com/user-attachments/assets/7348bea7-9ab0-4f47-982a-971697c9e423)

## 🚀 機能

- 🔍 全てのSlackチャンネルをインクリメンタルサーチ
- 🎯 **fzf風の複数ワード検索** - スペース区切りで複数キーワードを指定可能
- 💬 パブリックチャンネル、プライベートチャンネル、DM、グループDMに対応
- 🚀 Slackアプリまたはブラウザで直接開く
- 📋 チャンネル名、ID、WebURLをコピー
- 🔄 Slack Webインターフェースからチャンネルリストを更新
- 🏷️ よく使うチャンネルのカスタムエイリアス（近日公開）

## 📦 インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-username/raycast-slack-channel-opener.git
cd raycast-slack-channel-opener

# 依存関係をインストール
npm install

# Raycastにインストール（推奨）
npm run deploy
# → 自動的にRaycastの拡張機能フォルダにインストール
# → Raycastで Cmd+K を押して拡張機能をリロード

# または開発モードで起動
npm run dev
```

## 🛠️ セットアップ

### ステップ1: ブックマークレットを作成する

ブックマークレットは、ブラウザのブックマークとして保存できる小さなJavaScriptプログラムです。

> ⚠️ **重要**: `scripts/extract-channels.js`のコードは1行にまとめてあり、そのままブックマークレットとして使用できます

#### Chrome/Edgeの場合：
1. ブックマークバーを表示（`Cmd+Shift+B` または `Ctrl+Shift+B`）
2. ブックマークバーの空いている場所で右クリック
3. 「ページを追加...」または「新しいブックマーク」を選択
4. 以下の情報を入力：
   - **名前**: `Slack Channels抽出`
   - **URL**: `scripts/extract-channels.js`の内容を全てコピーして貼り付け（`javascript:`で始まる1行の長いコード）

#### Safariの場合：
1. メニューバーから「ブックマーク」→「ブックマークを追加...」
2. 適当なページをブックマーク（後で編集するため）
3. 「ブックマーク」→「ブックマークを編集」
4. 作成したブックマークを右クリック→「アドレスを編集」
5. `scripts/extract-channels.js`の内容を全てコピーして貼り付け

#### Firefoxの場合：
1. ブックマークツールバーを表示（右クリック→「ブックマークツールバー」）
2. ツールバーの空いている場所で右クリック→「新しいブックマーク」
3. 以下の情報を入力：
   - **名前**: `Slack Channels抽出`
   - **URL**: `scripts/extract-channels.js`の内容を全てコピーして貼り付け

### ステップ2: Slackからチャンネル情報を抽出する

1. **Slackをブラウザで開く**
   - https://app.slack.com にアクセス
   - 対象のワークスペースにログイン

2. **ブックマークレットを実行**
   - 作成した「Slack Channels抽出」ブックマークをクリック
   - または、ブラウザのコンソール（F12 → Console）に`scripts/extract-channels.js`の内容を貼り付けて実行

3. **結果を確認**
   - 「Successfully extracted XX channels!」というアラートが表示される
   - チャンネルデータが自動的にクリップボードにコピーされる

### ステップ3: Raycastでチャンネルリストを更新

1. **Raycastを開く**（`Cmd+Space`または設定したホットキー）
2. **「Update Channel List」を検索して実行**
3. **抽出したデータを貼り付け**（`Cmd+V`）
4. **「Update Channels」をクリック**

## 📖 使い方

### チャンネルを検索して開く

1. Raycastを開く（`Cmd+Space`）
2. 「Search Slack Channels」と入力
3. チャンネル名を入力して検索
   - **複数ワード検索**: スペース区切りで複数のキーワードを入力可能
   - 例: `dev backend` → "dev"と"backend"を両方含むチャンネルを検索
   - 例: `john dm` → "john"との DM を検索
4. `Enter`でSlackアプリで開く、`Cmd+O`でブラウザで開く

### キーボードショートカット

| ショートカット | 動作 |
|---|---|
| `Enter` | Slackアプリで開く |
| `Cmd+O` | ブラウザで開く |
| `Cmd+C` | チャンネル名をコピー |
| `Cmd+Shift+C` | チャンネルIDをコピー |
| `Cmd+Option+C` | WebURLをコピー |

## 🔧 トラブルシューティング

### ブックマークレットが動作しない場合

1. **Slackが完全に読み込まれているか確認**
   - ページを再読み込みしてから実行してみる

2. **コンソールでエラーを確認**
   - F12でコンソールを開き、エラーメッセージを確認
   - `Uncaught SyntaxError`が出る場合は、コードが正しくコピーされていない可能性

3. **手動でコンソールから実行**
   - F12でコンソールを開く
   - `scripts/extract-channels.js`の内容をコピー
   - コンソールに貼り付けて`Enter`

### チャンネルが表示されない場合

- チャンネルリストを更新したか確認
- 正しいワークスペースからデータを抽出したか確認
- Raycastの検索フィールドに何か入力されていないか確認

### Slackアプリが開かない場合

- Slackデスクトップアプリがインストールされているか確認
- アプリがインストールされていない場合は、自動的にブラウザで開きます

## 💡 Tips

### ブックマークレットのコードをコピーする簡単な方法

1. ターミナルで以下のコマンドを実行（macOSの場合）：
   ```bash
   cat scripts/extract-channels.js | pbcopy
   ```
   これでブックマークレットのコードがクリップボードにコピーされます

2. Windowsの場合：
   ```bash
   type scripts\extract-channels.js | clip
   ```

### 複数のワークスペースを使っている場合

- ワークスペースごとにチャンネルリストを抽出する必要があります
- 現在のバージョンでは、最後に更新したワークスペースのチャンネルのみが保存されます

### より多くのチャンネルを抽出するには

ブックマークレットは以下の場所からチャンネル情報を抽出します：
- サイドバーに表示されているチャンネル
- チャンネルブラウザ（開いている場合）
- 最近の会話

より多くのチャンネルを抽出したい場合は、チャンネルブラウザを開いてから実行してください。

## 🛠️ 開発

```bash
# 依存関係をインストール
npm install

# 開発モードで起動
npm run dev

# プロダクションビルド
npm run build

# コードのリント
npm run lint
```

### プロジェクト構造

```
raycast-slack-channel-opener/
├── src/
│   ├── index.tsx              # メイン検索コマンド
│   ├── update-channels.tsx    # チャンネル更新コマンド
│   ├── types.ts              # TypeScript型定義
│   ├── lib/
│   │   ├── storage.ts        # チャンネルデータの保存管理
│   │   └── slack.ts          # Slack URL/ディープリンクユーティリティ
├── scripts/
│   └── extract-channels.js   # ブラウザ抽出スクリプト（ブックマークレット）
├── package.json
├── tsconfig.json
└── README.md
```

## 📄 ライセンス

MIT

## 🤝 貢献

プルリクエストや機能提案を歓迎します！

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成
