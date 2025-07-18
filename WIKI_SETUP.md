# GitHub Wiki 設定手順

このファイルは、GitHubリポジトリのWikiを設定するための手順書です。

## 🎯 目的

`wiki-content/` ディレクトリにある包括的なドキュメント群をGitHub Wikiで参照できるようにします。

## 📋 Wiki作成手順

### 1. GitHub Wikiへのアクセス
1. [Quality Prism リポジトリ](https://github.com/kosuke-fujisawa/quality-prism) にアクセス
2. 上部タブの **"Wiki"** をクリック
3. **"Create the first page"** ボタンをクリック

### 2. ホームページ作成
1. ページタイトルを **"Home"** に設定
2. `wiki-content/Home.md` の内容をエディタにコピー&ペースト
3. **"Save Page"** をクリック

### 3. 各Wikiページの作成

以下の順序で各ページを作成することを推奨します：

#### A. アーキテクチャ・設計ページ
1. **"DDD Architecture"** ページ
   - `wiki-content/DDD-Architecture.md` の内容を使用
   - Domain-Driven Design の実装詳細

2. **"TDD Guidelines"** ページ
   - `wiki-content/TDD-Guidelines.md` の内容を使用
   - テスト駆動開発の実践指針

3. **"Logging System"** ページ
   - `wiki-content/Logging-System.md` の内容を使用
   - 89テスト完成のエンタープライズロギング

#### B. 開発・運用ページ
4. **"Development Setup"** ページ
   - `wiki-content/Development-Setup.md` の内容を使用
   - 開発環境構築完全ガイド

5. **"Test Strategy"** ページ
   - `wiki-content/Test-Strategy.md` の内容を使用
   - 425テストの体系的戦略

### 4. ページ作成の操作手順
各ページ作成時は以下の手順を実行：
1. Wikiホームページで **"New Page"** をクリック
2. ページタイトルを英語で入力（例: "DDD Architecture"）
3. 対応する `.md` ファイルの内容をコピー&ペースト
4. **"Save Page"** をクリック

## 📊 作成予定のWikiページ一覧

| ページ名 | ファイル | 内容 | 読者対象 |
|----------|----------|------|----------|
| Home | `Home.md` | Wikiナビゲーション・概要 | 全員 |
| DDD Architecture | `DDD-Architecture.md` | DDDアーキテクチャ詳細 | 開発者・アーキテクト |
| TDD Guidelines | `TDD-Guidelines.md` | TDD実践指針 | 全開発者 |
| Logging System | `Logging-System.md` | ロギングシステム | インフラ・開発者 |
| Development Setup | `Development-Setup.md` | 環境構築ガイド | 新規開発者 |
| Test Strategy | `Test-Strategy.md` | テスト戦略 | QA・開発者 |

## 🔗 リンク確認

Wiki作成後、以下のリンクが正常に動作することを確認：

### 内部リンク
- `[[DDD Architecture|DDDアーキテクチャ]]` → DDD Architecture ページ
- `[[TDD Guidelines|TDD開発指針]]` → TDD Guidelines ページ
- `[[Development Setup|開発環境構築]]` → Development Setup ページ

### 外部リンク
- GitHub Issues へのリンク
- リポジトリファイルへのリンク
- 外部ドキュメントへのリンク

## ✅ 完了確認

Wiki設定完了後、以下を確認：

1. **アクセス確認**
   - [https://github.com/kosuke-fujisawa/quality-prism/wiki](https://github.com/kosuke-fujisawa/quality-prism/wiki) にアクセス可能

2. **ナビゲーション確認**
   - ホームページから各ページへのリンクが正常動作
   - 相互参照リンクが適切に機能

3. **コンテンツ確認**
   - 各ページの内容が適切に表示
   - コードブロック・テーブル・リストの表示確認

4. **README更新確認**
   - README.md の Wikiリンクが正常動作

## 🚀 メンテナンス

### 定期更新
- プロジェクト更新時にWiki内容も同期更新
- テスト統計・実装状況の数値更新
- 新機能追加時のドキュメント追加

### 品質管理
- 実装とドキュメントの整合性維持
- リンク切れの定期チェック
- 内容の正確性・最新性確保

---

この手順により、**品質のプリズム**プロジェクトの包括的なWikiドキュメント体系が利用可能になります。