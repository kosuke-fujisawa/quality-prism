# 品質のプリズム (Quality Prism) Wiki

[![Tests](https://img.shields.io/badge/tests-425%20total%20|%20425%20passing-brightgreen)](https://github.com/kosuke-fujisawa/quality-prism)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![TDD](https://img.shields.io/badge/development-TDD-orange)](https://github.com/kosuke-fujisawa/quality-prism/blob/main/CLAUDE.md)

ソフトウェア開発における品質の本質を探求するノベルゲームの開発ドキュメント集

## 📚 Wiki ページ一覧

### 🎮 ゲーム仕様
- **[[Game Overview|ゲーム概要]]** - ゲームシステムとルート分岐
- **[[Scenario Format|シナリオ形式]]** - YAMLシナリオファイルの仕様
- **[[Route System|ルートシステム]]** - 3つのルートの詳細設計
- **[[Save System|セーブシステム]]** - データ永続化の仕組み

### 🏗️ アーキテクチャ
- **[[DDD Architecture|DDDアーキテクチャ]]** - Domain-Driven Design の実装
- **[[Repository Pattern|リポジトリパターン]]** - データアクセス層の設計
- **[[Logging System|ロギングシステム]]** - 包括的ログ記録アーキテクチャ
- **[[Error Handling|エラーハンドリング]]** - 例外処理とエラー管理

### 🧪 開発・テスト
- **[[TDD Guidelines|TDD開発指針]]** - テスト駆動開発の実践
- **[[Test Strategy|テスト戦略]]** - 425テストの体系的構成
- **[[E2E Testing|E2Eテスト]]** - Playwrightによる統合テスト
- **[[Development Workflow|開発ワークフロー]]** - ブランチ戦略とリリース

### 🛠️ セットアップ・運用
- **[[Development Setup|開発環境構築]]** - 環境セットアップガイド
- **[[Build Deployment|ビルド・デプロイ]]** - 本番環境への配備
- **[[Performance Optimization|パフォーマンス最適化]]** - 速度・メモリ最適化
- **[[Troubleshooting|トラブルシューティング]]** - 一般的な問題と解決策

### 🔧 ツール・インテグレーション
- **[[Vite Configuration|Vite設定]]** - ビルドツール設定詳細
- **[[TypeScript Configuration|TypeScript設定]]** - 型チェック・コンパイル設定
- **[[ESLint Prettier|コード品質ツール]]** - リント・フォーマット設定
- **[[GitHub Actions|CI/CD]]** - 自動化パイプライン

### 📈 プロジェクト管理
- **[[Coding Standards|コーディング規約]]** - プロジェクト共通ルール
- **[[Git Workflow|Git運用]]** - ブランチ管理とコミット規約
- **[[Issue Management|Issue管理]]** - 課題追跡とラベル体系
- **[[Release Notes|リリースノート]]** - バージョン履歴

## 🚀 クイックスタート

新規開発者向けの必読ページ：
1. [[Development Setup|開発環境構築]]
2. [[TDD Guidelines|TDD開発指針]]
3. [[DDD Architecture|DDDアーキテクチャ]]
4. [[Development Workflow|開発ワークフロー]]

## 📊 プロジェクト統計

- **総テスト数**: 425 (100% 成功)
- **総ファイル数**: 50+ TypeScript/test files
- **アーキテクチャ**: DDD (Domain-Driven Design)
- **開発手法**: TDD (Test-Driven Development)
- **フレームワーク**: Vite + TypeScript
- **テストツール**: Vitest + Playwright

## 💡 貢献ガイド

このプロジェクトに貢献する際は：
1. [[TDD Guidelines|TDD開発指針]]に従ってテストを先に作成
2. [[DDD Architecture|DDDアーキテクチャ]]の原則を遵守
3. [[Coding Standards|コーディング規約]]を確認
4. [[Git Workflow|Git運用]]に基づいてブランチを作成

## 📞 サポート

質問や提案がある場合：
- **Issues**: [GitHub Issues](https://github.com/kosuke-fujisawa/quality-prism/issues)
- **Wiki**: この Wiki ページでドキュメントを確認
- **Code**: [CLAUDE.md](https://github.com/kosuke-fujisawa/quality-prism/blob/main/CLAUDE.md) で開発ガイドラインを確認

---

**最終更新**: 2025年7月18日  
**プロジェクト**: 品質のプリズム v1.0.0  
**開発**: TDD + DDD アプローチ