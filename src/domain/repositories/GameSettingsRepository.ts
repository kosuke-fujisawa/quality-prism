import { GameSettings } from '../value-objects/GameSettings';

/**
 * ゲーム設定のリポジトリインターフェース
 */
export interface GameSettingsRepository {
  /**
   * ゲーム設定を取得
   */
  get(): Promise<GameSettings>;

  /**
   * ゲーム設定を保存
   */
  save(_settings: GameSettings): Promise<void>;

  /**
   * デフォルト設定で初期化
   */
  initializeDefault(): Promise<void>;
}
