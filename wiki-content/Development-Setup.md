# 開発環境構築

品質のプリズムプロジェクトの開発環境セットアップガイド

## 🚀 クイックスタート

### 前提条件

- **Node.js**: v18以上 (推奨: v20 LTS)
- **npm**: v9以上 または **yarn**: v1.22以上
- **Git**: 最新版
- **モダンブラウザ**: Chrome, Firefox, Safari, Edge

### 基本セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/kosuke-fujisawa/quality-prism.git
cd quality-prism

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてゲームを確認

## 📦 依存関係詳細

### 本番依存関係
```json
{
  "dexie": "^4.0.8",        // IndexedDB wrapper
  "js-yaml": "^4.1.0"       // YAML parser
}
```

### 開発依存関係
```json
{
  "vite": "^5.4.2",                    // ビルドツール
  "typescript": "^5.8.3",             // 型チェック
  "vitest": "^2.0.5",                 // テストフレームワーク
  "@playwright/test": "^1.46.1",      // E2Eテスト
  "eslint": "^9.9.0",                 // コード品質
  "prettier": "^3.3.3",               // コードフォーマット
  "jsdom": "^24.1.1",                 // DOM環境
  "fake-indexeddb": "^6.0.0"          // IndexedDB mock
}
```

## 🛠️ 開発ツール設定

### VS Code推奨設定

**.vscode/settings.json**
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.yaml": "yaml",
    "*.yml": "yaml"
  },
  "vitest.enable": true
}
```

**.vscode/extensions.json**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "vitest.explorer",
    "ms-playwright.playwright",
    "redhat.vscode-yaml"
  ]
}
```

### Git設定

**pre-commit hook** (自動設定)
```bash
#!/bin/sh
npm run lint:fix
npm run format
npm run type-check
npm run test:run
```

## 🧪 テスト環境

### 基本テスト実行
```bash
# 全テスト実行
npm test

# ウォッチモード（開発時推奨）
npm run test:ui

# CI用テスト実行
npm run test:run

# カバレッジ付きテスト
npm run test:coverage
```

### E2Eテスト設定
```bash
# Playwright初期セットアップ
npx playwright install

# E2Eテスト実行
npm run test:e2e

# デバッグモード
npm run test:e2e:debug

# UIモード
npm run test:e2e:ui
```

## 📁 プロジェクト構造理解

### 主要ディレクトリ
```
quality-prism/
├── src/                    # ソースコード
│   ├── domain/            # DDDドメイン層
│   ├── application/       # DDDアプリケーション層
│   ├── infrastructure/    # DDDインフラ層
│   ├── game/             # ゲームロジック
│   ├── storage/          # データ永続化
│   └── test/             # テストユーティリティ
├── tests/                 # E2Eテスト
├── public/               # 静的ファイル
│   └── scenarios/        # YAMLシナリオファイル
├── docs/                 # ドキュメント
└── wiki-content/         # Wiki用コンテンツ
```

### 開発時の主要ファイル
- **CLAUDE.md**: TDD開発ガイドライン
- **vite.config.ts**: Vite設定
- **vitest.config.ts**: テスト設定
- **playwright.config.ts**: E2Eテスト設定
- **eslint.config.js**: ESLint設定
- **.prettierrc**: Prettier設定

## 🔧 開発ワークフロー

### 1. 新機能開発フロー (TDD)

```bash
# 1. 機能ブランチ作成
git checkout -b feature/new-feature

# 2. テストを先に作成 (Red)
# src/domain/entities/NewFeature.test.ts

# 3. 最小限の実装 (Green)
# src/domain/entities/NewFeature.ts

# 4. テスト実行・確認
npm test

# 5. リファクタリング (Refactor)
npm run lint:fix
npm run format

# 6. 全テスト確認
npm run test:run

# 7. コミット
git add .
git commit -m "feat: Add new feature with tests"
```

### 2. バグ修正フロー

