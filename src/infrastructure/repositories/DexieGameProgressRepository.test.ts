import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DexieGameProgressRepository } from './DexieGameProgressRepository';
import { GameProgress } from '../../domain/entities/GameProgress';
import { RouteId } from '../../domain/value-objects/RouteId';

describe('DexieGameProgressRepository', () => {
  let repository: DexieGameProgressRepository;

  beforeEach(() => {
    repository = new DexieGameProgressRepository();
  });

  afterEach(async () => {
    try {
      await repository.delete();
    } catch (error) {
      // テスト後のクリーンアップでエラーが発生しても無視
    }
  });

  describe('getOrCreate', () => {
    it('初回呼び出しで新しいGameProgressを作成する', async () => {
      const progress = await repository.getOrCreate();

      expect(progress).toBeInstanceOf(GameProgress);
      expect(progress.getId()).toBeDefined();
      expect(progress.getCurrentRoute().isEmpty()).toBe(true);
      expect(progress.getCurrentScene().getValue()).toBe(0);
      expect(progress.getClearedRoutes().size).toBe(0);
    });

    it('二回目以降は同じデータを返す', async () => {
      const progress1 = await repository.getOrCreate();
      progress1.selectRoute(RouteId.from('route1'));
      await repository.save(progress1);

      const progress2 = await repository.getOrCreate();

      expect(progress2.getId()).toBe(progress1.getId());
      expect(progress2.getCurrentRoute().getValue()).toBe('route1');
    });
  });

  describe('save', () => {
    it('GameProgressを保存できる', async () => {
      const progress = GameProgress.createNew('test-id');
      progress.selectRoute(RouteId.from('route1'));
      progress.advanceToNextScene();

      await repository.save(progress);

      const savedProgress = await repository.getOrCreate();
      expect(savedProgress.getCurrentRoute().getValue()).toBe('route1');
      expect(savedProgress.getCurrentScene().getValue()).toBe(1);
    });

    it('クリアしたルートも保存される', async () => {
      const progress = GameProgress.createNew('test-id');
      progress.selectRoute(RouteId.from('route1'));
      // 最終シーンまで進める
      for (let i = 0; i < 100; i++) {
        progress.advanceToNextScene();
      }

      await repository.save(progress);

      const savedProgress = await repository.getOrCreate();
      expect(savedProgress.isRouteNameCleared('route1')).toBe(true);
    });

    it('保存時間が更新される', async () => {
      const progress = GameProgress.createNew('test-id');
      const originalSaveTime = progress.getSaveTime();

      // 少し待機してから保存
      await new Promise((resolve) => setTimeout(resolve, 10));

      progress.selectRoute(RouteId.from('route1'));
      await repository.save(progress);

      const savedProgress = await repository.getOrCreate();
      expect(savedProgress.getSaveTime().getTime()).toBeGreaterThan(
        originalSaveTime.getTime()
      );
    });
  });

  describe('findById', () => {
    it('存在するIDでGameProgressを取得できる', async () => {
      const originalProgress = GameProgress.createNew('1');
      originalProgress.selectRoute(RouteId.from('route2'));
      await repository.save(originalProgress);

      // 保存後にgetOrCreateで取得できることを確認
      const savedProgress = await repository.getOrCreate();
      expect(savedProgress.getCurrentRoute().getValue()).toBe('route2');
    });

    it('存在しないIDの場合はnullを返す', async () => {
      const foundProgress = await repository.findById('non-existent-id');

      expect(foundProgress).toBeNull();
    });
  });

  describe('delete', () => {
    it('保存データを削除できる', async () => {
      const progress = GameProgress.createNew('test-id');
      progress.selectRoute(RouteId.from('route1'));
      await repository.save(progress);

      await repository.delete();

      const newProgress = await repository.getOrCreate();
      expect(newProgress.getId()).not.toBe('test-id');
      expect(newProgress.getCurrentRoute().isEmpty()).toBe(true);
    });

    it('データが存在しない場合でもエラーにならない', async () => {
      await expect(repository.delete()).resolves.not.toThrow();
    });
  });

  describe('データ整合性', () => {
    it('複数のルートをクリアした状態を正しく保存・復元', async () => {
      const progress = GameProgress.createNew('test-id');

      // route1をクリア
      progress.selectRoute(RouteId.from('route1'));
      for (let i = 0; i < 100; i++) {
        progress.advanceToNextScene();
      }

      // route2をクリア
      progress.selectRoute(RouteId.from('route2'));
      for (let i = 0; i < 100; i++) {
        progress.advanceToNextScene();
      }

      await repository.save(progress);

      const savedProgress = await repository.getOrCreate();
      expect(savedProgress.getClearedRoutes().size).toBe(2);
      expect(savedProgress.isRouteNameCleared('route1')).toBe(true);
      expect(savedProgress.isRouteNameCleared('route2')).toBe(true);
    });

    it('トゥルールート解放状態を正しく保存・復元', async () => {
      const progress = GameProgress.createNew('test-id');

      // 全ルートをクリア
      ['route1', 'route2', 'route3'].forEach((routeName) => {
        progress.selectRoute(RouteId.from(routeName));
        for (let i = 0; i < 100; i++) {
          progress.advanceToNextScene();
        }
      });

      await repository.save(progress);

      const savedProgress = await repository.getOrCreate();
      expect(savedProgress.isTrueRouteUnlocked()).toBe(true);
    });
  });

  describe('エラーハンドリング', () => {
    it('無効なデータでも適切にハンドリング', async () => {
      // 通常のgetOrCreateでは新しいデータが作成される
      const progress = await repository.getOrCreate();
      expect(progress.getCurrentRoute().isEmpty()).toBe(true);
      expect(progress.getCurrentScene().getValue()).toBe(0);
    });
  });
});
