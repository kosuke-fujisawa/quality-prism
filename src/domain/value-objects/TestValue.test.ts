import { describe, it, expect } from 'vitest';
import { TestValue } from './TestValue';

describe('TestValue', () => {
  describe('基本機能', () => {
    it('有効な値で作成できる', () => {
      const testValue = TestValue.from(10);
      expect(testValue.getValue()).toBe(10);
    });

    it('0で作成できる', () => {
      const zero = TestValue.zero();
      expect(zero.getValue()).toBe(0);
    });

    it('負の値で例外を投げる', () => {
      expect(() => TestValue.from(-1)).toThrow('値は0以上である必要があります');
    });
  });

  describe('演算機能', () => {
    it('値を加算できる', () => {
      const value1 = TestValue.from(5);
      const value2 = TestValue.from(3);
      const result = value1.add(value2);
      
      expect(result.getValue()).toBe(8);
    });

    it('等価性をチェックできる', () => {
      const value1 = TestValue.from(10);
      const value2 = TestValue.from(10);
      const value3 = TestValue.from(20);

      expect(value1.equals(value2)).toBe(true);
      expect(value1.equals(value3)).toBe(false);
    });
  });

  describe('エッジケース', () => {
    it('大きな値で計算できる', () => {
      const large1 = TestValue.from(Number.MAX_SAFE_INTEGER - 1);
      const small = TestValue.from(1);
      const result = large1.add(small);
      
      expect(result.getValue()).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('0との加算は元の値を返す', () => {
      const value = TestValue.from(42);
      const zero = TestValue.zero();
      const result = value.add(zero);
      
      expect(result.getValue()).toBe(42);
    });
  });
});