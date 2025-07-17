import { SaveDataDB } from '../storage/SaveData';

export class GameLogic {
  private db: SaveDataDB;
  public availableRoutes: string[] = ['route1', 'route2', 'route3'];
  public currentRoute = '';
  public currentScene = 0;
  private readonly SCENES_PER_ROUTE = 100;

  constructor() {
    this.db = new SaveDataDB();
  }

  async selectRoute(routeName: string): Promise<boolean> {
    const saveData = await this.db.getOrCreateSaveData();
    
    // トゥルールートの判定
    if (routeName === 'trueRoute') {
      const allRoutesCleared = this.availableRoutes.every(route => 
        saveData.clearedRoutes.includes(route)
      );
      
      if (!allRoutesCleared) {
        return false;
      }
    } else if (!this.availableRoutes.includes(routeName)) {
      return false;
    }

    this.currentRoute = routeName;
    this.currentScene = 0;

    await this.db.updateSaveData({
      currentRoute: routeName,
      currentScene: 0
    });

    return true;
  }

  async nextScene(): Promise<boolean> {
    this.currentScene++;

    // 最終シーンでルートクリア
    if (this.currentScene >= this.SCENES_PER_ROUTE) {
      const saveData = await this.db.getOrCreateSaveData();
      const clearedRoutes = [...saveData.clearedRoutes];
      
      if (!clearedRoutes.includes(this.currentRoute)) {
        clearedRoutes.push(this.currentRoute);
      }

      await this.db.updateSaveData({
        clearedRoutes
      });

      return true; // ルートクリア
    }

    await this.db.updateSaveData({
      currentRoute: this.currentRoute,
      currentScene: this.currentScene
    });

    return false; // 続行
  }

  async autoSave(): Promise<void> {
    const settings = await this.db.getSettings();
    
    if (settings.autoSave) {
      await this.db.updateSaveData({
        currentRoute: this.currentRoute,
        currentScene: this.currentScene
      });
    }
  }

  async loadGameState(): Promise<void> {
    const saveData = await this.db.getOrCreateSaveData();
    
    this.currentRoute = saveData.currentRoute;
    this.currentScene = saveData.currentScene;
  }
}