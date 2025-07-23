import { GameLogicDDD } from './game/GameLogicDDD';
import { TextLog } from './game/TextLog';
import { SaveDataListService } from './application/services/SaveDataListService';
import { SaveDataListView } from './ui/SaveDataListView';
import { DexieGameProgressRepository } from './infrastructure/repositories/DexieGameProgressRepository';
import { ImageLoader } from './utils/ImageLoader';

export class NovelGameApp {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentOptions: string[] = [];
  private gameState: 'menu' | 'game' | 'gallery' | 'credits' | 'minigame' | 'load_list' =
    'menu';
  private gameLogic: GameLogicDDD;
  private textLog: TextLog;
  private saveDataListService: SaveDataListService;
  private saveDataListView: SaveDataListView | null = null;
  private imageLoader: ImageLoader;

  constructor() {
    this.gameLogic = new GameLogicDDD();
    this.textLog = new TextLog();
    this.imageLoader = new ImageLoader();
    
    // SaveDataListService を初期化
    const gameProgressRepository = new DexieGameProgressRepository();
    this.saveDataListService = new SaveDataListService(gameProgressRepository);

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
      await this.preloadImages();
      this.showMainMenu();
    } catch (error) {
      console.error('Failed to initialize game logic:', error);
      this.showMainMenu(); // フォールバック
    }
  }

  private async preloadImages(): Promise<void> {
    const imagePaths = [
      '/images/title_background.svg',
      '/images/logo.svg',
    ];

    const loadResults = await Promise.allSettled(
      imagePaths.map(async (path) => {
        try {
          await this.imageLoader.loadImage(path);
          return { path, success: true };
        } catch (error) {
          console.warn(`Failed to load image: ${path}`, error);
          return { path, success: false, error };
        }
      })
    );

    // ロード結果をログ出力
    const successCount = loadResults.filter(
      result => result.status === 'fulfilled' && result.value.success
    ).length;
    
    console.log(`Image preload completed: ${successCount}/${imagePaths.length} images loaded successfully`);
    
    // すべての画像の読み込みが失敗した場合のみ警告
    if (successCount === 0) {
      console.warn('No images could be loaded. The application will continue with text-only display.');
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

    document.addEventListener('keydown', async (e) => {
      await this.handleKeyDown(e);
    });
  }

  private async handleClick(e: MouseEvent): Promise<void> {
    const rect = this.canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;

    if (this.gameState === 'menu' && this.currentOptions.length > 0) {
      // レスポンシブなクリック位置計算（showMainMenuと同じロジック）
      const startY = Math.max(300, this.canvas.height * 0.45);
      const itemSpacing = Math.min(50, this.canvas.height * 0.08);
      
      for (let i = 0; i < this.currentOptions.length; i++) {
        const itemY = startY + i * itemSpacing;
        const itemTop = itemY - 25; // テキストより上25px
        const itemBottom = itemY + 25; // テキストより下25px

        if (y >= itemTop && y <= itemBottom) {
          await this.selectMenuOption(this.currentOptions[i]);
          break;
        }
      }
    }
  }

  private async selectMenuOption(option: string): Promise<void> {
    try {
      switch (option) {
        case 'start':
          const startSuccess = await this.gameLogic.selectRoute('route1');
          if (startSuccess) {
            this.gameState = 'game';
            this.showMessage(
              `ゲーム開始！ルート: ${this.gameLogic.currentRoute}, シーン: ${this.gameLogic.currentScene}`
            );
          } else {
            this.showMessage('ゲームを開始できませんでした');
          }
          break;
        case 'load':
          await this.showSaveDataList();
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

    // 背景画像を描画
    this.drawBackgroundImage('/images/title_background.svg');

    // ロゴ画像を描画
    this.drawLogoImage('/images/logo.svg');

    // ロゴ画像がない場合はテキストでタイトルを表示
    if (!this.imageLoader.isImageCached('/images/logo.svg')) {
      this.ctx.font = '36px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText('品質のプリズム', 250, 150);
    }

    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.currentOptions = ['start', 'load', 'gallery', 'mini game', 'credit'];

    this.currentOptions.forEach((option, index) => {
      // レスポンシブな位置計算
      const startY = Math.max(300, this.canvas.height * 0.45); // Canvas高さの45%以降から開始
      const itemSpacing = Math.min(50, this.canvas.height * 0.08); // 項目間隔をCanvasサイズに応じて調整
      const y = startY + index * itemSpacing;
      const x = this.canvas.width * 0.375; // Canvas幅の37.5%の位置（中央より少し左）
      
      this.ctx.fillText(`${index + 1}. ${option.toUpperCase()}`, x, y);
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
    state: 'menu' | 'game' | 'gallery' | 'credits' | 'minigame' | 'load_list'
  ): void {
    this.gameState = state;
  }

  // Issue #6実装: セーブデータ一覧表示
  private async showSaveDataList(): Promise<void> {
    try {
      this.gameState = 'load_list';
      
      // SaveDataListViewを初期化
      this.saveDataListView = new SaveDataListView(
        this.saveDataListService,
        (id: string) => this.onSaveDataSelected(id),
        () => this.onSaveDataSelectionCancelled()
      );
      
      const result = await this.saveDataListView.show();
      if (result.success) {
        this.clearCanvas();
        this.ctx.font = '24px Arial';
        this.ctx.fillText('セーブデータ一覧', 300, 150);
        this.ctx.font = '16px Arial';
        this.ctx.fillText(result.message || '', 300, 200);
        this.ctx.fillText('Escキーでメニューに戻る', 300, 500);
      } else {
        this.showMessage(result.message || 'セーブデータの読み込みに失敗しました');
      }
    } catch (error) {
      this.showMessage('セーブデータの読み込みに失敗しました');
    }
  }

  // セーブデータ選択時の処理
  private async onSaveDataSelected(id: string): Promise<void> {
    await this.loadSelectedSaveData(id);
  }

  // セーブデータ選択キャンセル時の処理
  private onSaveDataSelectionCancelled(): void {
    this.showMainMenu();
  }

  // 選択されたセーブデータをロード
  private async loadSelectedSaveData(id: string): Promise<void> {
    try {
      const result = await this.saveDataListService.loadSaveDataById(id);
      if (result.success && result.gameProgress) {
        // ゲーム状態を更新
        this.gameState = 'game';
        this.showMessage(
          `ロード完了！ルート: ${result.gameProgress.getCurrentRoute().getValue()}, シーン: ${result.gameProgress.getCurrentScene().getValue()}`
        );
      } else {
        this.showMessage(result.message || 'セーブデータのロードに失敗しました');
      }
    } catch (error) {
      this.showMessage('セーブデータのロードに失敗しました');
    }
  }

  // キーボードイベント処理
  public async handleKeyDown(e: KeyboardEvent): Promise<void> {
    if (e.key === 'Escape') {
      if (this.gameState === 'load_list') {
        this.showMainMenu();
      } else if (this.gameState !== 'menu') {
        this.showMainMenu();
      }
    } else if (this.gameState === 'menu' && /^[1-5]$/.test(e.key)) {
      const index = parseInt(e.key) - 1;
      if (index >= 0 && index < this.currentOptions.length) {
        await this.selectMenuOption(this.currentOptions[index]);
      }
    }
  }

  // 画像表示機能

  /**
   * 背景画像をロードする
   * @param imagePath 画像ファイルのパス
   */
  private async loadBackgroundImage(imagePath: string): Promise<void> {
    try {
      await this.imageLoader.loadImage(imagePath);
    } catch (error) {
      console.warn(`Failed to load background image: ${imagePath}`, error);
    }
  }

  /**
   * 背景画像をCanvasに描画する（アスペクト比を維持）
   * @param imagePath 画像ファイルのパス
   */
  private drawBackgroundImage(imagePath: string): void {
    const image = this.imageLoader.getLoadedImage(imagePath);
    if (image) {
      const canvasAspect = this.canvas.width / this.canvas.height;
      const imageAspect = image.width / image.height;

      let drawWidth, drawHeight, drawX, drawY;

      if (imageAspect > canvasAspect) {
        // 画像の方が横に長い場合：高さを基準にスケール
        drawHeight = this.canvas.height;
        drawWidth = drawHeight * imageAspect;
        drawX = (this.canvas.width - drawWidth) / 2;
        drawY = 0;
      } else {
        // 画像の方が縦に長い場合：幅を基準にスケール
        drawWidth = this.canvas.width;
        drawHeight = drawWidth / imageAspect;
        drawX = 0;
        drawY = (this.canvas.height - drawHeight) / 2;
      }

      this.ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    }
  }

  /**
   * ロゴ画像をCanvasに描画する（レスポンシブ対応）
   * @param imagePath 画像ファイルのパス
   */
  private drawLogoImage(imagePath: string): void {
    const image = this.imageLoader.getLoadedImage(imagePath);
    if (image) {
      // Canvasサイズに応じてロゴサイズを調整
      const maxLogoWidth = this.canvas.width * 0.6; // Canvas幅の60%以下
      const maxLogoHeight = this.canvas.height * 0.25; // Canvas高さの25%以下
      
      const imageAspect = image.width / image.height;
      let logoWidth, logoHeight;
      
      // アスペクト比を維持しながらサイズを決定
      if (image.width > maxLogoWidth || image.height > maxLogoHeight) {
        if (maxLogoWidth / imageAspect <= maxLogoHeight) {
          logoWidth = maxLogoWidth;
          logoHeight = maxLogoWidth / imageAspect;
        } else {
          logoHeight = maxLogoHeight;
          logoWidth = maxLogoHeight * imageAspect;
        }
      } else {
        logoWidth = image.width;
        logoHeight = image.height;
      }
      
      // 中央上部に配置
      const x = (this.canvas.width - logoWidth) / 2;
      const y = Math.max(20, this.canvas.height * 0.08); // 上から8%の位置、最小20px

      this.ctx.drawImage(image, x, y, logoWidth, logoHeight);
    }
  }

  /**
   * 画像を指定した位置とサイズで描画する（汎用メソッド）
   * @param imagePath 画像ファイルのパス
   * @param x X座標
   * @param y Y座標
   * @param width 幅
   * @param height 高さ
   */
  private drawImage(
    imagePath: string,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): void {
    const image = this.imageLoader.getLoadedImage(imagePath);
    if (image) {
      const drawWidth = width || image.width;
      const drawHeight = height || image.height;
      this.ctx.drawImage(image, x, y, drawWidth, drawHeight);
    }
  }
}
