# TDD開発指針

このプロジェクトは **t_wadaさんの推奨するTest-Driven Development (TDD)** 手法で開発されています。

## 🎯 TDD基本原則

### Red-Green-Refactorサイクル

1. **🔴 Red**: 失敗するテストを書く
2. **🟢 Green**: テストを通す最小限のコードを書く  
3. **🔵 Refactor**: コードを改善する

```typescript
// 1. Red: 失敗するテストを先に書く
describe('RouteId', () => {
  it('有効なルートIDを作成できる', () => {
    const routeId = RouteId.from('route1');
    expect(routeId.getValue()).toBe('route1');
  });
});

// 2. Green: 最小限の実装
export class RouteId {
  constructor(private value: string) {}
  static from(value: string): RouteId {
    return new RouteId(value);
  }
  getValue(): string {
    return this.value;
  }
}

// 3. Refactor: より良い設計に改善
export class RouteId {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('RouteId cannot be empty');
    }
  }
  
  static from(value: string): RouteId {
    return new RouteId(value);
  }
  
  getValue(): string {
    return this.value;
  }
  
  equals(other: RouteId): boolean {
    return this.value === other.value;
  }
}
```

## 📊 プロジェクトテスト統計

### 総テスト数: **425テスト** (100% 成功)

| カテゴリ | テスト数 | ファイル数 | 説明 |
|----------|----------|------------|------|
| **ドメイン層** | 139 | 11 | エンティティ・値オブジェクト・サービス |
| **アプリケーション層** | 31 | 2 | ユースケース・サービス統合 |
| **インフラストラクチャ層** | 41 | 3 | リポジトリ・永続化 |
| **ゲームロジック** | 66 | 6 | 従来アーキテクチャ |
| **ロギングシステム** | 89 | 7 | 包括的ログアーキテクチャ |
| **ユーティリティ** | 45 | 3 | テストヘルパー・共通機能 |
| **E2Eテスト** | 14 | 2 | 統合・ブラウザテスト |

## 🧪 テスト分類

### 1. ユニットテスト (Unit Tests)

**ドメインオブジェクトテスト**
```typescript
// 値オブジェクトの不変性テスト
describe('RouteId', () => {
  it('等価性を正しく判定する', () => {
    const route1 = RouteId.from('route1');
    const route2 = RouteId.from('route1');
    const route3 = RouteId.from('route2');
    
    expect(route1.equals(route2)).toBe(true);
    expect(route1.equals(route3)).toBe(false);
  });
});

// エンティティのビジネスロジックテスト
describe('GameProgress', () => {
  it('全ルートクリア後にトゥルールートが解放される', () => {
    const progress = GameProgress.createNew();
    
    // 3つのルートをクリア
    progress.selectRoute(RouteId.from('route1'));
    progress.markCurrentRouteAsCleared();
    progress.selectRoute(RouteId.from('route2'));
    progress.markCurrentRouteAsCleared();
    progress.selectRoute(RouteId.from('route3'));
    progress.markCurrentRouteAsCleared();
    
    expect(progress.isTrueRouteUnlocked()).toBe(true);
  });
});
```

**エッジケーステスト**
```typescript
describe('SceneNumber エッジケース', () => {
  it('負の数は無効', () => {
    expect(() => new SceneNumber(-1)).toThrow();
  });
  
  it('0は無効', () => {
    expect(() => new SceneNumber(0)).toThrow();
  });
  
  it('小数は無効', () => {
    expect(() => new SceneNumber(1.5)).toThrow();
  });
  
  it('NaNは無効', () => {
    expect(() => new SceneNumber(NaN)).toThrow();
  });
  
  it('Infinityは無効', () => {
    expect(() => new SceneNumber(Infinity)).toThrow();
  });
});
```

### 2. 統合テスト (Integration Tests)

**アプリケーションサービステスト**
```typescript
describe('GameService 統合テスト', () => {
  let gameService: GameService;
  let mockProgressRepo: GameProgressRepository;
  let mockSettingsRepo: GameSettingsRepository;

  beforeEach(() => {
    mockProgressRepo = createMockGameProgressRepository();
    mockSettingsRepo = createMockGameSettingsRepository();
    gameService = new GameService(mockProgressRepo, mockSettingsRepo);
  });

  it('ルート選択が正常に動作する', async () => {
    const result = await gameService.selectRoute('route1');
    
    expect(result.success).toBe(true);
    expect(mockProgressRepo.save).toHaveBeenCalled();
  });
});
```

