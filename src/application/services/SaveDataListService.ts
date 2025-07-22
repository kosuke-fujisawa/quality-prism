import { GameProgressRepository } from '../../domain/repositories/GameProgressRepository';
import { GameProgress } from '../../domain/entities/GameProgress';

/**
 * セーブデータ一覧サービス
 * セーブデータの一覧表示・選択・読み込み機能を提供
 */
export class SaveDataListService {
  constructor(private gameProgressRepository: GameProgressRepository) {}

  /**
   * セーブデータ一覧を取得
   */
  async getSaveDataList(): Promise<{
    success: boolean;
    saveDataList?: SaveDataSummary[];
    message?: string;
  }> {
    try {
      const allSaveData = await this.gameProgressRepository.getAll();
      
      const saveDataList = allSaveData.map(data => ({
        id: data.getId(),
        routeName: data.getCurrentRoute().getValue(),
        sceneNumber: data.getCurrentScene().getValue(),
        lastUpdated: data.getLastSaveTime(),
      }));

      return {
        success: true,
        saveDataList,
      };
    } catch (error) {
      return {
        success: false,
        message: 'セーブデータの読み込みに失敗しました',
      };
    }
  }

  /**
   * 指定されたIDのセーブデータを読み込み
   */
  async loadSaveDataById(id: string): Promise<{
    success: boolean;
    gameProgress?: GameProgress;
    message?: string;
  }> {
    try {
      const allSaveData = await this.gameProgressRepository.getAll();
      const targetSaveData = allSaveData.find(data => data.getId() === id);

      if (!targetSaveData) {
        return {
          success: false,
          message: '指定されたセーブデータが見つかりません',
        };
      }

      return {
        success: true,
        gameProgress: targetSaveData,
      };
    } catch (error) {
      return {
        success: false,
        message: 'セーブデータの読み込みに失敗しました',
      };
    }
  }
}

/**
 * セーブデータ一覧表示用のサマリー情報
 */
export interface SaveDataSummary {
  id: string;
  routeName: string;
  sceneNumber: number;
  lastUpdated: Date;
}