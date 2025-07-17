import { describe, it, expect } from 'vitest';
import { TextLogEntry } from './TextLogEntry';
import { RouteId } from '../value-objects/RouteId';
import { SceneNumber } from '../value-objects/SceneNumber';

describe('TextLogEntry', () => {
  describe('constructor', () => {
    it('有効な値でTextLogEntryを作成できる', () => {
      const route = RouteId.from('route1');
      const scene = SceneNumber.from(5);
      const text = 'テストメッセージ';
      const timestamp = new Date('2023-01-01T10:00:00Z');

      const entry = new TextLogEntry('test-id', route, scene, text, timestamp);

      expect(entry.getId()).toBe('test-id');
      expect(entry.getRoute().equals(route)).toBe(true);
      expect(entry.getScene().equals(scene)).toBe(true);
      expect(entry.getText()).toBe(text);
      expect(entry.getTimestamp()).toEqual(timestamp);
    });

    it('空のテキストでは作成できない', () => {
      const route = RouteId.from('route1');
      const scene = SceneNumber.from(5);
      const timestamp = new Date();

      expect(() => new TextLogEntry('test-id', route, scene, '', timestamp)).toThrow(
        'テキストは空にできません'
      );
    });

    it('空白のみのテキストでは作成できない', () => {
      const route = RouteId.from('route1');
      const scene = SceneNumber.from(5);
      const timestamp = new Date();

      expect(() => new TextLogEntry('test-id', route, scene, '   ', timestamp)).toThrow(
        'テキストは空にできません'
      );
    });
  });

  describe('isFromRoute', () => {
    it('同じルートの場合はtrueを返す', () => {
      const route = RouteId.from('route1');
      const scene = SceneNumber.from(5);
      const entry = new TextLogEntry('test-id', route, scene, 'テスト', new Date());

      expect(entry.isFromRoute(RouteId.from('route1'))).toBe(true);
    });

    it('異なるルートの場合はfalseを返す', () => {
      const route = RouteId.from('route1');
      const scene = SceneNumber.from(5);
      const entry = new TextLogEntry('test-id', route, scene, 'テスト', new Date());

      expect(entry.isFromRoute(RouteId.from('route2'))).toBe(false);
    });
  });

  describe('isFromScene', () => {
    it('同じシーンの場合はtrueを返す', () => {
      const route = RouteId.from('route1');
      const scene = SceneNumber.from(5);
      const entry = new TextLogEntry('test-id', route, scene, 'テスト', new Date());

      expect(entry.isFromScene(SceneNumber.from(5))).toBe(true);
    });

    it('異なるシーンの場合はfalseを返す', () => {
      const route = RouteId.from('route1');
      const scene = SceneNumber.from(5);
      const entry = new TextLogEntry('test-id', route, scene, 'テスト', new Date());

      expect(entry.isFromScene(SceneNumber.from(6))).toBe(false);
    });
  });

  describe('create', () => {
    it('新しいTextLogEntryを作成できる', () => {
      const route = RouteId.from('route1');
      const scene = SceneNumber.from(5);
      const text = 'テストメッセージ';

      const entry = TextLogEntry.create(route, scene, text);

      expect(entry.getId()).toBeDefined();
      expect(entry.getId()).not.toBe('');
      expect(entry.getRoute().equals(route)).toBe(true);
      expect(entry.getScene().equals(scene)).toBe(true);
      expect(entry.getText()).toBe(text);
      expect(entry.getTimestamp()).toBeInstanceOf(Date);
    });

    it('IDは一意である', () => {
      const route = RouteId.from('route1');
      const scene = SceneNumber.from(5);
      const text = 'テストメッセージ';

      const entry1 = TextLogEntry.create(route, scene, text);
      const entry2 = TextLogEntry.create(route, scene, text);

      expect(entry1.getId()).not.toBe(entry2.getId());
    });

    it('タイムスタンプは現在時刻に近い', () => {
      const route = RouteId.from('route1');
      const scene = SceneNumber.from(5);
      const text = 'テストメッセージ';
      const beforeCreate = new Date();

      const entry = TextLogEntry.create(route, scene, text);
      const afterCreate = new Date();

      expect(entry.getTimestamp().getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(entry.getTimestamp().getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });

  describe('restore', () => {
    it('既存データからTextLogEntryを復元できる', () => {
      const id = 'test-id';
      const route = 'route1';
      const scene = 5;
      const text = 'テストメッセージ';
      const timestamp = new Date('2023-01-01T10:00:00Z');

      const entry = TextLogEntry.restore(id, route, scene, text, timestamp);

      expect(entry.getId()).toBe(id);
      expect(entry.getRoute().getValue()).toBe(route);
      expect(entry.getScene().getValue()).toBe(scene);
      expect(entry.getText()).toBe(text);
      expect(entry.getTimestamp()).toEqual(timestamp);
    });

    it('復元時も不正なテキストは拒否される', () => {
      const id = 'test-id';
      const route = 'route1';
      const scene = 5;
      const timestamp = new Date('2023-01-01T10:00:00Z');

      expect(() => TextLogEntry.restore(id, route, scene, '', timestamp)).toThrow(
        'テキストは空にできません'
      );
    });
  });

  describe('getTimestamp', () => {
    it('タイムスタンプのコピーを返す', () => {
      const route = RouteId.from('route1');
      const scene = SceneNumber.from(5);
      const originalTimestamp = new Date('2023-01-01T10:00:00Z');
      const entry = new TextLogEntry('test-id', route, scene, 'テスト', originalTimestamp);

      const retrievedTimestamp = entry.getTimestamp();
      retrievedTimestamp.setTime(0); // 取得したタイムスタンプを変更

      // 元のタイムスタンプは変更されていない
      expect(entry.getTimestamp()).toEqual(originalTimestamp);
    });
  });
});