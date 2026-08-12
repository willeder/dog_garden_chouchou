# Dog Garden ChouChou

ドッグガーデンシュシュ 公式サイト。
`dog_breeder_ran` と同じ構成（Next.js App Router + TypeScript + Tailwind CSS v4 + microCMS）で構築しています。

デザイン: [Figma - Dog Garden Chouchou](https://www.figma.com/design/1TgbRAuC2WkcR4V1huirfq/Dog-Garden-Chouchou)

---

## セットアップ

```bash
npm install
cp .env.example .env.local   # 値を埋める
npm run dev                  # http://localhost:3000
```

`MICROCMS_SERVICE_DOMAIN` / `MICROCMS_API_KEY` が未設定の場合は
`app/_data/mockPuppies.ts` `app/_data/mockVoices.ts` のダミーデータで動作します。
（APIキーが無くても `npm run build` が通る設計）

### 環境変数

| 変数名 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | canonical / sitemap に使用する本番URL |
| `MICROCMS_SERVICE_DOMAIN` | microCMS のサービスドメイン |
| `MICROCMS_API_KEY` | microCMS のAPIキー |
| `NEXT_PUBLIC_GA_ID` | GA4の測定ID（`G-XXXXXXXXXX`）。未設定ならタグを出力しません |

お問い合わせは**公式LINEへの導線のみ**のため、メール送信（SMTP）の設定は不要です。

---

## ディレクトリ構成

`dog_breeder_ran` の規約を踏襲しています。

```
app/
├── _api/          microCMS取得層（puppies / voices）
├── _common/       ページ横断の共通コンポーネント（ui / LineGuide / FadeInSection）
├── _components/   TOPページのセクション ＋ GoogleAnalytics
├── _config/       ISR設定・メタデータ生成
├── _data/         犬舎情報・FAQ・モックデータ
├── _layout/       ヘッダー / フッター / BACKリンク
├── _lib/          microCMSクライアント・日付/金額フォーマッタ
├── _model/        ドメインモデル（Puppy / Voice / Faq ほか）
├── about/         犬舎について
├── adoption/      里親募集
├── contact/       お問い合わせ（公式LINE導線）
├── faq/           よくある質問
├── policy/        プライバシーポリシー
├── puppies/       仔犬紹介（一覧 + /[id] 詳細）
├── visit/         見学について
└── voice/         お客様の声
```

### Figmaフレームとルートの対応

| Figmaフレーム | ルート |
| --- | --- |
| TOP_PC | `/` |
| ABOUTUS | `/about` |
| PUPPYINFO | `/puppies` |
| PUPPYINFO_detail | `/puppies/[id]` |
| INFO | `/adoption` |
| THANKYOU | `/voice` |
| VISITUS | `/visit` |
| Q＆A | `/faq` |
| CONTACTUS | `/contact` |
| （Figmaになし） | `/policy` |

---

## dog_breeder_ran との対応関係

### 完全に踏襲している部分

- ディレクトリ規約（`_api` `_common` `_components` `_config` `_data` `_layout` `_lib` `_model` ＋ ページ配下の `_components`）
- API層の作法（`_api/<endpoint>/get.ts` + `response.ts`、`MC〜` 型 → `newXFromMC()` 変換、`next.tags` + revalidate）
- `_config/isr.ts`（`defaultRevalidateTime` / `defaultItemLimit`）、`_config/metadata.ts` の `generateMetadata()` ヘルパー
- `_lib/microcms/client.ts`、`_lib/date.ts`（`parseLocalDate`）、`_lib/format.ts`
- `_layout/header/useScrollBehavior.ts`（下スクロールでヘッダーを隠す挙動）
- `_components/GoogleAnalytics.tsx`
- `_common/ui/Icon.tsx`、`_common/FadeInSection`
- `layout.tsx` の構造（`next/font` → GA → Header → main → Footer）

### chouchou 固有

| ファイル | 役割 |
| --- | --- |
| `_common/ui/SectionHeading.tsx` | 骨型プレート＋英字＋日本語見出し（Figma共通パーツ） |
| `_common/ui/CloudDecoration.tsx` | 下層ページ上部の雲の装飾 |
| `_common/LineGuide/` | 公式LINEへの導線（ran の `LineGuide.tsx` 相当） |
| `_layout/back/` | Figma base/BACK コンポーネント |
| `_data/mockPuppies.ts` `mockVoices.ts` | microCMS未接続時のフォールバック（ran にはない仕組み） |

### ran にあって chouchou に無いもの

Figma に該当画面が無い、または要件外のため未実装です。

- `reservation/` 一式＋`api/reservation`（見学予約は外部カレンダーを利用）
- `rehoming/[id]`（里親募集は説明ページ1枚）
- `warranty`（生体保証）／利用規約
- `api/contact` + nodemailer（お問い合わせはLINEのみ）
- `puppies` の並び替え（`Order` / `OrderModal`）、`FilterModal`

---

## デザイントークン

`app/globals.css` の `@theme` に Figma の変数を1:1で定義しています。

| トークン | 値 | Figma変数 |
| --- | --- | --- |
| `pink` | `#F0D0D8` | PINK |
| `blue` | `#EAF1F2` | BLUE |
| `beige` | `#F6F3E9` | BEIGE |
| `green` | `#C7E7C8` | GREEN |
| `green-dark` | `#AAC5AB` | DARK GREEN |
| `yellow` | `#ECEFBB` | YELLOW |
| `yellow-light` | `#F5F7CA` | Q&Aカード背景（Figma生値） |
| `ink` | `#696969` | BLACK |
| `ink-light` | `#7C7C7C` | BLACK_3 |
| `shadow-pop` | `5px 5px 0 rgba(0,0,0,.15)` | shadow |
| `shadow-btn` | `2px 2px 0 rgba(0,0,0,.2)` | ボタン影 |

フォント: 日本語 `M PLUS 1p`（Medium 500 / ExtraBold 800）、英字見出し `Poller One`。
`next/font/google` で読み込み、CSS変数 `--font-jp` / `--font-en` として利用します。

---

## microCMS のAPIスキーマ

以下の2つのAPIを作成してください。

### `puppies`（リスト形式）

| フィールドID | 表示名 | 種類 | 必須 |
| --- | --- | --- | --- |
| `images` | 写真 | 複数画像 | ○ |
| `breed` | 犬種 | テキストフィールド | ○ |
| `sex` | 性別 | セレクトフィールド（`男の子` / `女の子`） | ○ |
| `birthday` | 誕生日 | 日時 | ○ |
| `color` | 毛色 | テキストフィールド | ○ |
| `price` | 価格 | 数値 | |
| `feature` | 特徴 | テキストフィールド | |

※ `images` の1枚目が詳細ページのメイン画像、2枚目以降がサムネイルになります。

### `voices`（リスト形式）

| フィールドID | 表示名 | 種類 | 必須 |
| --- | --- | --- | --- |
| `image` | 写真 | 画像 | |
| `title` | 見出し | テキストフィールド | ○ |
| `body` | 本文 | テキストエリア | ○ |

※ `title` は `福岡市 T様宅　マルチーズ　〇〇ちゃん` の形式を想定。

ISRは `app/_config/isr.ts` の `defaultRevalidateTime`（3600秒）を基準にしています。
仔犬一覧は1ページ12件のクライアントサイドページネーション（`puppies/_components/Pagination.tsx`）。

---

## レスポンシブ

Figmaは1024px幅のPCデザインのみのため、SPレイアウトは実装側で設計しています。

- `md`（768px）未満: ヘッダーをロゴ＋ハンバーガーに切り替え、ドロワーメニューを表示
- カルーセル（TOPヒーロー / お客様の声）は表示枚数を 1 → 2 → 3 枚と段階的に増加
- カード系グリッドは 1 → 2 → 3 カラム
- 本文幅は `measure-560` / `measure-700` ユーティリティで Figma の 560px / 700px に対応

---

## 要確認・未設定の項目

`app/_data/kennelInfo.ts` に空文字で用意してあります。値を入れるだけで反映されます。

| 項目 | 設定先 | 状況 |
| --- | --- | --- |
| **公式LINEの友だち追加URL** | `kennelInfo.sns.line.url` | **未設定。空のままだと友だち追加ボタンが表示されません** |
| 公式LINEのID | `kennelInfo.sns.line.id` | 未設定 |
| 友だち追加用QRコード画像 | `kennelInfo.sns.line.qrImage` | 未設定。設定するとPC向けQRブロックが表示されます |
| Instagram / TikTok のURL | `kennelInfo.sns` | 仮のトップURL |
| 住所・郵便番号・メールアドレス | `kennelInfo` | Figma・支給素材に記載なし。プライバシーポリシーの窓口欄にも使用 |
| GA4の測定ID | `NEXT_PUBLIC_GA_ID` | 未支給 |

Figma上でダミー／プレースホルダーだった箇所:

| 箇所 | 状況 |
| --- | --- |
| Q＆A の質問・回答（全6問） | Figmaは「テキスト入ります。」。`app/_data/faqData.ts` を差し替え |
| 見学について の注意事項本文 | 同上。`app/visit/page.tsx` |
| 見学予約カレンダー | FigmaはTimeRexのスクリーンショット画像。`kennelInfo.reservationUrl` にURLを設定すると iframe 埋め込みに切り替わる |
| 里親募集ページ下部 | Figmaは700×416のグレー枠のみ（動画枠と推測）。`app/adoption/page.tsx` |
| ブリーダー写真 | Figmaはグレーの円プレースホルダー。`public/assets/about-breeder-avatar.svg` を実写に差し替え |
| favicon / OGP画像 | 未支給。`app/icon.png` `app/opengraph-image.jpg` を追加 |
| 仔犬詳細の価格表記 | Figma原文は「230,000万円」。誤記と判断し `230,000円` で実装 |
| 「ビションフリーぜ」の表記 | Figma原文どおり（一般表記は「ビションフリーゼ」）。`app/_model/breed.ts` |

プライバシーポリシー（`app/policy/_components/PrivacyPolicy.tsx`）は
`dog_breeder_ran` の文面をベースにした**ドラフト**です。公開前に事業者側での内容確認をお願いします。
