import { TextLogEntry } from '../entities/TextLogEntry';
import { RouteId } from '../value-objects/RouteId';
import { SceneNumber } from '../value-objects/SceneNumber';

/**
 * テキストログのリポジトリインターフェース
 */
export interface TextLogRepository {
  /**
   * テキストログエントリを保存
   */
  save(_entry: TextLogEntry): Promise<void>;

  /**
   * 指定されたルートのテキストログを取得
   */
  findByRoute(_routeId: RouteId): Promise<TextLogEntry[]>;

  /**
   * 指定されたルートとシーンのテキストログを取得
   */
  findByRouteAndScene(
    _routeId: RouteId,
    _sceneNumber: SceneNumber
  ): Promise<TextLogEntry[]>;

  /**
   * 全てのテキストログを取得
   */
  findAll(): Promise<TextLogEntry[]>;

  /**
   * 指定されたルートのテキストログを削除
   */
  deleteByRoute(_routeId: RouteId): Promise<void>;

  /**
   * 全てのテキストログを削除
   */
  deleteAll(): Promise<void>;
}
