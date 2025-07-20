import type {
  ILogger,
  IGameLogger,
  IRepositoryLogger,
} from '../../domain/interfaces/ILogger';
import { LogLevel } from '../../domain/interfaces/ILogger';
import { BaseLogger } from './BaseLogger';
import { GameLogger } from '../../domain/services/GameLogger';
import { RepositoryLogger } from './RepositoryLogger';
import {
  ConsoleAppender,
  JsonLogFormatter,
  HumanReadableLogFormatter,
} from './ConsoleAppender';
import { IndexedDBAppender } from './IndexedDBAppender';

/**
 * ロガーファクトリー
 * 環境に応じて適切なロガーインスタンスを生成
 */
export class LoggerFactory {
  private static instance: LoggerFactory;
  private logLevel: LogLevel = LogLevel.INFO;
  private isDevelopment: boolean = false;
  private enablePersistentLogging: boolean = false;

  private constructor() {
    // 環境判定
    this.isDevelopment = 
      typeof process !== 'undefined' && 
      process.env.NODE_ENV === 'development';
    
    // 開発環境ではDEBUGレベル、本番環境ではINFOレベル
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    
    // 本番環境では永続化ログを有効化
    this.enablePersistentLogging = !this.isDevelopment;
  }

  static getInstance(): LoggerFactory {
    if (!LoggerFactory.instance) {
      LoggerFactory.instance = new LoggerFactory();
    }
    return LoggerFactory.instance;
  }

  /**
   * 基本ロガーを作成
   */
  createLogger(_name?: string): ILogger {
    const appenders = this.createAppenders();
    const logger = new BaseLogger(appenders, this.logLevel);
    return logger;
  }

  /**
   * ゲームロガーを作成
   */
  createGameLogger(): IGameLogger {
    const appenders = this.createAppenders();
    const logger = new GameLogger(appenders, this.logLevel);
    return logger;
  }

  /**
   * リポジトリロガーを作成
   */
  createRepositoryLogger(): IRepositoryLogger {
    const appenders = this.createAppenders();
    const logger = new RepositoryLogger(appenders, this.logLevel);
    return logger;
  }

  /**
   * アプリケーション用ロガーを作成（GameLoggerのエイリアス）
   */
  createApplicationLogger(): IGameLogger {
    return this.createGameLogger();
  }

  /**
   * ログレベルを設定
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * 現在のログレベルを取得
   */
  getLogLevel(): LogLevel {
    return this.logLevel;
  }

  /**
   * 開発環境かどうかを判定
   */
  isDev(): boolean {
    return this.isDevelopment;
  }

  /**
   * 永続化ログを有効化
   */
  enablePersistentLogs(): void {
    this.enablePersistentLogging = true;
  }

  /**
   * 永続化ログを無効化
   */
  disablePersistentLogs(): void {
    this.enablePersistentLogging = false;
  }

  /**
   * 環境に応じたアペンダーを作成
   */
  private createAppenders() {
    const appenders = [];

    // 開発環境では人間が読みやすい形式、本番環境ではJSON形式
    const formatter = this.isDevelopment
      ? new HumanReadableLogFormatter()
      : new JsonLogFormatter();

    // コンソールアペンダーは常に追加
    appenders.push(new ConsoleAppender(formatter));

    // 永続化ログが有効な場合はIndexedDBアペンダーを追加
    if (this.enablePersistentLogging && typeof window !== 'undefined') {
      appenders.push(new IndexedDBAppender());
    }

    return appenders;
  }

  /**
   * 設定をリセット（テスト用）
   */
  reset(): void {
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    this.enablePersistentLogging = !this.isDevelopment;
  }
}

/**
 * シングルトンインスタンスのショートカット
 */
export const loggerFactory = LoggerFactory.getInstance();