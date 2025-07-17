/**
 * ルートを識別する値オブジェクト
 */
export class RouteId {
  private readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: RouteId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value === '' || this.value.trim() === '';
  }

  static from(value: string): RouteId {
    return new RouteId(value);
  }

  static empty(): RouteId {
    return new RouteId('');
  }
}
