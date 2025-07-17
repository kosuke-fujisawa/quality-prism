import { SaveDataDB } from '../storage/SaveData';

export interface TextLogEntry {
  route: string;
  scene: number;
  text: string;
  timestamp: Date;
}

export class TextLog {
  private logs: TextLogEntry[] = [];
  private maxLogs = 1000;
  private db: SaveDataDB;

  constructor() {
    this.db = new SaveDataDB();
  }

  addText(route: string, scene: number, text: string): void {
    const entry: TextLogEntry = {
      route,
      scene,
      text,
      timestamp: new Date(),
    };

    this.logs.push(entry);

    // 最大ログ数を超えた場合、古いログを削除
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  getLogs(): TextLogEntry[] {
    return [...this.logs];
  }

  getLogsByRoute(route: string): TextLogEntry[] {
    return this.logs.filter((log) => log.route === route);
  }

  clearLogs(): void {
    this.logs = [];
  }

  clearLogsByRoute(route: string): void {
    this.logs = this.logs.filter((log) => log.route !== route);
  }

  searchLogs(searchText: string): TextLogEntry[] {
    return this.logs.filter((log) => log.text.includes(searchText));
  }

  setMaxLogs(maxLogs: number): void {
    this.maxLogs = maxLogs;

    // 現在のログ数が上限を超えている場合、古いログを削除
    if (this.logs.length > maxLogs) {
      this.logs = this.logs.slice(-maxLogs);
    }
  }

  async saveLogs(): Promise<void> {
    await this.db.updateSaveData({
      textLogs: this.logs,
    });
  }

  async loadLogs(): Promise<void> {
    const saveData = await this.db.getOrCreateSaveData();
    if (saveData.textLogs && Array.isArray(saveData.textLogs)) {
      this.logs = saveData.textLogs.map((log) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }));
    }
  }
}
