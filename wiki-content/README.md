# Wiki Content Files

このディレクトリには、GitHub Wiki用のMarkdownファイルが含まれています。

## 📋 ファイル一覧

### メインページ
- **Home.md** - Wikiホームページ (ナビゲーション・概要)

### アーキテクチャ・設計
- **DDD-Architecture.md** - Domain-Driven Design アーキテクチャ詳細
- **Logging-System.md** - 包括的ロギングシステム (89テスト実装)
- **TDD-Guidelines.md** - Test-Driven Development 開発指針

### 開発・テスト
- **Development-Setup.md** - 開発環境構築ガイド
- **Test-Strategy.md** - テスト戦略 (425テスト体系)

## 🚀 Wiki作成手順

1. GitHubリポジトリのWikiタブにアクセス
2. "Create the first page" または "New Page" をクリック
3. 各ファイルの内容をコピー&ペーストして作成

### ページ作成順序（推奨）
1. **Home** (Home.md) - メインページとナビゲーション
2. **DDD Architecture** (DDD-Architecture.md) - アーキテクチャ理解
3. **TDD Guidelines** (TDD-Guidelines.md) - 開発手法理解
4. **Development Setup** (Development-Setup.md) - 環境構築
5. **Test Strategy** (Test-Strategy.md) - テスト戦略
6. **Logging System** (Logging-System.md) - ロギング詳細

## 📝 Wiki管理のベストプラクティス

### ページ命名規則
- 英語でのページ名使用
- ハイフン区切り (例: "DDD-Architecture")
- 大文字開始 (例: "Development-Setup")

### 内部リンク
- `[[Page-Name|表示名]]` 形式でリンク作成
- 相互参照による情報連携

### 更新管理
- プロジェクト更新時にWiki内容も同期更新
- 実装とドキュメントの整合性維持

## 📊 Wiki統計

| ページ | 行数 | 主要セクション数 | 対象読者 |
|--------|------|------------------|----------|
| Home | 120 | 8 | 全開発者 |
| DDD Architecture | 400 | 12 | アーキテクト・開発者 |
| TDD Guidelines | 350 | 10 | 全開発者 |
| Development Setup | 300 | 11 | 新規開発者 |
| Test Strategy | 380 | 9 | QA・開発者 |
| Logging System | 420 | 13 | インフラ・開発者 |

## 🔄 継続的更新

### 定期更新項目
- テスト統計数値
- 新機能・アーキテクチャ変更
- 開発ツール・依存関係更新
- パフォーマンス指標

### バージョン管理
- プロジェクトリリース時にWiki更新
- 重要な変更時は更新日時記録
- 古い情報の定期的な見直し

---

これらのWikiページにより、**品質のプリズム**プロジェクトの包括的なドキュメント体系が構築されます。