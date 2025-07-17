import { GameProgress } from '../../domain/entities/GameProgress';
import { RouteId } from '../../domain/value-objects/RouteId';
import { SceneNumber } from '../../domain/value-objects/SceneNumber';

// テスト用定数
export const TEST_CONSTANTS = {
  FINAL_SCENE_NUMBER: 100,
  BEFORE_FINAL_SCENE: 99,
  DEFAULT_TEST_ID: 'test-id',
  VALID_ROUTES: ['route1', 'route2', 'route3'],
  TRUE_ROUTE: 'trueRoute',
  INVALID_ROUTE: 'invalid-route',
  SCENES_PER_ROUTE: 100,
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

/**
 * 期待値の説明を統一した形式で生成
 */
export const expectMessage = {
  shouldBe: (value: any) => `期待値は ${value} であるべき`,
  shouldEqual: (expected: any) => `期待値 ${expected} と一致するべき`,
  shouldNotBe: (value: any) => `${value} であってはならない`,
  shouldContain: (value: any) => `${value} を含むべき`,
  shouldNotContain: (value: any) => `${value} を含まないべき`,
  shouldHaveLength: (length: number) => `要素数は ${length} であるべき`,
  shouldBeTrue: () => 'true であるべき',
  shouldBeFalse: () => 'false であるべき',
  shouldBeNull: () => 'null であるべき',
  shouldNotBeNull: () => 'null でないべき',
  shouldBeUndefined: () => 'undefined であるべき',
  shouldNotBeUndefined: () => 'undefined でないべき',
  shouldBeEmpty: () => '空であるべき',
  shouldNotBeEmpty: () => '空でないべき',
  operationShould: (operation: string) => `${operation} が実行されるべき`,
  operationShouldNot: (operation: string) => `${operation} が実行されないべき`,
};

/**
 * 共通のテストパターン用のアサーション
 */
export const commonAssertions = {
  expectValidRoute: (routeId: RouteId, expectedValue: string) => {
    expect(routeId.getValue(), expectMessage.shouldEqual(expectedValue)).toBe(expectedValue);
    expect(routeId.isEmpty(), expectMessage.shouldBeFalse()).toBe(false);
  },
  
  expectEmptyRoute: (routeId: RouteId) => {
    expect(routeId.isEmpty(), expectMessage.shouldBeTrue()).toBe(true);
    expect(routeId.getValue(), expectMessage.shouldBeEmpty()).toBe('');
  },
  
  expectSceneNumber: (scene: SceneNumber, expectedValue: number) => {
    expect(scene.getValue(), expectMessage.shouldEqual(expectedValue)).toBe(expectedValue);
  },
  
  expectProgressState: (progress: GameProgress, routeId: string, sceneNumber: number) => {
    expect(progress.getCurrentRoute().getValue(), expectMessage.shouldEqual(routeId)).toBe(routeId);
    expect(progress.getCurrentScene().getValue(), expectMessage.shouldEqual(sceneNumber)).toBe(sceneNumber);
  },
  
  expectClearedRoutes: (progress: GameProgress, clearedRoutes: string[]) => {
    expect(progress.getClearedRoutes().size, expectMessage.shouldEqual(clearedRoutes.length)).toBe(clearedRoutes.length);
    clearedRoutes.forEach(routeName => {
      expect(progress.isRouteNameCleared(routeName), expectMessage.shouldBeTrue()).toBe(true);
    });
  },
};