```bash
# 1. バグ再現テスト作成
# tests/bug-reproduction.test.ts

# 2. テスト失敗確認
npm test

# 3. 修正実装
# 該当ファイルの修正

# 4. テスト成功確認
npm test

# 5. 回帰テスト実行
npm run test:run
npm run test:e2e
```

### 3. リファクタリングフロー

```bash
# 1. 現在のテスト状態確認
npm run test:run

# 2. リファクタリング実行
# 内部実装の改善

# 3. テスト維持確認
npm test

# 4. パフォーマンステスト
npm run test:coverage
```

## 🚦 コード品質チェック

### 自動チェックツール
```bash
# TypeScript型チェック
npm run type-check

# ESLint実行
npm run lint

# ESLint自動修正
npm run lint:fix

# Prettier実行
npm run format

# Prettier差分確認
npm run format:check
```

### 手動品質チェック
```bash
# ビルド確認
npm run build

# プレビュー確認
npm run preview

# 全品質チェック（CI相当）
npm run lint && npm run type-check && npm run test:run && npm run build
```

## 🌍 環境変数設定

### 開発環境 (.env.development)
```env
NODE_ENV=development
VITE_LOG_LEVEL=debug
VITE_ENABLE_DEVTOOLS=true
```

### 本番環境 (.env.production)
```env
NODE_ENV=production
VITE_LOG_LEVEL=info
VITE_ENABLE_DEVTOOLS=false
```

### テスト環境 (.env.test)
```env
NODE_ENV=test
VITE_LOG_LEVEL=error
```

## 🐛 トラブルシューティング

### よくある問題と解決策

**1. Node.js バージョンエラー**
```bash
# Node.js バージョン確認
node --version

# 推奨: Node.js v20 LTS使用
nvm install 20
nvm use 20
```

**2. 依存関係エラー**
```bash
# node_modules削除・再インストール
rm -rf node_modules package-lock.json
npm install
```

**3. TypeScriptエラー**
```bash
# TypeScript設定確認
npm run type-check

# VS Codeの TypeScript再起動
# Cmd+Shift+P > "TypeScript: Restart TS Server"
```

**4. テスト失敗**
```bash
# IndexedDB mock問題
npm install --save-dev fake-indexeddb

# DOM環境問題
npm install --save-dev jsdom @vitest/environment-jsdom

# Playwright問題
npx playwright install
```

**5. ビルドエラー**
```bash
# キャッシュクリア
npm run dev -- --force

# ビルドキャッシュクリア
rm -rf dist
npm run build
```

### パフォーマンス最適化

**メモリ使用量削減**
```bash
# Node.js メモリ制限増加
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

**ビルド速度向上**
```bash
# 並列ビルド有効化
npm run build -- --parallel

# インクリメンタルビルド
npm run dev # ホットリロード活用
```

## 📚 学習リソース

### プロジェクト固有ドキュメント
- [[TDD Guidelines|TDD開発指針]] - テスト駆動開発の実践
- [[DDD Architecture|DDDアーキテクチャ]] - ドメイン駆動設計
- [[Coding Standards|コーディング規約]] - プロジェクト規約

### 外部リソース
- [Vite公式ドキュメント](https://vitejs.dev/)
- [Vitest公式ドキュメント](https://vitest.dev/)
- [Playwright公式ドキュメント](https://playwright.dev/)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/)

## 🆘 サポート・質問

### 開発中の問題
1. [[Troubleshooting|トラブルシューティング]]ページを確認
2. [GitHub Issues](https://github.com/kosuke-fujisawa/quality-prism/issues)で質問
3. [CLAUDE.md](https://github.com/kosuke-fujisawa/quality-prism/blob/main/CLAUDE.md)で開発指針を確認

### 貢献・開発参加
1. [[Development Workflow|開発ワークフロー]]を確認
2. [[Git Workflow|Git運用]]でブランチ戦略を理解
3. [[Issue Management|Issue管理]]でタスク管理方法を学習

---

この開発環境構築により、**品質のプリズム**プロジェクトで効率的なTDD + DDD開発を実践できます。