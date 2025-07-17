import { GameProgress } from '../../domain/entities/GameProgress';
import { GameProgressRepository } from '../../domain/repositories/GameProgressRepository';
import { SaveDataDB } from '../persistence/SaveDataDB';

/**
 * Dexieを使用したゲーム進行状況リポジトリの実装
 */
export class DexieGameProgressRepository implements GameProgressRepository {
  private db: SaveDataDB;

  constructor() {
    this.db = new SaveDataDB();
  }

  async getOrCreate(): Promise<GameProgress> {
    const existingData = await this.db.saveData.toArray();

    if (existingData.length > 0) {
      const data = existingData[0];
      return GameProgress.restore(
        data.id?.toString() || '1',
        data.currentRoute,
        data.currentScene,
        data.clearedRoutes,
        data.lastSaveTime
      );
    }

    // 新規作成
    const newProgress = GameProgress.createNew('1');
    await this.save(newProgress);
    return newProgress;
  }

  async save(progress: GameProgress): Promise<void> {
    const existingData = await this.db.saveData.toArray();

    const saveData = {
      currentRoute: progress.getCurrentRoute().getValue(),
      currentScene: progress.getCurrentScene().getValue(),
      clearedRoutes: Array.from(progress.getClearedRoutes()).map((route) =>
        route.getValue()
      ),
      isTrueRouteUnlocked: progress.isTrueRouteUnlocked(),
      lastSaveTime: progress.getLastSaveTime(),
      textLogs: [], // 別途管理
    };

    if (existingData.length > 0) {
      await this.db.saveData.update(existingData[0].id!, saveData);
    } else {
      await this.db.saveData.add(saveData);
    }
  }

  async findById(id: string): Promise<GameProgress | null> {
    const data = await this.db.saveData.get(parseInt(id));

    if (!data) {
      return null;
    }

    return GameProgress.restore(
      data.id?.toString() || id,
      data.currentRoute,
      data.currentScene,
      data.clearedRoutes,
      data.lastSaveTime
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.saveData.delete(parseInt(id));
  }
}
