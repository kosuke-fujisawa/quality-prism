import { SaveDataListService, SaveDataSummary } from '../application/services/SaveDataListService';

/**
 * セーブデータ一覧表示UI
 * ロードボタンから呼び出されるセーブデータ選択画面
 */
export class SaveDataListView {
  private saveDataList: SaveDataSummary[] = [];
  private htmlContent = '';

  constructor(
    private saveDataListService: SaveDataListService,
    private onSelectCallback: (id: string) => void,
    private onCancelCallback: () => void
  ) {}

  /**
   * セーブデータ一覧を表示
   */
  async show(): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const result = await this.saveDataListService.getSaveDataList();

      if (!result.success) {
        return {
          success: false,
          message: result.message,
        };
      }

      this.saveDataList = result.saveDataList || [];
      this.generateHtmlContent();

      return {
        success: true,
        message: `${this.saveDataList.length}件のセーブデータが見つかりました`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'セーブデータの読み込みに失敗しました',
      };
    }
  }

  /**
   * セーブデータを選択
   */
  async selectSaveData(id: string): Promise<void> {
    this.onSelectCallback(id);
  }

  /**
   * キャンセル
   */
  cancel(): void {
    this.onCancelCallback();
  }

  /**
   * HTML コンテンツを取得
   */
  getHtmlContent(): string {
    return this.htmlContent;
  }

  /**
   * HTML コンテンツを生成
   */
  private generateHtmlContent(): void {
    if (this.saveDataList.length === 0) {
      this.htmlContent = `
        <div class="save-data-list">
          <h2>セーブデータ一覧</h2>
          <div class="empty-message">
            <p>セーブデータがありません</p>
            <button class="cancel-button" onclick="cancelLoad()">戻る</button>
          </div>
        </div>
      `;
      return;
    }

    const saveDataItems = this.saveDataList
      .map(saveData => {
        const formattedDate = this.formatDate(saveData.lastUpdated);
        return `
          <div class="save-data-item" onclick="selectSaveData('${saveData.id}')">
            <div class="save-data-info">
              <div class="route-name">${saveData.routeName}</div>
              <div class="scene-info">シーン: ${saveData.sceneNumber}</div>
              <div class="last-updated">${formattedDate}</div>
            </div>
          </div>
        `;
      })
      .join('');

    this.htmlContent = `
      <div class="save-data-list">
        <h2>セーブデータ一覧</h2>
        <div class="save-data-items">
          ${saveDataItems}
        </div>
        <div class="controls">
          <button class="cancel-button" onclick="cancelLoad()">キャンセル</button>
        </div>
      </div>
    `;
  }

  /**
   * 日付をフォーマット
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}