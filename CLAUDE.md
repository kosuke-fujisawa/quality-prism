# 品質のプリズム - 開発ガイドライン

## 🧪 開発方針

このプロジェクトは **t_wadaさんの推奨するTDD (Test-Driven Development)** と **DDD (Domain-Driven Design)** アーキテクチャを組み合わせて開発を進めています。

### Claude Code応答スタイル
開発支援AIは **理系女子大学院生** のペルソナで応答します：

- **技術的正確性**: 専門知識に基づいた正確な情報提供
- **親しみやすさ**: 丁寧で分かりやすい説明
- **探究心**: 新技術への好奇心と実験的アプローチ
- **論理性**: データと事実に基づいた判断
- **謙虚さ**: 研究者らしい姿勢での技術検討

設定詳細は `.claude/settings.local.json` で管理されています。

### TDD開発サイクル
1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限のコードを書く
3. **Refactor**: コードを改善する

### DDD設計原則
- **ドメイン中心**: ビジネスロジックをドメイン層に集約
- **関心の分離**: 各レイヤーの責任を明確に分離
- **テスト駆動**: 各レイヤーを独立してテスト可能
- **不変性**: 値オブジェクトとエンティティの不変性を保証

### テスト要件
- 新機能追加時は必ずテストを先に書く
- すべてのテストが通ることを確認してからコミット
- リファクタリング時もテストカバレッジを維持
- **エッジケース・境界値テスト**を必ず含める
- **エラーハンドリング**のテストを網羅する
- **E2Eテスト**でユーザーシナリオを検証する

## 📋 現在のテスト状況

```bash
npm test
```

- **総テスト数**: 425
- **成功率**: 100% (425/425)
- **単体テスト**: 411テスト (30ファイル)
- **E2Eテスト**: 14テスト (2ファイル)

### テストカバレッジ

#### 既存アーキテクチャ (66 tests)
- `NovelGameApp.test.ts`: 11 tests - UI・イベント処理
- `ChoiceSystem.test.ts`: 16 tests - 選択肢・ルート分岐
- `ScenarioLoader.test.ts`: 8 tests - YAMLファイル読み込み
- `GameLogic.test.ts`: 10 tests - ゲーム状態管理
- `TextLog.test.ts`: 13 tests - テキストログ
- `SaveData.test.ts`: 8 tests - データ永続化

#### DDDアーキテクチャ - ドメイン層 (150 tests)
- `GameProgress.test.ts`: 7 tests - ゲーム進行エンティティ
- `GameProgress.edge-cases.test.ts`: 16 tests - エッジケース・境界値
- `TextLogEntry.test.ts`: 13 tests - テキストログエンティティ
- `RouteId.test.ts`: 10 tests - ルートID値オブジェクト
- `RouteId.edge-cases.test.ts`: 22 tests - エッジケース・特殊文字・Unicode
- `SceneNumber.test.ts`: 10 tests - シーン番号値オブジェクト
- `SceneNumber.edge-cases.test.ts`: 22 tests - 境界値・型安全性・パフォーマンス
- `GameSettings.test.ts`: 18 tests - ゲーム設定値オブジェクト
- `GameSettings.edge-cases.test.ts`: 23 tests - 浮動小数点精度・不変性・NaN/Infinity処理
- `RouteConfiguration.test.ts`: 26 tests - ルート設定管理
- `RouteConfiguration.extensibility.test.ts`: 14 tests - 拡張性・柔軟性テスト
- `RouteValidationService.test.ts`: 9 tests - ルート検証ドメインサービス
- `ILogger.test.ts`: 11 tests - ロガーインターフェース・型定義・ログレベル検証
- `GameLogger.test.ts`: 11 tests - ゲーム専用ロガー・アクション記録・パフォーマンス監視

#### DDDアーキテクチャ - アプリケーション層 (31 tests)
- `GameService.test.ts`: 16 tests - ゲームアプリケーションサービス
- `GameService.edge-cases.test.ts`: 15 tests - 非同期エラー・競合状態・タイムアウト

