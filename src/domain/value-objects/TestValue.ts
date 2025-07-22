/**
 * CodeRabbit動作確認用のテスト値オブジェクト
 * TDD/DDD原則に従った実装例
 */
export class TestValue {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0) {
      throw new Error('値は0以上である必要があります');
    }
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }

  add(other: TestValue): TestValue {
    return new TestValue(this.value + other.getValue());
  }

  equals(other: TestValue): boolean {
    return this.value === other.getValue();
  }

  static zero(): TestValue {
    return new TestValue(0);
  }

  static from(value: number): TestValue {
    return new TestValue(value);
  }
}