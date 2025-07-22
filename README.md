# 品質のプリズム (Quality Prism)

[![Tests](https://img.shields.io/badge/tests-445%20total%20|%20445%20passing-brightgreen)](https://github.com/kosuke-fujisawa/quality-prism)
[![CodeRabbit](https://img.shields.io/badge/CodeRabbit-AI%20Code%20Review-blue)](https://coderabbit.ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![TDD](https://img.shields.io/badge/development-TDD-orange)](CLAUDE.md)

ソフトウェア開発における品質の本質を探求するノベルゲーム。
異なる視点から品質にアプローチする3つのルートを体験できます。

## ✨ 特徴

- 🧪 **TDD開発**: t_wadaさんの推奨するTest-Driven Developmentで構築
- 🏗️ **DDD アーキテクチャ**: Domain-Driven Design による設計
- 📱 **レスポンシブUI**: Canvas APIによる滑らかな描画
- 🎮 **インタラクティブ**: クリック・キーボード操作対応
- 💾 **永続化**: IndexedDBによるセーブデータ管理
- 📝 **YAML駆動**: シナリオファイルによる柔軟なコンテンツ管理
- 🔀 **マルチルート**: 選択肢に基づく分岐ストーリー
- 🧪 **高品質**: 445テスト・100%成功率
- 🤖 **CodeRabbit**: AI駆動コードレビュー自動化
- 📊 **ロギング**: エンタープライズレベルの監視・デバッグ機能

## 🚀 クイックスタート

### 前提条件

- Node.js (v18以上推奨)
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/kosuke-fujisawa/quality-prism.git
cd quality-prism

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 にアクセスしてゲームを開始できます。

## 🎮 操作方法

### メニュー画面
- **マウスクリック**: メニュー項目を選択
- **数字キー (1-5)**: メニュー項目を選択
  - 1: START (新規ゲーム)
  - 2: LOAD (セーブデータから継続)
  - 3: GALLERY (ギャラリー表示)
  - 4: MINI GAME (ミニゲーム)
  - 5: CREDIT (クレジット)

### 共通操作
- **Escキー**: メニューに戻る

## 🏗️ 技術スタック

### フロントエンド
- **Vite**: 高速開発サーバー・ビルドツール
- **TypeScript**: 型安全な開発言語
- **Canvas API**: ゲーム描画エンジン

### アーキテクチャ
- **DDD**: Domain-Driven Design パターン
- **Repository Pattern**: データアクセスの抽象化
- **Dependency Injection**: 依存性注入による疎結合

### データ管理
- **Dexie**: IndexedDB wrapper (セーブデータ・設定)
- **js-yaml**: YAMLファイル読み込み

### 開発・テスト
- **Vitest**: 高速テストフレームワーク
- **jsdom**: DOM環境シミュレーション
- **fake-indexeddb**: IndexedBテスト環境
- **Playwright**: E2Eテストフレームワーク
- **ESLint**: コード品質チェック・自動修正
- **Prettier**: コードフォーマット自動化
- **textlint**: シナリオテキスト品質チェック

## 📚 ドキュメント・Wiki

### GitHub Wiki (包括的開発ドキュメント)
プロジェクトの詳細な技術ドキュメントは [**GitHub Wiki**](https://github.com/kosuke-fujisawa/quality-prism/wiki) で参照できます：

#### 🏗️ アーキテクチャ・設計
- **[DDD Architecture](https://github.com/kosuke-fujisawa/quality-prism/wiki/DDD-Architecture)** - Domain-Driven Design 実装詳細
- **[Logging System](https://github.com/kosuke-fujisawa/quality-prism/wiki/Logging-System)** - 89テスト完成のエンタープライズロギング
- **[TDD Guidelines](https://github.com/kosuke-fujisawa/quality-prism/wiki/TDD-Guidelines)** - テスト駆動開発実践指針

#### 🛠️ 開発・運用
- **[Development Setup](https://github.com/kosuke-fujisawa/quality-prism/wiki/Development-Setup)** - 開発環境構築完全ガイド
- **[Test Strategy](https://github.com/kosuke-fujisawa/quality-prism/wiki/Test-Strategy)** - 425テストの体系的戦略

### ローカルWikiコンテンツ
Wikiコンテンツのソースファイルは `wiki-content/` ディレクトリにあります：
- `Home.md` - Wikiメインページ
- `DDD-Architecture.md` - DDDアーキテクチャ詳細
- `TDD-Guidelines.md` - TDD開発指針
- `Development-Setup.md` - 環境構築ガイド
- `Test-Strategy.md` - テスト戦略
- `Logging-System.md` - ロギングシステム

### Wiki手動作成手順
1. [GitHub Wiki](https://github.com/kosuke-fujisawa/quality-prism/wiki) にアクセス
2. "Create the first page" をクリック
3. `wiki-content/Home.md` の内容をコピー&ペーストしてホームページを作成
4. 各 `.md` ファイルの内容で対応するWikiページを作成

## 📋 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プレビューサーバー起動
npm run preview

# テスト実行
npm test

# テストUI表示
npm run test:ui

# テスト実行 (CIモード)
npm run test:run

# E2Eテスト実行
npm run test:e2e

# E2Eテスト（ヘッドありモード）
npm run test:e2e:headed

# E2EテストUI表示
npm run test:e2e:ui

# E2Eテストデバッグモード
npm run test:e2e:debug

# E2Eテストレポート表示
npm run test:e2e:report

# コードlint実行
npm run lint

# lint自動修正
npm run lint:fix

# 型チェック実行
npm run type-check

# コードフォーマット実行
npm run format

# フォーマットチェック（差分確認）
npm run format:check

# シナリオテキストlint実行
npm run textlint

# シナリオテキスト自動修正
npm run textlint:fix
```

## 🔒 セキュリティ

### 依存関係セキュリティ
- **npm audit**: 依存関係の脆弱性チェック
- **定期的な更新**: 依存関係の手動更新・監視

```bash
# セキュリティ監査実行
npm audit

# 依存関係の脆弱性チェック
npm audit --audit-level high
```

## 🧪 テスト

このプロジェクトは **TDD (Test-Driven Development)** で開発されています。

### テスト統計
- **総テスト数**: 445
- **成功率**: 100% (445/445)
- **単体テスト**: 431テスト (33ファイル) - **全テスト成功** 
- **E2Eテスト**: 14テスト (2ファイル)
- **カバレッジ**: 全主要コンポーネント + DDDレイヤー完全網羅

### テストスイート

#### 既存アーキテクチャ (66 tests)
- `NovelGameApp.test.ts` (11 tests): UI・イベント処理
- `ChoiceSystem.test.ts` (16 tests): 選択肢・ルート分岐
- `ScenarioLoader.test.ts` (8 tests): YAMLファイル読み込み
- `GameLogic.test.ts` (10 tests): ゲーム状態管理
- `TextLog.test.ts` (13 tests): テキストログ
- `SaveData.test.ts` (8 tests): データ永続化

#### DDDアーキテクチャ - ドメイン層 (150 tests)
- `GameProgress.test.ts` (7 tests): ゲーム進行エンティティ
- `GameProgress.edge-cases.test.ts` (16 tests): エッジケース・境界値
- `TextLogEntry.test.ts` (13 tests): テキストログエンティティ
- `RouteId.test.ts` (10 tests): ルートID値オブジェクト
- `RouteId.edge-cases.test.ts` (22 tests): エッジケース・特殊文字・Unicode
- `SceneNumber.test.ts` (10 tests): シーン番号値オブジェクト
- `SceneNumber.edge-cases.test.ts` (22 tests): 境界値・型安全性・パフォーマンス
- `GameSettings.test.ts` (18 tests): ゲーム設定値オブジェクト
- `GameSettings.edge-cases.test.ts` (23 tests): 浮動小数点精度・不変性・NaN/Infinity処理
- `RouteConfiguration.test.ts` (26 tests): ルート設定管理
- `RouteConfiguration.extensibility.test.ts` (14 tests): 拡張性・柔軟性テスト
- `RouteValidationService.test.ts` (9 tests): ルート検証ドメインサービス
- `ILogger.test.ts` (11 tests): ロガーインターフェース・型定義
- `GameLogger.test.ts` (11 tests): ゲーム専用ロガー

#### DDDアーキテクチャ - アプリケーション層 (73 tests)
- `GameService.test.ts` (16 tests): ゲームアプリケーションサービス
- `GameService.edge-cases.test.ts` (15 tests): 非同期エラー・競合状態・タイムアウト
- `SaveDataListService.test.ts` (7 tests): セーブデータ一覧管理サービス
- **UI層** (35 tests):
  - `SaveDataListView.test.ts` (8 tests): セーブデータ一覧表示UI
  - `NovelGameApp.load-integration.test.ts` (7 tests): ロード機能統合テスト

#### DDDアーキテクチャ - インフラストラクチャ層 (108 tests)
- `DexieGameProgressRepository.test.ts` (12 tests): ゲーム進行リポジトリ
- `DexieGameSettingsRepository.test.ts` (14 tests): ゲーム設定リポジトリ
- `DexieTextLogRepository.test.ts` (15 tests): テキストログリポジトリ
- `BaseLogger.test.ts` (15 tests): 基盤ロガー実装
- `ConsoleAppender.test.ts` (12 tests): コンソール出力・フォーマッター
- `IndexedDBAppender.test.ts` (6 tests): 永続化ログ・検索機能
- `RepositoryLogger.test.ts` (16 tests): セキュアDB操作ログ
- `LoggerFactory.test.ts` (18 tests): 環境対応ファクトリー

#### E2Eテスト (Playwright) - 14 tests
- `basic.spec.ts` (8 tests): 基本動作・UI操作・モード遷移
- `ddd-integration.spec.ts` (6 tests): DDDアーキテクチャ統合・永続化・エラーハンドリング


#### テスト品質特徴
- **TDD準拠**: t_wadaさんの推奨手法に基づく
- **エッジケース網羅**: 境界値・特殊文字・Unicode・NaN/Infinity処理
- **型安全性**: TypeScript型システムの完全活用
- **パフォーマンステスト**: 大量データ・同時実行・タイムアウト処理
- **モック使用**: 依存関係の分離とテスト独立性
- **データ整合性**: 永続化・復元・並行処理の検証
- **E2E検証**: 実際のブラウザ環境でのユーザーシナリオテスト

詳細な開発ガイドラインは [CLAUDE.md](CLAUDE.md) を参照してください。

## 📁 プロジェクト構成

```
quality-prism/
├── src/
│   ├── NovelGameApp.ts          # メインアプリケーション
│   ├── main.ts                  # エントリーポイント
│   ├── game/                    # 従来のゲームロジック
│   │   ├── GameLogic.ts         # ゲーム状態管理
│   │   ├── GameLogicDDD.ts      # DDD版ゲームロジック
│   │   ├── ChoiceSystem.ts      # 選択肢・ルート分岐
│   │   ├── ScenarioLoader.ts    # YAMLシナリオ読み込み
│   │   └── TextLog.ts           # テキストログ
│   ├── domain/                  # DDDドメイン層
│   │   ├── entities/            # エンティティ
│   │   │   ├── GameProgress.ts  # ゲーム進行エンティティ
│   │   │   └── TextLogEntry.ts  # テキストログエンティティ
│   │   ├── value-objects/       # 値オブジェクト
│   │   │   ├── RouteId.ts       # ルートID
│   │   │   ├── SceneNumber.ts   # シーン番号
│   │   │   ├── GameSettings.ts  # ゲーム設定
│   │   │   └── RouteConfiguration.ts # ルート設定管理
│   │   ├── repositories/        # リポジトリインターフェース
│   │   │   ├── GameProgressRepository.ts
│   │   │   ├── GameSettingsRepository.ts
│   │   │   └── TextLogRepository.ts
│   │   └── services/            # ドメインサービス
│   │       └── RouteValidationService.ts
│   ├── application/             # アプリケーション層
│   │   └── services/
│   │       └── GameService.ts   # ゲームサービス
│   ├── infrastructure/          # インフラストラクチャ層
│   │   ├── repositories/        # リポジトリ実装
│   │   │   ├── DexieGameProgressRepository.ts
│   │   │   ├── DexieGameSettingsRepository.ts
│   │   │   └── DexieTextLogRepository.ts
│   │   └── persistence/         # 永続化
│   │       └── SaveDataDB.ts    # Dexieデータベース
│   ├── storage/                 # 従来のストレージ
│   │   └── SaveData.ts          # セーブデータ管理
│   └── test/                    # テスト共通ユーティリティ
│       └── utils/
│           └── testHelpers.ts   # テストヘルパー・モック・定数
├── tests/                       # E2Eテストディレクトリ
│   └── e2e/                     # E2Eテストファイル
├── public/
│   └── scenarios/               # YAMLシナリオファイル
│       ├── opening.yaml         # オープニング
│       └── route1_1.yaml        # ルート1 シーン1
├── playwright.config.ts         # Playwright設定
├── CLAUDE.md                    # TDD開発ガイドライン
└── README.md                    # このファイル
```

## 🏗️ アーキテクチャ

### DDD (Domain-Driven Design)
このプロジェクトは **DDD (Domain-Driven Design)** アーキテクチャを採用しています。

#### レイヤー構成
- **Domain Layer** (`src/domain/`): ビジネスロジックの核心
  - **Entities**: ゲーム進行状況、テキストログエントリ
  - **Value Objects**: ルートID、シーン番号、ゲーム設定
  - **Repositories**: データ永続化の抽象化
  - **Services**: ドメインサービス（ルート検証など）

- **Application Layer** (`src/application/`): ユースケースの実装
  - **Services**: ゲームサービス（ルート選択、進行管理など）

- **Infrastructure Layer** (`src/infrastructure/`): 技術的実装
  - **Repositories**: Dexie（IndexedDB）リポジトリ実装
  - **Persistence**: データベース定義

#### DDD設計の利点
- **関心の分離**: ビジネスロジックと技術的実装の分離
- **テスタビリティ**: 各レイヤーの独立したテスト
- **保守性**: 明確な責任範囲による変更容易性
- **拡張性**: 新機能追加時のクリーンなアーキテクチャ

#### 実装されたDDDコンポーネント
**エンティティ**
- `GameProgress`: ゲーム進行状況の管理（ルート選択、シーン進行、セーブ時間）
- `TextLogEntry`: テキストログの記録（ルート、シーン、テキスト、タイムスタンプ）

**値オブジェクト**
- `RouteId`: ルート識別子（不変性・等価性・検証）
- `SceneNumber`: シーン番号（範囲検証・進行ロジック）
- `GameSettings`: ゲーム設定（音量・テキスト速度・オートセーブ）

**リポジトリ**
- `GameProgressRepository`: ゲーム進行データの永続化
- `GameSettingsRepository`: ゲーム設定の永続化
- `TextLogRepository`: テキストログの永続化
- `DexieTextLogRepository`: IndexedDBベースのテキストログ実装

**ドメインサービス**
- `RouteValidationService`: ルート選択の検証とビジネスルール

**アプリケーションサービス**
- `GameService`: ゲームのユースケース実装（ルート選択、シーン進行、設定管理）

## 🎯 ゲームシステム

### ルート分岐システム
プレイヤーの選択によって以下の3つのルートに分岐します：

- **Route 1**: テスト駆動開発重視
- **Route 2**: コードレビュー重視  
- **Route 3**: ユーザー体験重視

### シナリオ形式 (YAML)
```yaml
route: opening
scene: 1
background: title_bg.jpg
bgm: opening_theme.mp3
characters:
  - id: narrator
    name: "ナレーター"
    position: center
    sprite: null
default_speaker: narrator
texts:
  - speaker: narrator
    content:
      - "品質のプリズム"
      - "それぞれが異なる視点から、品質の本質を探求していく。"
```

## 🚧 開発ロードマップ

### 実装済み ✅
- [x] メニューシステム
- [x] クリック・キーボード操作
- [x] 選択肢システム
- [x] YAMLシナリオローダー
- [x] セーブデータシステム
- [x] **DDDアーキテクチャ実装**
- [x] **包括的テストスイート (445 tests)**
- [x] **CodeRabbit AI レビュー**: 必須レビューワークフロー
- [x] **Issue #6解決**: ロードボタンからセーブデータ一覧表示機能
- [x] **TDD準拠開発プロセス**
- [x] **エッジケース・エラーハンドリング**
- [x] **データ永続化・復元システム**
- [x] **E2Eテストフレームワーク（Playwright）**

### 今後の予定 🚀
- [ ] テキスト送りシステム (クリック/ENTERキー)
- [ ] ギャラリー機能詳細実装
- [ ] ミニゲーム機能詳細実装
- [ ] マルチメディア対応 (ボイス・BGM・背景)
- [ ] セーブ/ロード画面UI
- [ ] 選択肢UI表示

## 🤝 コントリビューション

このプロジェクトはGit Flowブランチ戦略を採用しています。

### 🌿 ブランチ戦略
- **main**: 本番環境用安定版
- **develop**: 開発統合ブランチ  
- **feature/***: 機能開発ブランチ

### 🤖 CodeRabbit必須レビューワークフロー
- **自動AI分析**: 全PRでコード品質・TDD・DDD準拠をチェック
- **日本語対応**: プロジェクト特化の日本語コメント
- **必須承認**: CodeRabbitの承認なしでは本番マージ不可

### 開発フロー
1. このリポジトリをフォーク
2. `develop`ブランチから機能ブランチを作成
   ```bash
   git checkout develop
   git checkout -b feature/amazing-feature
   ```
3. TDD手法に従ってテストを先に作成
4. 変更をコミット (`git commit -m 'feat: Add amazing feature'`)
5. ブランチにプッシュ (`git push origin feature/amazing-feature`)
6. `develop`ブランチへのプルリクエストを作成

### 開発時の注意事項
- 必ずテストを先に書いてください (TDD)
- 全テストが通ることを確認してからコミット
- lintエラーを解消してからコミット (`npm run lint`)
- **CodeRabbitレビュー必須**: PRは必ずCodeRabbitの承認を得てからマージ
- [CLAUDE.md](CLAUDE.md) の開発ガイドラインに従ってください
- [BRANCHING_STRATEGY.md](BRANCHING_STRATEGY.md) のブランチ運用ルールを遵守してください

## 📄 ライセンス

このプロジェクトは制限的カスタムライセンスの下で公開されています。

### 🚫 利用制限
- **商用利用禁止**: 商用目的での使用は許可されていません
- **再配布禁止**: ソースコード・バイナリの再配布は禁止されています
- **個人・教育利用のみ**: 学習・研究目的での利用に限定されています

詳細は [LICENSE](LICENSE) ファイルを参照してください。
商用利用や再配布をご希望の場合は、事前にお問い合わせください。

## 👨‍💻 作者

- **開発**: Claude Code with Human
- **TDD指導**: t_wadaさんの推奨手法に基づく
- **エンジン**: Vite + TypeScript
- **アーキテクチャ**: DDD (Domain-Driven Design) + TDD

---

品質の本質を探求する旅を、ぜひお楽しみください。🌟