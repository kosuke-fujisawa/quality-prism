import { GameService } from '../application/services/GameService';
import { DexieGameProgressRepository } from '../infrastructure/repositories/DexieGameProgressRepository';
import { DexieGameSettingsRepository } from '../infrastructure/repositories/DexieGameSettingsRepository';

/**
 * DDDアーキテクチャに基づいたゲームロジッククラス
 * 既存のGameLogicの代替として使用
 */
export class GameLogicDDD {
  private gameService: GameService;
  public availableRoutes: string[] = ['route1', 'route2', 'route3'];
  private _currentRoute = '';
  private _currentScene = 0;

  constructor() {
    const gameProgressRepo = new DexieGameProgressRepository();
    const gameSettingsRepo = new DexieGameSettingsRepository();
    this.gameService = new GameService(gameProgressRepo, gameSettingsRepo);
  }

  get currentRoute(): string {
    return this._currentRoute;
  }

  get currentScene(): number {
    return this._currentScene;
  }

  /**
   * ルートを選択する
   */
  async selectRoute(routeName: string): Promise<boolean> {
    const result = await this.gameService.selectRoute(routeName);

    if (result.success) {
      // 内部状態を更新
      await this.loadGameState();
      return true;
    }

    return false;
  }

  /**
   * 次のシーンに進む
   */
  async nextScene(): Promise<boolean> {
    const result = await this.gameService.advanceToNextScene();

    // 内部状態を更新
    this._currentScene = result.currentScene;

    return result.routeCleared;
  }

  /**
   * オートセーブを実行
   */
  async autoSave(): Promise<void> {
    await this.gameService.performAutoSave();
  }

  /**
   * ゲーム状態を読み込む
   */
  async loadGameState(): Promise<void> {
    const state = await this.gameService.getCurrentGameState();
    this._currentRoute = state.currentRoute;
    this._currentScene = state.currentScene;
  }

  /**
   * ゲーム設定を更新
   */
  async updateSettings(
    volume?: number,
    textSpeed?: number,
    autoSave?: boolean
  ): Promise<void> {
    await this.gameService.updateGameSettings(volume, textSpeed, autoSave);
  }

  /**
   * ゲーム設定を取得
   */
  async getSettings(): Promise<{
    volume: number;
    textSpeed: number;
    autoSave: boolean;
  }> {
    return await this.gameService.getGameSettings();
  }
}
