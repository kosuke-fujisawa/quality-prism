import { GameProgress } from '../entities/GameProgress';

/**
 * ゲーム進行状況のリポジトリインターフェース
 */
export interface GameProgressRepository {
  /**
   * ゲーム進行状況を取得または新規作成
   */
  getOrCreate(): Promise<GameProgress>;

  /**
   * ゲーム進行状況を保存
   */
  save(_progress: GameProgress): Promise<void>;

  /**
   * 指定されたIDのゲーム進行状況を取得
   */
  findById(_id: string): Promise<GameProgress | null>;

  /**
   * ゲーム進行状況を削除
   */
  delete(_id: string): Promise<void>;
}
