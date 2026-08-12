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
  /** 見学予約カレンダー（TimeRex等）の埋め込みURL。未設定なら静止画を表示 */
  reservationUrl?: string;
};

/**
 * サイト全体で参照する犬舎の基本情報。
 * TODO: 住所・メールアドレス・動物取扱業登録情報はFigma・支給素材に記載がないためクライアント確認後に追記する。
 */
export const kennelInfo: KennelInfo = {
  name: "ドッグガーデンシュシュ",
  nameEn: "Dog Garden ChouChou",
  breeder: "織方記美子",
  breederKana: "おりかたきみこ",
  description:
    "ドッグガーデンシュシュでは、家庭的な環境で愛情を込めて子犬たちを育てています。お庭や室内を元気いっぱいに走り回れるよう環境を整え、健康管理や衛生面にも気を配りながら、安心して一緒に暮らせるよう心がけています。",
  email: "",
  postalCode: "",
  address: "",
  sns: {
    instagram: "https://www.instagram.com/",
    tiktok: "https://www.tiktok.com/",
    line: {
      url: "",
      id: "",
      qrImage: "",
    },
  },
  reservationUrl: "",
};
