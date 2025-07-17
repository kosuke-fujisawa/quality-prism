import './style.css';
import { GameLogic } from './game/GameLogic';
import { TextLog } from './game/TextLog';
import { ScenarioLoader, type Scenario } from './game/ScenarioLoader';
import { ChoiceSystem, type ChoiceData } from './game/ChoiceSystem';

class NovelGameApp {
  private gameLogic: GameLogic;
  private textLog: TextLog;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private currentText: string = '';
  private currentOptions: string[] = [];
  private showingTextLog: boolean = false;
  private currentScenario: Scenario | null = null;
  private currentTextIndex: number = 0;
  private gameState: 'menu' | 'game' | 'gallery' | 'credits' | 'minigame' =
    'menu';
  private choiceSystem: ChoiceSystem = new ChoiceSystem();
  private currentChoice: ChoiceData | null = null;

  constructor() {
    console.log('NovelGameApp constructor called');
    this.gameLogic = new GameLogic();
    this.textLog = new TextLog();

    this.canvas = document.querySelector<HTMLCanvasElement>('#gameCanvas')!;
    console.log('Canvas element:', this.canvas);

    if (!this.canvas) {
      console.error('Canvas not found!');
      return;
    }

    this.ctx = this.canvas.getContext('2d')!;
    console.log('Canvas context:', this.ctx);

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
    console.log('Setting up event listeners...');

    this.canvas.addEventListener('click', (e) => {
      console.log('Canvas clicked!');
      this.handleClick(e);
    });

    // キーボード操作
    document.addEventListener('keydown', (e) => {
      console.log('Key pressed:', e.key, 'gameState:', this.gameState);

      if (e.key === 'Escape') {
        if (this.gameState !== 'menu') {
          this.showMainMenu();
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (this.showingTextLog) {
          this.hideTextLog();
        } else if (this.gameState === 'game') {
          if (this.currentChoice) {
            // 選択肢では無効
            return;
          }
          this.advanceText();
        }
      } else if (e.key === 'l' || e.key === 'L') {
        if (this.gameState === 'game') {
          this.toggleTextLog();
        }
      } else if (this.gameState === 'menu' && /^[1-5]$/.test(e.key)) {
        console.log('Menu key detected:', e.key);
        // 数字キーでメニュー選択
        const index = parseInt(e.key) - 1;
        if (index >= 0 && index < this.currentOptions.length) {
          console.log('Selecting menu option:', this.currentOptions[index]);
          this.selectMenuOption(this.currentOptions[index]);
        }
      } else if (
        this.gameState === 'game' &&
        this.currentChoice &&
        /^[1-9]$/.test(e.key)
      ) {
        // 選択肢での数字キー
        const index = parseInt(e.key) - 1;
        if (index >= 0 && index < this.currentChoice.choices.length) {
          this.selectChoice(index);
        }
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

    this.showMainMenu();
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
      console.log(`Menu item ${index}: "${option}" at y=${y}`);
      this.ctx.fillText(`${index + 1}. ${option.toUpperCase()}`, 300, y);
    });

    this.ctx.font = '16px Arial';
    this.ctx.fillText('数字キーまたはクリックで選択', 300, 550);

    console.log('Menu options:', this.currentOptions);
    console.log('Menu y positions: 250, 300, 350, 400, 450');
  }

  private async showCurrentScene(addToLog: boolean = true): Promise<void> {
    // シナリオを読み込み
    this.currentScenario = await ScenarioLoader.loadScenario(
      this.gameLogic.currentRoute,
      this.gameLogic.currentScene
    );

    if (this.currentScenario) {
      this.currentTextIndex = 0;
      this.showScenarioText(addToLog);
    } else {
      // フォールバック：従来の表示
      this.showFallbackScene(addToLog);
    }
  }

  private showScenarioText(addToLog: boolean = true): void {
    if (
      !this.currentScenario ||
      this.currentTextIndex >= this.currentScenario.texts.length
    ) {
      return;
    }

    this.clearCanvas();
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`ルート: ${this.gameLogic.currentRoute}`, 50, 50);
    this.ctx.fillText(`シーン: ${this.gameLogic.currentScene}`, 50, 100);

    const scenarioText = this.currentScenario.texts[this.currentTextIndex];
    this.currentText = scenarioText.content;

    // 複数行テキストの表示
    this.displayMultilineText(this.currentText, 50, 200);

    // キャラクター情報の表示
    if (scenarioText.speaker && scenarioText.speaker !== 'narrator') {
      const character = this.currentScenario.characters.find(
        (c) => c.id === scenarioText.speaker
      );
      if (character) {
        this.ctx.font = '16px Arial';
        this.ctx.fillText(character.name, 50, 180);
      }
    }

    // テキストログに追加（初回表示時のみ）
    if (addToLog && this.currentText) {
      this.textLog.addText(
        this.gameLogic.currentRoute,
        this.gameLogic.currentScene,
        this.currentText
      );
    }

    // 操作説明
    this.ctx.font = '16px Arial';
    if (this.currentTextIndex < this.currentScenario.texts.length - 1) {
      this.ctx.fillText('クリックまたはEnterキーで次のテキストへ', 50, 500);
    } else {
      this.ctx.fillText('クリックまたはEnterキーで次のシーンへ', 50, 500);
    }
    this.ctx.fillText('Lキーでテキストログ表示', 50, 530);
    this.ctx.fillText('ブラウザバックでも進行状況は自動保存されます', 50, 560);
  }

  private displayMultilineText(text: string, x: number, y: number): void {
    if (!text) return;

    this.ctx.font = '18px Arial';
    const lines = text.split('\n');
    const lineHeight = 25;

    lines.forEach((line, lineIndex) => {
      // 長い行の自動折り返し
      if (line.length > 40) {
        const words = line.split('');
        let currentLine = '';
        let currentY = y + lineIndex * lineHeight;

        for (const char of words) {
          const testLine = currentLine + char;
          const metrics = this.ctx.measureText(testLine);

          if (metrics.width > 700 && currentLine !== '') {
            this.ctx.fillText(currentLine, x, currentY);
            currentLine = char;
            currentY += lineHeight;
          } else {
            currentLine = testLine;
          }
        }

        if (currentLine) {
          this.ctx.fillText(currentLine, x, currentY);
        }
      } else {
        this.ctx.fillText(line, x, y + lineIndex * lineHeight);
      }
    });
  }

  private showFallbackScene(addToLog: boolean = true): void {
    this.clearCanvas();
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`ルート: ${this.gameLogic.currentRoute}`, 50, 50);
    this.ctx.fillText(`シーン: ${this.gameLogic.currentScene}`, 50, 100);

    this.ctx.font = '18px Arial';
    this.currentText = `これは${this.gameLogic.currentRoute}の${this.gameLogic.currentScene}番目のシーンです。`;
    this.ctx.fillText(this.currentText, 50, 200);

    // テキストログに追加（初回表示時のみ）
    if (addToLog) {
      this.textLog.addText(
        this.gameLogic.currentRoute,
        this.gameLogic.currentScene,
        this.currentText
      );
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

    console.log(
      'Click at y:',
      y,
      'gameState:',
      this.gameState,
      'options:',
      this.currentOptions
    );

    if (this.showingTextLog) {
      this.hideTextLog();
      return;
    }

    if (this.gameState === 'menu' && this.currentOptions.length > 0) {
      // メニュー画面
      const optionIndex = Math.floor((y - 250) / 50);
      console.log('Calculated option index:', optionIndex, 'for y:', y);
      if (optionIndex >= 0 && optionIndex < this.currentOptions.length) {
        console.log('Selecting option:', this.currentOptions[optionIndex]);
        this.selectMenuOption(this.currentOptions[optionIndex]);
      } else {
        console.log('Click outside menu options range');
      }
    } else if (this.gameState === 'game') {
      if (this.currentChoice) {
        // 選択肢画面
        const optionIndex = Math.floor((y - 250) / 40);
        if (
          optionIndex >= 0 &&
          optionIndex < this.currentChoice.choices.length
        ) {
          this.selectChoice(optionIndex);
        }
      } else {
        // ゲーム画面
        this.advanceText();
      }
    }
  }

  private async selectMenuOption(option: string): Promise<void> {
    this.currentOptions = [];

    switch (option) {
      case 'start':
        await this.startNewGame();
        break;
      case 'load':
        await this.loadGame();
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
    }
  }

  private async startNewGame(): Promise<void> {
    this.gameState = 'game';
    // 新しいゲームの開始 - オープニングから開始
    this.choiceSystem.clearFlags();
    await this.gameLogic.selectRoute('opening');
    await this.showCurrentScene();
  }

  private async loadGame(): Promise<void> {
    this.gameState = 'game';
    // セーブデータがあればロード、なければ新規ゲーム
    if (this.gameLogic.currentRoute === '') {
      await this.startNewGame();
    } else {
      await this.showCurrentScene();
    }
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
    this.ctx.fillText('', 350, 290);
    this.ctx.fillText('Escキーでメニューに戻る', 300, 500);
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
      this.textLog.addText(
        this.gameLogic.currentRoute,
        this.gameLogic.currentScene,
        `${this.gameLogic.currentRoute} クリア！`
      );
      await this.textLog.saveLogs();

      setTimeout(() => {
        this.showMainMenu();
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

    const currentRouteLogs = this.textLog.getLogsByRoute(
      this.gameLogic.currentRoute
    );

    if (currentRouteLogs.length === 0) {
      this.ctx.fillText('ログがありません', 350, 300);
      return;
    }

    // 最新の15件を表示
    const recentLogs = currentRouteLogs.slice(-15);
    let y = 120;

    recentLogs.forEach((log) => {
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

  private async advanceText(): Promise<void> {
    if (
      this.currentScenario &&
      this.currentTextIndex < this.currentScenario.texts.length - 1
    ) {
      // 同じシーン内の次のテキストへ
      this.currentTextIndex++;
      this.showScenarioText(true);
    } else {
      // シーンの最後 - 選択肢があるかチェック
      const choice = ChoiceSystem.getChoice(
        this.gameLogic.currentRoute,
        this.gameLogic.currentScene
      );
      if (choice) {
        this.showChoice(choice);
      } else {
        // 次のシーンへ
        await this.nextScene();
      }
    }
  }

  private showChoice(choice: ChoiceData): void {
    this.currentChoice = choice;
    this.clearCanvas();

    this.ctx.font = '24px Arial';
    this.ctx.fillText(`ルート: ${this.gameLogic.currentRoute}`, 50, 50);
    this.ctx.fillText(`シーン: ${this.gameLogic.currentScene}`, 50, 100);

    this.ctx.font = '20px Arial';
    this.displayMultilineText(choice.question, 50, 150);

    this.ctx.font = '18px Arial';
    choice.choices.forEach((option, index) => {
      const y = 250 + index * 40;
      this.ctx.fillText(`${index + 1}. ${option.text}`, 50, y);
    });

    this.ctx.font = '16px Arial';
    this.ctx.fillText('数字キーまたはクリックで選択', 50, 500);
  }

  private async selectChoice(choiceIndex: number): Promise<void> {
    if (
      !this.currentChoice ||
      choiceIndex >= this.currentChoice.choices.length
    ) {
      return;
    }

    const selectedChoice = this.currentChoice.choices[choiceIndex];
    this.choiceSystem.makeChoice(selectedChoice.id, selectedChoice);

    // 選択肢をクリア
    this.currentChoice = null;

    // 次のシーンへ
    await this.nextScene();
  }
}

// アプリケーション開始
console.log('Script loaded');

function initApp() {
  console.log('Initializing application...');
  console.log('Document ready state:', document.readyState);
  console.log('Canvas exists:', !!document.querySelector('#gameCanvas'));

  // 基本的なイベントテスト
  document.addEventListener('click', (e) => {
    console.log('Document click detected:', e.target);
  });

  document.addEventListener('keydown', (e) => {
    console.log('Document keydown detected:', e.key);
  });

  try {
    new NovelGameApp();
    console.log('Application started successfully');
  } catch (error) {
    console.error('Failed to start application:', error);
  }
}

if (document.readyState === 'loading') {
  console.log('Waiting for DOM...');
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  console.log('DOM already ready');
  initApp();
}
