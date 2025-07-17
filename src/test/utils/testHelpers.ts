import { GameProgress } from '../../domain/entities/GameProgress';
import { RouteId } from '../../domain/value-objects/RouteId';
import { SceneNumber } from '../../domain/value-objects/SceneNumber';
import { vi } from 'vitest';

// テスト用定数
export const TEST_CONSTANTS = {
  FINAL_SCENE_NUMBER: 100,
  BEFORE_FINAL_SCENE: 99,
  DEFAULT_TEST_ID: 'test-id',
  SCENES_PER_ROUTE: 100,
  INVALID_ROUTE: 'invalid-route',
  
  // ルート名（直接的で分かりやすい名前）
  ROUTE1: 'route1',
  ROUTE2: 'route2', 
  ROUTE3: 'route3',
  TRUE_ROUTE: 'trueRoute',
  VALID_ROUTES: ['route1', 'route2', 'route3'],
} as const;

// テストヘルパー関数

/**
 * 指定されたルートを選択したGameProgressを作成
 */
export const createProgressWithRoute = (routeId: string, sceneCount = 0): GameProgress => {
  const progress = GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID);
  progress.selectRoute(RouteId.from(routeId));
  
  for (let i = 0; i < sceneCount; i++) {
    progress.advanceToNextScene();
  }
  
  return progress;
};

/**
 * 指定されたルートをクリアしたGameProgressを作成
 */
export const createProgressWithClearedRoutes = (routeNames: string[]): GameProgress => {
  const progress = GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID);
  
  routeNames.forEach(routeName => {
    progress.selectRoute(RouteId.from(routeName));
    // 最終シーンまで進める
    for (let i = 0; i < TEST_CONSTANTS.FINAL_SCENE_NUMBER; i++) {
      progress.advanceToNextScene();
    }
  });
  
  return progress;
};

/**
 * 指定されたシーン数まで進めたGameProgressを作成
 */
export const createProgressAtScene = (routeId: string, sceneNumber: number): GameProgress => {
  const progress = GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID);
  progress.selectRoute(RouteId.from(routeId));
  
  for (let i = 0; i < sceneNumber; i++) {
    progress.advanceToNextScene();
  }
  
  return progress;
};

/**
 * 最終シーンの直前まで進めたGameProgressを作成
 */
export const createProgressAtFinalScene = (routeId: string): GameProgress => {
  return createProgressAtScene(routeId, TEST_CONSTANTS.BEFORE_FINAL_SCENE);
};

/**
 * 全ベースルートをクリアしたGameProgressを作成（トゥルールート解放条件）
 */
export const createProgressWithAllBaseRoutesCleared = (): GameProgress => {
  return createProgressWithClearedRoutes(TEST_CONSTANTS.VALID_ROUTES);
};

/**
 * 複数のルートID配列をRouteIdオブジェクトの配列に変換
 */
export const createRouteIds = (routeNames: string[]): RouteId[] => {
  return routeNames.map(name => RouteId.from(name));
};

/**
 * テスト用のGameProgressを復元用データから作成
 */
export const createRestoredProgress = (
  id: string,
  currentRoute: string,
  currentScene: number,
  clearedRoutes: string[],
  lastSaveTime: Date = new Date()
): GameProgress => {
  return GameProgress.restore(id, currentRoute, currentScene, clearedRoutes, lastSaveTime);
};

// 簡潔な期待値メッセージ（必要に応じて使用）
export const expectMessage = {
  shouldBeTrue: () => 'should be true',
  shouldBeFalse: () => 'should be false',
  shouldBeEmpty: () => 'should be empty',
  shouldNotBeEmpty: () => 'should not be empty',
};

/**
 * 共通のテストパターン用のアサーション
 */
export const commonAssertions = {
  expectValidRoute: (routeId: RouteId, expectedValue: string) => {
    expect(routeId.getValue()).toBe(expectedValue);
    expect(routeId.isEmpty()).toBe(false);
  },
  
  expectEmptyRoute: (routeId: RouteId) => {
    expect(routeId.isEmpty()).toBe(true);
    expect(routeId.getValue()).toBe('');
  },
  
  expectSceneNumber: (scene: SceneNumber, expectedValue: number) => {
    expect(scene.getValue()).toBe(expectedValue);
  },
  
  expectProgressState: (progress: GameProgress, routeId: string, sceneNumber: number) => {
    expect(progress.getCurrentRoute().getValue()).toBe(routeId);
    expect(progress.getCurrentScene().getValue()).toBe(sceneNumber);
  },
  
  expectClearedRoutes: (progress: GameProgress, clearedRoutes: string[]) => {
    expect(progress.getClearedRoutes().size).toBe(clearedRoutes.length);
    clearedRoutes.forEach(routeName => {
      expect(progress.isRouteNameCleared(routeName)).toBe(true);
    });
  },
};

