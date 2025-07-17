# ブランチ戦略 (Git Flow)

このプロジェクトはGit Flowベースのブランチ戦略を採用しています。

## 🌿 ブランチ構成

### 📍 永続ブランチ

#### `main` ブランチ
- **役割**: 本番環境用の安定版
- **保護**: 直接プッシュ禁止
- **マージ元**: `develop` ブランチのみ
- **リリース**: タグ付けによるバージョン管理
- **品質基準**: 全テスト通過 + 動作確認済み

#### `develop` ブランチ  
- **役割**: 開発統合ブランチ
- **用途**: 機能開発の統合・テスト
- **マージ元**: `feature/*` ブランチ
- **マージ先**: `main` ブランチ（リリース時）
- **品質基準**: 全テスト通過必須

### 🚀 作業ブランチ

#### `feature/*` ブランチ
- **命名規則**: `feature/機能名` または `feature/issue番号-機能名`
- **分岐元**: `develop` ブランチ
- **マージ先**: `develop` ブランチ
- **ライフサイクル**: 機能完成後削除

**例**:
```bash
feature/text-progression    # テキスト送り機能
feature/gallery-ui         # ギャラリーUI
feature/voice-system       # ボイスシステム
feature/23-save-load-ui    # Issue#23 セーブ/ロードUI
```

## 🔄 開発フロー

### 1. 新機能開発開始

```bash
# developブランチを最新化
git checkout develop
git pull origin develop

# 新機能ブランチを作成
git checkout -b feature/機能名

# 開発作業...
# TDDに従ってテストファーストで実装
npm test  # 全テスト通過確認
npm run lint  # コード品質確認
```

### 2. プルリクエスト作成

```bash
# featureブランチをプッシュ
git push -u origin feature/機能名

# GitHub上でPR作成: feature/機能名 → develop
```

### 3. コードレビュー・マージ

- **レビュー要件**:
  - [ ] 全テスト通過 (66+ tests)
  - [ ] TDD手法に従った実装
  - [ ] TypeScriptエラーなし
  - [ ] ESLintエラーなし (`npm run lint`)
  - [ ] 適切なエラーハンドリング
  - [ ] ドキュメント更新（必要に応じて）

### 4. リリース準備

```bash
# developから最新機能をmainにマージ
git checkout main
git pull origin main
git merge develop

# タグ付けでバージョン管理
git tag -a v1.1.0 -m "Release v1.1.0: 新機能追加"
git push origin main --tags
```

## 📋 ブランチ運用ルール

### ✅ 必須ルール

1. **直接コミット禁止**:
   - `main` ブランチへの直接プッシュ禁止
   - `develop` ブランチも重要な変更はPR経由

2. **TDD遵守**:
   - テストファーストでの開発
   - 全テスト通過確認必須
   - リファクタリング時もテスト維持

3. **プルリクエスト必須**:
   - `feature/*` → `develop` はPR必須
   - `develop` → `main` もPR推奨

4. **命名規則**:
   - ブランチ名: kebab-case使用
   - コミットメッセージ: [Conventional Commits](https://www.conventionalcommits.org/)準拠

### 🎯 品質ゲート

各ブランチマージ時の品質基準:

#### `feature/*` → `develop`
- [ ] 全テスト通過
- [ ] TypeScriptビルド成功
- [ ] ESLintエラーなし
- [ ] 新機能のテストカバレッジ追加
- [ ] コードレビュー承認

#### `develop` → `main`
- [ ] 統合テスト実行
- [ ] 手動動作確認
- [ ] パフォーマンステスト
- [ ] セキュリティチェック
- [ ] ドキュメント更新

## 🚨 緊急時対応

### ホットフィックス
緊急のバグ修正が必要な場合:

```bash
# mainから直接hotfixブランチを作成
git checkout main
git checkout -b hotfix/緊急修正内容

# 修正実装...
npm test  # テスト確認

# mainとdevelopの両方にマージ
git checkout main
git merge hotfix/緊急修正内容
git push origin main

git checkout develop  
git merge hotfix/緊急修正内容
git push origin develop
```

## 📊 ブランチ管理コマンド

```bash
# 現在のブランチ状況確認
git branch -a

# リモートブランチとの同期
git fetch --all --prune

# 不要なローカルブランチ削除
git branch -d feature/完了した機能名

# developの最新化
git checkout develop && git pull origin develop
```

## 🤝 チーム開発のベストプラクティス

1. **小さく頻繁なコミット**
2. **わかりやすいコミットメッセージ**
3. **プルリクエストでのコミュニケーション**
4. **コードレビューでの知識共有**
5. **継続的インテグレーション活用**

この戦略により、安定したリリースサイクルと高品質なコードベース維持を実現します。