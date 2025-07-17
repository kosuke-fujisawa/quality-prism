import { RouteId } from '../value-objects/RouteId';
import { GameProgress } from '../entities/GameProgress';
import { RouteConfiguration } from '../value-objects/RouteConfiguration';

/**
 * ルート選択の妥当性を検証するドメインサービス
 */
export class RouteValidationService {

  /**
   * ルートが選択可能かどうかを検証
   */
  static canSelectRoute(
    routeId: RouteId,
    progress: GameProgress
  ): {
    canSelect: boolean;
    reason?: string;
  } {
    const routeValue = routeId.getValue();

    // 空のルートは選択不可
    if (routeValue === '') {
      return {
        canSelect: false,
        reason: 'ルートが指定されていません',
      };
    }

    // トゥルールートの場合
    if (RouteConfiguration.isTrueRoute(routeValue)) {
      return this.validateTrueRoute(progress);
    }

    // 通常ルートの場合
    return this.validateNormalRoute(routeValue);
  }

  /**
   * トゥルールートの選択可能性を検証
   */
  private static validateTrueRoute(progress: GameProgress): {
    canSelect: boolean;
    reason?: string;
  } {
    if (!progress.isTrueRouteUnlocked()) {
      return {
        canSelect: false,
        reason: '全てのルートをクリアする必要があります',
      };
    }

    return { canSelect: true };
  }

  /**
   * 通常ルートの選択可能性を検証
   */
  private static validateNormalRoute(routeValue: string): {
    canSelect: boolean;
    reason?: string;
  } {
    if (!RouteConfiguration.isValidRoute(routeValue)) {
      return {
        canSelect: false,
        reason: '存在しないルートです',
      };
    }

    return { canSelect: true };
  }

  /**
   * 利用可能なルート一覧を取得
   */
  static getAvailableRoutes(): string[] {
    return RouteConfiguration.getAllRoutes();
  }

  /**
   * ベースルートの一覧を取得
   */
  static getBaseRoutes(): string[] {
    return RouteConfiguration.getBaseRoutes();
  }

  /**
   * DLCルートの一覧を取得
   */
  static getDlcRoutes(): string[] {
    return RouteConfiguration.getDlcRoutes();
  }

  /**
   * トゥルールートの名前を取得
   */
  static getTrueRouteName(): string {
    return RouteConfiguration.getTrueRouteName();
  }
}
