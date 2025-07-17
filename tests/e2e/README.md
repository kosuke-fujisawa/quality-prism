# E2Eテスト

このディレクトリには、Playwrightを使用したEnd-to-End (E2E) テストが含まれています。

## 概要

E2Eテストは、実際のブラウザ環境でアプリケーション全体の動作を検証します。ユーザーの操作フローを模擬し、UI要素の表示、ユーザーインタラクション、データの永続化などを包括的にテストします。

## テストファイル構成

```
tests/e2e/
├── pages/
│   └── GamePage.ts          # Page Object Model
├── basic.spec.ts            # 基本的な機能テスト
├── route-selection.spec.ts  # ルート選択機能のテスト
├── true-route.spec.ts       # トゥルールート解放のテスト
├── settings.spec.ts         # 設定変更機能のテスト
└── README.md               # このファイル
```

## テストの実行

### 基本的な実行

```bash
# 全てのE2Eテストを実行
npm run test:e2e

# ヘッドレスモードで実行（ブラウザを表示）
npm run test:e2e:headed

# UIモードで実行（テスト結果を視覚的に確認）
npm run test:e2e:ui

# デバッグモードで実行
npm run test:e2e:debug

# テストレポートを表示
npm run test:e2e:report
```

### 特定のテストファイルのみ実行

```bash
# 基本機能のみテスト
npx playwright test basic.spec.ts

# ルート選択機能のみテスト
npx playwright test route-selection.spec.ts

# トゥルールート機能のみテスト
npx playwright test true-route.spec.ts

# 設定機能のみテスト
npx playwright test settings.spec.ts
```

### 特定のブラウザでのみ実行

```bash
# Chromiumのみ
npx playwright test --project=chromium

# Firefoxのみ
npx playwright test --project=firefox

# Webkitのみ
npx playwright test --project=webkit
```

## テストシナリオ

### 1. 基本機能テスト (basic.spec.ts)

- ページの正しい読み込み
- 基本UI要素の表示確認
- 初期状態の検証

### 2. ルート選択テスト (route-selection.spec.ts)

- 各ルート（route1, route2, route3）の選択
- シーン進行の確認
- ルート切り替え時の動作
- ルートクリア機能
- エラーハンドリング

### 3. トゥルールート解放テスト (true-route.spec.ts)

- 3つのルートクリア後のトゥルールート解放
- トゥルールート選択とシーン進行
- 部分的クリア時の動作確認
- 重複クリアの処理

### 4. 設定変更テスト (settings.spec.ts)

- 音量設定の変更
- テキスト速度の変更
- オートセーブ設定の切り替え
- 設定の永続化
- 無効値の正規化

## Page Object Model

`pages/GamePage.ts`では、Page Object Modelパターンを使用してUI要素とその操作を抽象化しています。

### 主要メソッド

- `goto()`: ゲームページに移動
- `clickRouteButton(routeName)`: 指定ルートを選択
- `advanceScenes(count)`: 指定数のシーンを進める
- `openSettings()`: 設定画面を開く
- `getGameStatus()`: ゲーム状態を取得
- `isTrueRouteUnlocked()`: トゥルールート解放状態を確認

## 設定

`playwright.config.ts`では以下の設定を行っています：

- **テストディレクトリ**: `./tests/e2e`
- **ベースURL**: `http://127.0.0.1:3000`
- **ブラウザ**: Chrome, Firefox, Safari, モバイル版Chrome/Safari
- **開発サーバー**: 自動起動（`npm run dev`）
- **失敗時**: スクリーンショットとビデオ録画

## CI/CD統合

CI環境では以下の設定が適用されます：

- リトライ回数: 2回
- 並列実行: 無効
- `forbidOnly`: 有効（`test.only`の使用を禁止）

## トラブルシューティング

### よくある問題

1. **テストが失敗する**
   - 開発サーバーが起動していることを確認
   - ブラウザが正しくインストールされていることを確認

2. **要素が見つからない**
   - セレクターが正しいか確認
   - 要素の表示タイミングを確認（`waitFor`の使用）

3. **テストが遅い**
   - 不要な`waitForTimeout`を削除
   - より具体的なセレクターを使用

### デバッグ方法

```bash
# デバッグモードで実行
npm run test:e2e:debug

# 特定のテストをデバッグ
npx playwright test --debug basic.spec.ts
```

## 拡張方法

新しいテストを追加する場合：

1. 新しいspecファイルを作成
2. `GamePage`クラスに必要なメソッドを追加
3. テストケースを実装
4. 必要に応じてREADMEを更新