# DDDアーキテクチャ

このプロジェクトは **Domain-Driven Design (DDD)** アーキテクチャを採用し、**Test-Driven Development (TDD)** で実装されています。

## 🏗️ アーキテクチャ概要

### レイヤー構成

```
src/
├── domain/                  # ドメイン層 (ビジネスロジックの核心)
│   ├── entities/            # エンティティ
│   ├── value-objects/       # 値オブジェクト
│   ├── repositories/        # リポジトリインターフェース
│   ├── services/           # ドメインサービス
│   └── interfaces/         # ドメインインターフェース
├── application/            # アプリケーション層 (ユースケース)
│   └── services/           # アプリケーションサービス
└── infrastructure/         # インフラストラクチャ層 (技術的実装)
    ├── repositories/       # リポジトリ実装
    ├── persistence/        # 永続化
    └── logging/           # ロギング
```

## 🔍 ドメイン層 (Domain Layer)

### エンティティ (Entities)

**GameProgress** - ゲーム進行状況エンティティ
- ユニークID: `progressId`
- ライフサイクル管理: ルート選択、シーン進行、完了状態
- ビジネスルール: トゥルールート解放条件

```typescript
export class GameProgress {
  private constructor(
    private readonly progressId: string,
    private currentRoute: RouteId,
    private currentScene: SceneNumber,
    private clearedRoutes: RouteId[],
    private lastSaveTime: Date
  ) {}

  // ビジネスロジック
  selectRoute(routeId: RouteId): void
  advanceToNextScene(): void
  isTrueRouteUnlocked(): boolean
}
```

**TextLogEntry** - テキストログエンティティ
- 一意性: `entryId`
- 不変性: 一度作成されたログは変更不可
- 時系列管理: タイムスタンプベースの順序

```typescript
export class TextLogEntry {
  constructor(
    private readonly entryId: string,
    private readonly routeId: RouteId,
    private readonly sceneNumber: SceneNumber,
    private readonly text: string,
    private readonly timestamp: Date
  ) {}
}
```

### 値オブジェクト (Value Objects)

**RouteId** - ルート識別子
- 不変性: 一度作成されたら変更不可
- 等価性: 値による比較
- 検証: 空文字列・null チェック

```typescript
export class RouteId {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('RouteId cannot be empty');
    }
  }

  equals(other: RouteId): boolean {
    return this.value === other.value;
  }

  isEmpty(): boolean {
    return this.value === '' || this.value.trim() === '';
  }
}
```

**SceneNumber** - シーン番号
- 範囲検証: 1以上の整数
- 進行ロジック: 次シーンへの移動
- 境界値チェック: 最大値制限

```typescript
export class SceneNumber {
  constructor(private readonly value: number) {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error('SceneNumber must be a positive integer');
    }
  }

  next(): SceneNumber {
    return new SceneNumber(this.value + 1);
  }

  isEqual(other: SceneNumber): boolean {
    return this.value === other.value;
  }
}
```

**GameSettings** - ゲーム設定
- 音量制御: 0.0 - 1.0 の範囲
- テキスト速度: 1-10 のレベル
- オートセーブ: 有効/無効

```typescript
export class GameSettings {
  constructor(
    private readonly volume: number,
    private readonly textSpeed: number,
    private readonly autoSave: boolean
  ) {
    if (volume < 0 || volume > 1) {
      throw new Error('Volume must be between 0 and 1');
    }
    if (textSpeed < 1 || textSpeed > 10) {
      throw new Error('Text speed must be between 1 and 10');
    }
  }
}
```

**RouteConfiguration** - ルート設定管理
- ルート定義: 利用可能なルート一覧
- トゥルールート: 特別なルートの定義
- 拡張性: 新ルート追加への対応

### ドメインサービス (Domain Services)

**RouteValidationService** - ルート検証サービス
- ビジネスルール: ルート選択可否の判定
- トゥルールート条件: 全ルートクリア後の解放

```typescript
export class RouteValidationService {
  canSelectRoute(routeId: RouteId, gameProgress: GameProgress): boolean {
    if (routeId.equals(RouteId.from('trueRoute'))) {
      return gameProgress.isTrueRouteUnlocked();
    }
    return this.getAvailableRoutes().some(route => route.equals(routeId));
  }
}
```

### リポジトリインターフェース

**GameProgressRepository** - ゲーム進行データアクセス
```typescript
export interface GameProgressRepository {
  getOrCreate(): Promise<GameProgress>;
  save(progress: GameProgress): Promise<void>;
  delete(): Promise<void>;
}
```

**GameSettingsRepository** - ゲーム設定データアクセス
```typescript
export interface GameSettingsRepository {
  getOrDefault(): Promise<GameSettings>;
  save(settings: GameSettings): Promise<void>;
  reset(): Promise<void>;
}
```

