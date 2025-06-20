# 実装計画: RayCast Slack Channel Opener Plugin

## 概要（日本語）
ブラウザからSlackチャンネル情報を抽出し、RayCastでインクリメンタルサーチして選択したチャンネルをSlackアプリで開くプラグインを実装します。

### 機能要件
- Slack Webアプリからチャンネル情報を抽出するブックマークレット
- 抽出したデータをローカルにキャッシュ
- RayCastでチャンネル名をインクリメンタルサーチ
- 選択したチャンネルをSlackアプリで直接開く
- キャッシュの更新機能

### 技術スタック
- RayCast Extension API (TypeScript/React)
- ブラウザのJavaScript (データ抽出用)
- JSON (データ保存形式)

## Technical Specification

### Implementation Overview
Create a two-part solution:
1. Browser bookmarklet to extract Slack channel data
2. RayCast extension with incremental search functionality

### Project Structure
```
raycast-slack-channel-opener/
├── src/
│   ├── index.tsx              # Main search command
│   ├── update-channels.tsx    # Update channels from clipboard
│   ├── types.ts              # TypeScript type definitions
│   ├── lib/
│   │   ├── storage.ts        # Channel data storage management
│   │   ├── slack.ts          # Slack URL/deep link utilities
│   │   └── channels.ts       # Channel data processing
│   └── hooks/
│       └── useChannels.ts    # React hook for channel data
├── assets/
│   ├── channels.json         # Cached channel data
│   └── command-icon.png     # Extension icon
├── scripts/
│   └── extract-channels.js   # Browser extraction script
├── package.json
├── tsconfig.json
└── README.md
```

### Implementation Steps

#### Phase 1: RayCast Extension Setup
1. Initialize RayCast extension
   - [ ] Run `npm init @raycast/extension@latest`
   - [ ] Choose TypeScript template
   - [ ] Configure package.json metadata
   - [ ] Set up development environment

2. Configure TypeScript and dependencies
   - [ ] Install required packages (@raycast/api, @raycast/utils)
   - [ ] Configure tsconfig.json for strict mode
   - [ ] Set up ESLint and Prettier

#### Phase 2: Browser Extraction Script
3. Create channel extraction bookmarklet
   - [ ] Implement DOM traversal for channel elements
   - [ ] Extract channel name, ID, team ID, and type
   - [ ] Handle public channels, private channels, and DMs
   - [ ] Format data as JSON with proper structure
   - [ ] Add clipboard copy functionality
   - [ ] Include error handling and validation

4. Script features to implement:
   ```javascript
   // Extract from multiple sources:
   // - Sidebar channels
   // - Channel browser modal
   // - Recent conversations
   // Include metadata:
   // - Channel purpose/topic
   // - Member count (if available)
   // - Last activity indicator
   ```

#### Phase 3: Core RayCast Functionality
5. Implement channel data types (types.ts)
   - [ ] Define Channel interface
   - [ ] Define ChannelType enum (channel, group, im, mpim)
   - [ ] Define storage format types
   - [ ] Add preference types

6. Create storage management (lib/storage.ts)
   - [ ] Implement read/write functions for channels.json
   - [ ] Add cache timestamp management
   - [ ] Implement data validation
   - [ ] Handle file permissions and errors

7. Build main search command (index.tsx)
   - [ ] Create List component with search bar
   - [ ] Implement fuzzy search algorithm
   - [ ] Add channel type icons and indicators
   - [ ] Show channel metadata (topic, member count)
   - [ ] Implement keyboard shortcuts
   - [ ] Add action to open in Slack

8. Channel opening logic (lib/slack.ts)
   - [ ] Generate deep links: `slack://channel?team={teamId}&id={channelId}`
   - [ ] Handle different Slack client scenarios
   - [ ] Add fallback to web URL if app not installed
   - [ ] Implement workspace switching support

#### Phase 4: Update Functionality
9. Create update command (update-channels.tsx)
   - [ ] Read JSON from clipboard
   - [ ] Validate JSON structure
   - [ ] Merge with existing data (optional)
   - [ ] Update timestamp
   - [ ] Show success/error feedback

10. Alternative update methods
    - [ ] Import from file picker
    - [ ] Manual edit command
    - [ ] Backup/restore functionality

#### Phase 5: Enhanced Features
11. Add search enhancements
    - [ ] Recent/favorite channels
    - [ ] Search history
    - [ ] Custom aliases for channels
    - [ ] Regex search support

12. Implement preferences
    - [ ] Default action (open in app vs web)
    - [ ] Search behavior settings
    - [ ] Update reminder intervals
    - [ ] Custom keybindings

### Data Format Specification
```typescript
interface Channel {
  id: string;           // Channel ID (C1234567)
  name: string;         // Channel name (general)
  displayName?: string; // Display name with emoji
  teamId: string;       // Workspace ID (T1234567)
  type: ChannelType;    // channel | group | im | mpim
  topic?: string;       // Channel topic/purpose
  memberCount?: number; // Number of members
  isArchived?: boolean; // Archive status
  lastActivity?: string; // ISO timestamp
  customAlias?: string; // User-defined alias
}

interface ChannelStorage {
  version: number;      // Storage format version
  lastUpdated: string;  // ISO timestamp
  channels: Channel[];  // Channel array
}
```

### Browser Extraction Script Details
```javascript
// Core extraction logic:
// 1. Wait for Slack to fully load
// 2. Query multiple selectors for different UI versions
// 3. Extract data with fallbacks
// 4. Deduplicate entries
// 5. Sort by activity/alphabetically
// 6. Format and copy to clipboard
```

### Error Handling Strategy
- Network errors: Show cached data with warning
- Invalid JSON: Prompt user to re-extract
- Missing Slack app: Offer web fallback
- Large datasets: Implement pagination

### Performance Optimizations
- Lazy load channel data
- Implement search debouncing
- Cache search results
- Use React.memo for list items
- Virtual scrolling for large lists

### Testing Plan
- [ ] Test with different Slack workspace sizes
- [ ] Verify deep links on macOS
- [ ] Test search performance with 1000+ channels
- [ ] Validate update mechanisms
- [ ] Test error scenarios

## セッション引き継ぎメモ（2025-01-19）

### 現在の状況
- プロジェクトディレクトリ作成済み: `/Users/takuma/projects/raycast-slack-channel-opener`
- 実装計画作成済み
- RayCast拡張機能の初期化待ち（ユーザー側で実行予定）

### 次のステップ
1. `npm init @raycast/extension@latest`
2. TypeScriptテンプレートを選択
3. 以下の設定を使用：
   - Name: slack-channel-opener
   - Title: Open Slack Channels
   - Description: Search and open Slack channels
   - Category: Applications or Productivity

### 重要な決定事項
- API使用不可のため、ブラウザ抽出方式を採用
- チャンネルデータはローカルJSONファイルにキャッシュ
- インクリメンタルサーチ機能を実装
- クリップボード経由でデータ更新

### 実装のポイント
- Slack Web UIのセレクタは変更される可能性があるため、複数の方法で抽出
- チームIDとチャンネルIDの両方が必要（ディープリンク生成のため）
- エラーハンドリングを丁寧に（Slackアプリ未インストール時など）

### ブックマークレット作成時の注意
- Slack WebアプリのDOM構造に依存するため、定期的なメンテナンスが必要
- 抽出時はコンソールに進捗を表示してユーザーフレンドリーに
- 大量のチャンネルがある場合のパフォーマンスを考慮