#### DDDアーキテクチャ - インフラストラクチャ層 (108 tests)
- `DexieGameProgressRepository.test.ts`: 12 tests - ゲーム進行リポジトリ
- `DexieGameSettingsRepository.test.ts`: 14 tests - ゲーム設定リポジトリ
- `DexieTextLogRepository.test.ts`: 15 tests - テキストログリポジトリ

#### ロギングシステム (89 tests) - エンタープライズレベル監視機能
- `BaseLogger.test.ts`: 15 tests - 基盤ロガー・レベルフィルタリング・エラー耐性
- `ConsoleAppender.test.ts`: 12 tests - コンソール出力・JSON/人間可読フォーマッター
- `IndexedDBAppender.test.ts`: 6 tests - 永続化ログ・検索・自動削除機能
- `RepositoryLogger.test.ts`: 16 tests - セキュアDB操作ログ・機密情報マスキング
- `LoggerFactory.test.ts`: 18 tests - 環境対応ファクトリー・シングルトンパターン
- `LoggingIntegration.example.ts`: 22 tests - DDD統合パターン・実用例

#### E2Eテスト (Playwright) - 14 tests
- **基本動作テスト** (`basic.spec.ts`): 8 tests
  - メインページ表示・メニュー動作
  - キーボード・マウス操作
  - 各モード遷移（ゲーム・ギャラリー・ミニゲーム・クレジット）
- **DDD統合テスト** (`ddd-integration.spec.ts`): 6 tests
  - DDDアーキテクチャの動作検証
  - ゲーム状態の永続化・ロード
  - エラーハンドリング・安定性テスト
  - ルート選択・設定管理機能

## 🛠️ 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# テスト実行
npm test

# テストUI表示
npm run test:ui

# E2Eテスト実行
npm run test:e2e

# E2Eテスト（ヘッドありモード）
npm run test:e2e:headed

# E2EテストUI表示
npm run test:e2e:ui

# E2Eテストデバッグモード
npm run test:e2e:debug

# E2Eテストレポート表示
npm run test:e2e:report

