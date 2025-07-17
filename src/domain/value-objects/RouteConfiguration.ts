/**
 * ルート設定を管理する値オブジェクト
 * DLC追加時の拡張性を考慮した設計
 */
export class RouteConfiguration {
  private static readonly config = {
    baseRoutes: ['route1', 'route2', 'route3'],
    dlcRoutes: [] as string[],
    trueRoute: 'trueRoute',
    specialRoutes: [] as string[]
  };

  /**
   * 全てのルートを取得（ベース + DLC + 特殊）
   */
  static getAllRoutes(): string[] {
    return [
      ...this.config.baseRoutes,
      ...this.config.dlcRoutes,
      ...this.config.specialRoutes
    ];
  }

  /**
   * ベースルートのみを取得
   */
  static getBaseRoutes(): string[] {
    return [...this.config.baseRoutes];
  }

  /**
   * DLCルートのみを取得
   */
  static getDlcRoutes(): string[] {
    return [...this.config.dlcRoutes];
  }

  /**
   * 特殊ルートのみを取得
   */
  static getSpecialRoutes(): string[] {
    return [...this.config.specialRoutes];
  }

  /**
   * トゥルールートの名前を取得
   */
  static getTrueRouteName(): string {
    return this.config.trueRoute;
  }

  /**
   * DLCルートを追加
   */
  static addDlcRoute(routeName: string): void {
    if (!this.config.dlcRoutes.includes(routeName)) {
      this.config.dlcRoutes.push(routeName);
    }
  }

  /**
   * 特殊ルートを追加
   */
  static addSpecialRoute(routeName: string): void {
    if (!this.config.specialRoutes.includes(routeName)) {
      this.config.specialRoutes.push(routeName);
    }
  }

  /**
   * ルートが存在するかどうかを判定
   */
  static isValidRoute(routeName: string): boolean {
    return this.getAllRoutes().includes(routeName) || 
           routeName === this.config.trueRoute;
  }

  /**
   * ルートがベースルートかどうかを判定
   */
  static isBaseRoute(routeName: string): boolean {
    return this.config.baseRoutes.includes(routeName);
  }

  /**
   * ルートがDLCルートかどうかを判定
   */
  static isDlcRoute(routeName: string): boolean {
    return this.config.dlcRoutes.includes(routeName);
  }

  /**
   * ルートがトゥルールートかどうかを判定
   */
  static isTrueRoute(routeName: string): boolean {
    return routeName === this.config.trueRoute;
  }

  /**
   * トゥルールートのアンロック条件を満たしているかを判定
   * （全ベースルートがクリアされている）
   */
  static isTrueRouteUnlockCondition(clearedRoutes: string[]): boolean {
    return this.config.baseRoutes.every(route => 
      clearedRoutes.includes(route)
    );
  }

  /**
   * DLCルートを削除（テスト用）
   */
  static removeDlcRoute(routeName: string): void {
    const index = this.config.dlcRoutes.indexOf(routeName);
    if (index > -1) {
      this.config.dlcRoutes.splice(index, 1);
    }
  }

  /**
   * 設定をリセット（テスト用）
   */
  static resetConfiguration(): void {
    this.config.dlcRoutes = [];
    this.config.specialRoutes = [];
  }
}