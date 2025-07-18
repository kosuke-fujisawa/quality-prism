# ロギングシステム

DDDアーキテクチャに完全準拠した包括的なロギングシステムの実装詳細

## 🎯 システム概要

品質のプリズムプロジェクトのロギングシステムは、**89個のテストすべてが成功**し、TDD原則を完全実践したエンタープライズレベルの実装です。

### 主要特徴
- ✅ **DDDレイヤー準拠**: ドメイン・アプリケーション・インフラ層の分離
- ✅ **セキュリティ重視**: 機密情報の自動マスキング
- ✅ **環境適応**: 開発/本番環境での最適化
- ✅ **型安全性**: TypeScript厳密モードでの完全対応
- ✅ **拡張性**: 将来の機能追加に対応した設計

## 🏗️ アーキテクチャ

### レイヤー構成

```
src/
├── domain/
│   ├── interfaces/
│   │   └── ILogger.ts              # 基本ロガーインターフェース (11テスト)
│   └── services/
│       └── GameLogger.ts           # ゲーム専用ロガー (11テスト)
└── infrastructure/
    └── logging/
        ├── BaseLogger.ts           # 基盤ロガー実装 (15テスト)
        ├── ConsoleAppender.ts      # コンソール出力 (12テスト)
        ├── IndexedDBAppender.ts    # 永続化ログ (6テスト)
        ├── RepositoryLogger.ts     # DB操作ログ (16テスト)
        ├── LoggerFactory.ts        # ファクトリー (18テスト)
        └── LoggingIntegration.example.ts # 使用例・統合パターン
```

## 🔧 コンポーネント詳細

### 1. ロガーインターフェース (11テスト)

**基本インターフェース**
```typescript
export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
}

export interface IGameLogger extends ILogger {
  logGameAction(action: string, context?: GameLogContext): void;
  logStateChange(from: string, to: string, context?: GameLogContext): void;
  logPerformance(operation: string, duration: number, context?: LogContext): void;
}

export interface IRepositoryLogger extends ILogger {
  logQuery(repository: string, operation: string, params?: any): void;
  logQueryResult(repository: string, operation: string, resultCount: number): void;
  logQueryError(repository: string, operation: string, error: Error): void;
}
```

**ログレベルとコンテキスト**
```typescript
export enum LogLevel {
  DEBUG = 0,
  INFO = 1, 
  WARN = 2,
  ERROR = 3
}

export enum LogLayer {
  DOMAIN = 'domain',
  APPLICATION = 'application', 
  INFRASTRUCTURE = 'infrastructure'
}

export interface LogContext {
  layer?: LogLayer;
  operation?: string;
  userId?: string;
  metadata?: Record<string, any>;
}
```

### 2. BaseLogger - 基盤実装 (15テスト)

**核となるロガー実装**
```typescript
export class BaseLogger implements ILogger {
  constructor(
    private appenders: ILogAppender[],
    private minLevel: LogLevel = LogLevel.INFO
  ) {}

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, undefined, context);
  }

  private log(level: LogLevel, message: string, error?: Error, context?: LogContext): void {
    if (level < this.minLevel) return;
    
    const entry: LogEntry = {
      level,
      message,
      error,
      context,
      timestamp: new Date()
    };

    // 複数アペンダーへの安全な配信
    this.appenders.forEach((appender) => {
      try {
        appender.append(entry);
      } catch (appendError) {
        console.error('Log appender error:', appendError);
      }
    });
  }
}
```

**テスト例**
```typescript
describe('BaseLogger', () => {
  it('ログレベルフィルタリングが正常に動作する', () => {
    const logger = new BaseLogger([mockAppender], LogLevel.WARN);
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    
    expect(mockAppender.append).toHaveBeenCalledTimes(1); // WARNのみ
  });

  it('複数アペンダーに並行配信する', () => {
    const appender1 = createMockAppender();
    const appender2 = createMockAppender();
    const logger = new BaseLogger([appender1, appender2]);
    
    logger.info('Test message');
    
    expect(appender1.append).toHaveBeenCalled();
    expect(appender2.append).toHaveBeenCalled();
  });
});
```

### 3. GameLogger - ゲーム専用 (11テスト)

