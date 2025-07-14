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
      saveData: '++id, currentRoute, currentScene, clearedRoutes, isTrueRouteUnlocked, lastSaveTime, textLogs',
      settings: '++id, volume, textSpeed, autoSave'
    });
  }

  async getOrCreateSaveData(): Promise<SaveData> {
    const existingData = await this.saveData.toArray();
    if (existingData.length > 0) {
      return existingData[0];
    }
    
    const newSaveData: SaveData = {
      currentRoute: '',
      currentScene: 0,
      clearedRoutes: [],
      isTrueRouteUnlocked: false,
      lastSaveTime: new Date(),
      textLogs: []
    };
    
    await this.saveData.add(newSaveData);
    return newSaveData;
  }

  async updateSaveData(data: Partial<SaveData>): Promise<void> {
    const existingData = await this.saveData.toArray();
    if (existingData.length > 0) {
      await this.saveData.update(existingData[0].id!, {
        ...data,
        lastSaveTime: new Date()
      });
    }
  }

  async getSettings(): Promise<GameSettings> {
    const existingSettings = await this.settings.toArray();
    if (existingSettings.length > 0) {
      return existingSettings[0];
    }
    
    const defaultSettings: GameSettings = {
      volume: 0.8,
      textSpeed: 1.0,
      autoSave: true
    };
    
    await this.settings.add(defaultSettings);
    return defaultSettings;
  }

  async updateSettings(settings: Partial<GameSettings>): Promise<void> {
    const existingSettings = await this.settings.toArray();
    if (existingSettings.length > 0) {
      await this.settings.update(existingSettings[0].id!, settings);
    }
  }
}