# 3D Super Mario Kart

ブラウザで遊べる3Dカートレースゲームです。ゲーム内タイトルは **SUPER MARIO KART**。SNES風のキャラクターデザインとマリオカート風の演出を取り入れ、ドリフト・アイテム・AI対戦を楽しめます。

## 概要

- Three.jsで動作するフル3Dのカートレーサー
- プレイヤーはマリオ固定、AIはマリオカート風キャラクター（ルイージ、ピーチ、ヨッシー、クッパ、ドンキー、ワリオなど）
- 草原・雪原・クッパ城の3コース
- ドリフトでターボ発動（青→オレンジ→紫）
- アイテムボックスのルーレット演出とSNES風アイコン

## セットアップ

### 前提条件
- Node.js 18以上
- pnpm

### インストールと起動
```bash
# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm dev

# ブラウザでアクセス
open http://localhost:3000/game.html
```

## 技術仕様

- **フロントエンド**: React 19.2.1 + TypeScript + Vite
- **3Dエンジン**: Three.js
- **スタイリング**: TailwindCSS 4.x + Radix UI
- **パッケージマネージャー**: pnpm

## ライセンス
MIT License