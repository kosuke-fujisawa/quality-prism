import type { GameProgressRepository } from '../../domain/repositories/GameProgressRepository';
import type { GameSettingsRepository } from '../../domain/repositories/GameSettingsRepository';
import { RouteId } from '../../domain/value-objects/RouteId';

/**
 * ゲームの主要な操作を提供するアプリケーションサービス
 */
export class GameService {
  private gameProgressRepository: GameProgressRepository;
  private gameSettingsRepository: GameSettingsRepository;
  
  constructor(
    gameProgressRepository: GameProgressRepository,
    gameSettingsRepository: GameSettingsRepository
  ) {
    this.gameProgressRepository = gameProgressRepository;
    this.gameSettingsRepository = gameSettingsRepository;
  }

  /**
   * ルートを選択する
   */
  async selectRoute(routeName: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const progress = await this.gameProgressRepository.getOrCreate();
      const routeId = RouteId.from(routeName);

      // トゥルールートの場合、解放条件をチェック
      if (routeName === 'trueRoute') {
        if (!progress.isTrueRouteUnlocked()) {
          return {
            success: false,
            message: '全てのルートをクリアしてください',
          };
        }
      }

      // 通常ルートの場合、利用可能かチェック
      const availableRoutes = ['route1', 'route2', 'route3'];
      if (routeName !== 'trueRoute' && !availableRoutes.includes(routeName)) {
        return {
          success: false,
          message: '無効なルートです',
        };
      }

      progress.selectRoute(routeId);
      await this.gameProgressRepository.save(progress);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '不明なエラー',
      };
    }
  }

  /**
   * 次のシーンに進む
   */
  async advanceToNextScene(): Promise<{
    routeCleared: boolean;
    currentScene: number;
  }> {
    const progress = await this.gameProgressRepository.getOrCreate();

    const routeCleared = progress.advanceToNextScene();
    await this.gameProgressRepository.save(progress);

    return {
      routeCleared,
      currentScene: progress.getCurrentScene().getValue(),
    };
  }

  /**
   * 現在のゲーム状態を取得
   */
  async getCurrentGameState(): Promise<{
    currentRoute: string;
    currentScene: number;
    clearedRoutes: string[];
    isTrueRouteUnlocked: boolean;
  }> {
    const progress = await this.gameProgressRepository.getOrCreate();

    return {
      currentRoute: progress.getCurrentRoute().getValue(),
      currentScene: progress.getCurrentScene().getValue(),
      clearedRoutes: Array.from(progress.getClearedRoutes()).map((route) =>
        route.getValue()
      ),
      isTrueRouteUnlocked: progress.isTrueRouteUnlocked(),
    };
  }

  /**
   * オートセーブを実行
   */
  async performAutoSave(): Promise<void> {
    const settings = await this.gameSettingsRepository.get();

    if (settings.isAutoSaveEnabled()) {
      const progress = await this.gameProgressRepository.getOrCreate();
      await this.gameProgressRepository.save(progress);
    }
  }

  /**
   * ゲーム設定を更新
   */
  async updateGameSettings(
    volume?: number,
    textSpeed?: number,
    autoSave?: boolean
  ): Promise<void> {
    let settings = await this.gameSettingsRepository.get();

    if (volume !== undefined) {
      settings = settings.withVolume(volume);
    }
    if (textSpeed !== undefined) {
      settings = settings.withTextSpeed(textSpeed);
    }
    if (autoSave !== undefined) {
      settings = settings.withAutoSave(autoSave);
    }

    await this.gameSettingsRepository.save(settings);
  }

  /**
   * ゲーム設定を取得
   */
  async getGameSettings(): Promise<{
    volume: number;
    textSpeed: number;
    autoSave: boolean;
  }> {
    const settings = await this.gameSettingsRepository.get();

    return {
      volume: settings.getVolume(),
      textSpeed: settings.getTextSpeed(),
      autoSave: settings.isAutoSaveEnabled(),
    };
  }
}
