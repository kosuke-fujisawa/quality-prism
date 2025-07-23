/**
 * 画像の読み込みとキャッシュ管理を行うクラス
 */
export class ImageLoader {
  private imageCache: Map<string, HTMLImageElement> = new Map();

  /**
   * 画像を読み込み、キャッシュに保存する
   * @param imagePath 画像ファイルのパス
   * @returns 読み込まれた画像要素
   */
  async loadImage(imagePath: string): Promise<HTMLImageElement> {
    // キャッシュから画像を取得
    const cachedImage = this.imageCache.get(imagePath);
    if (cachedImage) {
      return cachedImage;
    }

    return new Promise((resolve, reject) => {
      const image = new Image();
      
      image.onload = () => {
        this.imageCache.set(imagePath, image);
        resolve(image);
      };
      
      image.onerror = () => {
        reject(new Error(`Failed to load image: ${imagePath}`));
      };
      
      image.src = imagePath;
    });
  }

  /**
   * 複数の画像を並行して読み込む
   * @param imagePaths 画像ファイルのパスの配列
   * @returns 読み込まれた画像要素の配列
   */
  async preloadImages(imagePaths: string[]): Promise<HTMLImageElement[]> {
    const loadPromises = imagePaths.map(path => this.loadImage(path));
    return Promise.all(loadPromises);
  }

  /**
   * キャッシュから画像を取得する
   * @param imagePath 画像ファイルのパス
   * @returns キャッシュされた画像要素、またはnull
   */
  getLoadedImage(imagePath: string): HTMLImageElement | null {
    return this.imageCache.get(imagePath) || null;
  }

  /**
   * 画像キャッシュをクリアする
   */
  clearCache(): void {
    this.imageCache.clear();
  }

  /**
   * キャッシュされている画像の数を取得する
   */
  getCacheSize(): number {
    return this.imageCache.size;
  }

  /**
   * 指定した画像がキャッシュされているかを確認する
   * @param imagePath 画像ファイルのパス
   * @returns キャッシュされている場合true
   */
  isImageCached(imagePath: string): boolean {
    return this.imageCache.has(imagePath);
  }
}