# ビルド
npm run build
```

## 🏗️ DDDアーキテクチャ規則

### レイヤー責任

#### ドメイン層 (`src/domain/`)
- **エンティティ**: ビジネスロジックとライフサイクル管理
- **値オブジェクト**: 不変性と等価性を保証
- **リポジトリ**: データアクセスのインターフェース
- **ドメインサービス**: ビジネスルールの実装

#### アプリケーション層 (`src/application/`)
- **アプリケーションサービス**: ユースケースの実装
- **ドメインオブジェクトの調整**: 複数のドメインオブジェクトの協調

#### インフラストラクチャ層 (`src/infrastructure/`)
- **リポジトリ実装**: 実際のデータアクセス
- **永続化**: データベースとの連携

### 実装規則

1. **ドメインオブジェクト**:
   - 値オブジェクトは不変にする
   - エンティティは一意性を保証
   - ビジネスロジックはドメイン層に集約

2. **依存関係**:
   - ドメイン層は他の層に依存しない
   - アプリケーション層はドメイン層に依存
   - インフラストラクチャ層はアプリケーション層に依存

3. **テスト**:
   - 各レイヤーを独立してテスト
   - モックを使用して依存関係を分離
   - エッジケースを網羅

## 📝 コーディング規則

### 1. TDD開発フロー

**新機能開発時**:
1. 失敗するテストを書く（Red）
2. 最小限の実装でテストを通す（Green）
3. コードを改善する（Refactor）
4. エッジケースのテストを追加
5. エラーハンドリングのテストを追加

**バグ修正時**:
1. バグを再現するテストを作成
2. テストが失敗することを確認
3. 修正してテストを通す
4. 関連するエッジケースを検証

### 2. DDD実装フロー

**新しいドメインオブジェクト追加時**:
1. ドメインオブジェクトのテストを書く
2. ドメインオブジェクトを実装
3. リポジトリインターフェースを定義
4. アプリケーションサービスのテストを書く
5. アプリケーションサービスを実装
6. インフラストラクチャ層のテストを書く
7. インフラストラクチャ層を実装

### 3. コミット前チェック

**必須確認事項**:
- [ ] 全テストが通過する
- [ ] TypeScriptビルドエラーがない
- [ ] 新機能にはエッジケーステストがある
- [ ] エラーハンドリングがテストされている
- [ ] DDDレイヤーの責任が正しく分離されている
- [ ] E2Eテストでユーザーシナリオが検証されている

## 🎯 品質保証

このプロジェクトでは以下の品質基準を維持します:

### 基本品質指標
- ✅ **テスト成功率**: 100% (342/342)
- ✅ **TypeScriptビルドエラーなし**
- ✅ **ESLint/Prettier準拠**
- ✅ **textlint（シナリオ品質）準拠**
- ✅ **依存関係セキュリティ監査**

### DDD品質指標
- ✅ **ドメインロジックの分離**: ビジネスロジックをドメイン層に集約
- ✅ **不変性の保証**: 値オブジェクトの不変性を徹底
- ✅ **テスト独立性**: 各レイヤーを独立してテスト可能
- ✅ **エッジケース網羅**: 境界値・特殊文字・Unicode・NaN/Infinity処理のテスト
- ✅ **型安全性**: TypeScript型システムの完全活用
- ✅ **パフォーマンステスト**: 大量データ・同時実行・タイムアウト処理

### TDD品質指標
- ✅ **テストファースト**: 実装前にテストを作成
- ✅ **リファクタリング安全性**: テストによる変更保護
- ✅ **継続的改善**: Red-Green-Refactorサイクルの実践

### E2E品質指標
- ✅ **ユーザーシナリオ検証**: 実際のブラウザ環境でのテスト
- ✅ **統合テスト**: 全レイヤーの協調動作確認
- ✅ **UI操作テスト**: ゲームアプリケーションの実際の操作フロー

### セキュリティ品質指標
- ✅ **依存関係監査**: npm auditによる脆弱性検出・修正
- ✅ **クライアントサイドセキュリティ**: XSS・CSRF対策
- ✅ **ローカルストレージ**: IndexedDBでの安全なデータ保存

## 🚀 今後の開発指針

### 新機能追加時のアプローチ
1. **ドメインモデリング**: ビジネス要件をドメインオブジェクトとして設計
2. **TDD実践**: テストファーストで実装
3. **レイヤー分離**: DDDアーキテクチャの原則に従った責任分離
4. **エッジケース考慮**: 境界値・エラー処理・特殊ケースを網羅

### コードベースの成長戦略
- **漸進的改善**: 既存コードを段階的にDDDパターンに移行
- **テストカバレッジ向上**: 未テスト部分の継続的な改善
- **設計パターンの一貫性**: 新機能も既存のDDDパターンに準拠

TDD + DDDにより、**安全で保守性の高い拡張可能なコードベース**を構築しています。

## 🚀 DDDアーキテクチャ完全移行完了

### 移行ステータス
- ✅ **ドメイン層**: 完全実装済み
- ✅ **アプリケーション層**: 完全実装済み
- ✅ **インフラストラクチャ層**: 完全実装済み
- ✅ **メインアプリケーション**: DDDアーキテクチャに完全移行
- ✅ **E2Eテスト**: DDDアーキテクチャ対応完了

### 移行による改善点
1. **非同期処理の適切な実装**
   - `async/await`による確実な非同期処理制御
   - イベントハンドラーの非同期対応
   - 初期化競合状態の解決

2. **テストカバレッジの向上**
   - 単体テスト: 328テスト（100%成功）
   - E2Eテスト: 14テスト（100%成功）
   - DDDアーキテクチャ統合テスト追加

3. **アーキテクチャの一貫性**
   - 全レイヤーでDDD原則に準拠
   - 責任分離の徹底
   - 依存関係の適切な管理

## 🎯 エッジケース・品質向上の成果

このプロジェクトではテストコードの可読性向上と包括的なエッジケーステストの追加により、品質を大幅に向上させました。

### 📈 品質向上の数値
- **テスト数増加**: 252テスト → 328テスト (+76テスト)
- **エッジケーステスト**: 新規追加で5つの専用テストファイル
- **テスト成功率**: 100%維持
- **カバレッジ範囲**: DDDアーキテクチャ全レイヤー + エッジケース完全網羅

### 🔍 追加されたエッジケーステスト

#### 1. RouteId.edge-cases.test.ts (22 tests)
- **Unicode文字**: 日本語・絵文字を含むルートID
- **特殊文字**: 記号・数字・空白文字の処理
- **境界値**: 空文字列・非常に長い文字列
- **不変性**: オブジェクトの不変性保証

#### 2. SceneNumber.edge-cases.test.ts (22 tests)
- **型安全性**: 非整数・NaN・Infinity値の検証
- **境界値**: 最大安全整数・ゼロ・負の値
- **パフォーマンス**: 大量オブジェクト作成・演算速度
- **実用性**: ゲームシナリオでの実際の使用パターン

#### 3. GameSettings.edge-cases.test.ts (23 tests)
- **浮動小数点精度**: 高精度値・演算誤差への対応
- **不変性の詳細**: チェーンメソッド・分岐設定の独立性
- **NaN/Infinity処理**: 異常値での適切なエラーハンドリング
- **実用的シナリオ**: ユーザー設定・プリセット管理

#### 4. DexieTextLogRepository.test.ts (15 tests)
- **CRUD操作**: 完全なデータベース操作テスト
- **クエリ性能**: 複雑な検索条件・大量データ処理
- **特殊文字対応**: Unicode・改行・タブ文字の永続化
- **パフォーマンス**: 100件データでの保存・取得速度

#### 5. GameService.edge-cases.test.ts (15 tests)
- **非同期エラー**: 複雑なエラーシナリオ・例外伝播
- **競合状態**: 同時実行・並行処理の整合性
- **タイムアウト処理**: 長時間実行・応答性テスト
- **データ整合性**: トランザクション・原子性の保証

### 🛠️ テストコード可読性の改善

#### Before: 配列インデックス使用
```typescript
const routes = ['route1', 'route2', 'route3'];
gameService.selectRoute(routes[0]); // 何のルートか不明
```

#### After: 直感的な定数使用
```typescript
import { TEST_CONSTANTS } from '../../test/utils/testHelpers';
gameService.selectRoute(TEST_CONSTANTS.ROUTE1); // 明確なルート識別
```

#### テストヘルパーの充実
- **定数管理**: 各ルート・設定値の一元管理
- **モックファクトリ**: 再利用可能なモック生成
- **アサーションヘルパー**: 複雑な検証ロジックの簡略化
- **非同期テスト**: Promise・エラー処理の標準化

### 🎮 実装された品質保証機能

#### 型安全性の向上
- **NaN/Infinity検証**: 数値型の完全な検証
- **整数チェック**: シーン番号の整数性保証
- **範囲検証**: 音量・速度の適切な範囲チェック

#### エラーハンドリングの網羅
- **適切なメッセージ**: ユーザーフレンドリーなエラー文言
- **例外の伝播**: 非同期処理での正確なエラー情報
- **復旧可能性**: 一時的エラーからの回復パターン

#### パフォーマンス保証
- **レスポンス時間**: 各操作の実行時間上限設定
- **メモリ効率**: 大量データ処理での安定性
- **並行処理**: 同時実行での競合状態回避

### 🔧 技術的改善

#### TypeScript設定最適化
- **ビルド分離**: テストファイルをプロダクションビルドから除外
- **型インポート**: `verbatimModuleSyntax`対応
- **未使用コード**: インポート・変数の整理

#### データベース最適化
- **Dexieクエリ**: 効率的なIndexedDB操作
- **ソート処理**: タイムスタンプによる確実な順序保証
- **エラーハンドリング**: データベース操作の例外処理

これらの改善により、**328テスト100%成功**という高い品質水準を達成し、継続的な開発での安全性を確保しています。

## 🛡️ クライアントサイドセキュリティ

### プロジェクトのセキュリティ特性

このプロジェクトは**クライアントサイドのみの静的Webアプリケーション**として設計されており、従来のWebアプリケーションとは異なるセキュリティ要件を持ちます。

#### アーキテクチャ特性
- **静的サイト**: Viteでビルドされる完全な静的サイト
- **サーバーレス**: バックエンドAPI・データベースなし
- **ローカルストレージ**: IndexedDBによる完全ローカルデータ保存
- **クライアントサイド**: 全ての処理がブラウザ内で完結

#### 適用されるセキュリティ対策

1. **依存関係セキュリティ**
   - npm auditによる脆弱性検出・修正
   - 定期的な依存関係更新
   - 不要なパッケージの除去

2. **コード品質によるセキュリティ**
   - TypeScript型安全性による実行時エラー防止
   - ESLint・Prettierによる一貫した品質維持
   - 328テスト100%成功による品質保証

3. **クライアントサイドセキュリティ**
   - XSS対策: 信頼できるデータソースのみ使用
   - CSRF対策: 外部APIへの送信なし
   - データ検証: TypeScript型システムによる入力検証

#### セキュリティ分析結果
- ✅ **脆弱性0件**: 依存関係の脆弱性を完全修正
- ✅ **型安全性**: TypeScript による実行時エラー防止
- ✅ **品質保証**: 328テスト・TDD・DDDによる堅牢性

#### 不要なセキュリティ対策

**CodeQL等の高度なセキュリティ分析**は、以下の理由で不要と判断：
- サーバーサイドコードが存在しない
- 外部APIとの通信がない
- ユーザーデータの外部送信がない
- 権限管理・認証システムがない

### 適切なセキュリティアプローチ

このプロジェクトでは、**シンプルで効果的なセキュリティ対策**を採用：

1. **依存関係監査**: `npm audit`による定期チェック
2. **コード品質**: TypeScript・ESLint・テストによる品質保証
3. **静的解析**: プロジェクトの性質に適したツールのみ使用

この適切なセキュリティアプローチにより、**過度に複雑でない、保守性の高いセキュリティ体制**を構築しています。

## 💡 実装例

### ドメインオブジェクトの実装例

```typescript
// 値オブジェクト例
export class RouteId {
  private readonly value: string;
  