**リポジトリテスト**
```typescript
describe('DexieGameProgressRepository', () => {
  let repository: DexieGameProgressRepository;
  let db: SaveDataDB;

  beforeEach(async () => {
    db = new SaveDataDB();
    repository = new DexieGameProgressRepository(db);
    await db.delete();
    await db.open();
  });

  it('ゲーム進行データを保存・復元できる', async () => {
    const progress = GameProgress.createNew();
    progress.selectRoute(RouteId.from('route1'));
    
    await repository.save(progress);
    const restored = await repository.getOrCreate();
    
    expect(restored.getCurrentRoute().getValue()).toBe('route1');
  });
});
```

### 3. E2Eテスト (End-to-End Tests)

**ブラウザ統合テスト** (Playwright)
```typescript
test('ゲーム開始からルート選択まで', async ({ page }) => {
  await page.goto('/');
  
  // スタート画面の確認
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('text=START')).toBeVisible();
  
  // ゲーム開始
  await page.click('text=START');
  
  // ルート選択画面の確認
  await expect(page.locator('text=ルートを選択してください')).toBeVisible();
  
  // ルート1を選択
  await page.keyboard.press('1');
  
  // ゲーム画面に遷移
  await expect(page.locator('text=Route 1開始')).toBeVisible();
});
```

## 🔧 テスト実装パターン

### 1. AAA パターン (Arrange-Act-Assert)

```typescript
describe('GameSettings', () => {
  it('音量設定を更新できる', () => {
    // Arrange: テストデータの準備
    const settings = GameSettings.createDefault();
    const newVolume = 0.8;
    
    // Act: テスト対象の実行
    const updatedSettings = settings.updateVolume(newVolume);
    
    // Assert: 結果の検証
    expect(updatedSettings.getVolume()).toBe(0.8);
    expect(updatedSettings).not.toBe(settings); // 不変性の確認
  });
});
```

### 2. Given-When-Then パターン

```typescript
describe('RouteValidationService', () => {
  it('トゥルールートは全ルートクリア後のみ選択可能', () => {
    // Given: 2つのルートをクリアした状態
    const progress = GameProgress.createNew();
    progress.selectRoute(RouteId.from('route1'));
    progress.markCurrentRouteAsCleared();
    progress.selectRoute(RouteId.from('route2'));
    progress.markCurrentRouteAsCleared();
    
    const service = new RouteValidationService();
    const trueRoute = RouteId.from('trueRoute');
    
    // When: トゥルールートを選択しようとする
    const canSelect = service.canSelectRoute(trueRoute, progress);
    
    // Then: まだ選択できない（3つ目のルートが未クリア）
    expect(canSelect).toBe(false);
  });
});
```

### 3. モックとスタブの活用

```typescript
describe('GameService', () => {
  it('データベースエラー時に適切にハンドリングする', async () => {
    // Mock repository that throws error
    const mockRepo = {
      getOrCreate: vi.fn().mockRejectedValue(new Error('DB Error')),
      save: vi.fn(),
      delete: vi.fn()
    };
    
    const gameService = new GameService(mockRepo, mockSettingsRepo);
    
    const result = await gameService.selectRoute('route1');
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('エラー');
  });
});
```

## 📋 テスト品質ガイドライン

### 1. テストの命名規則

**日本語による説明的な名前**
```typescript
// ✅ Good: 何をテストしているかが明確
it('空文字列のルートIDは作成時にエラーを投げる', () => {
  expect(() => RouteId.from('')).toThrow();
});

// ❌ Bad: 何をテストしているかが不明
it('should throw error', () => {
  expect(() => RouteId.from('')).toThrow();
});
```

### 2. テストの独立性

