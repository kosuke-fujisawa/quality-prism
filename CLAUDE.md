# 品質のプリズム - 開発ガイドライン

## 🧪 開発方針

このプロジェクトは **t_wadaさんの推奨するTDD (Test-Driven Development)** と **DDD (Domain-Driven Design)** アーキテクチャを組み合わせて開発を進めています。

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

- **総テスト数**: 212
- **成功率**: 93% (197/212)
- **テストファイル**: 17ファイル

### テストカバレッジ

#### 既存アーキテクチャ (66 tests)
- `NovelGameApp.test.ts`: 11 tests - UI・イベント処理
- `ChoiceSystem.test.ts`: 16 tests - 選択肢・ルート分岐
- `ScenarioLoader.test.ts`: 8 tests - YAMLファイル読み込み
- `GameLogic.test.ts`: 10 tests - ゲーム状態管理
- `TextLog.test.ts`: 13 tests - テキストログ
- `SaveData.test.ts`: 8 tests - データ永続化

#### DDDアーキテクチャ - ドメイン層 (76 tests)
- `GameProgress.test.ts`: 7 tests - ゲーム進行エンティティ
- `GameProgress.edge-cases.test.ts`: 16 tests - エッジケース・境界値
- `TextLogEntry.test.ts`: 13 tests - テキストログエンティティ
- `RouteId.test.ts`: 10 tests - ルートID値オブジェクト
- `RouteId.edge-cases.test.ts`: 21 tests - エッジケース・特殊文字
- `SceneNumber.test.ts`: 10 tests - シーン番号値オブジェクト
- `GameSettings.test.ts`: 18 tests - ゲーム設定値オブジェクト
- `RouteValidationService.test.ts`: 9 tests - ルート検証ドメインサービス

#### DDDアーキテクチャ - アプリケーション層 (16 tests)
- `GameService.test.ts`: 16 tests - ゲームアプリケーションサービス

#### DDDアーキテクチャ - インフラストラクチャ層 (26 tests)
- `DexieGameProgressRepository.test.ts`: 12 tests - ゲーム進行リポジトリ
- `DexieGameSettingsRepository.test.ts`: 14 tests - ゲーム設定リポジトリ

#### E2Eテスト (Playwright)
- **ユーザーシナリオ**: 実際のブラウザ環境でのゲーム動作検証
- **統合テスト**: 全レイヤーの協調動作テスト
- **UI操作テスト**: ゲームアプリケーションの実際の操作フロー

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
- ✅ **テスト成功率**: 93% (197/212)
- ✅ **TypeScriptビルドエラーなし**
- ✅ **ESLint/Prettier準拠**
- ✅ **textlint（シナリオ品質）準拠**

### DDD品質指標
- ✅ **ドメインロジックの分離**: ビジネスロジックをドメイン層に集約
- ✅ **不変性の保証**: 値オブジェクトの不変性を徹底
- ✅ **テスト独立性**: 各レイヤーを独立してテスト可能
- ✅ **エッジケース網羅**: 境界値・特殊文字・エラー処理のテスト

### TDD品質指標
- ✅ **テストファースト**: 実装前にテストを作成
- ✅ **リファクタリング安全性**: テストによる変更保護
- ✅ **継続的改善**: Red-Green-Refactorサイクルの実践

### E2E品質指標
- ✅ **ユーザーシナリオ検証**: 実際のブラウザ環境でのテスト
- ✅ **統合テスト**: 全レイヤーの協調動作確認
- ✅ **UI操作テスト**: ゲームアプリケーションの実際の操作フロー

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
- **失敗テストの分析**: 15の失敗テストを段階的に修正
- **エッジケースの追加**: 新しい境界値・エラーケースの発見と追加
- **リファクタリング**: 既存コードのDDDパターンへの移行