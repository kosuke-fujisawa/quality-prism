# ロギングシステム設計仕様

## 🎯 目的と方針

### 目的
- DDDアーキテクチャに適したロギングシステムの構築
- デバッグ・監視・トラブルシューティングの効率化
- テスト可能で保守性の高いロギング実装

### 設計方針
- **ドメイン駆動**: ビジネスロジックに特化したログ
- **レイヤー分離**: 各レイヤーの責任に応じたロギング
- **依存関係逆転**: インターフェースを通じた疎結合
- **テスト駆動**: モック・テスト対応

## 🏗️ アーキテクチャ設計

### ロギングレイヤー構成

```
┌─────────────────────────────────────────┐
│           Application Layer             │
│  ┌─────────────────────────────────┐    │
│  │        Game Service             │    │
│  │     + Application Logger        │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│            Domain Layer                 │
│  ┌─────────────────────────────────┐    │
│  │       Domain Services           │    │
│  │      + Domain Logger            │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │         Entities                │    │
│  │      + Entity Logger            │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│        Infrastructure Layer            │
│  ┌─────────────────────────────────┐    │
│  │       Repositories              │    │
│  │   + Infrastructure Logger       │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │      Logging Infrastructure     │    │
│  │  ┌─────────────────────────┐   │    │
│  │  │    Console Appender     │   │    │
│  │  │   IndexedDB Appender    │   │    │
│  │  │   Performance Monitor   │   │    │
│  │  └─────────────────────────┘   │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## 🔧 インターフェース設計

### 1. Core Logger Interface

```typescript
interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
}

interface LogContext {
  userId?: string;
  sessionId?: string;
  operation?: string;
  layer?: LogLayer;
  metadata?: Record<string, any>;
}

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

enum LogLayer {
  DOMAIN = 'domain',
  APPLICATION = 'application',
  INFRASTRUCTURE = 'infrastructure',
  PRESENTATION = 'presentation'
}
```

### 2. Domain Specific Loggers

```typescript
interface IGameLogger extends ILogger {
  logGameAction(action: GameAction, context: GameContext): void;
  logStateChange(from: GameState, to: GameState, context: GameContext): void;
  logPerformance(operation: string, duration: number): void;
}

interface IRepositoryLogger extends ILogger {
  logQuery(repository: string, operation: string, params: any): void;
  logQueryResult(repository: string, operation: string, resultCount: number): void;
  logError(repository: string, operation: string, error: Error): void;
}
```

## 📊 ログレベル戦略

### Development Environment
- **DEBUG**: 詳細なフロー追跡
- **INFO**: 主要な操作・状態変更
- **WARN**: 予期される問題・制限
- **ERROR**: エラー・例外

### Production Environment  
- **INFO**: 重要な操作のみ
- **WARN**: 業務に影響する警告
- **ERROR**: システムエラー・例外

## 🎮 ゲーム固有のロギング要件

### ユーザーアクション
- メニュー選択
- ルート選択
- ゲーム進行
- セーブ・ロード操作

### システム状態
- ゲーム状態遷移
- データ永続化
- パフォーマンス指標

### エラー対応
- データアクセスエラー
- ユーザー操作エラー
- システム例外

## 🔒 プライバシー・セキュリティ

### データ保護
- 個人情報の除外
- セッション情報の匿名化
- 機密データのマスキング

### ローカルストレージ
- IndexedDBでのログ永続化
- 容量制限の実装
- ログローテーション

## 📈 パフォーマンス考慮事項

### 最適化戦略
- 非同期ロギング
- バッファリング
- 条件付きロギング
- メモリ効率的な実装

### 監視指標
- ログ出力頻度
- メモリ使用量
- ディスク使用量
- 応答時間への影響