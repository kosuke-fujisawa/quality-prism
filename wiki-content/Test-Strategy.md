# テスト戦略

品質のプリズムプロジェクトの包括的テスト戦略とTDD実践方針

## 📊 テスト概要

### 総合統計
- **総テスト数**: **425テスト** (100% 成功)
- **テストファイル数**: 30ファイル
- **開発手法**: TDD (Test-Driven Development)
- **カバレッジ**: 全主要コンポーネント + DDDレイヤー完全網羅

### テスト分布

| カテゴリ | テスト数 | ファイル数 | 成功率 |
|----------|----------|------------|--------|
| **ドメイン層** | 139 | 11 | 100% |
| **アプリケーション層** | 31 | 2 | 100% |
| **インフラストラクチャ層** | 131 | 10 | 100% |
| **ゲームロジック** | 66 | 6 | 100% |
| **E2Eテスト** | 14 | 2 | 100% |
| **ユーティリティ** | 44 | 1 | 100% |

## 🏗️ テストピラミッド

### 1. ユニットテスト (レベル1) - 367テスト

**ドメイン層テスト** (139テスト)
```typescript
// エンティティテスト例
describe('GameProgress', () => {
  it('新しいゲーム進行状況を作成できる', () => {
    const progress = GameProgress.createNew();
    
    expect(progress.getCurrentRoute().getValue()).toBe('');
    expect(progress.getCurrentScene().getValue()).toBe(1);
    expect(progress.getClearedRoutes()).toHaveLength(0);
  });
  
  it('全ルートクリア後にトゥルールートが解放される', () => {
    const progress = GameProgress.createNew();
    
    // 3つのルートをクリア
    ['route1', 'route2', 'route3'].forEach(route => {
      progress.selectRoute(RouteId.from(route));
      progress.markCurrentRouteAsCleared();
    });
    
    expect(progress.isTrueRouteUnlocked()).toBe(true);
  });
});

// 値オブジェクトテスト例
describe('RouteId', () => {
  it('等価性を正しく判定する', () => {
    const route1 = RouteId.from('route1');
    const route2 = RouteId.from('route1');
    const route3 = RouteId.from('route2');
    
    expect(route1.equals(route2)).toBe(true);
    expect(route1.equals(route3)).toBe(false);
  });
});
```

**アプリケーション層テスト** (31テスト)
```typescript
// アプリケーションサービステスト例
describe('GameService', () => {
  let gameService: GameService;
  let mockProgressRepo: GameProgressRepository;

  beforeEach(() => {
    mockProgressRepo = createMockGameProgressRepository();
    gameService = new GameService(mockProgressRepo, ...);
  });

  it('ルート選択が正常に動作する', async () => {
    const result = await gameService.selectRoute('route1');
    
    expect(result.success).toBe(true);
    expect(mockProgressRepo.save).toHaveBeenCalled();
  });
  
  it('無効なルート選択時にエラーハンドリングする', async () => {
    const result = await gameService.selectRoute('invalid-route');
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('無効なルート');
  });
});
```

**インフラストラクチャ層テスト** (131テスト)
```typescript
// リポジトリテスト例
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

// ロギングシステムテスト例 (89テスト)
describe('BaseLogger', () => {
  it('ログレベルフィルタリングが正常に動作する', () => {
    const mockAppender = { append: vi.fn() };
    const logger = new BaseLogger([mockAppender], LogLevel.WARN);
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    
    expect(mockAppender.append).toHaveBeenCalledTimes(1); // WARNのみ
  });
});
```

### 2. 統合テスト (レベル2) - 44テスト

**複数コンポーネント間の協調テスト**
```typescript
describe('ゲームサービス統合テスト', () => {
  it('ルート選択からシーン進行まで一連の流れ', async () => {
    const db = new SaveDataDB();
    const progressRepo = new DexieGameProgressRepository(db);
    const settingsRepo = new DexieGameSettingsRepository(db);
    const gameService = new GameService(progressRepo, settingsRepo);
    
    // ルート選択
    const selectResult = await gameService.selectRoute('route1');
    expect(selectResult.success).toBe(true);
    
    // シーン進行
    const progressResult = await gameService.advanceScene();
    expect(progressResult.success).toBe(true);
    
    // データ永続化確認
    const saved = await progressRepo.getOrCreate();
    expect(saved.getCurrentScene().getValue()).toBe(2);
  });
});
```

