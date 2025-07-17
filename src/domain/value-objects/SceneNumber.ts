/**
 * シーン番号を表す値オブジェクト
 */
export class SceneNumber {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0) {
      throw new Error('シーン番号は0以上でなければなりません');
    }
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }

  next(): SceneNumber {
    return new SceneNumber(this.value + 1);
  }

  equals(other: SceneNumber): boolean {
    return this.value === other.value;
  }

  isLastScene(maxScenes: number): boolean {
    return this.value >= maxScenes - 1;
  }

  toString(): string {
    return this.value.toString();
  }

  static from(value: number): SceneNumber {
    return new SceneNumber(value);
  }

  static zero(): SceneNumber {
    return new SceneNumber(0);
  }
}
