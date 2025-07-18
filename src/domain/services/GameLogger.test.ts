import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameLogger } from './GameLogger';
import {
  LogLevel,
  LogLayer,
  ILogAppender,
  GameLogContext,
} from '../interfaces/ILogger';

describe('GameLogger', () => {
  let mockAppender: ILogAppender;
  let gameLogger: GameLogger;

  beforeEach(() => {
    mockAppender = {
      append: vi.fn(),
    };
    gameLogger = new GameLogger([mockAppender], LogLevel.DEBUG);
  });

  describe('ゲームアクション', () => {
    it('ゲームアクションをログできる', () => {
      const context: GameLogContext = {
        userId: 'user-123',
        routeId: 'route1',
        sceneNumber: 5,
      };

      gameLogger.logGameAction('menu-selection', context);

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          message: 'Game action: menu-selection',
          context: expect.objectContaining({
            ...context,
            layer: LogLayer.DOMAIN,
            operation: 'game-action',
            metadata: expect.objectContaining({
              action: 'menu-selection',
            }),
          }),
        })
      );
    });

    it('コンテキストなしでもゲームアクションをログできる', () => {
      gameLogger.logGameAction('game-start');

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          message: 'Game action: game-start',
          context: expect.objectContaining({
            layer: LogLayer.DOMAIN,
            operation: 'game-action',
            metadata: expect.objectContaining({
              action: 'game-start',
            }),
          }),
        })
      );
    });
  });

  describe('状態変更', () => {
    it('状態変更をログできる', () => {
      const context: GameLogContext = {
        userId: 'user-123',
        gameState: 'playing',
      };

      gameLogger.logStateChange('menu', 'game', context);

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          message: 'State change: menu -> game',
          context: expect.objectContaining({
            ...context,
            layer: LogLayer.DOMAIN,
            operation: 'state-change',
            metadata: expect.objectContaining({
              fromState: 'menu',
              toState: 'game',
            }),
          }),
        })
      );
    });
  });

  describe('パフォーマンス', () => {
    it('通常のパフォーマンスはDEBUGレベルでログする', () => {
      gameLogger.logPerformance('scene-load', 500);

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.DEBUG,
          message: 'Operation completed: scene-load took 500ms',
          context: expect.objectContaining({
            layer: LogLayer.DOMAIN,
            operation: 'performance',
            metadata: expect.objectContaining({
              operationName: 'scene-load',
              durationMs: 500,
            }),
          }),
        })
      );
    });

    it('遅い操作はWARNレベルでログする', () => {
      gameLogger.logPerformance('heavy-operation', 1500);

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.WARN,
          message: 'Slow operation detected: heavy-operation took 1500ms',
          context: expect.objectContaining({
            layer: LogLayer.DOMAIN,
            operation: 'performance',
            metadata: expect.objectContaining({
              operationName: 'heavy-operation',
              durationMs: 1500,
            }),
          }),
        })
      );
    });
  });

  describe('ゲーム固有メソッド', () => {
    it('ルート選択をログできる', () => {
      const context: GameLogContext = {
        userId: 'user-123',
      };

      gameLogger.logRouteSelection('route2', context);

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          message: 'Game action: route-selection',
          context: expect.objectContaining({
            ...context,
            routeId: 'route2',
            layer: LogLayer.DOMAIN,
            operation: 'game-action',
            metadata: expect.objectContaining({
              action: 'route-selection',
              selectedRoute: 'route2',
            }),
          }),
        })
      );
    });

    it('シーン進行をログできる', () => {
      gameLogger.logSceneProgress('route1', 3);

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          message: 'Game action: scene-progress',
          context: expect.objectContaining({
            routeId: 'route1',
            sceneNumber: 3,
            layer: LogLayer.DOMAIN,
            operation: 'game-action',
            metadata: expect.objectContaining({
              action: 'scene-progress',
              currentRoute: 'route1',
              currentScene: 3,
            }),
          }),
        })
      );
    });

    it('ゲーム完了をログできる', () => {
      gameLogger.logGameCompletion('route1');

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          message: 'Game action: game-completion',
          context: expect.objectContaining({
            routeId: 'route1',
            metadata: expect.objectContaining({
              action: 'game-completion',
              completedRoute: 'route1',
            }),
          }),
        })
      );
    });

    it('成功したセーブ操作をINFOレベルでログする', () => {
      gameLogger.logSaveLoad('save', true);

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          message: 'save operation successful',
          context: expect.objectContaining({
            operation: 'save-load-save',
            metadata: expect.objectContaining({
              operationType: 'save',
              success: true,
            }),
          }),
        })
      );
    });

    it('失敗したロード操作をWARNレベルでログする', () => {
      gameLogger.logSaveLoad('load', false);

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.WARN,
          message: 'load operation failed',
          context: expect.objectContaining({
            operation: 'save-load-load',
            metadata: expect.objectContaining({
              operationType: 'load',
              success: false,
            }),
          }),
        })
      );
    });
  });

  describe('メタデータの結合', () => {
    it('既存のメタデータと新しいメタデータを結合する', () => {
      const context: GameLogContext = {
        metadata: {
          existingKey: 'existingValue',
        },
      };

      gameLogger.logGameAction('test-action', context);

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            metadata: expect.objectContaining({
              existingKey: 'existingValue',
              action: 'test-action',
            }),
          }),
        })
      );
    });
  });
});