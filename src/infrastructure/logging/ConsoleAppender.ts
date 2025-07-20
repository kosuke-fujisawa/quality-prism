import type {
  ILogAppender,
  ILogFormatter,
  LogEntry,
} from '../../domain/interfaces/ILogger';
import { LogLevel } from '../../domain/interfaces/ILogger';

// ログレベルの名前を取得するヘルパー関数
function getLogLevelName(level: number): string {
  switch (level) {
    case LogLevel.DEBUG: return 'DEBUG';
    case LogLevel.INFO: return 'INFO';
    case LogLevel.WARN: return 'WARN';
    case LogLevel.ERROR: return 'ERROR';
    default: return 'UNKNOWN';
  }
}

/**
 * コンソール出力アペンダー
 * ブラウザの開発者ツールにログを出力
 */
export class ConsoleAppender implements ILogAppender {
  private formatter: ILogFormatter;

  constructor(formatter: ILogFormatter) {
    this.formatter = formatter;
  }

  append(entry: LogEntry): void {
    const formattedMessage = this.formatter.format(entry);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        if (entry.error) {
          console.error(formattedMessage, entry.error);
        } else {
          console.error(formattedMessage);
        }
        break;
      default:
        console.log(formattedMessage);
    }
  }
}

/**
 * JSON形式のログフォーマッター
 */
export class JsonLogFormatter implements ILogFormatter {
  format(entry: LogEntry): string {
    const logObject = {
      timestamp: entry.timestamp.toISOString(),
      level: getLogLevelName(entry.level),
      message: entry.message,
      context: entry.context,
      error: entry.error
        ? {
            name: entry.error.name,
            message: entry.error.message,
            stack: entry.error.stack,
          }
        : undefined,
    };

    return JSON.stringify(logObject);
  }
}

/**
 * 人間が読みやすい形式のログフォーマッター
 */
export class HumanReadableLogFormatter implements ILogFormatter {
  format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = getLogLevelName(entry.level).padEnd(5);
    const context = entry.context
      ? ` [${this.formatContext(entry.context)}]`
      : '';

    return `${timestamp} ${level} ${entry.message}${context}`;
  }

  private formatContext(context: any): string {
    const parts: string[] = [];

    if (context.layer) parts.push(`layer=${context.layer}`);
    if (context.operation) parts.push(`op=${context.operation}`);
    if (context.userId) parts.push(`user=${context.userId}`);
    if (context.sessionId) parts.push(`session=${context.sessionId}`);

    return parts.join(' ');
  }
}