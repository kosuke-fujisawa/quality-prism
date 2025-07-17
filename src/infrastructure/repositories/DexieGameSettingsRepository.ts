import { GameSettings } from '../../domain/value-objects/GameSettings';
import { GameSettingsRepository } from '../../domain/repositories/GameSettingsRepository';
import { SaveDataDB } from '../persistence/SaveDataDB';

/**
 * Dexieを使用したゲーム設定リポジトリの実装
 */
export class DexieGameSettingsRepository implements GameSettingsRepository {
  private db: SaveDataDB;

  constructor() {
    this.db = new SaveDataDB();
  }

  async get(): Promise<GameSettings> {
    const existingSettings = await this.db.settings.toArray();

    if (existingSettings.length > 0) {
      const settings = existingSettings[0];
      return new GameSettings(
        settings.volume,
        settings.textSpeed,
        settings.autoSave
      );
    }

    // デフォルト設定を作成して保存
    const defaultSettings = GameSettings.default();
    await this.save(defaultSettings);
    return defaultSettings;
  }

  async save(settings: GameSettings): Promise<void> {
    const existingSettings = await this.db.settings.toArray();

    const settingsData = {
      volume: settings.getVolume(),
      textSpeed: settings.getTextSpeed(),
      autoSave: settings.isAutoSaveEnabled(),
    };

    if (existingSettings.length > 0) {
      await this.db.settings.update(existingSettings[0].id!, settingsData);
    } else {
      await this.db.settings.add(settingsData);
    }
  }

  async initializeDefault(): Promise<void> {
    const defaultSettings = GameSettings.default();
    await this.save(defaultSettings);
  }
}
