import Dexie, { type Table } from 'dexie';
import { TextLogEntry } from '../../domain/entities/TextLogEntry';
import { RouteId } from '../../domain/value-objects/RouteId';
import { SceneNumber } from '../../domain/value-objects/SceneNumber';
import type { TextLogRepository } from '../../domain/repositories/TextLogRepository';

/**
 * テキストログのデータベーススキーマ
 */
interface TextLogEntryData {
  id: string;
  routeId: string;
  sceneNumber: number;
  speakerName: string;
  textContent: string;
  timestamp: Date;
}

/**
 * DexieベースのTextLogRepositoryの実装
 */
export class DexieTextLogRepository implements TextLogRepository {
  private db: Dexie;
  private textLogs: Table<TextLogEntryData, string>;

  constructor() {
    this.db = new Dexie('QualityPrismTextLogs');
    this.db.version(1).stores({
      textLogs: 'id, routeId, sceneNumber, timestamp',
    });
    this.textLogs = this.db.table('textLogs');
  }

  /**
   * テキストログエントリを保存
   */
  async save(entry: TextLogEntry): Promise<void> {
    const data: TextLogEntryData = {
      id: entry.getId(),
      routeId: entry.getRoute().getValue(),
      sceneNumber: entry.getScene().getValue(),
      speakerName: 'システム', // TextLogEntryにはspeakerNameがないのでデフォルト値
      textContent: entry.getText(),
      timestamp: entry.getTimestamp(),
    };

    await this.textLogs.put(data);
  }

  /**
   * 指定されたルートのテキストログを取得
   */
  async findByRoute(routeId: RouteId): Promise<TextLogEntry[]> {
    const entries = await this.textLogs
      .where('routeId')
      .equals(routeId.getValue())
      .toArray();

    // タイムスタンプでソート
    entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return entries.map(this.convertToEntity);
  }

  /**
   * 指定されたルートとシーンのテキストログを取得
   */
  async findByRouteAndScene(
    routeId: RouteId,
    sceneNumber: SceneNumber
  ): Promise<TextLogEntry[]> {
    const entries = await this.textLogs
      .where('routeId')
      .equals(routeId.getValue())
      .and((entry) => entry.sceneNumber === sceneNumber.getValue())
      .toArray();

    // タイムスタンプでソート
    entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return entries.map(this.convertToEntity);
  }

  /**
   * 全てのテキストログを取得
   */
  async findAll(): Promise<TextLogEntry[]> {
    const entries = await this.textLogs.toArray();

    // タイムスタンプでソート
    entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return entries.map(this.convertToEntity);
  }

  /**
   * 指定されたルートのテキストログを削除
   */
  async deleteByRoute(routeId: RouteId): Promise<void> {
    await this.textLogs.where('routeId').equals(routeId.getValue()).delete();
  }

  /**
   * 全てのテキストログを削除
   */
  async deleteAll(): Promise<void> {
    await this.textLogs.clear();
  }

  /**
   * データベースオブジェクトをエンティティに変換
   */
  private convertToEntity(data: TextLogEntryData): TextLogEntry {
    return TextLogEntry.restore(
      data.id,
      data.routeId,
      data.sceneNumber,
      data.textContent,
      data.timestamp
    );
  }
}