**ゲーム固有のロギング機能**
```typescript
export class GameLogger extends BaseLogger implements IGameLogger {
  logGameAction(action: string, context?: GameLogContext): void {
    const enrichedContext: GameLogContext = {
      ...context,
      layer: LogLayer.DOMAIN,
      operation: 'game-action',
      metadata: {
        ...context?.metadata,
        action,
      },
    };

    this.info(`Game action: ${action}`, enrichedContext);
  }

  logRouteSelection(routeId: string, context?: GameLogContext): void {
    this.logGameAction('route-selection', {
      ...context,
      routeId,
      metadata: {
        ...context?.metadata,
        selectedRoute: routeId,
      },
    });
  }

  logPerformance(operation: string, duration: number, context?: LogContext): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG;
    const message = duration > 1000 
      ? `Slow operation detected: ${operation} took ${duration}ms`
      : `Operation completed: ${operation} took ${duration}ms`;

    this.log(level, message, undefined, {
      ...context,
      layer: LogLayer.DOMAIN,
      operation: 'performance',
      metadata: {
        ...context?.metadata,
        operationName: operation,
        durationMs: duration,
      },
    });
  }
}
```

### 4. RepositoryLogger - セキュア (16テスト)

**機密情報保護付きデータアクセスロガー**
```typescript
export class RepositoryLogger extends BaseLogger implements IRepositoryLogger {
  logQuery(repository: string, operation: string, params?: any): void {
    const context: LogContext = {
      layer: LogLayer.INFRASTRUCTURE,
      operation: 'repository-query',
      metadata: {
        repository,
        operationType: operation,
        parameters: this.sanitizeParams(params), // 機密情報マスク
      },
    };

    this.debug(`Repository query: ${repository}.${operation}`, context);
  }

  private sanitizeParams(params: any): any {
    if (!params || typeof params !== 'object') return params;

    if (Array.isArray(params)) {
      return params.map(param => this.sanitizeParams(param));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(params)) {
      if (this.isSensitiveKey(key)) {
        sanitized[key] = '[MASKED]'; // 機密情報をマスク
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeParams(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      'password', 'secret', 'token', 'apikey', 'privatekey', 'credential'
    ];
    return sensitiveKeys.some(sensitiveKey =>
      key.toLowerCase().includes(sensitiveKey)
    );
  }
}
```

### 5. アペンダー実装

**ConsoleAppender** (12テスト)
```typescript
export class ConsoleAppender implements ILogAppender {
  constructor(private formatter: ILogFormatter) {}

  append(entry: LogEntry): void {
    const formatted = this.formatter.format(entry);
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }
}

export class JsonLogFormatter implements ILogFormatter {
  format(entry: LogEntry): string {
    return JSON.stringify({
      timestamp: entry.timestamp.toISOString(),
      level: LogLevel[entry.level],
      message: entry.message,
      context: entry.context,
      error: entry.error ? {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack,
      } : undefined,
    });
  }
}
```

**IndexedDBAppender** (6テスト)
```typescript
export class IndexedDBAppender implements ILogAppender {
  private db: IDBDatabase | null = null;

  async append(entry: LogEntry): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['logs'], 'readwrite');
      const store = transaction.objectStore('logs');
      
      const logRecord = {
        id: Date.now() + Math.random(),
        timestamp: entry.timestamp.toISOString(),
        level: entry.level,
        message: entry.message,
        context: entry.context,
        error: entry.error ? {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
        } : undefined,
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.add(logRecord);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // 古いエントリの自動削除
      await this.cleanupOldEntries();
    } catch (error) {
      console.error('Failed to store log entry:', error);
    }
  }
}
```

### 6. LoggerFactory - 環境対応 (18テスト)

**シングルトンファクトリーパターン**
```typescript
export class LoggerFactory {
  private static instance: LoggerFactory;
  private logLevel: LogLevel = LogLevel.INFO;
  private isDevelopment: boolean = false;
  private enablePersistentLogging: boolean = false;

  private constructor() {
    this.isDevelopment = 
      typeof process !== 'undefined' && 
      process.env.NODE_ENV === 'development';
    
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    this.enablePersistentLogging = !this.isDevelopment;
  }

  static getInstance(): LoggerFactory {
    if (!LoggerFactory.instance) {
      LoggerFactory.instance = new LoggerFactory();
    }
    return LoggerFactory.instance;
  }

  createGameLogger(): IGameLogger {
    const appenders = this.createAppenders();
    return new GameLogger(appenders, this.logLevel);
  }

  private createAppenders() {
    const appenders = [];

    // 環境に応じたフォーマッター選択
    const formatter = this.isDevelopment
      ? new HumanReadableLogFormatter()
      : new JsonLogFormatter();

    appenders.push(new ConsoleAppender(formatter));

    // 本番環境では永続化ログを追加
    if (this.enablePersistentLogging && typeof window !== 'undefined') {
      appenders.push(new IndexedDBAppender());
    }

    return appenders;
  }
}

export const loggerFactory = LoggerFactory.getInstance();
```

