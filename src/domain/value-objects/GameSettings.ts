/**
 * ゲーム設定を表す値オブジェクト
 */
export class GameSettings {
  private readonly volume: number;
  private readonly textSpeed: number;
  private readonly autoSave: boolean;

  constructor(volume: number, textSpeed: number, autoSave: boolean) {
    if (volume < 0 || volume > 1) {
      throw new Error('音量は0.0から1.0の間でなければなりません');
    }
    if (textSpeed <= 0) {
      throw new Error('テキスト速度は0より大きくなければなりません');
    }

    this.volume = volume;
    this.textSpeed = textSpeed;
    this.autoSave = autoSave;
  }

  getVolume(): number {
    return this.volume;
  }

  getTextSpeed(): number {
    return this.textSpeed;
  }

  isAutoSaveEnabled(): boolean {
    return this.autoSave;
  }

  withVolume(volume: number): GameSettings {
    return new GameSettings(volume, this.textSpeed, this.autoSave);
  }

  withTextSpeed(textSpeed: number): GameSettings {
    return new GameSettings(this.volume, textSpeed, this.autoSave);
  }

  withAutoSave(autoSave: boolean): GameSettings {
    return new GameSettings(this.volume, this.textSpeed, autoSave);
  }

  equals(other: GameSettings): boolean {
    return (
      this.volume === other.volume &&
      this.textSpeed === other.textSpeed &&
      this.autoSave === other.autoSave
    );
  }

  static default(): GameSettings {
    return new GameSettings(0.8, 1.0, true);
  }
}
