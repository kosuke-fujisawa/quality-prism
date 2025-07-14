import './style.css'
import { GameLogic } from './game/GameLogic'
import { TextLog } from './game/TextLog'

class NovelGameApp {
  private gameLogic: GameLogic;
  private textLog: TextLog;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentText: string = '';
  private currentOptions: string[] = [];
  private showingTextLog: boolean = false;

  constructor() {
    this.gameLogic = new GameLogic();
    this.textLog = new TextLog();
    this.canvas = document.querySelector<HTMLCanvasElement>('#gameCanvas')!;
    this.ctx = this.canvas.getContext('2d')!;
    this.setupCanvas();
    this.setupEventListeners();
    this.init();
  }

  private setupCanvas(): void {
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#ffffff';
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    
    // キーボード操作
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (this.showingTextLog) {
          this.hideTextLog();
        } else {
          this.nextScene();
        }
      } else if (e.key === 'l' || e.key === 'L') {
        this.toggleTextLog();
      }
    });

    // ブラウザバック対応
    window.addEventListener('beforeunload', () => {
      this.gameLogic.autoSave();
    });
  }

  private async init(): Promise<void> {
    await this.gameLogic.loadGameState();
    await this.textLog.loadLogs();
    
    if (this.gameLogic.currentRoute === '') {
      this.showRouteSelection();
    } else {
      this.showCurrentScene();
    }
  }

  private showRouteSelection(): void {
    this.clearCanvas();
    this.ctx.fillText('品質のプリズム', 300, 100);
    this.ctx.font = '18px Arial';
    this.ctx.fillText('ルートを選択してください:', 300, 200);
    
    this.currentOptions = ['route1', 'route2', 'route3'];
    
    // 3つのルートがクリアされていればトゥルールートを追加
    this.gameLogic.loadGameState().then(async () => {
      const saveData = await this.gameLogic['db'].getOrCreateSaveData();
      const allRoutesCleared = this.gameLogic.availableRoutes.every(route => 
        saveData.clearedRoutes.includes(route)
      );
      
      if (allRoutesCleared) {
        this.currentOptions.push('trueRoute');
      }
      
      this.currentOptions.forEach((option, index) => {
        const y = 250 + (index * 40);
        this.ctx.fillText(`${index + 1}. ${option}`, 300, y);
      });
    });
  }

  private showCurrentScene(addToLog: boolean = true): void {
    this.clearCanvas();
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`ルート: ${this.gameLogic.currentRoute}`, 50, 50);
    this.ctx.fillText(`シーン: ${this.gameLogic.currentScene}`, 50, 100);
    
    this.ctx.font = '18px Arial';
    this.currentText = `これは${this.gameLogic.currentRoute}の${this.gameLogic.currentScene}番目のシーンです。`;
    this.ctx.fillText(this.currentText, 50, 200);
    
    // テキストログに追加（初回表示時のみ）
    if (addToLog) {
      this.textLog.addText(this.gameLogic.currentRoute, this.gameLogic.currentScene, this.currentText);
    }
    
    this.ctx.fillText('クリックまたはEnterキーで次のシーンへ', 50, 500);
    this.ctx.fillText('Lキーでテキストログ表示', 50, 530);
    this.ctx.fillText('ブラウザバックでも進行状況は自動保存されます', 50, 560);
  }

  private clearCanvas(): void {
    this.ctx.fillStyle = '#111111';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#ffffff';
  }

  private handleClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    if (this.showingTextLog) {
      this.hideTextLog();
      return;
    }
    
    if (this.currentOptions.length > 0) {
      // ルート選択画面
      const optionIndex = Math.floor((y - 250) / 40);
      if (optionIndex >= 0 && optionIndex < this.currentOptions.length) {
        this.selectRoute(this.currentOptions[optionIndex]);
      }
    } else {
      // ゲーム画面
      this.nextScene();
    }
  }

  private async selectRoute(routeName: string): Promise<void> {
    const success = await this.gameLogic.selectRoute(routeName);
    if (success) {
      this.currentOptions = [];
      this.showCurrentScene();
    }
  }

  private async nextScene(): Promise<void> {
    const isCleared = await this.gameLogic.nextScene();
    await this.gameLogic.autoSave();
    await this.textLog.saveLogs();
    
    if (isCleared) {
      this.clearCanvas();
      this.ctx.fillText(`${this.gameLogic.currentRoute} クリア！`, 300, 300);
      this.ctx.fillText('クリックで戻る', 300, 400);
      
      // クリアメッセージもログに追加
      this.textLog.addText(this.gameLogic.currentRoute, this.gameLogic.currentScene, `${this.gameLogic.currentRoute} クリア！`);
      await this.textLog.saveLogs();
      
      setTimeout(() => {
        this.showRouteSelection();
      }, 2000);
    } else {
      this.showCurrentScene();
    }
  }

  private toggleTextLog(): void {
    if (this.showingTextLog) {
      this.hideTextLog();
    } else {
      this.showTextLog();
    }
  }

  private showTextLog(): void {
    this.showingTextLog = true;
    this.clearCanvas();
    
    this.ctx.font = '24px Arial';
    this.ctx.fillText('テキストログ', 350, 50);
    
    this.ctx.font = '16px Arial';
    this.ctx.fillText('現在のルートのログを表示中', 300, 80);
    this.ctx.fillText('Lキーまたはクリックで戻る', 300, 580);
    
    const currentRouteLogs = this.textLog.getLogsByRoute(this.gameLogic.currentRoute);
    
    if (currentRouteLogs.length === 0) {
      this.ctx.fillText('ログがありません', 350, 300);
      return;
    }
    
    // 最新の15件を表示
    const recentLogs = currentRouteLogs.slice(-15);
    let y = 120;
    
    recentLogs.forEach((log, index) => {
      const text = `シーン${log.scene}: ${log.text}`;
      
      // テキストが長い場合は折り返し
      if (text.length > 60) {
        const line1 = text.substring(0, 60);
        const line2 = text.substring(60);
        this.ctx.fillText(line1, 50, y);
        this.ctx.fillText(line2, 50, y + 20);
        y += 40;
      } else {
        this.ctx.fillText(text, 50, y);
        y += 25;
      }
      
      // 画面に入りきらない場合は中断
      if (y > 550) {
        this.ctx.fillText('...', 50, y);
        return;
      }
    });
  }

  private hideTextLog(): void {
    this.showingTextLog = false;
    this.showCurrentScene(false); // ログに追加しない
  }
}

// アプリケーション開始
new NovelGameApp();