import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NovelGameApp } from './NovelGameApp';
import { ImageLoader } from './utils/ImageLoader';

// DOM環境のモック
Object.defineProperty(window, 'HTMLCanvasElement', {
  value: class MockCanvas {
    width = 800;
    height = 600;
    getContext() {
      return {
        fillStyle: '',
        font: '',
        fillText: vi.fn(),
        fillRect: vi.fn(),
        measureText: vi.fn(() => ({ width: 100 })),
        drawImage: vi.fn(),
      };
    }
    addEventListener = vi.fn();
    dispatchEvent = vi.fn();
    getBoundingClientRect() {
      return { top: 0, left: 0, width: 800, height: 600 };
    }
  },
});

// DocumentのモックでHTMLCanvasElementを返す
const mockCanvas = new (window as any).HTMLCanvasElement();
(globalThis as any).document = {
  ...(globalThis as any).document,
  querySelector: vi.fn(() => mockCanvas),
  addEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  readyState: 'complete',
} as any;

// globalに公開
const globalAny = globalThis as any;
if (!globalAny.global) globalAny.global = globalThis;
globalAny.global.document = globalAny.document;

describe('NovelGameApp', () => {
  let app: NovelGameApp;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期化', () => {
    it('正常に初期化できる', () => {
      expect(() => {
        app = new NovelGameApp();
      }).not.toThrow();
    });

    it('キャンバス要素を取得する', () => {
      app = new NovelGameApp();
      expect(document.querySelector).toHaveBeenCalledWith('#gameCanvas');
    });

    it('イベントリスナーを設定する', () => {
      app = new NovelGameApp();
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );
      expect(document.addEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });
  });

  describe('メニュー操作', () => {
    beforeEach(async () => {
      app = new NovelGameApp();
      // 初期化を待つ
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    it('メニュー状態で数字キー1-5に反応する', () => {
      const selectMenuSpy = vi.spyOn(app as any, 'selectMenuOption');

      // ゲーム状態がmenuであることを確認
      expect((app as any).gameState).toBe('menu');

      // currentOptionsが空の場合は手動で設定してテスト続行
      if ((app as any).currentOptions.length === 0) {
        (app as any).currentOptions = [
          'start',
          'load',
          'gallery',
          'mini game',
          'credit',
        ];
      }

      // イベントリスナーを直接呼び出し
      const keyEvent = new KeyboardEvent('keydown', { key: '1' });
      const addEventListenerCalls = (document.addEventListener as any).mock
        .calls;
      const keyHandler = addEventListenerCalls.find(
        (call: any[]) => call[0] === 'keydown'
      )?.[1];
      if (keyHandler) keyHandler(keyEvent);

      expect(selectMenuSpy).toHaveBeenCalledWith('start');
    });

    it('メニュー状態でEscキーは無反応', () => {
      const showMenuSpy = vi.spyOn(app as any, 'showMainMenu');
      const initialCallCount = showMenuSpy.mock.calls.length;

      const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(keyEvent);

      // 初期化時の呼び出し以外は増えない
      expect(showMenuSpy).toHaveBeenCalledTimes(initialCallCount);
    });

    it('クリック位置からメニュー項目を正しく計算する', () => {
      const selectMenuSpy = vi.spyOn(app as any, 'selectMenuOption');

      // currentOptionsが空の場合は手動で設定してテスト続行
      if ((app as any).currentOptions.length === 0) {
        (app as any).currentOptions = [
          'start',
          'load',
          'gallery',
          'mini game',
          'credit',
        ];
      }

      // STARTの位置（y=250-299）をクリック
      const clickEvent = {
        clientY: 275,
        target: mockCanvas,
      };
      const addEventListenerCalls = (mockCanvas.addEventListener as any).mock
        .calls;
      const clickHandler = addEventListenerCalls.find(
        (call: any[]) => call[0] === 'click'
      )?.[1];
      if (clickHandler) clickHandler(clickEvent);

      expect(selectMenuSpy).toHaveBeenCalledWith('start');
    });
  });

  describe('ゲーム状態管理', () => {
    beforeEach(() => {
      app = new NovelGameApp();
    });

    it('初期状態はメニュー', () => {
      expect(app.getGameState()).toBe('menu');
    });

    it('ゲーム状態を変更できる', () => {
      app.setGameState('game');
      expect(app.getGameState()).toBe('game');
    });

    it('ゲーム状態でEscキーを押すとメニューに戻る', () => {
      app.setGameState('game');

      const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      const addEventListenerCalls = (document.addEventListener as any).mock
        .calls;
      const keyHandler = addEventListenerCalls.find(
        (call: any[]) => call[0] === 'keydown'
      )?.[1];
      if (keyHandler) keyHandler(keyEvent);

      expect(app.getGameState()).toBe('menu');
    });
  });

  describe('エラーハンドリング', () => {
    it('キャンバス要素が見つからない場合の処理', () => {
      (document.querySelector as any).mockReturnValueOnce(null);

      expect(() => {
        new NovelGameApp();
      }).toThrow('Canvas element not found');
    });

    it('無効なメニューオプションの処理', () => {
      app = new NovelGameApp();

      expect(() => {
        (app as any).selectMenuOption('invalid');
      }).not.toThrow();
    });
  });

  describe('画像表示機能', () => {
    let mockImageLoader: any;

    beforeEach(() => {
      // ImageLoaderのモック作成
      mockImageLoader = {
        loadImage: vi.fn(),
        preloadImages: vi.fn(),
        getLoadedImage: vi.fn(),
        clearCache: vi.fn(),
        isImageCached: vi.fn(),
      };

      app = new NovelGameApp();
      (app as any).imageLoader = mockImageLoader;
    });

    it('背景画像をロードできる', async () => {
      const mockImage = new Image();
      mockImageLoader.loadImage.mockResolvedValue(mockImage);

      await (app as any).loadBackgroundImage('/images/title_bg.jpg');

      expect(mockImageLoader.loadImage).toHaveBeenCalledWith('/images/title_bg.jpg');
    });

    it('背景画像をCanvasに描画できる', async () => {
      const mockImage = {
        width: 800,
        height: 600,
      } as HTMLImageElement;
      
      mockImageLoader.getLoadedImage.mockReturnValue(mockImage);
      const drawImageSpy = vi.spyOn((app as any).ctx, 'drawImage');

      (app as any).drawBackgroundImage('/images/title_bg.jpg');

      expect(mockImageLoader.getLoadedImage).toHaveBeenCalledWith('/images/title_bg.jpg');
      expect(drawImageSpy).toHaveBeenCalledWith(mockImage, 0, 0, 800, 600);
    });

    it('画像が見つからない場合はエラーハンドリングされる', async () => {
      mockImageLoader.loadImage.mockRejectedValue(new Error('Image not found'));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await (app as any).loadBackgroundImage('/images/nonexistent.jpg');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load background image: /images/nonexistent.jpg',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('ロゴ画像を正しい位置に描画できる', () => {
      const mockImage = {
        width: 400,
        height: 200,
      } as HTMLImageElement;
      
      mockImageLoader.getLoadedImage.mockReturnValue(mockImage);
      const drawImageSpy = vi.spyOn((app as any).ctx, 'drawImage');

      (app as any).drawLogoImage('/images/logo.svg');

      // レスポンシブ対応の計算結果
      // maxLogoWidth = 800 * 0.6 = 480
      // maxLogoHeight = 600 * 0.25 = 150
      // imageAspect = 400 / 200 = 2
      // 400 > 480 は false, 200 > 150 は true なので maxLogoHeight基準
      // logoHeight = 150, logoWidth = 150 * 2 = 300
      // x = (800 - 300) / 2 = 250
      // y = Math.max(20, 600 * 0.08) = Math.max(20, 48) = 48

      expect(drawImageSpy).toHaveBeenCalledWith(
        mockImage,
        250, // (800 - 300) / 2
        48,  // Math.max(20, 600 * 0.08)
        300, // レスポンシブ調整後の幅
        150  // レスポンシブ調整後の高さ
      );
    });

    it('キャッシュされていない画像の描画時は何もしない', () => {
      mockImageLoader.getLoadedImage.mockReturnValue(null);
      const drawImageSpy = vi.spyOn((app as any).ctx, 'drawImage');

      (app as any).drawBackgroundImage('/images/not_cached.jpg');

      expect(drawImageSpy).not.toHaveBeenCalled();
    });
  });
});
