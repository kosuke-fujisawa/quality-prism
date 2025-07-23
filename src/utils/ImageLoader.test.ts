import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImageLoader } from './ImageLoader';

describe('ImageLoader', () => {
  let imageLoader: ImageLoader;
  let mockImage: HTMLImageElement;

  beforeEach(() => {
    imageLoader = new ImageLoader();
    
    // HTMLImageElementのモック作成
    mockImage = {
      src: '',
      onload: null,
      onerror: null,
      width: 800,
      height: 600,
    } as unknown as HTMLImageElement;

    // Image コンストラクタのモック
    global.Image = vi.fn(() => mockImage) as any;
  });

  describe('loadImage', () => {
    it('画像の読み込みが成功する', async () => {
      const imagePath = '/images/test.jpg';
      
      // 非同期でonloadを呼び出す
      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload({} as Event);
        }
      }, 0);

      const result = await imageLoader.loadImage(imagePath);
      
      expect(result).toBe(mockImage);
      expect(mockImage.src).toBe(imagePath);
    });

    it('画像の読み込みが失敗した場合エラーを投げる', async () => {
      const imagePath = '/images/nonexistent.jpg';
      
      // 非同期でonerrorを呼び出す
      setTimeout(() => {
        if (mockImage.onerror) {
          mockImage.onerror({} as Event);
        }
      }, 0);

      await expect(imageLoader.loadImage(imagePath)).rejects.toThrow(
        `Failed to load image: ${imagePath}`
      );
    });

    it('同じ画像を複数回読み込んでもキャッシュを使用する', async () => {
      const imagePath = '/images/cached.jpg';
      
      // 最初の読み込み
      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload({} as Event);
        }
      }, 0);

      const firstResult = await imageLoader.loadImage(imagePath);
      const secondResult = await imageLoader.loadImage(imagePath);
      
      expect(firstResult).toBe(secondResult);
      expect(global.Image).toHaveBeenCalledTimes(1);
    });
  });

  describe('preloadImages', () => {
    it('複数の画像を並行して読み込む', async () => {
      const imagePaths = ['/images/bg.jpg', '/images/logo.png'];
      
      // 各画像のモックを作成
      const mockImages = imagePaths.map(() => ({
        src: '',
        onload: null,
        onerror: null,
        width: 800,
        height: 600,
      } as unknown as HTMLImageElement));

      let imageIndex = 0;
      global.Image = vi.fn(() => mockImages[imageIndex++]) as any;

      // 非同期で全てのonloadを呼び出す
      setTimeout(() => {
        mockImages.forEach(img => {
          if (img.onload) {
            img.onload({} as Event);
          }
        });
      }, 0);

      const results = await imageLoader.preloadImages(imagePaths);
      
      expect(results).toHaveLength(2);
      expect(mockImages[0].src).toBe(imagePaths[0]);
      expect(mockImages[1].src).toBe(imagePaths[1]);
    });

    it('一部の画像読み込みが失敗してもエラーを投げる', async () => {
      const imagePaths = ['/images/good.jpg', '/images/bad.jpg'];
      
      const mockImages = imagePaths.map(() => ({
        src: '',
        onload: null,
        onerror: null,
      } as unknown as HTMLImageElement));

      let imageIndex = 0;
      global.Image = vi.fn(() => mockImages[imageIndex++]) as any;

      setTimeout(() => {
        // 最初の画像は成功
        if (mockImages[0].onload) {
          mockImages[0].onload({} as Event);
        }
        // 2番目の画像は失敗
        if (mockImages[1].onerror) {
          mockImages[1].onerror({} as Event);
        }
      }, 0);

      await expect(imageLoader.preloadImages(imagePaths)).rejects.toThrow();
    });
  });

  describe('getLoadedImage', () => {
    it('ロード済みの画像を取得できる', async () => {
      const imagePath = '/images/loaded.jpg';
      
      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload({} as Event);
        }
      }, 0);

      await imageLoader.loadImage(imagePath);
      const result = imageLoader.getLoadedImage(imagePath);
      
      expect(result).toBe(mockImage);
    });

    it('未ロードの画像に対してはnullを返す', () => {
      const result = imageLoader.getLoadedImage('/images/not-loaded.jpg');
      expect(result).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('キャッシュをクリアできる', async () => {
      const imagePath = '/images/cached.jpg';
      
      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload({} as Event);
        }
      }, 0);

      await imageLoader.loadImage(imagePath);
      imageLoader.clearCache();
      
      const result = imageLoader.getLoadedImage(imagePath);
      expect(result).toBeNull();
    });
  });
});