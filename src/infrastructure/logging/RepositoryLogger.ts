import {
  IRepositoryLogger,
  LogContext,
  LogLayer,
} from '../../domain/interfaces/ILogger';
import { BaseLogger } from './BaseLogger';

/**
 * リポジトリ専用ロガー実装
 * データアクセス操作、クエリ、結果を専門的にログ
 */
export class RepositoryLogger extends BaseLogger implements IRepositoryLogger {
  logQuery(repository: string, operation: string, params?: any): void {
    const context: LogContext = {
      layer: LogLayer.INFRASTRUCTURE,
      operation: 'repository-query',
      metadata: {
        repository,
        operationType: operation,
        parameters: this.sanitizeParams(params),
      },
    };

    this.debug(`Repository query: ${repository}.${operation}`, context);
  }

  logQueryResult(repository: string, operation: string, resultCount: number): void {
    const context: LogContext = {
      layer: LogLayer.INFRASTRUCTURE,
      operation: 'repository-result',
      metadata: {
        repository,
        operationType: operation,
        resultCount,
      },
    };

    this.debug(
      `Repository result: ${repository}.${operation} returned ${resultCount} items`,
      context
    );
  }

  logQueryError(repository: string, operation: string, error: Error): void {
    const context: LogContext = {
      layer: LogLayer.INFRASTRUCTURE,
      operation: 'repository-error',
      metadata: {
        repository,
        operationType: operation,
        errorType: error.name,
        errorMessage: error.message,
      },
    };

    this.error(
      `Repository error: ${repository}.${operation} failed`,
      error,
      context
    );
  }

  /**
   * データベース接続状態のログ
   */
  logConnection(repository: string, status: 'connected' | 'disconnected' | 'error'): void {
    const context: LogContext = {
      layer: LogLayer.INFRASTRUCTURE,
      operation: 'repository-connection',
      metadata: {
        repository,
        connectionStatus: status,
      },
    };

    switch (status) {
      case 'connected':
        this.info(`Repository connected: ${repository}`, context);
        break;
      case 'disconnected':
        this.info(`Repository disconnected: ${repository}`, context);
        break;
      case 'error':
        this.error(`Repository connection error: ${repository}`, undefined, context);
        break;
    }
  }

  /**
   * キャッシュ操作のログ
   */
  logCacheOperation(
    repository: string,
    operation: 'hit' | 'miss' | 'invalidate',
    key?: string
  ): void {
    const context: LogContext = {
      layer: LogLayer.INFRASTRUCTURE,
      operation: 'repository-cache',
      metadata: {
        repository,
        cacheOperation: operation,
        cacheKey: key,
      },
    };

    this.debug(
      `Cache ${operation}: ${repository}${key ? ` [${key}]` : ''}`,
      context
    );
  }

  /**
   * パフォーマンス指標のログ
   */
  logPerformanceMetrics(
    repository: string,
    operation: string,
    metrics: {
      duration: number;
      recordCount?: number;
      memoryUsage?: number;
    }
  ): void {
    const context: LogContext = {
      layer: LogLayer.INFRASTRUCTURE,
      operation: 'repository-performance',
      metadata: {
        repository,
        operationType: operation,
        ...metrics,
      },
    };

    if (metrics.duration > 500) {
      this.warn(
        `Slow repository operation: ${repository}.${operation} took ${metrics.duration}ms`,
        context
      );
    } else {
      this.debug(
        `Repository performance: ${repository}.${operation} took ${metrics.duration}ms`,
        context
      );
    }
  }

  /**
   * パラメータの機密情報をサニタイズ
   */
  private sanitizeParams(params: any): any {
    if (!params) return undefined;

    // プリミティブ型はそのまま返す
    if (typeof params !== 'object') return params;

    // 配列の場合
    if (Array.isArray(params)) {
      return params.map(param => this.sanitizeParams(param));
    }

    // オブジェクトの場合
    const sanitized: any = {};
    for (const [key, value] of Object.entries(params)) {
      // 機密情報と思われるキーはマスク
      if (this.isSensitiveKey(key)) {
        sanitized[key] = '[MASKED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeParams(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * 機密情報のキーかどうかを判定
   */
  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      'password',
      'secret',
      'token',
      'apikey',
      'privatekey',
      'credential',
    ];
    
    return sensitiveKeys.some(sensitiveKey =>
      key.toLowerCase().includes(sensitiveKey)
    );
  }
}