  constructor(value: string) {
    this.value = value;
  }
  
  getValue(): string {
    return this.value;
  }
  
  equals(other: RouteId): boolean {
    return this.value === other.value;
  }
  
  isEmpty(): boolean {
    return this.value === '' || this.value.trim() === '';
  }
  
  static from(value: string): RouteId {
    return new RouteId(value);
  }
  
  static empty(): RouteId {
    return new RouteId('');
  }
}
```

### TDD実装例

```typescript
// 1. テストを先に書く（Red）
describe('RouteId', () => {
  it('有効なルートIDを作成できる', () => {
    const routeId = RouteId.from('route1');
    expect(routeId.getValue()).toBe('route1');
  });
  
  it('空のルートIDは空とみなされる', () => {
    const emptyRoute = RouteId.empty();
    expect(emptyRoute.isEmpty()).toBe(true);
  });
});

// 2. 最小限の実装でテストを通す（Green）
// 3. コードを改善する（Refactor）
```

### アプリケーションサービス実装例

```typescript
export class GameService {
  constructor(
    private gameProgressRepository: GameProgressRepository,
    private gameSettingsRepository: GameSettingsRepository
  ) {}
  
  async selectRoute(routeName: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const progress = await this.gameProgressRepository.getOrCreate();
      const routeId = RouteId.from(routeName);
      
      // ビジネスルールの検証
      if (routeName === 'trueRoute') {
        if (!progress.isTrueRouteUnlocked()) {
          return {
            success: false,
            message: '全てのルートをクリアしてください',
          };
        }
      }
      
      progress.selectRoute(routeId);
      await this.gameProgressRepository.save(progress);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '不明なエラー',
      };
    }
  }
}
```

## 🔄 継続的改善プロセス

### 日常的な開発サイクル
1. **朝の品質チェック**: `npm test` で全テスト状況を確認
2. **機能開発**: TDD + DDDアプローチで実装
3. **コミット前**: 品質チェックリストを確認
4. **週次レビュー**: テストカバレッジと失敗テストの分析

### 品質向上のための継続的取り組み
- **テスト品質の向上**: 全252テストが成功し、100%の成功率を達成
- **エッジケースの追加**: 新しい境界値・エラーケースの発見と追加
- **リファクタリング**: 既存コードのDDDパターンへの移行