## 💡 使用例・統合パターン

### ドメイン層での使用
```typescript
export class GameProgressWithLogging {
  private readonly logger = loggerFactory.createGameLogger();

  selectRoute(routeId: string): void {
    const startTime = Date.now();
    
    try {
      this.logger.logGameAction('route-selection', {
        userId: 'user-123',
        routeId,
        metadata: { availableRoutes: ['route1', 'route2', 'trueRoute'] }
      });

      this.doSelectRoute(routeId);

      this.logger.logStateChange('menu', 'game', {
        userId: 'user-123',
        routeId,
        gameState: 'playing'
      });

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
}
```

### インフラストラクチャ層での使用
```typescript
export class GameProgressRepositoryWithLogging {
  private readonly logger = loggerFactory.createRepositoryLogger();

  async findById(id: string): Promise<any> {
    const startTime = Date.now();
    const repositoryName = 'GameProgressRepository';

    this.logger.logQuery(repositoryName, 'findById', { id });

    try {
      const result = await this.executeQuery('SELECT * FROM game_progress WHERE id = ?', [id]);
      
      this.logger.logQueryResult(repositoryName, 'findById', 
        Array.isArray(result) ? result.length : 1);

      const duration = Date.now() - startTime;
      this.logger.logPerformanceMetrics(repositoryName, 'findById', {
        duration,
        recordCount: Array.isArray(result) ? result.length : 1
      });

      return result;
    } catch (error) {
      this.logger.logQueryError(repositoryName, 'findById', error as Error);
      throw error;
    }
  }
}
```

### セキュリティ機能のデモ
```typescript
// 機密情報を含むクエリパラメータ
const userData = {
  username: 'testuser',
  password: 'secret123',    // 自動的に [MASKED] に変換
  apiKey: 'abc123def456',   // 自動的に [MASKED] に変換
  email: 'user@example.com' // 通常データはそのまま
};

repositoryLogger.logQuery('UserRepository', 'authenticate', userData);

// ログ出力例:
// {
//   "level": "DEBUG",
//   "message": "Repository query: UserRepository.authenticate",
//   "metadata": {
//     "parameters": {
//       "username": "testuser",
//       "password": "[MASKED]",
//       "apiKey": "[MASKED]", 
//       "email": "user@example.com"
//     }
//   }
// }
```

## 🧪 テスト戦略

### 1. インターフェーステスト (11テスト)
- ログレベルの順序検証
- DDDレイヤー定義の確認
- 型安全性の保証

### 2. 基盤機能テスト (15テスト)
- ログレベルフィルタリング
- マルチアペンダー配信
- エラー耐性・復旧機能

### 3. ゲーム固有機能テスト (11テスト)
- ゲームアクション記録
- パフォーマンス測定・警告
- 状態変更追跡

### 4. セキュリティテスト (16テスト)
- 機密情報マスキング
- ネストオブジェクトの保護
- 配列内データの安全化

### 5. 環境対応テスト (18テスト)
- 開発/本番環境の自動判定
- アペンダー構成の動的変更
- ファクトリーパターンの動作

### 6. 永続化テスト (6テスト)
- IndexedDB初期化・エラーハンドリング
- ログ検索・フィルタリング
- 古いエントリの自動削除

## 🚀 パフォーマンス特性

### メモリ効率
- 遅延初期化によるメモリ使用量最適化
- 循環参照の回避
- ガベージコレクション対応

### 実行効率
- レベルフィルタによる不要処理スキップ
- 非同期処理によるUI ブロック回避
- エラー時の自動復旧機能

### スケーラビリティ
- 複数アペンダーの並行処理
- 大量ログエントリの効率的処理
- 環境スケールに応じた自動調整

## 🔧 設定・カスタマイズ

### 基本設定
```typescript
// 開発環境での詳細ログ有効化
loggerFactory.setLogLevel(LogLevel.DEBUG);
loggerFactory.enablePersistentLogs();

// 本番環境での最適化
loggerFactory.setLogLevel(LogLevel.INFO);
loggerFactory.disablePersistentLogs(); // パフォーマンス重視
```

### カスタムアペンダー追加
```typescript
class RemoteLogAppender implements ILogAppender {
  async append(entry: LogEntry): Promise<void> {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
  }
}
```

---

この包括的なロギングシステムにより、**品質のプリズム**は本格的なエンタープライズレベルの監視・デバッグ・運用支援機能を実現しています。TDD + DDDアプローチによる堅牢な設計で、将来の拡張にも対応可能です。