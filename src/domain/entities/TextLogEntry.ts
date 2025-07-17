import { RouteId } from '../value-objects/RouteId';
import { SceneNumber } from '../value-objects/SceneNumber';

/**
 * テキストログエントリを表すエンティティ
 */
export class TextLogEntry {
  private readonly id: string;
  private readonly route: RouteId;
  private readonly scene: SceneNumber;
  private readonly text: string;
  private readonly timestamp: Date;

  constructor(
    id: string,
    route: RouteId,
    scene: SceneNumber,
    text: string,
    timestamp: Date
  ) {
    if (!text || text.trim() === '') {
      throw new Error('テキストは空にできません');
    }

    this.id = id;
    this.route = route;
    this.scene = scene;
    this.text = text;
    this.timestamp = timestamp;
  }

  getId(): string {
    return this.id;
  }

  getRoute(): RouteId {
    return this.route;
  }

  getScene(): SceneNumber {
    return this.scene;
  }

  getText(): string {
    return this.text;
  }

  getTimestamp(): Date {
    return new Date(this.timestamp);
  }

  /**
   * 指定したルートのログかチェック
   */
  isFromRoute(routeId: RouteId): boolean {
    return this.route.equals(routeId);
  }

  /**
   * 指定したシーンのログかチェック
   */
  isFromScene(sceneNumber: SceneNumber): boolean {
    return this.scene.equals(sceneNumber);
  }

  /**
   * ファクトリーメソッド - 新しいテキストログエントリを作成
   */
  static create(
    route: RouteId,
    scene: SceneNumber,
    text: string
  ): TextLogEntry {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();

    return new TextLogEntry(id, route, scene, text, timestamp);
  }

  /**
   * ファクトリーメソッド - 既存データから復元
   */
  static restore(
    id: string,
    route: string,
    scene: number,
    text: string,
    timestamp: Date
  ): TextLogEntry {
    return new TextLogEntry(
      id,
      RouteId.from(route),
      SceneNumber.from(scene),
      text,
      timestamp
    );
  }
}
