import {
  IGameLogger,
  LogContext,
  GameLogContext,
  LogLayer,
} from '../interfaces/ILogger';
import { BaseLogger } from '../../infrastructure/logging/BaseLogger';

/**
 * ゲーム固有のロガー実装
 * ゲームアクション、状態変更、パフォーマンス測定を専門的にログ
 */
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

  logStateChange(from: string, to: string, context?: GameLogContext): void {
    const enrichedContext: GameLogContext = {
      ...context,
      layer: LogLayer.DOMAIN,
      operation: 'state-change',
      metadata: {
        ...context?.metadata,
        fromState: from,
        toState: to,
      },
    };

    this.info(`State change: ${from} -> ${to}`, enrichedContext);
  }

  logPerformance(
    operation: string,
    duration: number,
    context?: LogContext
  ): void {
    const enrichedContext: LogContext = {
      ...context,
      layer: LogLayer.DOMAIN,
      operation: 'performance',
      metadata: {
        ...context?.metadata,
        operationName: operation,
        durationMs: duration,
      },
    };

    if (duration > 1000) {
      this.warn(
        `Slow operation detected: ${operation} took ${duration}ms`,
        enrichedContext
      );
    } else {
      this.debug(
        `Operation completed: ${operation} took ${duration}ms`,
        enrichedContext
      );
    }
  }

  /**
   * ルート選択のログ
   */
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

  /**
   * シーン進行のログ
   */
  logSceneProgress(
    routeId: string,
    sceneNumber: number,
    context?: GameLogContext
  ): void {
    this.logGameAction('scene-progress', {
      ...context,
      routeId,
      sceneNumber,
      metadata: {
        ...context?.metadata,
        currentRoute: routeId,
        currentScene: sceneNumber,
      },
    });
  }

  /**
   * ゲーム完了のログ
   */
  logGameCompletion(routeId: string, context?: GameLogContext): void {
    this.logGameAction('game-completion', {
      ...context,
      routeId,
      metadata: {
        ...context?.metadata,
        completedRoute: routeId,
      },
    });
  }

  /**
   * セーブ・ロード操作のログ
   */
  logSaveLoad(operation: 'save' | 'load', success: boolean, context?: GameLogContext): void {
    const message = `${operation} operation ${success ? 'successful' : 'failed'}`;
    
    if (success) {
      this.info(message, {
        ...context,
        operation: `save-load-${operation}`,
        metadata: {
          ...context?.metadata,
          operationType: operation,
          success,
        },
      });
    } else {
      this.warn(message, {
        ...context,
        operation: `save-load-${operation}`,
        metadata: {
          ...context?.metadata,
          operationType: operation,
          success,
        },
      });
    }
  }
}