```typescript
// ✅ Good: 各テストが独立している
describe('GameProgress', () => {
  let progress: GameProgress;
  
  beforeEach(() => {
    progress = GameProgress.createNew(); // 毎回新しいインスタンス
  });
  
  it('ルートを選択できる', () => {
    progress.selectRoute(RouteId.from('route1'));
    expect(progress.getCurrentRoute().getValue()).toBe('route1');
  });
  
  it('シーンを進行できる', () => {
    progress.selectRoute(RouteId.from('route1'));
    progress.advanceToNextScene();
    expect(progress.getCurrentScene().getValue()).toBe(2);
  });
});
```

### 3. エラーケースの網羅

```typescript
describe('RouteId エラーハンドリング', () => {
  const invalidInputs = [
    { input: '', description: '空文字列' },
    { input: '   ', description: '空白文字のみ' },
    { input: '\t\n', description: 'タブと改行' },
    { input: null, description: 'null' },
    { input: undefined, description: 'undefined' }
  ];

  test.each(invalidInputs)('$description は無効入力として扱われる', ({ input }) => {
    expect(() => RouteId.from(input as string)).toThrow();
  });
});
```

### 4. パフォーマンステスト

```typescript
describe('RouteId パフォーマンス', () => {
  it('大量のRouteIdオブジェクト作成が効率的', () => {
    const startTime = performance.now();
    
    for (let i = 0; i < 10000; i++) {
      RouteId.from(`route${i}`);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100); // 100ms以内
  });
});
```

## 🚀 TDD実践のベストプラクティス

### 1. 小さなステップで進む

```typescript
// Step 1: 最も簡単な実装から始める
it('ルートIDを作成できる', () => {
  const routeId = new RouteId('route1');
  expect(routeId).toBeDefined();
});

// Step 2: 基本機能を追加
it('ルートIDの値を取得できる', () => {
  const routeId = new RouteId('route1');
  expect(routeId.getValue()).toBe('route1');
});

// Step 3: エッジケースを追加
it('空のルートIDは作成できない', () => {
  expect(() => new RouteId('')).toThrow();
});
```

### 2. リファクタリングの安全性

```typescript
// リファクタリング前: 重複したロジック
class GameProgress {
  selectRoute(routeId: RouteId): void {
    if (routeId.getValue() === '') {
      throw new Error('Invalid route');
    }
    this.currentRoute = routeId;
  }
}

// リファクタリング後: バリデーションをRouteIdに移動
class RouteId {
  constructor(private value: string) {
    if (!value || value.trim() === '') {
      throw new Error('RouteId cannot be empty');
    }
  }
}

class GameProgress {
  selectRoute(routeId: RouteId): void {
    this.currentRoute = routeId; // バリデーションはRouteIdで実行済み
  }
}
```

### 3. テストファーストの徹底

```typescript
// ❌ Bad: 実装してからテストを書く
class SceneNumber {
  constructor(private value: number) {
    this.value = value;
  }
}

// ✅ Good: テストを書いてから実装する
describe('SceneNumber', () => {
  it('正の整数で作成できる', () => {
    const scene = new SceneNumber(1);
    expect(scene.getValue()).toBe(1);
  });
  
  it('負の数では作成できない', () => {
    expect(() => new SceneNumber(-1)).toThrow();
  });
});

// その後、テストを通すための実装
class SceneNumber {
  constructor(private value: number) {
    if (value < 1 || !Number.isInteger(value)) {
      throw new Error('SceneNumber must be a positive integer');
    }
    this.value = value;
  }
}
```

## 📈 継続的改善

### テストメトリクス監視
- **成功率**: 常に100%を維持
- **実行時間**: 高速フィードバックループの維持
- **カバレッジ**: 重要なビジネスロジックの完全カバー

### 品質ゲート
- 新機能追加時は必ずテストを先に作成
- 全テストが通ることを確認してからコミット
- リファクタリング時もテストカバレッジを維持

### チーム開発での実践
- ペアプログラミングでのTDD実践
- コードレビューでのテスト品質チェック
- 継続的インテグレーションでの自動テスト実行

---

このTDD指針により、**品質のプリズム**は高品質で保守性の高いコードベースを実現しています。t_wadaさんの推奨する手法に従い、テストが設計を導く開発を実践しています。