### 3. E2Eテスト (レベル3) - 14テスト

**実際のブラウザ環境でのテスト**
```typescript
// basic.spec.ts (8テスト)
test('ゲーム開始からルート選択まで', async ({ page }) => {
  await page.goto('/');
  
  // スタート画面確認
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('text=START')).toBeVisible();
  
  // ゲーム開始
  await page.click('text=START');
  
  // ルート選択画面確認
  await expect(page.locator('text=ルートを選択してください')).toBeVisible();
  
  // ルート1選択
  await page.keyboard.press('1');
  
  // ゲーム画面遷移確認
  await expect(page.locator('text=Route 1開始')).toBeVisible();
});

// ddd-integration.spec.ts (6テスト)
test('DDDアーキテクチャ統合テスト', async ({ page }) => {
  await page.goto('/');
  
  // ルート選択とデータ永続化
  await page.click('text=START');
  await page.keyboard.press('1');
  
  // IndexedDBへの保存確認
  const savedData = await page.evaluate(() => {
    return new Promise(resolve => {
      const request = indexedDB.open('QualityPrismSaveData');
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['gameProgress']);
        const store = transaction.objectStore('gameProgress');
        const getRequest = store.getAll();
        getRequest.onsuccess = () => resolve(getRequest.result);
      };
    });
  });
  
  expect(savedData).toHaveLength(1);
});
```

## 🎯 テスト品質基準

### 1. エッジケース・境界値テスト

**数値境界値テスト**
```typescript
describe('SceneNumber エッジケース', () => {
  const validCases = [1, 10, 100, 999];
  const invalidCases = [-1, 0, 1.5, NaN, Infinity, -Infinity];

  test.each(validCases)('有効な値 %i で作成できる', (value) => {
    expect(() => new SceneNumber(value)).not.toThrow();
  });

  test.each(invalidCases)('無効な値 %i でエラーを投げる', (value) => {
    expect(() => new SceneNumber(value)).toThrow();
  });
});
```

**文字列・Unicode テスト**
```typescript
describe('RouteId Unicode対応', () => {
  const unicodeTests = [
    { input: '日本語ルート', description: '日本語文字' },
    { input: '🎮ゲーム', description: '絵文字' },
    { input: 'route_with_underscore', description: 'アンダースコア' },
    { input: '123-route', description: '数字とハイフン' }
  ];

  test.each(unicodeTests)('$description を含むルートID: $input', ({ input }) => {
    const routeId = RouteId.from(input);
    expect(routeId.getValue()).toBe(input);
  });
});
```

### 2. エラーハンドリングテスト

**非同期エラーテスト**
```typescript
describe('GameService エラーハンドリング', () => {
  it('リポジトリエラー時に適切なメッセージを返す', async () => {
    const mockRepo = {
      getOrCreate: vi.fn().mockRejectedValue(new Error('Database error')),
      save: vi.fn(),
      delete: vi.fn()
    };
    
    const gameService = new GameService(mockRepo, ...);
    
    const result = await gameService.selectRoute('route1');
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('エラーが発生しました');
  });
  
  it('タイムアウトエラーを適切に処理する', async () => {
    const mockRepo = {
      getOrCreate: vi.fn().mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      ),
      save: vi.fn(),
      delete: vi.fn()
    };
    
    const gameService = new GameService(mockRepo, ...);
    
    const result = await gameService.selectRoute('route1');
    
    expect(result.success).toBe(false);
  });
});
```

### 3. パフォーマンステスト