**TextLogRepository** - テキストログデータアクセス
```typescript
export interface TextLogRepository {
  save(entry: TextLogEntry): Promise<void>;
  findByRoute(routeId: RouteId): Promise<TextLogEntry[]>;
  findAll(): Promise<TextLogEntry[]>;
  clear(): Promise<void>;
}
```

## 📱 アプリケーション層 (Application Layer)

### アプリケーションサービス

**GameService** - ゲームユースケースの統合
- 複数ドメインオブジェクトの調整
- トランザクション管理
- エラーハンドリング

```typescript
export class GameService {
  constructor(
    private gameProgressRepository: GameProgressRepository,
    private gameSettingsRepository: GameSettingsRepository,
    private textLogRepository: TextLogRepository,
    private routeValidationService: RouteValidationService
  ) {}

  async selectRoute(routeName: string): Promise<SelectRouteResult> {
    const progress = await this.gameProgressRepository.getOrCreate();
    const routeId = RouteId.from(routeName);

    // ビジネスルール検証
    if (!this.routeValidationService.canSelectRoute(routeId, progress)) {
      return { success: false, message: 'ルートを選択できません' };
    }

    // ドメインオブジェクトの操作
    progress.selectRoute(routeId);
    await this.gameProgressRepository.save(progress);

    return { success: true };
  }
}
```

## 🔧 インフラストラクチャ層 (Infrastructure Layer)

### リポジトリ実装

**DexieGameProgressRepository** - IndexedDB実装
```typescript
export class DexieGameProgressRepository implements GameProgressRepository {
  constructor(private db: SaveDataDB) {}

  async getOrCreate(): Promise<GameProgress> {
    const data = await this.db.gameProgress.toCollection().first();
    return data ? GameProgress.restore(data) : GameProgress.createNew();
  }

  async save(progress: GameProgress): Promise<void> {
    const data = progress.toData();
    await this.db.gameProgress.put(data);
  }
}
```

### 永続化

**SaveDataDB** - Dexieデータベース定義
```typescript
export class SaveDataDB extends Dexie {
  gameProgress!: Table<GameProgressData>;
  gameSettings!: Table<GameSettingsData>;
  textLogs!: Table<TextLogData>;

  constructor() {
    super('QualityPrismSaveData');
    this.version(1).stores({
      gameProgress: '++id, currentRoute, currentScene, lastSaveTime',
      gameSettings: '++id, volume, textSpeed, autoSave',
      textLogs: '++id, routeId, sceneNumber, timestamp'
    });
  }
}
```

## 🧪 テスト戦略

### レイヤー別テスト

**ドメイン層** (139 tests)
- エンティティ: ビジネスロジック・状態遷移
- 値オブジェクト: 不変性・等価性・検証
- ドメインサービス: ビジネスルール

**アプリケーション層** (31 tests)
- ユースケース: 複数ドメインオブジェクトの協調
- エラーハンドリング: 例外・競合状態

**インフラストラクチャ層** (41 tests)
- リポジトリ: データアクセス・永続化
- データベース: CRUD操作・整合性

### エッジケーステスト
- 境界値: 最小・最大値での動作確認
- 異常系: 不正入力・null・undefined
- Unicode: 日本語・特殊文字・絵文字
- 浮動小数点: 精度・NaN・Infinity

## 🔄 依存関係のルール

### レイヤー間依存
1. **ドメイン層**: 他の層に依存しない
2. **アプリケーション層**: ドメイン層のみに依存
3. **インフラストラクチャ層**: アプリケーション層・ドメイン層に依存

### 依存性注入
```typescript
// アプリケーションサービスへの依存注入
const gameService = new GameService(
  new DexieGameProgressRepository(db),
  new DexieGameSettingsRepository(db),
  new DexieTextLogRepository(db),
  new RouteValidationService()
);
```

## 📈 DDD実装の利点

### 保守性
- **関心の分離**: ビジネスロジックと技術実装の明確な分離
- **単一責任**: 各オブジェクトが一つの責任を持つ
- **疎結合**: インターフェースによる依存関係の管理

### テスタビリティ
- **レイヤー独立**: 各レイヤーを独立してテスト
- **モック使用**: リポジトリインターフェースのモック
- **ビジネスロジック**: 純粋関数による検証

### 拡張性
- **新機能追加**: ドメインオブジェクトの追加
- **リポジトリ変更**: 実装切り替えの容易性
- **ビジネスルール変更**: ドメイン層での局所化

## 🚀 今後の拡張

### 新しいドメインオブジェクト
- **Character**: キャラクター管理
- **Scene**: シーン詳細管理
- **Achievement**: 実績システム

### 新しいリポジトリ
- **CharacterRepository**: キャラクターデータ
- **SceneRepository**: シーンデータ
- **AchievementRepository**: 実績データ

### 新しいドメインサービス
- **AchievementService**: 実績解放判定
- **ProgressCalculationService**: 進行度計算

---

このDDDアーキテクチャにより、**品質のプリズム**は保守性・テスタビリティ・拡張性を備えたクリーンなコードベースを実現しています。