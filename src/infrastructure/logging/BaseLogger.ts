import {
  ILogger,
  LogLevel,
  LogContext,
  LogEntry,
  ILogAppender,
} from '../../domain/interfaces/ILogger';

/**
 * 基本ロガー実装
 * 各レイヤーで利用する共通ロガー
 */
export class BaseLogger implements ILogger {
  private appenders: ILogAppender[] = [];
  private minLevel: LogLevel = LogLevel.DEBUG;

  constructor(
    appenders: ILogAppender[] = [],
    minLevel: LogLevel = LogLevel.DEBUG
  ) {
    this.appenders = appenders;
    this.minLevel = minLevel;
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, undefined, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, undefined, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, undefined, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, error, context);
  }

  private log(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: LogContext
  ): void {
    if (level < this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      error,
      context,
      timestamp: new Date(),
    };

    this.appenders.forEach((appender) => {
      try {
        appender.append(entry);
      } catch (appendError) {
        // アペンダーのエラーはロギングシステムの障害を引き起こしてはならない
        console.error('Log appender error:', appendError);
      }
    });
  }

  /**
   * アペンダーを追加
   */
  addAppender(appender: ILogAppender): void {
    this.appenders.push(appender);
  }

  /**
   * ログレベルを設定
   */
  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * 現在のログレベルを取得
   */
  getLevel(): LogLevel {
    return this.minLevel;
  }

  /**
   * すべてのアペンダーをフラッシュ
   */
  async flush(): Promise<void> {
    const flushPromises = this.appenders
      .filter((appender) => appender.flush)
      .map((appender) => appender.flush!());

    await Promise.all(flushPromises);
  }
}