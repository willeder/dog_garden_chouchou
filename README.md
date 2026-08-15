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
├── _api/          microCMS取得層（puppies / voices / rehoming）
├── _common/       ページ横断の共通コンポーネント（ui / LineGuide / PhotoGallery / FadeInSection）
├── _components/   TOPページのセクション ＋ GoogleAnalytics
├── _config/       ISR設定・メタデータ生成
├── _data/         犬舎情報・FAQ・モックデータ
├── _layout/       ヘッダー / フッター / BACKリンク
├── _lib/          microCMSクライアント・日付/金額フォーマッタ
├── _model/        ドメインモデル（Puppy / Voice / Faq ほか）
├── about/         犬舎について
├── adoption/      里親募集（一覧 + /[id] 詳細）
├── contact/       お問い合わせ（公式LINE導線）
├── faq/           よくある質問
├── policy/        利用規約・プライバシーポリシー
├── puppies/       仔犬紹介（一覧 + /[id] 詳細）
├── visit/         見学について（注意点 ＋ 公式LINE導線）
├── voice/         お客様の声
└── warranty/      生体保証
```

### Figmaフレームとルートの対応

| Figmaフレーム | ルート |
| --- | --- |
| TOP_PC | `/` |
| ABOUTUS | `/about` |
| PUPPYINFO | `/puppies` |
| PUPPYINFO_detail | `/puppies/[id]` |
| INFO | `/adoption`（+ `/adoption/[id]`） |
| THANKYOU | `/voice` |
| VISITUS | `/visit`（予約カレンダーは公式LINE導線に変更） |
| Q＆A | `/faq` |
| CONTACTUS | `/contact` |
| （Figmaになし） | `/warranty`・`/policy` |

---

## dog_breeder_ran との対応関係

**ページ構成は `dog_breeder_ran` を正、デザインは Figma を正**として実装しています。

### 完全に踏襲している部分

- ディレクトリ規約（`_api` `_common` `_components` `_config` `_data` `_layout` `_lib` `_model` ＋ ページ配下の `_components`）
- API層の作法（`_api/<endpoint>/get.ts` + `response.ts`、`MC〜` 型 → `newXFromMC()` 変換、`next.tags` + revalidate）
- `_config/isr.ts`（`defaultRevalidateTime` / `defaultItemLimit`）、`_config/metadata.ts` の `generateMetadata()` ヘルパー
- `_lib/microcms/client.ts`、`_lib/date.ts`（`parseLocalDate`）、`_lib/format.ts`
- `_layout/header/useScrollBehavior.ts`（下スクロールでヘッダーを隠す挙動）
- `_components/GoogleAnalytics.tsx`
- `_common/ui/Icon.tsx`、`_common/FadeInSection`
- `layout.tsx` の構造（`next/font` → GA → Header → main → Footer）
- TOPのセクション順（Hero → About → 仔犬一覧 → リンク集 → お問い合わせ → SNS）
- キービジュアル（全幅スライドショー・5秒で自動送り・インジケータ）
- `/about` の構成（こだわり → ブリーダー紹介 → スタッフの1日 → 犬舎概要 → 動物取扱業登録）
- `/warranty`（生体保証）、`/policy`（利用規約 ＋ プライバシーポリシー）
- `_model` / `_api` の項目（Puppy・Parent・Status・RehomingDog）

### chouchou 固有

| ファイル | 役割 |
| --- | --- |
| `_common/ui/SectionHeading.tsx` | 骨型プレート＋英字＋日本語見出し（Figma共通パーツ） |
| `_common/ui/CloudDecoration.tsx` | 下層ページ上部の雲の装飾 |
| `_common/LineGuide/` | 公式LINEへの導線（ran の `LineGuide.tsx` 相当） |
| `_common/PhotoGallery/` | メイン画像＋サムネイルのギャラリー（仔犬詳細・里親募集詳細で共用） |
| `_common/ui/SpecTable.tsx` | スペック表（同上。項目が奇数のときは最終行を2列ぶち抜き） |
| `_layout/back/` | Figma base/BACK コンポーネント |
| `_data/mockPuppies.ts` `mockVoices.ts` | microCMS未接続時のフォールバック（ran にはない仕組み） |

### ran にあって chouchou に無いもの

Figma に該当画面が無い、または要件外のため未実装です。

- `reservation/` 一式＋`api/reservation`（見学申し込みは公式LINEに集約）
- `api/contact` + nodemailer、`/contact/complete`（お問い合わせはLINEのみ）
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

以下の4つのAPIを作成してください。

### `puppies`（リスト形式）

`dog_breeder_ran` の `puppies` API と同じ項目構成です。
ran は画像を `images1` / `images2` の2フィールドに分けていますが、
chouchou では `images` 1フィールドにまとめています。

| フィールドID | 表示名 | 種類 | 必須 |
| --- | --- | --- | --- |
| `images` | 写真 | 複数画像 | ○ |
| `breed` | 犬種 | テキストフィールド | ○ |
| `breed_explanation` | 犬種の説明 | テキストエリア | |
| `sex` | 性別 | セレクトフィールド（`男の子` / `女の子`） | ○ |
| `birthday` | 誕生日 | 日時 | ○ |
| `color` | 毛色 | テキストフィールド | ○ |
| `expected_weight` | 成犬時予想体重(kg) | 数値 | |
| `expected_height` | 成犬時予想体高(cm) | 数値 | |
| `price` | 価格(円・税込) | 数値 | |
| `message` | ブリーダーからのメッセージ | テキストエリア | ○ |
| `mother` | 母犬 | コンテンツ参照（`parents`） | |
| `father` | 父犬 | コンテンツ参照（`parents`） | |
| `status` | ステータス | セレクトフィールド（`商談中` / `成約済み`） | |

※ `images` の1枚目が詳細ページのメイン画像、2枚目以降がサムネイルになります。
※ `status` は未選択＝募集中。選択するとカードと詳細の写真左上にバッジが出ます。
※ 「生後○ヶ月」は `birthday` からサーバー側で算出（ISRの再生成時に更新）。

### `parents`（リスト形式）

`puppies` の `mother` / `father` から参照する親犬のAPIです。

| フィールドID | 表示名 | 種類 | 必須 |
| --- | --- | --- | --- |
| `image` | 写真 | 複数画像（1枚） | ○ |
| `name` | お名前 | テキストフィールド | ○ |
| `breed` | 犬種 | テキストフィールド | ○ |
| `sex` | 性別 | セレクトフィールド（`男の子` / `女の子`） | ○ |
| `birthday` | 誕生日 | 日時 | ○ |
| `color` | 毛色 | テキストフィールド | ○ |
| `weight` | 体重(kg) | 数値 | ○ |

### `voices`（リスト形式）

| フィールドID | 表示名 | 種類 | 必須 |
| --- | --- | --- | --- |
| `image` | 写真 | 画像 | |
| `title` | 見出し | テキストフィールド | ○ |
| `body` | 本文 | テキストエリア | ○ |

※ `title` は `福岡市 T様宅　マルチーズ　〇〇ちゃん` の形式を想定。

### `rehoming`（リスト形式）

`dog_breeder_ran` の `rehoming` API と同じ項目構成です。
ran は画像を `images1` / `images2` の2フィールドに分けていますが、
chouchou では `puppies` と揃えて `images` 1フィールドにまとめています。

| フィールドID | 表示名 | 種類 | 必須 |
| --- | --- | --- | --- |
| `name` | お名前 | テキストフィールド | ○ |
| `images` | 写真 | 複数画像 | ○ |
| `breed` | 犬種 | テキストフィールド | ○ |
| `sex` | 性別 | セレクトフィールド（`男の子` / `女の子`） | ○ |
| `birthday` | 誕生日 | 日時 | ○ |
| `size` | サイズ | テキストフィールド | ○ |
| `color` | 毛色 | テキストフィールド | ○ |
| `weight` | 体重(kg) | 数値 | ○ |
| `vaccination` | ワクチン接種済み | 真偽値 | |
| `neutering` | 避妊・去勢済み | 真偽値 | |
| `description` | ブリーダーからの紹介文 | テキストエリア | ○ |

ISRは `app/_config/isr.ts` の `defaultRevalidateTime`（3600秒）を基準にしています。
仔犬一覧は1ページ12件のクライアントサイドページネーション（`puppies/_components/Pagination.tsx`）。

TOPの犬種カードは `/puppies?breed=<犬種名>` へのリンクで、一覧をその犬種で絞り込んだ状態で開きます。
カードの写真はmicroCMSに該当犬種の仔犬がいればその1枚目を使い、いなければ静的画像にフォールバックします。

---

## レスポンシブ

Figmaは1024px幅のPCデザインのみのため、SPレイアウトは実装側で設計しています。

- `md`（768px）未満: ヘッダーをロゴ＋ハンバーガーに切り替え、ドロワーメニューを表示
- カルーセル（TOPヒーロー / お客様の声）は表示枚数を 1 → 2 → 3 枚と段階的に増加
- カード系グリッドは 1 → 2 → 3 カラム
- 本文幅は `measure-560` / `measure-700` ユーティリティで Figma の 560px / 700px に対応

---

## キービジュアルについて

TOPのキービジュアルは `dog_breeder_ran` と同じ**全幅スライドショー**（5秒ごとに自動送り、インジケータ付き）です。
下端にFigmaの緑の丘・雲・花を重ね、次のABOUT USセクションと地続きに見えるようにしています。

- 表示する写真: `app/_components/hero/data.ts`
- キャッチコピー: `app/_components/hero/copy.ts` … **Figmaに記載が無いため暫定の文言です**

### 表示比率

高さ固定ではなく**アスペクト比指定**にしているため、画面幅が変わっても写真の見え方が揃います。

| 画面 | 比率 | 例 |
| --- | --- | --- |
| SP（〜639px） | `4:3`（スマホで横向きに撮った静止画と同じ） | 390 × 293 |
| sm以上 | `16:9`（スマホの横画面と同じ） | 1024 × 576 |
| 大画面 | `max-h-[72vh]` でクランプ（その分だけ上下がトリミング） | 1440 × 720 |

緑の丘・インジケータ・コピーの余白もすべて%指定なので、比率を変えても崩れません。
比率を変えたい場合は `HeroSlideshow.tsx` の `aspect-[4/3]` / `sm:aspect-[16/9]` を書き換えてください。

写真の切り抜き基準は `object-[center_35%]`（やや上寄り）です。縦長写真でも顔が入りやすい位置に調整しています。

**写真は横長（1600×900px以上）を推奨します。** 現在設定しているのはFigmaに入っていた縦長の写真で、
全幅に引き伸ばすと顔まわりだけが大きく切り取られます。ドッグランで遊んでいる様子など、
引きのある横向きの写真を3枚ご用意いただくと、このレイアウトの効果が最大になります。

---

## Instagramセクションについて

TOPのInstagramセクションは、**投稿風カード3枚から公式アカウントへ誘導する**構成です（APIによる自動取得はしていません）。

APIで最新投稿を自動表示することも技術的には可能ですが、以下の運用が発生するため現状は見送っています。

- Instagram Basic Display API は廃止済み。後継は **Instagram API with Instagram Login** または **Instagram Graph API**
- **プロアカウント（ビジネス/クリエイター）限定**、Meta開発者アカウントとアプリ登録が必要
- アクセストークンの有効期限が**最長60日**。自動更新の仕組みを入れないと表示が止まる
- レート制限の目安は 200リクエスト/時

将来的に導入する場合は、`_api/instagram/get.ts` を追加してサーバー側で取得し、失敗時は現在のサンプル画像にフォールバックする形が安全です。

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
| 見学について の注意事項本文 | Figmaは「テキスト入ります。」。一般的な内容で暫定4項目を記載（`app/visit/page.tsx`） |
| ブリーダー写真 | Figmaはグレーの円プレースホルダー。`public/assets/about-breeder-avatar.svg` を実写に差し替え |
| favicon / OGP画像 | 未支給。`app/icon.png` `app/opengraph-image.jpg` を追加 |
| TOPのInstagram投稿画像 | `public/assets/top-insta-photo-1〜3.png` はサンプル。実際の投稿画像に差し替え |
| キービジュアルの写真 | 縦長のため横長に切り抜くと上下が大きく切れる。**16:9の横長（1920×1080程度）3枚を推奨**。`app/_components/hero/data.ts` |
| キービジュアルのキャッチコピー | Figmaに記載なし。暫定文言（`app/_components/hero/copy.ts`） |
| 「犬舎の6つのこだわり」の見出し | 文字がSVG（`about-heading-6points-ribbon.svg`）に含まれるため、文言変更にはSVGの差し替えが必要 |
| 仔犬詳細の価格表記 | Figma原文は「230,000万円」。誤記と判断し `230,000円` で実装 |
| 「ビションフリーぜ」の表記 | Figma原文どおり（一般表記は「ビションフリーゼ」）。`app/_model/breed.ts` |
| 生体保証の内容 | `dog_breeder_ran` の文面をベースにしたドラフト（`app/_data/warrantyData.ts`）。保証日数・返金範囲は必ず確認 |
| スタッフの1日 | `dog_breeder_ran` の内容をそのまま（`app/about/_components/staffDayData.ts`）。実際のスケジュールに差し替え |
| 犬舎概要・動物取扱業登録 | `kennelInfo` の空欄は画面上「―」表示。**登録番号等は法令上の表示義務があるため公開前に必須** |
| 仔犬のステータス表示 | Figmaに指定なし。ran と同じ区分（商談中/成約済み）で、色は `--color-negotiating` / `--color-sold` に定義 |

利用規約・プライバシーポリシー（`app/policy/_components/`）と生体保証（`app/_data/warrantyData.ts`）は
`dog_breeder_ran` の文面をベースにした**ドラフト**です。公開前に事業者側での内容確認をお願いします。