// エラーメッセージ定数
export const ERROR_MESSAGES = {
  INVALID_SCENE_NUMBER: 'シーン番号は0以上である必要があります',
  INVALID_VOLUME: 'ボリュームは0.0から1.0の範囲で指定してください',
  INVALID_TEXT_SPEED: 'テキストスピードは0より大きい値を指定してください',
  EMPTY_TEXT_CONTENT: 'テキストコンテンツは空にできません',
  CANVAS_NOT_FOUND: 'Canvas element not found',
  DATABASE_ERROR: 'Database error',
  TRUE_ROUTE_LOCKED: '全てのルートをクリアしてください',
  INVALID_ROUTE: '無効なルートです',
  ROUTE_NOT_FOUND: 'ルートが見つかりません',
  SAVE_DATA_ERROR: 'セーブデータの保存に失敗しました',
  LOAD_DATA_ERROR: 'セーブデータの読み込みに失敗しました',
} as const;

// モックファクトリー
export const mockRepositories = {
  createGameProgressRepository: () => ({
    getOrCreate: vi.fn(),
    save: vi.fn(),
    findById: vi.fn(),
    delete: vi.fn(),
  }),
  createGameSettingsRepository: () => ({
    get: vi.fn(),
    save: vi.fn(),
    initializeDefault: vi.fn(),
  }),
};

// 繰り返し処理ヘルパー
export const loopHelpers = {
  /**
   * GameProgressを指定回数だけシーンを進める
   */
  advanceScenes: (progress: GameProgress, count: number): void => {
    for (let i = 0; i < count; i++) {
      progress.advanceToNextScene();
    }
  },
  
  /**
   * 複数のRouteIdを生成する
   */
  createMultipleRouteIds: (count: number, prefix = 'route'): RouteId[] => {
    return Array.from({ length: count }, (_, i) => RouteId.from(`${prefix}${i + 1}`));
  },
  
  /**
   * 配列の各要素に対してテストを実行
   */
  testForEachRoute: (routes: string[], testFn: (route: string, index: number) => void): void => {
    routes.forEach((route, index) => testFn(route, index));
  },
};

// 非同期テストヘルパー
export const asyncTestHelpers = {
  /**
   * 非同期関数が成功することを期待
   */
  expectAsyncSuccess: async (fn: () => Promise<{ success: boolean }>): Promise<void> => {
    const result = await fn();
    expect(result.success).toBe(true);
  },
  
  /**
   * 非同期関数が失敗することを期待
   */
  expectAsyncFailure: async (
    fn: () => Promise<{ success: boolean; message?: string }>,
    expectedMessage?: string
  ): Promise<void> => {
    const result = await fn();
    expect(result.success).toBe(false);
    if (expectedMessage) {
      expect(result.message).toBe(expectedMessage);
    }
  },
  
  /**
   * 非同期関数がエラーを投げることを期待
   */
  expectAsyncThrowsError: async (
    fn: () => Promise<void>,
    expectedMessage: string
  ): Promise<void> => {
    await expect(fn).rejects.toThrow(expectedMessage);
  },
};

// アサーション拡張
export const enhancedAssertions = {
  /**
   * GameServiceの結果を検証
   */
  expectGameServiceResult: (
    result: { success: boolean; message?: string },
    expectedSuccess: boolean,
    expectedMessage?: string
  ): void => {
    expect(result.success).toBe(expectedSuccess);
    if (expectedMessage) {
      expect(result.message).toBe(expectedMessage);
    }
  },
  
  /**
   * リポジトリモックの呼び出し回数を検証
   */
  expectRepositoryMockCalls: (
    mockRepo: any,
    expectedCalls: { method: string; times: number }[]
  ): void => {
    expectedCalls.forEach(({ method, times }) => {
      expect(mockRepo[method]).toHaveBeenCalledTimes(times);
    });
  },
  
  /**
   * エラーが投げられることを期待
   */
  expectThrowsError: (fn: () => void, expectedMessage: string): void => {
    expect(fn).toThrow(expectedMessage);
  },
  
  /**
   * 複数のアサーションをまとめて実行
   */
  expectMultiple: (assertions: (() => void)[]): void => {
    assertions.forEach(assertion => assertion());
  },
};