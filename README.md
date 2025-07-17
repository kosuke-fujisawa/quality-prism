# 品質のプリズム (Quality Prism)

[![Tests](https://img.shields.io/badge/tests-66%2F66%20passing-brightgreen)](https://github.com/kosuke-fujisawa/quality-prism)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![TDD](https://img.shields.io/badge/development-TDD-orange)](CLAUDE.md)

ソフトウェア開発における品質の本質を探求するノベルゲーム。
異なる視点から品質にアプローチする3つのルートを体験できます。

## ✨ 特徴

- 🧪 **TDD開発**: t_wadaさんの推奨するTest-Driven Developmentで構築
- 📱 **レスポンシブUI**: Canvas APIによる滑らかな描画
- 🎮 **インタラクティブ**: クリック・キーボード操作対応
- 💾 **永続化**: IndexedDBによるセーブデータ管理
- 📝 **YAML駆動**: シナリオファイルによる柔軟なコンテンツ管理
- 🔀 **マルチルート**: 選択肢に基づく分岐ストーリー

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
- **ESLint**: コード品質チェック・自動修正
- **Prettier**: コードフォーマット自動化
- **textlint**: シナリオテキスト品質チェック

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

## 🧪 テスト

このプロジェクトは **TDD (Test-Driven Development)** で開発されています。

### テスト統計
- **総テスト数**: 93
- **成功率**: 100% (93/93)
- **カバレッジ**: 全主要コンポーネント + DDDレイヤー

### テストスイート
#### 既存アーキテクチャ
- `NovelGameApp.test.ts` (11 tests): UI・イベント処理
- `ChoiceSystem.test.ts` (16 tests): 選択肢・ルート分岐
- `ScenarioLoader.test.ts` (8 tests): YAMLファイル読み込み
- `GameLogic.test.ts` (10 tests): ゲーム状態管理
- `TextLog.test.ts` (13 tests): テキストログ
- `SaveData.test.ts` (8 tests): データ永続化

#### DDDアーキテクチャ
- `GameProgress.test.ts` (7 tests): ゲーム進行エンティティ
- `RouteId.test.ts` (10 tests): ルートID値オブジェクト
- `SceneNumber.test.ts` (10 tests): シーン番号値オブジェクト

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
│   │   │   └── GameSettings.ts  # ゲーム設定
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
│   │   │   └── DexieGameSettingsRepository.ts
│   │   └── persistence/         # 永続化
│   │       └── SaveDataDB.ts    # Dexieデータベース
│   └── storage/                 # 従来のストレージ
│       └── SaveData.ts          # セーブデータ管理
├── public/
│   └── scenarios/               # YAMLシナリオファイル
│       ├── opening.yaml         # オープニング
│       └── route1_1.yaml        # ルート1 シーン1
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
- [x] 包括的テストスイート

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

---

品質の本質を探求する旅を、ぜひお楽しみください。🌟