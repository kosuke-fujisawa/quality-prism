/**
 * ロギングシステムの統合例
 * DDD アーキテクチャでのロガー使用パターンを示す
 */

import { loggerFactory } from './LoggerFactory';
import { LogLevel } from '../../domain/interfaces/ILogger';

// =============================================================================
// ドメイン層での使用例
// =============================================================================

/**
 * ゲーム進行エンティティでのロガー使用例
 */
export class GameProgressWithLogging {
  private readonly logger = loggerFactory.createGameLogger();

  selectRoute(routeId: string): void {
    const startTime = Date.now();
    
    try {
      // ゲームアクションをログ
      this.logger.logGameAction('route-selection', {
        userId: 'user-123',
        routeId,
        metadata: {
          availableRoutes: ['route1', 'route2', 'trueRoute']
        }
      });

      // ビジネスロジック実行
      this.doSelectRoute(routeId);

      // 状態変更をログ
      this.logger.logStateChange('menu', 'game', {
        userId: 'user-123',
        routeId,
        gameState: 'playing'
      });

      // パフォーマンス測定
      const duration = Date.now() - startTime;
      this.logger.logPerformance('route-selection', duration);

    } catch (error) {
      this.logger.error('Route selection failed', error as Error, {
        userId: 'user-123',
        routeId,
        operation: 'route-selection'
      });
      throw error;
    }
  }

  private doSelectRoute(routeId: string): void {
    // 実際のビジネスロジック
  }

  completeRoute(routeId: string): void {
    this.logger.logGameCompletion(routeId, {
      userId: 'user-123',
      metadata: {
        completionTime: new Date().toISOString(),
        score: 100
      }
    });
  }
}

// =============================================================================
// アプリケーション層での使用例
// =============================================================================

/**
 * ゲームサービスでのロガー使用例
 */
export class GameServiceWithLogging {
  private readonly logger = loggerFactory.createApplicationLogger();

  async startGame(userId: string, routeId: string): Promise<void> {
    this.logger.info('Starting game session', {
      userId,
      routeId,
      operation: 'start-game',
      metadata: {
        sessionId: this.generateSessionId(),
        timestamp: new Date().toISOString()
      }
    });

    try {
      // アプリケーションロジック
      await this.initializeGame(userId, routeId);
      
      this.logger.logGameAction('game-start', {
        userId,
        routeId,
        gameState: 'initialized'
      });

    } catch (error) {
      this.logger.error('Game initialization failed', error as Error, {
        userId,
        routeId,
        operation: 'start-game'
      });
      throw error;
    }
  }

  async saveGame(userId: string, gameData: any): Promise<void> {
    const startTime = Date.now();

    try {
      await this.persistGameData(userId, gameData);
      
      const duration = Date.now() - startTime;
      this.logger.logSaveLoad('save', true, {
        userId,
        metadata: {
          dataSize: JSON.stringify(gameData).length,
          duration
        }
      });

    } catch (error) {
      this.logger.logSaveLoad('save', false, {
        userId,
        metadata: {
          errorMessage: (error as Error).message
        }
      });
      throw error;
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(7);
  }

  private async initializeGame(userId: string, routeId: string): Promise<void> {
    // 実装
  }

  private async persistGameData(userId: string, gameData: any): Promise<void> {
    // 実装
  }
}

// =============================================================================
// インフラストラクチャ層での使用例
// =============================================================================

/**
 * リポジトリでのロガー使用例
 */
export class GameProgressRepositoryWithLogging {
  private readonly logger = loggerFactory.createRepositoryLogger();

  async findById(id: string): Promise<any> {
    const startTime = Date.now();
    const repositoryName = 'GameProgressRepository';

    // クエリログ
    this.logger.logQuery(repositoryName, 'findById', { id });

    try {
      // データベース接続状態をログ
      this.logger.logConnection(repositoryName, 'connected');

      // 実際のクエリ実行
      const result = await this.executeQuery('SELECT * FROM game_progress WHERE id = ?', [id]);
      
      // 結果をログ
      this.logger.logQueryResult(repositoryName, 'findById', Array.isArray(result) ? result.length : 1);

      // パフォーマンス指標をログ
      const duration = Date.now() - startTime;
      this.logger.logPerformanceMetrics(repositoryName, 'findById', {
        duration,
        recordCount: Array.isArray(result) ? result.length : 1
      });

      return result;

    } catch (error) {
      // エラーをログ
      this.logger.logQueryError(repositoryName, 'findById', error as Error);
      throw error;
    }
  }

