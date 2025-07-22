/**
 * ロガーインターフェース
 * DDDアーキテクチャでのロギング抽象化
 */

export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export const LogLayer = {
  DOMAIN: 'domain',
  APPLICATION: 'application',
  INFRASTRUCTURE: 'infrastructure',
  PRESENTATION: 'presentation',
} as const;

export type LogLayer = (typeof LogLayer)[keyof typeof LogLayer];

export interface LogContext {
  userId?: string;
  sessionId?: string;
  operation?: string;
  layer?: LogLayer;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  timestamp: Date;
}

/**
 * 基本ロガーインターフェース
 */
export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
}

/**
 * ゲーム固有のロガーインターフェース
 */
export interface IGameLogger extends ILogger {
  logGameAction(action: string, context?: GameLogContext): void;
  logStateChange(from: string, to: string, context?: GameLogContext): void;
  logPerformance(
    operation: string,
    duration: number,
    context?: LogContext
  ): void;
}

export interface GameLogContext extends LogContext {
  routeId?: string;
  sceneNumber?: number;
  gameState?: string;
}

/**
 * リポジトリ用ロガーインターフェース
 */
export interface IRepositoryLogger extends ILogger {
  logQuery(repository: string, operation: string, params?: any): void;
  logQueryResult(
    repository: string,
    operation: string,
    resultCount: number
  ): void;
  logQueryError(repository: string, operation: string, error: Error): void;
}

/**
 * ログアペンダーインターフェース
 */
export interface ILogAppender {
  append(entry: LogEntry): void;
  flush?(): Promise<void>;
}

/**
 * ログフォーマッターインターフェース
 */
export interface ILogFormatter {
  format(entry: LogEntry): string;
}