**大量データテスト**
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
  
  it('長文字列での等価性チェックが効率的', () => {
    const longString = 'a'.repeat(10000);
    const route1 = RouteId.from(longString);
    const route2 = RouteId.from(longString);
    
    const startTime = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      route1.equals(route2);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(50); // 50ms以内
  });
});
```

### 4. データ整合性テスト

**永続化・復元テスト**
```typescript
describe('データ整合性', () => {
  it('複雑なゲーム状態の保存・復元', async () => {
    const originalProgress = GameProgress.createNew();
    
    // 複雑な状態を作成
    originalProgress.selectRoute(RouteId.from('route1'));
    originalProgress.advanceToNextScene();
    originalProgress.markCurrentRouteAsCleared();
    originalProgress.selectRoute(RouteId.from('route2'));
    
    const repository = new DexieGameProgressRepository(db);
    
    // 保存
    await repository.save(originalProgress);
    
    // 復元
    const restoredProgress = await repository.getOrCreate();
    
    // 完全性確認
    expect(restoredProgress.getCurrentRoute().getValue())
      .toBe(originalProgress.getCurrentRoute().getValue());
    expect(restoredProgress.getCurrentScene().getValue())
      .toBe(originalProgress.getCurrentScene().getValue());
    expect(restoredProgress.getClearedRoutes())
      .toEqual(originalProgress.getClearedRoutes());
  });
});
```

## 🔧 テストツール・設定

### テストフレームワーク構成

**Vitest設定** (vitest.config.ts)
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/test/**']
    }
  }
});
```

**Playwright設定** (playwright.config.ts)
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  }
});
```

### モック・テストユーティリティ

**テストヘルパー** (testHelpers.ts)
```typescript
// MockGameProgressRepository
export function createMockGameProgressRepository(): GameProgressRepository {
  return {
    getOrCreate: vi.fn().mockResolvedValue(GameProgress.createNew()),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined)
  };
}

// FakeIndexedDB setup
export async function setupTestDatabase(): Promise<SaveDataDB> {
  const FDBFactory = require('fake-indexeddb/lib/FDBFactory');
  global.indexedDB = new FDBFactory();
  
  const db = new SaveDataDB();
  await db.delete();
  await db.open();
  return db;
}

// Test data generators
export function createTestGameProgress(routeId: string = 'route1'): GameProgress {
  const progress = GameProgress.createNew();
  progress.selectRoute(RouteId.from(routeId));
  return progress;
}
```

## 📈 テスト実行戦略

### 開発時テスト実行

**ウォッチモード**
```bash
# 変更ファイルのみテスト実行
npm run test:watch

# UIモードでインタラクティブテスト
npm run test:ui

# 特定ファイルのみテスト
npm test -- RouteId.test.ts
```

**デバッグモード**
```bash
# Node.js デバッガー付きテスト
npm run test:debug

# VS Code デバッガー統合
# .vscode/launch.json設定済み
```

### CI/CD テスト実行

**並列実行**
```bash
# 全テスト並列実行
npm run test:run

# E2E テスト並列実行
npm run test:e2e -- --workers=4
```

**段階的実行**
```bash
# 1. 型チェック
npm run type-check

# 2. ユニットテスト
npm run test:run

# 3. E2Eテスト
npm run test:e2e

# 4. カバレッジレポート
npm run test:coverage
```

## 🚀 テスト継続改善

### テストメトリクス

**品質指標**
- **成功率**: 100% 維持
- **実行時間**: 平均 < 2秒 (ユニットテスト)
- **E2E実行時間**: 平均 < 30秒
- **カバレッジ**: 主要ビジネスロジック 100%

**パフォーマンス指標**
```typescript
// テスト実行時間監視
describe('Performance monitoring', () => {
  it('テストスイート実行時間が基準内', () => {
    const startTime = Date.now();
    
    // テスト実行
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // 5秒以内
  });
});
```

### テスト拡張戦略

**新機能テスト追加**
1. ドメインオブジェクトテスト先行作成
2. アプリケーション統合テスト
3. E2Eシナリオテスト
4. パフォーマンス・エッジケーステスト

**テスト品質向上**
- Mutation testing導入検討
- Visual regression testing検討
- A/B testing framework検討

---

この包括的なテスト戦略により、**品質のプリズム**は高い品質と安定性を維持しながら、継続的な機能追加・改善を実現しています。TDD手法による設計駆動開発で、保守性とテスタビリティを両立しています。