  async save(entity: any): Promise<void> {
    const repositoryName = 'GameProgressRepository';
    
    // 機密情報を含む可能性があるパラメータも安全にログ
    this.logger.logQuery(repositoryName, 'save', {
      id: entity.id,
      userId: entity.userId,
      password: 'secret123', // これは自動的にマスクされる
      gameData: entity.gameData
    });

    try {
      await this.executeUpdate('UPDATE game_progress SET data = ? WHERE id = ?', 
        [JSON.stringify(entity.gameData), entity.id]);
      
      this.logger.info('Game progress saved successfully', {
        operation: 'repository-save',
        metadata: {
          entityId: entity.id,
          repository: repositoryName
        }
      });

    } catch (error) {
      this.logger.logQueryError(repositoryName, 'save', error as Error);
      throw error;
    }
  }

  private async executeQuery(sql: string, params: any[]): Promise<any> {
    // 実際のクエリ実行
    return [];
  }

  private async executeUpdate(sql: string, params: any[]): Promise<void> {
    // 実際の更新実行
  }
}

// =============================================================================
// ロガー設定の例
// =============================================================================

/**
 * アプリケーション初期化時のロガー設定例
 */
export class LoggingConfiguration {
  static configure(): void {
    // 開発環境での設定
    if (process.env.NODE_ENV === 'development') {
      loggerFactory.setLogLevel(LogLevel.DEBUG);
      loggerFactory.enablePersistentLogs(); // 開発時でも永続化ログを有効に
    }

    // 本番環境での設定
    if (process.env.NODE_ENV === 'production') {
      loggerFactory.setLogLevel(LogLevel.INFO);
      // 本番環境では自動的に永続化ログが有効
    }

    // テスト環境での設定
    if (process.env.NODE_ENV === 'test') {
      loggerFactory.setLogLevel(LogLevel.ERROR); // テスト時はエラーのみ
      loggerFactory.disablePersistentLogs();
    }
  }

  /**
   * ログ検索とエクスポート機能の例
   */
  static async exportLogs(): Promise<void> {
    // IndexedDBアペンダーからログを検索
    // 注意: 実際の実装では、ファクトリーからアペンダーにアクセスする
    // 適切な方法を提供する必要があります
    
    const logger = loggerFactory.createLogger();
    logger.info('Log export initiated', {
      operation: 'log-export',
      metadata: {
        exportTime: new Date().toISOString()
      }
    });
  }
}

// =============================================================================
// エラー監視とアラート例
// =============================================================================

/**
 * エラー監視システムの例
 */
export class ErrorMonitoring {
  private readonly logger = loggerFactory.createLogger();

  monitorCriticalErrors(): void {
    // グローバルエラーハンドラー
    window.addEventListener('error', (event) => {
      this.logger.error('Uncaught error detected', event.error, {
        operation: 'global-error-handler',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          message: event.message
        }
      });
    });

    // Promise拒否ハンドラー
    window.addEventListener('unhandledrejection', (event) => {
      this.logger.error('Unhandled promise rejection', new Error(event.reason), {
        operation: 'promise-rejection-handler',
        metadata: {
          reason: event.reason
        }
      });
    });
  }

  /**
   * パフォーマンス監視の例
   */
  monitorPerformance(): void {
    // ページロード時間の監視
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.logger.logPerformance('page-load', navigation.loadEventEnd - navigation.fetchStart, {
          metadata: {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            firstPaint: navigation.responseEnd - navigation.fetchStart
          }
        });
      }
    });
  }
}

// =============================================================================
// 使用例のまとめ
// =============================================================================

/**
 * アプリケーション全体でのロガー統合例
 */
export function initializeLoggingSystem(): void {
  // 1. ロガー設定
  LoggingConfiguration.configure();

  // 2. エラー監視開始
  const errorMonitoring = new ErrorMonitoring();
  errorMonitoring.monitorCriticalErrors();
  errorMonitoring.monitorPerformance();

  // 3. アプリケーション開始をログ
  const appLogger = loggerFactory.createApplicationLogger();
  appLogger.info('Application initialized', {
    operation: 'app-init',
    metadata: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
  });
}