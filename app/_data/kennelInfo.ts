export type KennelInfo = {
  /** 犬舎名（正式表記） */
  name: string;
  /** 英字表記 */
  nameEn: string;
  /** 代表者 / ブリーダー名 */
  breeder: string;
  breederKana: string;
  description: string;
  email: string;
  /** 郵便番号（ハイフンなし） */
  postalCode: string;
  address: string;
  /** 設立年度（例: 2023年） */
  establishedYear: string;
  /** 事業内容 */
  businessContent: string;
  /** アクセス情報。未設定の項目は表示されない */
  access: {
    station?: string;
    parking?: string;
  };
  sns: {
    instagram?: string;
    tiktok?: string;
    line?: {
      /** 公式LINEの友だち追加URL */
      url: string;
      /** LINE ID（@から始まる） */
      id?: string;
      /** 友だち追加用QRコード画像のパス。設定するとPC向けQRブロックが表示される */
      qrImage?: string;
    };
  };
  /** 第一種動物取扱業の登録情報。未設定の項目は「―」で表示される */
  animalBusiness: {
    officeName: string;
    registrationType: string;
    type: string;
    registrationNumber: string;
    registrationDate: string;
    expirationDate: string;
    animalHandler: string;
  };
};

/**
 * サイト全体で参照する犬舎の基本情報。
 * TODO: 空文字の項目はFigma・支給素材に記載がないため、クライアント確認後に記入すること。
 *       とくに動物取扱業の登録情報は法令上の表示義務があるため、公開前に必ず埋める。
 */
export const kennelInfo: KennelInfo = {
  name: "ドッグガーデンシュシュ",
  nameEn: "Dog Garden ChouChou",
  breeder: "織方　記美子",
  breederKana: "おりかたきみこ",
  description:
    "ドッグガーデンシュシュでは、家庭的な環境で愛情を込めて子犬たちを育てています。お庭や室内を元気いっぱいに走り回れるよう環境を整え、健康管理や衛生面にも気を配りながら、安心して一緒に暮らせるよう心がけています。",
  email: "dog.g.chouchou@gmail.com",
  // TODO: 郵便番号は支給資料に記載が無いため未設定（空なら住所のみ表示される）
  postalCode: "",
  address: "福岡県筑紫野市美しが丘南5-17-1",
  // TODO: 設立年度は未確認（空なら犬舎概要の行自体が非表示になる）
  establishedYear: "",
  businessContent: "犬のブリーディング、販売、里親募集",
  access: {
    station: "",
    parking: "",
  },
  sns: {
    instagram: "https://www.instagram.com/d.g_chouchou/",
    tiktok: "https://www.tiktok.com/@d.g_chouchou",
    line: {
      url: "https://lin.ee/ZBfUumi",
      // TODO: LINE ID（@から始まる）が分かれば設定すると友だち追加ボタンの下に表示される
      id: "",
      // TODO: 友だち追加用QRコード画像を public/assets/ に置いてパスを設定するとPC向けQRブロックが表示される
      qrImage: "",
    },
  },
  // 第一種動物取扱業の登録情報（みんなのブリーダー掲載の登録内容に準拠）
  animalBusiness: {
    officeName: "Dog Garden Chou chou",
    registrationType: "第一種動物取扱業登録",
    type: "販売",
    registrationNumber: "第4059100212号",
    registrationDate: "2019年5月29日",
    expirationDate: "2029年5月28日",
    animalHandler: "織方　記美子",
  },
};
