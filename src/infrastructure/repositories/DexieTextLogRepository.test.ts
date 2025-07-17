import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DexieTextLogRepository } from './DexieTextLogRepository';
import { TextLogEntry } from '../../domain/entities/TextLogEntry';
import { RouteId } from '../../domain/value-objects/RouteId';
import { SceneNumber } from '../../domain/value-objects/SceneNumber';
import { TEST_CONSTANTS } from '../../test/utils/testHelpers';

describe('DexieTextLogRepository', () => {
  let repository: DexieTextLogRepository;

  beforeEach(() => {
    repository = new DexieTextLogRepository();
  });

  afterEach(async () => {
    await repository.deleteAll();
  });

  describe('save', () => {
    it('テキストログエントリを保存できる', async () => {
      const entry = TextLogEntry.create(
        RouteId.from(TEST_CONSTANTS.ROUTE1),
        SceneNumber.from(1),
        'こんにちは、世界！'
      );

      await repository.save(entry);

      const savedEntries = await repository.findAll();
      expect(savedEntries).toHaveLength(1);
      expect(savedEntries[0].getId()).toBe(entry.getId());
      expect(savedEntries[0].getRoute().getValue()).toBe(TEST_CONSTANTS.ROUTE1);
      expect(savedEntries[0].getScene().getValue()).toBe(1);
      expect(savedEntries[0].getText()).toBe('こんにちは、世界！');
    });

    it('複数のエントリを保存できる', async () => {
      const entries = [
        TextLogEntry.create(
          RouteId.from(TEST_CONSTANTS.ROUTE1),
          SceneNumber.from(1),
          'メッセージ1'
        ),
        TextLogEntry.create(
          RouteId.from(TEST_CONSTANTS.ROUTE1),
          SceneNumber.from(2),
          'メッセージ2'
        ),
        TextLogEntry.create(
          RouteId.from(TEST_CONSTANTS.ROUTE2),
          SceneNumber.from(1),
          'メッセージ3'
        )
      ];

      for (const entry of entries) {
        await repository.save(entry);
      }

      const savedEntries = await repository.findAll();
      expect(savedEntries).toHaveLength(3);
    });
  });

  describe('findByRoute', () => {
    beforeEach(async () => {
      // テストデータを準備（時間差で作成してタイムスタンプを異なるものにする）
      const entry1 = TextLogEntry.create(
        RouteId.from(TEST_CONSTANTS.ROUTE1),
        SceneNumber.from(1),
        'route1のメッセージ1'
      );
      await repository.save(entry1);
      
      // 少し時間をおいて次のエントリを作成
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const entry2 = TextLogEntry.create(
        RouteId.from(TEST_CONSTANTS.ROUTE1),
        SceneNumber.from(2),
        'route1のメッセージ2'
      );
      await repository.save(entry2);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const entry3 = TextLogEntry.create(
        RouteId.from(TEST_CONSTANTS.ROUTE2),
        SceneNumber.from(1),
        'route2のメッセージ1'
      );
      await repository.save(entry3);
    });

    it('指定されたルートのテキストログを取得できる', async () => {
      const route1Entries = await repository.findByRoute(RouteId.from(TEST_CONSTANTS.ROUTE1));
      
      expect(route1Entries).toHaveLength(2);
      expect(route1Entries[0].getText()).toBe('route1のメッセージ1');
      expect(route1Entries[1].getText()).toBe('route1のメッセージ2');
    });

    it('存在しないルートの場合は空配列を返す', async () => {
      const entries = await repository.findByRoute(RouteId.from('nonexistent'));
      expect(entries).toHaveLength(0);
    });
  });

  describe('findByRouteAndScene', () => {
    beforeEach(async () => {
      // テストデータを準備（時間差で作成してタイムスタンプを異なるものにする）
      const entry1 = TextLogEntry.create(
        RouteId.from(TEST_CONSTANTS.ROUTE1),
        SceneNumber.from(1),
        'route1-scene1のメッセージ1'
      );
      await repository.save(entry1);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const entry2 = TextLogEntry.create(
        RouteId.from(TEST_CONSTANTS.ROUTE1),
        SceneNumber.from(1),
        'route1-scene1のメッセージ2'
      );
      await repository.save(entry2);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const entry3 = TextLogEntry.create(
        RouteId.from(TEST_CONSTANTS.ROUTE1),
        SceneNumber.from(2),
        'route1-scene2のメッセージ1'
      );
      await repository.save(entry3);
    });

    it('指定されたルートとシーンのテキストログを取得できる', async () => {
      const entries = await repository.findByRouteAndScene(
        RouteId.from(TEST_CONSTANTS.ROUTE1),
        SceneNumber.from(1)
      );
      
      expect(entries).toHaveLength(2);
      expect(entries[0].getText()).toBe('route1-scene1のメッセージ1');
      expect(entries[1].getText()).toBe('route1-scene1のメッセージ2');
    });

    it('存在しないルートとシーンの場合は空配列を返す', async () => {
      const entries = await repository.findByRouteAndScene(
        RouteId.from('nonexistent'),
        SceneNumber.from(999)
      );
      expect(entries).toHaveLength(0);
    });
  });

  describe('findAll', () => {
    it('全てのテキストログを取得できる', async () => {
      const entries = [
        TextLogEntry.create(
          RouteId.from(TEST_CONSTANTS.ROUTE1),
          SceneNumber.from(1),
          'メッセージ1'
        ),
        TextLogEntry.create(
          RouteId.from(TEST_CONSTANTS.ROUTE2),
          SceneNumber.from(1),
          'メッセージ2'
        )
      ];

      for (const entry of entries) {
        await repository.save(entry);
      }

      const allEntries = await repository.findAll();
      expect(allEntries).toHaveLength(2);
    });

    it('空の場合は空配列を返す', async () => {
      const entries = await repository.findAll();
      expect(entries).toHaveLength(0);
    });
  });

  describe('deleteByRoute', () => {
    beforeEach(async () => {
      // テストデータを準備
      const entries = [
        TextLogEntry.create(
          RouteId.from(TEST_CONSTANTS.ROUTE1),
          SceneNumber.from(1),
          'route1のメッセージ1'
        ),
        TextLogEntry.create(
          RouteId.from(TEST_CONSTANTS.ROUTE1),
          SceneNumber.from(2),
          'route1のメッセージ2'
        ),
        TextLogEntry.create(
          RouteId.from(TEST_CONSTANTS.ROUTE2),
          SceneNumber.from(1),
          'route2のメッセージ1'
        )
      ];

      for (const entry of entries) {
        await repository.save(entry);
      }
    });

    it('指定されたルートのテキストログを削除できる', async () => {
      await repository.deleteByRoute(RouteId.from(TEST_CONSTANTS.ROUTE1));

      const route1Entries = await repository.findByRoute(RouteId.from(TEST_CONSTANTS.ROUTE1));
      const route2Entries = await repository.findByRoute(RouteId.from(TEST_CONSTANTS.ROUTE2));

      expect(route1Entries).toHaveLength(0);
      expect(route2Entries).toHaveLength(1);
    });

    it('存在しないルートの削除は何もしない', async () => {
      const beforeCount = (await repository.findAll()).length;
      
      await repository.deleteByRoute(RouteId.from('nonexistent'));
      
      const afterCount = (await repository.findAll()).length;
      expect(afterCount).toBe(beforeCount);
    });
  });

  describe('deleteAll', () => {
    it('全てのテキストログを削除できる', async () => {
      const entries = [
        TextLogEntry.create(
          RouteId.from(TEST_CONSTANTS.ROUTE1),
          SceneNumber.from(1),
          'メッセージ1'
        ),
        TextLogEntry.create(
          RouteId.from(TEST_CONSTANTS.ROUTE2),
          SceneNumber.from(1),
          'メッセージ2'
        )
      ];

      for (const entry of entries) {
        await repository.save(entry);
      }

      await repository.deleteAll();

      const allEntries = await repository.findAll();
      expect(allEntries).toHaveLength(0);
    });

    it('空の状態での削除は何もしない', async () => {
      await repository.deleteAll();
      
      const allEntries = await repository.findAll();
      expect(allEntries).toHaveLength(0);
    });
  });

  describe('エラーハンドリング', () => {
    it('特殊文字を含むデータの保存と取得', async () => {
      const entry = TextLogEntry.create(
        RouteId.from('特殊ルート🎮'),
        SceneNumber.from(1),
        'こんにちは\n改行あり\tタブあり'
      );

      await repository.save(entry);

      const savedEntries = await repository.findAll();
      expect(savedEntries).toHaveLength(1);
      expect(savedEntries[0].getRoute().getValue()).toBe('特殊ルート🎮');
      expect(savedEntries[0].getText()).toBe('こんにちは\n改行あり\tタブあり');
    });
  });

  describe('パフォーマンステスト', () => {
    it('大量のデータの保存と取得', async () => {
      const entries: TextLogEntry[] = [];
      
      // 100個のエントリを作成
      for (let i = 0; i < 100; i++) {
        entries.push(
          TextLogEntry.create(
            RouteId.from(`route${i % 5}`),
            SceneNumber.from(i),
            `Message ${i}`
          )
        );
      }

      // 保存のパフォーマンステスト
      const saveStart = performance.now();
      for (const entry of entries) {
        await repository.save(entry);
      }
      const saveEnd = performance.now();

      // 取得のパフォーマンステスト
      const findStart = performance.now();
      const allEntries = await repository.findAll();
      const findEnd = performance.now();

      expect(allEntries).toHaveLength(100);
      expect(saveEnd - saveStart).toBeLessThan(500); // 500ms以内
      expect(findEnd - findStart).toBeLessThan(100); // 100ms以内
    });

    it('複雑なクエリのパフォーマンス', async () => {
      // 複数のルートに大量のデータを作成
      for (let route = 0; route < 5; route++) {
        for (let scene = 0; scene < 20; scene++) {
          await repository.save(
            TextLogEntry.create(
              RouteId.from(`route${route}`),
              SceneNumber.from(scene),
              `Message route${route} scene${scene}`
            )
          );
        }
      }

      // 特定のルートでの検索パフォーマンス
      const start = performance.now();
      const route1Entries = await repository.findByRoute(RouteId.from('route1'));
      const end = performance.now();

      expect(route1Entries).toHaveLength(20);
      expect(end - start).toBeLessThan(50); // 50ms以内
    });
  });
});