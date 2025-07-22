import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RepositoryLogger } from './RepositoryLogger';
import {
  LogLevel,
  LogLayer,
  ILogAppender,
} from '../../domain/interfaces/ILogger';

describe('RepositoryLogger', () => {
  let mockAppender: ILogAppender;
  let repositoryLogger: RepositoryLogger;

  beforeEach(() => {
    mockAppender = {
      append: vi.fn(),
    };
    repositoryLogger = new RepositoryLogger([mockAppender], LogLevel.DEBUG);
  });

  describe('クエリログ', () => {
    it('クエリをログできる', () => {
      const params = { id: 123, name: 'test' };
      repositoryLogger.logQuery('GameProgressRepository', 'findById', params);

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.DEBUG,
          message: 'Repository query: GameProgressRepository.findById',
          context: expect.objectContaining({
            layer: LogLayer.INFRASTRUCTURE,
            operation: 'repository-query',
            metadata: expect.objectContaining({
              repository: 'GameProgressRepository',
              operationType: 'findById',
              parameters: params,
            }),
          }),
        })
      );
    });

    it('パラメータなしでもクエリをログできる', () => {
      repositoryLogger.logQuery('GameProgressRepository', 'findAll');

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Repository query: GameProgressRepository.findAll',
          context: expect.objectContaining({
            metadata: expect.objectContaining({
              parameters: undefined,
            }),
          }),
        })
      );
    });
  });

  describe('クエリ結果ログ', () => {
    it('クエリ結果をログできる', () => {
      repositoryLogger.logQueryResult('GameProgressRepository', 'findAll', 5);

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.DEBUG,
          message:
            'Repository result: GameProgressRepository.findAll returned 5 items',
          context: expect.objectContaining({
            layer: LogLayer.INFRASTRUCTURE,
            operation: 'repository-result',
            metadata: expect.objectContaining({
              repository: 'GameProgressRepository',
              operationType: 'findAll',
              resultCount: 5,
            }),
          }),
        })
      );
    });
  });

  describe('クエリエラーログ', () => {
    it('クエリエラーをログできる', () => {
      const error = new Error('Database connection failed');
      repositoryLogger.logQueryError('GameProgressRepository', 'save', error);

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.ERROR,
          message: 'Repository error: GameProgressRepository.save failed',
          error,
          context: expect.objectContaining({
            layer: LogLayer.INFRASTRUCTURE,
            operation: 'repository-error',
            metadata: expect.objectContaining({
              repository: 'GameProgressRepository',
              operationType: 'save',
              errorType: 'Error',
              errorMessage: 'Database connection failed',
            }),
          }),
        })
      );
    });
  });

  describe('接続状態ログ', () => {
    it('接続成功をログできる', () => {
      repositoryLogger.logConnection('GameProgressRepository', 'connected');

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          message: 'Repository connected: GameProgressRepository',
          context: expect.objectContaining({
            metadata: expect.objectContaining({
              connectionStatus: 'connected',
            }),
          }),
        })
      );
    });

    it('切断をログできる', () => {
      repositoryLogger.logConnection('GameProgressRepository', 'disconnected');

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          message: 'Repository disconnected: GameProgressRepository',
        })
      );
    });

    it('接続エラーをログできる', () => {
      repositoryLogger.logConnection('GameProgressRepository', 'error');

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.ERROR,
          message: 'Repository connection error: GameProgressRepository',
        })
      );
    });
  });

  describe('キャッシュ操作ログ', () => {
    it('キャッシュヒットをログできる', () => {
      repositoryLogger.logCacheOperation(
        'GameProgressRepository',
        'hit',
        'user-123'
      );

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.DEBUG,
          message: 'Cache hit: GameProgressRepository [user-123]',
          context: expect.objectContaining({
            metadata: expect.objectContaining({
              cacheOperation: 'hit',
              cacheKey: 'user-123',
            }),
          }),
        })
      );
    });

    it('キーなしでキャッシュ操作をログできる', () => {
      repositoryLogger.logCacheOperation(
        'GameProgressRepository',
        'invalidate'
      );

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Cache invalidate: GameProgressRepository',
          context: expect.objectContaining({
            metadata: expect.objectContaining({
              cacheOperation: 'invalidate',
              cacheKey: undefined,
            }),
          }),
        })
      );
    });
  });

  describe('パフォーマンス指標ログ', () => {
    it('通常のパフォーマンスはDEBUGレベルでログする', () => {
      const metrics = {
        duration: 200,
        recordCount: 10,
        memoryUsage: 1024,
      };

      repositoryLogger.logPerformanceMetrics(
        'GameProgressRepository',
        'findAll',
        metrics
      );

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.DEBUG,
          message:
            'Repository performance: GameProgressRepository.findAll took 200ms',
          context: expect.objectContaining({
            metadata: expect.objectContaining({
              repository: 'GameProgressRepository',
              operationType: 'findAll',
              duration: 200,
              recordCount: 10,
              memoryUsage: 1024,
            }),
          }),
        })
      );
    });

    it('遅い操作はWARNレベルでログする', () => {
      const metrics = { duration: 800 };

      repositoryLogger.logPerformanceMetrics(
        'GameProgressRepository',
        'complexQuery',
        metrics
      );

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.WARN,
          message:
            'Slow repository operation: GameProgressRepository.complexQuery took 800ms',
        })
      );
    });
  });

  describe('パラメータサニタイズ', () => {
    it('機密情報を含むパラメータをマスクする', () => {
      const params = {
        username: 'testuser',
        password: 'secret123',
        apiKey: 'abc123def456',
        data: 'normal data',
      };

      repositoryLogger.logQuery('UserRepository', 'authenticate', params);

      const call = (mockAppender.append as any).mock.calls[0][0];
      const sanitizedParams = call.context.metadata.parameters;

      expect(sanitizedParams.username).toBe('testuser');
      expect(sanitizedParams.password).toBe('[MASKED]');
      expect(sanitizedParams.apiKey).toBe('[MASKED]');
      expect(sanitizedParams.data).toBe('normal data');
    });

    it('ネストしたオブジェクトの機密情報もマスクする', () => {
      const params = {
        user: {
          name: 'testuser',
          credential: 'secret',
        },
        settings: {
          theme: 'dark',
          privateKey: 'key123',
        },
      };

      repositoryLogger.logQuery('UserRepository', 'updateUser', params);

      const call = (mockAppender.append as any).mock.calls[0][0];
      const sanitizedParams = call.context.metadata.parameters;

      expect(sanitizedParams.user.name).toBe('testuser');
      expect(sanitizedParams.user.credential).toBe('[MASKED]');
      expect(sanitizedParams.settings.theme).toBe('dark');
      expect(sanitizedParams.settings.privateKey).toBe('[MASKED]');
    });

    it('配列内の機密情報もマスクする', () => {
      const params = [
        { id: 1, password: 'secret1' },
        { id: 2, password: 'secret2' },
      ];

      repositoryLogger.logQuery('UserRepository', 'batchUpdate', params);

      const call = (mockAppender.append as any).mock.calls[0][0];
      const sanitizedParams = call.context.metadata.parameters;

      expect(sanitizedParams[0].id).toBe(1);
      expect(sanitizedParams[0].password).toBe('[MASKED]');
      expect(sanitizedParams[1].id).toBe(2);
      expect(sanitizedParams[1].password).toBe('[MASKED]');
    });

    it('プリミティブ型のパラメータはそのまま返す', () => {
      repositoryLogger.logQuery('GameProgressRepository', 'findById', 123);

      const call = (mockAppender.append as any).mock.calls[0][0];
      const sanitizedParams = call.context.metadata.parameters;

      expect(sanitizedParams).toBe(123);
    });

    it('nullやundefinedのパラメータを処理できる', () => {
      repositoryLogger.logQuery('GameProgressRepository', 'findAll', null);
      repositoryLogger.logQuery('GameProgressRepository', 'findAll', undefined);

      expect(mockAppender.append).toHaveBeenCalledTimes(2);
    });
  });
});
