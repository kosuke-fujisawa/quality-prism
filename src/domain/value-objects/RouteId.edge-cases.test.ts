import { describe, it, expect } from 'vitest';
import { RouteId } from './RouteId';

describe('RouteId エッジケース', () => {
  describe('特殊文字とUnicode処理', () => {
    it('日本語文字を含むルートIDを処理できる', () => {
      const routeId = RouteId.from('ルート１');
      expect(routeId.getValue()).toBe('ルート１');
      expect(routeId.isEmpty()).toBe(false);
    });

    it('絵文字を含むルートIDを処理できる', () => {
      const routeId = RouteId.from('route🎮');
      expect(routeId.getValue()).toBe('route🎮');
      expect(routeId.isEmpty()).toBe(false);
    });

    it('特殊記号を含むルートIDを処理できる', () => {
      const specialCases = [
        'route-1',
        'route.1',
        'route_1',
        'route@1',
        'route#1',
      ];

      specialCases.forEach((specialRoute) => {
        const routeId = RouteId.from(specialRoute);
        expect(routeId.getValue()).toBe(specialRoute);
        expect(routeId.isEmpty()).toBe(false);
      });
    });

    it('Unicode制御文字を含むルートIDを処理できる', () => {
      const routeWithTab = RouteId.from('route\t1');
      const routeWithNewline = RouteId.from('route\n1');

      expect(routeWithTab.getValue()).toBe('route\t1');
      expect(routeWithNewline.getValue()).toBe('route\n1');
    });

    it('空白文字の組み合わせを正しく処理する', () => {
      const routeId1 = RouteId.from(' route1 ');
      const routeId2 = RouteId.from('\t\n\r');

      expect(routeId1.getValue()).toBe(' route1 ');
      expect(routeId1.isEmpty()).toBe(false);

      expect(routeId2.getValue()).toBe('\t\n\r');
      expect(routeId2.isEmpty()).toBe(true); // 空白文字のみなのでtrue
    });
  });

  describe('境界値テスト', () => {
    it('非常に長いルートIDを処理できる', () => {
      const longRoute = 'a'.repeat(1000);
      const routeId = RouteId.from(longRoute);

      expect(routeId.getValue()).toBe(longRoute);
      expect(routeId.getValue().length).toBe(1000);
      expect(routeId.isEmpty()).toBe(false);
    });

    it('極端に長いルートIDでも等価性を正しく判定する', () => {
      const longRoute = 'route'.repeat(200);
      const routeId1 = RouteId.from(longRoute);
      const routeId2 = RouteId.from(longRoute);
      const routeId3 = RouteId.from(longRoute + '1');

      expect(routeId1.equals(routeId2)).toBe(true);
      expect(routeId1.equals(routeId3)).toBe(false);
    });

    it('単一文字のルートIDを処理できる', () => {
      const singleChar = RouteId.from('a');
      expect(singleChar.getValue()).toBe('a');
      expect(singleChar.isEmpty()).toBe(false);
    });
  });

  describe('数値と文字列の組み合わせ', () => {
    it('数値のみの文字列を処理できる', () => {
      const numericRoute = RouteId.from('123456');
      expect(numericRoute.getValue()).toBe('123456');
      expect(numericRoute.isEmpty()).toBe(false);
    });

    it('浮動小数点数形式の文字列を処理できる', () => {
      const floatRoute = RouteId.from('3.14159');
      expect(floatRoute.getValue()).toBe('3.14159');
      expect(floatRoute.isEmpty()).toBe(false);
    });

    it('科学的記数法の文字列を処理できる', () => {
      const scientificRoute = RouteId.from('1e10');
      expect(scientificRoute.getValue()).toBe('1e10');
      expect(scientificRoute.isEmpty()).toBe(false);
    });
  });

  describe('等価性の詳細テスト', () => {
    it('大文字小文字の違いを正しく判定する', () => {
      const routeId1 = RouteId.from('Route1');
      const routeId2 = RouteId.from('route1');

      expect(routeId1.equals(routeId2)).toBe(false);
    });

    it('前後の空白の違いを正しく判定する', () => {
      const routeId1 = RouteId.from('route1');
      const routeId2 = RouteId.from(' route1 ');

      expect(routeId1.equals(routeId2)).toBe(false);
    });

    it('同じオブジェクトとの等価性を確認する', () => {
      const routeId = RouteId.from('route1');
      expect(routeId.equals(routeId)).toBe(true);
    });
  });

  describe('文字列変換の詳細テスト', () => {
    it('特殊文字を含む場合の文字列変換', () => {
      const routeId = RouteId.from('route-1_test.2');
      expect(routeId.toString()).toBe('route-1_test.2');
    });

    it('Unicode文字を含む場合の文字列変換', () => {
      const routeId = RouteId.from('ルート🎮test');
      expect(routeId.toString()).toBe('ルート🎮test');
    });

    it('空文字列の場合の文字列変換', () => {
      const routeId = RouteId.empty();
      expect(routeId.toString()).toBe('');
    });
  });

  describe('複合的なエッジケース', () => {
    it('複数の特殊文字を組み合わせた場合', () => {
      const complexRoute = 'route-1_test.2@domain#section';
      const routeId = RouteId.from(complexRoute);

      expect(routeId.getValue()).toBe(complexRoute);
      expect(routeId.toString()).toBe(complexRoute);
      expect(routeId.isEmpty()).toBe(false);
    });

    it('Unicodeと特殊文字の混在', () => {
      const mixedRoute = 'ルート-1_テスト.2🎮';
      const routeId = RouteId.from(mixedRoute);

      expect(routeId.getValue()).toBe(mixedRoute);
      expect(routeId.isEmpty()).toBe(false);
    });

    it('空白文字とタブ文字の混在での空判定', () => {
      const whitespaceRoute = RouteId.from('   \t\n\r   ');
      expect(whitespaceRoute.isEmpty()).toBe(true);
    });
  });

  describe('メモリとパフォーマンス', () => {
    it('大量のRouteIdオブジェクト作成でのメモリ使用量', () => {
      const routes: RouteId[] = [];

      // 1000個のRouteIdを作成
      for (let i = 0; i < 1000; i++) {
        routes.push(RouteId.from(`route${i}`));
      }

      expect(routes.length).toBe(1000);
      expect(routes[0].getValue()).toBe('route0');
      expect(routes[999].getValue()).toBe('route999');
    });

    it('長文字列での等価性チェックのパフォーマンス', () => {
      const baseRoute = 'route'.repeat(100);
      const routeId1 = RouteId.from(baseRoute);
      const routeId2 = RouteId.from(baseRoute);
      const routeId3 = RouteId.from(baseRoute + 'diff');

      // パフォーマンステストとして実行時間を測定
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        routeId1.equals(routeId2);
        routeId1.equals(routeId3);
      }

      const end = performance.now();
      const duration = end - start;

      // 100回の等価性チェックが100ms以内で完了することを確認
      expect(duration).toBeLessThan(100);
      expect(routeId1.equals(routeId2)).toBe(true);
      expect(routeId1.equals(routeId3)).toBe(false);
    });
  });
});
