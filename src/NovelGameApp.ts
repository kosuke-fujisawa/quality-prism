import { GameLogic } from './game/GameLogic';
import { TextLog } from './game/TextLog';

export class NovelGameApp {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentOptions: string[] = [];
  private gameState: 'menu' | 'game' | 'gallery' | 'credits' | 'minigame' =
    'menu';
  private gameLogic: GameLogic;
  private textLog: TextLog;

  constructor() {
    this.gameLogic = new GameLogic();
    this.textLog = new TextLog();

    this.canvas = document.querySelector<HTMLCanvasElement>('#gameCanvas')!;
    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }

    this.ctx = this.canvas.getContext('2d')!;
    this.setupCanvas();
    this.setupEventListeners();
    this.init();
  }

  private async init(): Promise<void> {
    try {
      await this.gameLogic.loadGameState();
      await this.textLog.loadLogs();
      this.showMainMenu();
    } catch (error) {
      console.error('Failed to initialize game logic:', error);
      this.showMainMenu(); // フォールバック
    }
  }

  private setupCanvas(): void {
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#ffffff';
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('click', (e) => this.handleClick(e));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.gameState !== 'menu') {
          this.showMainMenu();
        }
      } else if (this.gameState === 'menu' && /^[1-5]$/.test(e.key)) {
        const index = parseInt(e.key) - 1;
        if (index >= 0 && index < this.currentOptions.length) {
          this.selectMenuOption(this.currentOptions[index]);
        }
      }
    });
  }

  private handleClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;

    if (this.gameState === 'menu' && this.currentOptions.length > 0) {
      // テキストのベースライン基準で描画されているため、クリック範囲を調整
      // 各メニュー項目のY座標: 250, 300, 350, 400, 450
      // クリック可能範囲: 各項目の上下25pxずつ（テキスト高さを考慮）
      for (let i = 0; i < this.currentOptions.length; i++) {
        const itemY = 250 + i * 50;
        const itemTop = itemY - 25; // テキストより上25px
        const itemBottom = itemY + 25; // テキストより下25px

        if (y >= itemTop && y <= itemBottom) {
          this.selectMenuOption(this.currentOptions[i]);
          break;
        }
      }
    }
  }

  private async selectMenuOption(option: string): Promise<void> {
    try {
      switch (option) {
        case 'start':
          await this.gameLogic.selectRoute('opening');
          this.gameState = 'game';
          this.showMessage(
            `ゲーム開始！ルート: ${this.gameLogic.currentRoute}, シーン: ${this.gameLogic.currentScene}`
          );
          break;
        case 'load':
          this.gameState = 'game';
          if (this.gameLogic.currentRoute === '') {
            this.showMessage('セーブデータがありません');
          } else {
            this.showMessage(
              `ロード完了！ルート: ${this.gameLogic.currentRoute}, シーン: ${this.gameLogic.currentScene}`
            );
          }
          break;
        case 'gallery':
          this.showGallery();
          break;
        case 'mini game':
          this.showMiniGame();
          break;
        case 'credit':
          this.showCredits();
          break;
        default:
          console.warn('Unknown menu option:', option);
      }
    } catch (error) {
      console.error('Error in selectMenuOption:', error);
      this.showMessage('エラーが発生しました: ' + error);
    }
  }

  private showMainMenu(): void {
    this.gameState = 'menu';
    this.clearCanvas();

    this.ctx.font = '36px Arial';
    this.ctx.fillText('品質のプリズム', 250, 150);

    this.ctx.font = '24px Arial';
    this.currentOptions = ['start', 'load', 'gallery', 'mini game', 'credit'];

    this.currentOptions.forEach((option, index) => {
      const y = 250 + index * 50;
      this.ctx.fillText(`${index + 1}. ${option.toUpperCase()}`, 300, y);
    });

    this.ctx.font = '16px Arial';
    this.ctx.fillText('数字キーまたはクリックで選択', 300, 550);
  }

  private showMessage(message: string): void {
    this.clearCanvas();
    this.ctx.font = '24px Arial';
    this.ctx.fillText(message, 300, 300);
    this.ctx.font = '16px Arial';
    this.ctx.fillText('Escキーでメニューに戻る', 300, 400);
  }

  private showGallery(): void {
    this.gameState = 'gallery';
    this.clearCanvas();
    this.ctx.font = '24px Arial';
    this.ctx.fillText('ギャラリー', 350, 200);
    this.ctx.font = '18px Arial';
    this.ctx.fillText('（未実装）', 350, 250);
    this.ctx.fillText('Escキーでメニューに戻る', 300, 500);
  }

  private showMiniGame(): void {
    this.gameState = 'minigame';
    this.clearCanvas();
    this.ctx.font = '24px Arial';
    this.ctx.fillText('ミニゲーム', 350, 200);
    this.ctx.font = '18px Arial';
    this.ctx.fillText('（未実装）', 350, 250);
    this.ctx.fillText('Escキーでメニューに戻る', 300, 500);
  }

  private showCredits(): void {
    this.gameState = 'credits';
    this.clearCanvas();
    this.ctx.font = '24px Arial';
    this.ctx.fillText('クレジット', 350, 150);
    this.ctx.font = '18px Arial';
    this.ctx.fillText('品質のプリズム', 350, 200);
    this.ctx.fillText('開発：Claude Code', 350, 230);
    this.ctx.fillText('エンジン：Vite + TypeScript', 350, 260);
    this.ctx.fillText('Escキーでメニューに戻る', 300, 500);
  }

  private clearCanvas(): void {
    this.ctx.fillStyle = '#111111';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#ffffff';
  }

  // テスト用のパブリックメソッド
  public getGameState(): string {
    return this.gameState;
  }

  public setGameState(
    state: 'menu' | 'game' | 'gallery' | 'credits' | 'minigame'
  ): void {
    this.gameState = state;
  }
}
