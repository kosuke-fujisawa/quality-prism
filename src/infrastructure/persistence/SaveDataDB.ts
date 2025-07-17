import Dexie, { type EntityTable } from 'dexie';

export interface TextLogEntry {
  route: string;
  scene: number;
  text: string;
  timestamp: Date;
}

export interface SaveData {
  id?: number;
  currentRoute: string;
  currentScene: number;
  clearedRoutes: string[];
  isTrueRouteUnlocked: boolean;
  lastSaveTime: Date;
  textLogs?: TextLogEntry[];
}

export interface GameSettings {
  id?: number;
  volume: number;
  textSpeed: number;
  autoSave: boolean;
}

export class SaveDataDB extends Dexie {
  saveData!: EntityTable<SaveData, 'id'>;
  settings!: EntityTable<GameSettings, 'id'>;

  constructor() {
    super('QualityPrismSaveData');
    this.version(1).stores({
      saveData:
        '++id, currentRoute, currentScene, clearedRoutes, isTrueRouteUnlocked, lastSaveTime, textLogs',
      settings: '++id, volume, textSpeed, autoSave',
    });
  }
}
