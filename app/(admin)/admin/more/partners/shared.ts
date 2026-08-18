export type PartnerInput = {
  name: string;
  contact_name: string;
  license_no: string;
  phone: string;
  note: string;
};

export type PartnerResult =
  | { ok: true; id: string }
  | { ok: false; message: string; field?: keyof PartnerInput };

export type PartnerListItem = {
  id: string;
  name: string;
  contact_name: string | null;
  license_no: string | null;
  phone: string | null;
  note: string | null;
  /** 繁殖者または入手先として紐付いている犬の数 */
  used: number;
};

export const EMPTY_PARTNER: PartnerInput = {
  name: '',
  contact_name: '',
  license_no: '',
  phone: '',
  note: '',
};
