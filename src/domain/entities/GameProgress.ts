import { RouteId } from '../value-objects/RouteId';
import { SceneNumber } from '../value-objects/SceneNumber';

/**
 * ゲームの進行状況を表すエンティティ
 */
export class GameProgress {
  private readonly id: string;
  private currentRoute: RouteId;
  private currentScene: SceneNumber;
  private clearedRoutes: Set<RouteId>;
  private lastSaveTime: Date;
  private readonly SCENES_PER_ROUTE = 100;

  constructor(
    id: string,
    currentRoute: RouteId,
    currentScene: SceneNumber,
    clearedRoutes: Set<RouteId>,
    lastSaveTime: Date
  ) {
    this.id = id;
    this.currentRoute = currentRoute;
    this.currentScene = currentScene;
    this.clearedRoutes = clearedRoutes;
    this.lastSaveTime = lastSaveTime;
  }

  getId(): string {
    return this.id;
  }

  getCurrentRoute(): RouteId {
    return this.currentRoute;
  }

  getCurrentScene(): SceneNumber {
    return this.currentScene;
  }

  getClearedRoutes(): Set<RouteId> {
    return new Set(this.clearedRoutes);
  }

  getLastSaveTime(): Date {
    return new Date(this.lastSaveTime);
  }

  getSaveTime(): Date {
    return new Date(this.lastSaveTime);
  }

  /**
   * ルートを選択する
   */
  selectRoute(routeId: RouteId): void {
    this.currentRoute = routeId;
    this.currentScene = SceneNumber.zero();
    this.updateSaveTime();
  }

  /**
   * 次のシーンに進む
   * @returns ルートがクリアされた場合はtrue
   */
  advanceToNextScene(): boolean {
    // 最後のシーンを超えている場合は何もしない
    if (this.currentScene.getValue() >= this.SCENES_PER_ROUTE) {
      return false;
    }

    this.currentScene = this.currentScene.next();
    this.updateSaveTime();

    if (this.currentScene.getValue() === this.SCENES_PER_ROUTE) {
      this.markRouteAsCleared(this.currentRoute);
      return true;
    }

    return false;
  }

  /**
   * トゥルールートが解放されているかチェック
   * 全ベースルート（route1, route2, route3）がクリアされている必要がある
   */
  isTrueRouteUnlocked(): boolean {
    const clearedRouteNames = Array.from(this.clearedRoutes).map((route) => route.getValue());
    return ['route1', 'route2', 'route3'].every(route => clearedRouteNames.includes(route));
  }

  /**
   * 指定したルートがクリア済みかチェック
   */
  isRouteCleared(routeId: RouteId): boolean {
    return Array.from(this.clearedRoutes).some((cleared) =>
      cleared.equals(routeId)
    );
  }

  /**
   * 指定したルート名がクリア済みかチェック
   */
  isRouteNameCleared(routeName: string): boolean {
    return Array.from(this.clearedRoutes).some((cleared) =>
      cleared.getValue() === routeName
    );
  }

  private markRouteAsCleared(routeId: RouteId): void {
    // 同じ値のRouteIdがすでにSetに存在しても、新しいインスタンスを追加
    // Setは参照ベースなので、新しいインスタンスは追加される
    const existingRoute = Array.from(this.clearedRoutes).find(route => route.equals(routeId));
    if (!existingRoute) {
      this.clearedRoutes.add(routeId);
    }
  }

  private updateSaveTime(): void {
    this.lastSaveTime = new Date();
  }

  /**
   * ファクトリーメソッド - 新しいゲーム進行状況を作成
   */
  static createNew(id: string): GameProgress {
    return new GameProgress(
      id,
      RouteId.empty(),
      SceneNumber.zero(),
      new Set(),
      new Date()
    );
  }

  /**
   * ファクトリーメソッド - 既存データから復元
   */
  static restore(
    id: string,
    currentRoute: string,
    currentScene: number,
    clearedRoutes: string[],
    lastSaveTime: Date
  ): GameProgress {
    // 無効なシーン番号は0に正規化
    const normalizedScene = Math.max(0, Math.min(currentScene, 100));
    
    // 重複除去のため、一度文字列のSetにしてからRouteIdのSetに変換
    const uniqueRouteNames = Array.from(new Set(clearedRoutes));
    const clearedRouteSet = new Set(
      uniqueRouteNames.map((route) => RouteId.from(route))
    );

    return new GameProgress(
      id,
      RouteId.from(currentRoute),
      SceneNumber.from(normalizedScene),
      clearedRouteSet,
      lastSaveTime
    );
  }
}
