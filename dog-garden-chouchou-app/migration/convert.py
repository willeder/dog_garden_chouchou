#!/usr/bin/env python3
"""
Dog Garden Chouchou 台帳（.xlsx）→ Supabase 投入用CSV

Google Apps Script が使えない環境向け。スプレッドシートを
「ファイル → ダウンロード → Microsoft Excel (.xlsx)」で保存し、
    python3 convert.py daichou.xlsx
と実行すると、同じフォルダにCSVが書き出されます。

出力:
  dogs.csv / litters.csv / vaccinations.csv / partners.csv
  review.csv       ★要確認リスト（必ず目視すること）
  sire_breeds.csv  種雄犬の犬種の判定結果と根拠
  summary.csv      件数照合レポート
"""
import sys, csv, re, unicodedata, datetime, pathlib
from collections import defaultdict, OrderedDict

import openpyxl

BREEDS = ['TP', 'ML', 'CI', 'BFR', 'PO']

# 種雄犬の犬種。施主確認（2026-08-16）で台帳の連番ブロックと対応づけたもの。
#   クリフ〜グラフ = CI / ルイ〜モンクレール = TP / ディオ〜ハリー = ML
#   ハク = BFR / ウルフ = PO / 連番なしの行 = 引退（在籍していない）
SIRE_BREED_OVERRIDE = {
    'ハリー': 'ML',            # 現役（lalapet・2024/11/16・グルコーゲン検査＝マルチーズ）
    'ハク': 'BFR',
    'ウルフ': 'PO',
    # 引退した種雄犬。過去の出産記録の父として参照されるため status='退役' で残す。
    # 「カラー」シートのチワワ毛色表に載っているため CI。
    'ハリー（退役）': 'CI',     # 引退済みのチワワ（エンジェルクラウン・2022/11/7）
    'ダンヒル': 'CI', 'クロム': 'CI', 'ポール': 'CI', 'ゆきお': 'CI',
    'バリー': 'CI', 'ハーツ': 'CI', 'ラルフ': 'CI', 'つばさ': 'CI',
    'ロレックス': 'TP',        # 施主確認: 台帳の「PT」は TP の打ち間違い（2026-08-16 確認済み）
    'プラダ（退役）': 'ML',    # 施主確認
}

# 外部の種雄犬（外交配）。施主確認（2026-08-16）。
# 自舎の犬ではないので is_external=true で入れ、法令の帳簿・定期報告からは除外される。
# 犬種は交配記録から確定済み（Ⅿ記号の有無で判定）。
EXTERNAL_SIRES = {
    '歌舞伎': 'ML',    # レモン(ML)・メロン(ML) と同犬種の交配記録あり
    'ハーレ': 'BFR',   # パール(BFR) と同犬種の交配記録あり（4件）
    'アル':   'TP',    # マロン(TP) と同犬種の交配記録あり
}

# ♂シートの連番ブロック → 犬種（施主確認 2026-08-16）。
# 連番が1に戻るたびにブロック番号が増える。
SIRE_BLOCK_BREED = {
    1: 'CI',    # クリフ・ヴァン・ピケ・ポロ・ピアジェ・モツ・グラフ
    2: 'TP',    # ルイ・エルメス・ヴィトン・モンクレール
    3: 'ML',    # ディオ・ドルチェ・プラダ・ハリー
    4: 'BFR',   # ハク
    5: 'PO',    # ウルフ
}

# 台帳に♂の行はあるが自舎の犬ではない。その行としては取り込まない。
DOG_DROP = {
    'アル': '施主確認（2026-08-16）: 外部の種雄犬。EXTERNAL_SIRES として登録する',
}

# 施主確認による出産記録の修正。(母犬名, 回数) がキー。
LITTER_FIXES = {
    ('ジョジョ', 2): {'birth_date': '2024-09-14'},  # 空欄だった出産日
    ('ジョジョ', 5): 'DROP',                        # 4回目と同日（2026-05-21）の重複行
    ('クロミ',  5): 'DROP',                         # 4回目と同日（2026-04-30）の重複行
    ('ぽにょ',  1): {'method': '帝王切開'},         # 妊娠日数欄が空。施主確認
    ('ぽにょ',  2): {'method': '帝王切開'},
}

COLOR_MAP = {
    'AP': 'AP', 'アプリコット': 'AP',
    'RD': 'RD', 'レッド': 'RD', '赤': 'RD', '茶': 'RD',
    'CR': 'CR', 'クリーム': 'CR',
    'FN': 'FN', 'フォーン': 'FN',
    'W': 'W', 'WH': 'W', 'ホワイト': 'W', '白': 'W',
    'BK': 'BK', 'ブラック': 'BK', '黒': 'BK',
    'BKT': 'BKT', 'BK T': 'BKT', 'ブラタン': 'BKT', 'ブラックタン': 'BKT',
    'CHLT': 'CHLT', 'チョコ': 'CHLT', 'チョコレート': 'CHLT',
    'MERLE': 'MERLE', 'マール': 'MERLE',
    'BKW': 'BKW', 'BK WH': 'BKW', '黒白': 'BKW', 'BK W': 'BKW',
    'WH BK': 'BKW', 'W BK': 'BKW',
    '牛': 'BKW',                                  # 施主確認: 牛柄＝白黒
    'CHLTW': 'CHLTW', 'CH WH': 'CHLTW', 'CH W': 'CHLTW', 'CHLT WH': 'CHLTW',
    'CR H': 'CHLTW',                              # 施主確認: 台帳の誤記。正しくは CH WH
}

CIRCLED = re.compile(r'[①-⑳]')


# ── 正規化 ────────────────────────────────
def norm(v):
    """NFKC正規化。「５８日」「ＢＫ」のような全角が実在するため必須"""
    if v is None:
        return ''
    if isinstance(v, datetime.datetime):
        return v.strftime('%Y-%m-%d')
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    s = unicodedata.normalize('NFKC', str(v))
    return re.sub(r'\s+', ' ', s.replace('　', ' ')).strip()


def strip_circled(v):
    """丸数字は同名個体の区別符号。NFKCで数字になる前に落とす"""
    return CIRCLED.sub('', '' if v is None else str(v))


def has_circled(v):
    return bool(CIRCLED.search('' if v is None else str(v)))


def norm_chip(v):
    d = re.sub(r'\D', '', norm(v))
    return d or None


def norm_date(v):
    if isinstance(v, datetime.datetime):
        return v.strftime('%Y-%m-%d')
    if isinstance(v, datetime.date):
        return v.isoformat()
    s = norm(v)
    m = re.match(r'^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})', s)
    if not m:
        return None
    return f'{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}'


def norm_num(v):
    s = re.sub(r'[^0-9.\-]', '', norm(v))
    try:
        return float(s) if s else None
    except ValueError:
        return None


def norm_int(v):
    n = norm_num(v)
    return None if n is None else int(n)


def parse_gestation(v):
    """「61日 帝」「５８日 帝」「帝」「59日♀5」を分解する"""
    s = norm(v)
    if not s:
        return None, None, ''
    m = re.search(r'(\d{1,3})\s*日', s)
    days = int(m.group(1)) if m else None
    if '後帝' in s:
        method = '後帝'
    elif '帝' in s:
        method = '帝王切開'
    elif days is not None:
        method = '自然'
    else:
        method = None
    leftover = re.sub(r'後帝|帝', '', re.sub(r'(\d{1,3})\s*日', '', s, count=1)).strip()
    return days, method, leftover


def parse_stillborn(v):
    """備考の「死1」を死産数として抜き、備考からは除去する"""
    s = norm(v)
    m = re.search(r'死\s*(\d+)', s)
    n = int(m.group(1)) if m else 0
    return n, re.sub(r'死\s*\d+', '', s, count=1).strip()


def is_mix_mark(v):
    return bool(re.search(r'[MⅯm]\s*$', norm(strip_circled(v))))


def clean_sire(v):
    return re.sub(r'\s*[MⅯm]\s*$', '', norm(strip_circled(v))).strip()


def parse_color(v):
    """「黒L」→ 毛色BK・毛質L / 「BK T」→ 毛色BKT・毛質なし"""
    raw = norm(v)
    if not raw:
        return None, None, ''
    coat, body = None, raw
    m = re.match(r'^(.*?)\s*([LS])$', raw)
    if m and m.group(1):
        body, coat = m.group(1).strip(), m.group(2)
    code = COLOR_MAP.get(body.upper()) or COLOR_MAP.get(body)
    return code, coat, raw


# ── 変換本体 ──────────────────────────────
class Converter:
    def __init__(self):
        self.dogs, self.litters, self.vaccinations = [], [], []
        self.partners, self.review = OrderedDict(), []
        self.dam_breed, self.sire_ev = {}, OrderedDict()
        self.pending_sires, self.sire_breed = [], {}
        self.seen_names = {}
        self.excluded = []          # 連番が無い＝台帳の正式行ではない犬
        self.sire_block = 0         # 種雄犬シートの犬種ブロック番号（連番が1に戻るたびに増える）
        self.block_breed = {}
        self.retired_names = set()
        self.retired_birth = {}     # 退役犬の名前 → 誕生日（同名判定に使う）
        self.merged_rows = []       # 同名・同誕生日で統合した行
        self.dropped_names = set()  # DOG_DROP で取り込まなかった犬

    def add_review(self, sheet, row, kind, detail):
        self.review.append([sheet, row, kind, detail])

    def add_partner(self, name, contact=''):
        n = norm(name)
        if not n or n == '自家繁殖':
            return None
        if n not in self.partners:
            self.partners[n] = norm(contact)
        elif not self.partners[n] and norm(contact):
            self.partners[n] = norm(contact)
        return n

    def register_name(self, name, sheet, row):
        if not name:
            return
        if name in self.seen_names:
            self.add_review(sheet, row, '同名の犬',
                            f'「{name}」が {self.seen_names[name]} にも存在します。'
                            '血統の紐付けが誤る可能性があります')
        else:
            self.seen_names[name] = f'{sheet} 行{row}'

    # ── 母犬 ──
    def parse_dam(self, sheet, r, row):
        breed = norm(row[1]).upper()
        name = norm(row[3])
        if not name:
            return
        # A列の連番が入っている行だけが台帳の正式な行。
        # 連番の無い行は過去の犬・参考記録なので取り込まない。
        if not isinstance(row[0], (int, float)):
            self.excluded.append([sheet, r, breed, name, norm(row[7]), '連番なし（過去・参考の行）'])
            return
        if breed not in BREEDS:
            self.add_review(sheet, r, '犬種が不明', f'犬種欄=「{norm(row[1])}」 名前={name}')
            return

        code, coat, raw_color = parse_color(row[4])
        chip = norm_chip(row[8])
        if norm(row[8]) and (not chip or len(chip) != 15):
            self.add_review(sheet, r, 'マイクロチップの桁数',
                            f'{name} : 「{norm(row[8])}」→ {len(chip) if chip else 0}桁')
        if raw_color and not code:
            self.add_review(sheet, r, '毛色を正規化できない', f'{name} : 「{raw_color}」')

        self_bred = '自家繁殖' in norm(row[12])
        supplier = self.add_partner(row[13], row[14])
        breeder = None if self_bred else (self.add_partner(row[12]) or supplier)
        birthday = norm_date(row[2])

        if not birthday:
            self.add_review(sheet, r, '誕生日が空', name)
        if not self_bred and not supplier:
            self.add_review(sheet, r, '所有日を確定できない',
                            f'{name} : 仕入れ元が不明のため acquired_on が空になります。法令の帳簿項目です')

        self.register_name(name, sheet, r)
        self.dam_breed[name] = breed

        self.dogs.append(dict(
            breed_code=breed, sex='♀', name=name, birthday=birthday,
            color=raw_color, color_code=code, coat_type_code=coat,
            weight_kg=norm_num(row[6]), microchip=chip,
            genes=norm(row[11]), breeder_note=norm(row[5]),
            is_self_bred=self_bred, is_external=False, note='', breeder_name=breeder or '',
            supplier_name=supplier or '',
            acquired_on=birthday if self_bred else '', status='在籍'))

        self.push_vac(name, '混合', row[7])
        self.push_vac(name, '狂犬病', row[9])
        self.parse_matings(sheet, r, row, name, breed)

    def push_vac(self, dog, kind, v):
        d = norm_date(v)
        if d:
            self.vaccinations.append(dict(dog_name=dog, kind=kind, dosed_on=d))

    # ── 交配履歴（横36列 → 1回1行） ──
    def parse_matings(self, sheet, r, row, dam, dam_breed):
        seen = {}
        for i in range(6):
            b = 16 + i * 6
            if b + 5 >= len(row):
                break
            birth = norm_date(row[b])
            sire_raw = row[b + 1]
            sire = clean_sire(sire_raw)
            days, method, leftover = parse_gestation(row[b + 2])
            male, female = norm_int(row[b + 3]), norm_int(row[b + 4])
            still, note = parse_stillborn(row[b + 5])

            if not any([birth, sire, days, method, male, female, still, note]):
                continue

            # 施主確認による台帳の修正
            fix = LITTER_FIXES.get((dam, i + 1))
            if fix == 'DROP':
                self.add_review(sheet, r, '施主確認により削除',
                                f'{dam} {i+1}回目（{birth or "出産日なし"}）: '
                                '前回と同日の重複行のため取り込みません')
                continue
            if isinstance(fix, dict) and fix.get('birth_date'):
                if not birth:
                    birth = fix['birth_date']
                    self.add_review(sheet, r, '施主確認により補完',
                                    f'{dam} {i+1}回目 : 空欄だった出産日に {birth} を補いました')
                elif birth != fix['birth_date']:
                    self.add_review(sheet, r, '施主確認と台帳が食い違う',
                                    f'{dam} {i+1}回目 : 台帳は {birth}、確認値は {fix["birth_date"]}。'
                                    'LITTER_FIXES が古くなっている可能性があります')
            if isinstance(fix, dict) and fix.get('method') and method is None:
                method = fix['method']
                self.add_review(sheet, r, '施主確認により補完',
                                f'{dam} {i+1}回目（{birth}）: 空欄だった分娩方法を「{method}」にしました')

            if not birth:
                self.add_review(sheet, r, '出産日が空',
                                f'{dam} {i+1}回目 : 他の項目は入力済みですが出産日がありません'
                                '（このままでは登録できません）')
                continue
            if birth in seen:
                self.add_review(sheet, r, '同一出産日の重複',
                                f'{dam} : {birth} が {seen[birth]}回目 と {i+1}回目 に重複しています。'
                                '同日2回の出産でない限り、どちらかが入力ミスです')
                continue
            seen[birth] = i + 1

            if has_circled(sire_raw):
                self.add_review(sheet, r, '同名の個体を区別する符号',
                                f'{dam} {i+1}回目 : 雄犬欄が「{norm(sire_raw)}」。'
                                '同名の種雄犬が複数いる可能性があります')
            if method is None:
                self.add_review(sheet, r, '分娩方法が分からない',
                                f'{dam} {i+1}回目（{birth}）: 妊娠日数欄が空欄のため、'
                                '自然分娩か帝王切開か判定できません')
            if days is not None and not (50 <= days <= 75):
                self.add_review(sheet, r, '妊娠日数が範囲外', f'{dam} {i+1}回目 : {days}日')
            if leftover:
                self.add_review(sheet, r, '妊娠日数欄に余分な文字',
                                f'{dam} {i+1}回目 : 「{norm(row[b+2])}」の残り「{leftover}」')

            if sire:
                ev = self.sire_ev.setdefault(sire, dict(same=set(), diff=set(), rows=[], how=''))
                if is_mix_mark(sire_raw):
                    ev['diff'].add(dam_breed); ev['rows'].append(f'{dam}({dam_breed}) ミックス')
                else:
                    ev['same'].add(dam_breed); ev['rows'].append(f'{dam}({dam_breed}) 同犬種')

            self.litters.append(dict(
                dam_name=dam, sire_name=sire, birth_date=birth,
                gestation_days=days, method=method,
                male_count=male or 0, female_count=female or 0,
                stillborn_count=still, note=note))

    # ── 種雄犬（犬種の推定を待つ） ──
    def collect_sire(self, sheet, r, row):
        name = norm(row[2])
        if not name:
            return
        if name in DOG_DROP:
            self.excluded.append([sheet, r, '', name, norm(row[6]), DOG_DROP[name]])
            self.dropped_names.add(name)
            return
        seq = row[0] if isinstance(row[0], (int, float)) else None
        if seq is None:
            # 連番なし＝退役・他所へ出た犬。血統の父として参照される可能性があるので取り込む。
            # 現役の犬と同名なら「（退役）」を付けて別個体として扱う（名前でUUIDを解決するため）
            orig = name
            bday = row[1].date().isoformat() if hasattr(row[1], 'date') else norm(row[1])
            # 同名かつ同じ誕生日の退役行が既にある＝台帳の行が重複している。別個体にしない
            dup = [p for p in self.pending_sires
                   if p[5] == '退役' and p[3].split('（')[0] == name
                   and self.retired_birth.get(p[3]) == bday and bday]
            if dup:
                self.add_review(sheet, r, '重複行',
                                f'「{orig}」（誕生日 {bday}）は {dup[0][0]}{dup[0][1]}行目と'
                                f'同名・同誕生日のため、同じ犬とみなして1頭に統合しました')
                self.merged_rows.append([sheet, r, orig, bday, f'{dup[0][0]} {dup[0][1]}行目に統合'])
                return
            if name in self.retired_names or any(p[3] == name for p in self.pending_sires):
                base = f'{name}（退役）'
                n2, k = base, 2
                while n2 in self.retired_names:
                    n2, k = f'{name}（退役{k}）', k + 1
                name = n2
                self.add_review(sheet, r, '同名のため改名',
                                f'「{orig}」（誕生日 {bday}）は現役の犬と同名だが誕生日が違うため、'
                                f'別個体「{name}」として取り込みます')
            self.retired_names.add(name)
            self.retired_birth[name] = bday
            self.pending_sires.append((sheet, r, row, name, None, '退役'))
            self.sire_ev.setdefault(name, dict(same=set(), diff=set(), rows=[], how=''))
            return
        # 連番が 1 に戻ったら犬種ブロックの切れ目
        if int(seq) == 1:
            self.sire_block += 1
        self.pending_sires.append((sheet, r, row, name, self.sire_block, '在籍'))
        self.sire_ev.setdefault(name, dict(same=set(), diff=set(), rows=[], how=''))

    def infer_sire_breeds(self):
        cand_pool = ['TP', 'ML', 'CI']   # BFRは母犬0頭のため消去法の候補から外す
        for name, e in self.sire_ev.items():
            same, diff = sorted(e['same']), sorted(e['diff'])
            decided = None
            if name in SIRE_BREED_OVERRIDE:
                decided, how = SIRE_BREED_OVERRIDE[name], '手動指定'
            elif len(same) == 1 and same[0] not in diff:
                decided, how = same[0], f'確定（{same[0]}の母犬と同犬種の交配記録あり）'
            elif len(same) == 1:
                how = f'矛盾（{same[0]}の母犬に「同犬種」と「ミックス」の両方の記録がある）'
            elif len(same) > 1:
                how = f'矛盾（{"・".join(same)} の複数犬種で「同犬種」の記録がある）'
            else:
                cand = [b for b in cand_pool if b not in diff]
                if len(cand) == 1:
                    decided, how = cand[0], f'推定（{"・".join(diff)} とのミックス記録のみ。消去法）'
                else:
                    how = f'判定不能（{"・".join(diff) or "交配記録なし"}）'
            e['how'] = how
            if decided:
                self.sire_breed[name] = decided

    def resolve_blocks(self):
        """種雄犬シートのブロック（連番の振り直し）ごとに犬種を決める。
        施主確認の SIRE_BLOCK_BREED を最優先。無ければ交配記録から確定した個体で多数決。"""
        votes = defaultdict(lambda: defaultdict(int))
        for sheet, r, row, name, block, status in self.pending_sires:
            if block is None:
                continue
            b = self.sire_breed.get(name)
            if b and '確定' in self.sire_ev[name]['how']:
                votes[block][b] += 1
        for block, v in votes.items():
            self.block_breed[block] = max(v, key=v.get)
            if len(v) > 1:
                self.add_review('種雄犬', '', 'ブロック内で犬種が割れている',
                                f'ブロック{block} : ' +
                                '・'.join(f'{k}{n}頭' for k, n in v.items()))
        # 施主確認の割り当てで上書きし、食い違えば報告する
        for block, breed in SIRE_BLOCK_BREED.items():
            guessed = self.block_breed.get(block)
            if guessed and guessed != breed:
                self.add_review('種雄犬', '', 'ブロックの犬種が施主確認と食い違う',
                                f'ブロック{block} : 交配記録からは {guessed}、施主確認は {breed}。'
                                '施主確認を優先します')
            self.block_breed[block] = breed

        # ブロックの犬種で、個体判定が付かなかった犬を埋める
        for sheet, r, row, name, block, status in self.pending_sires:
            if block is None or name in self.sire_breed:
                continue
            b = self.block_breed.get(block)
            if b:
                self.sire_breed[name] = b
                self.sire_ev[name]['how'] += f' → 台帳のブロック位置から {b} と判定'

        # 個体判定とブロックが食い違う場合は報告する
        for sheet, r, row, name, block, status in self.pending_sires:
            if block is None:
                continue
            b = self.block_breed.get(block)
            ind = self.sire_breed.get(name)
            if b and ind and b != ind and '確定' in self.sire_ev[name]['how']:
                self.add_review(sheet, r, '種雄犬の犬種が台帳と交配記録で食い違う',
                                f'{name} : 交配記録からは {ind}、台帳のブロック位置は {b}。'
                                '同名の犬が複数いるか、ミックス記号の付け忘れの可能性')

        # ここまでで犬種が決まらなかった種雄犬だけを報告する
        for name, e in self.sire_ev.items():
            if name in self.sire_breed or name in DOG_DROP:
                continue
            where = ('台帳の♂シートに行がありません（外部の種雄犬か、行の入れ忘れ）'
                     if not any(p[3] == name for p in self.pending_sires)
                     else e['how'])
            self.add_review('種雄犬', '', '★種雄犬の犬種が決まらない',
                            f'{name} : {where} → SIRE_BREED_OVERRIDE に追記して再実行してください')

    def emit_sires(self):
        for sheet, r, row, name, block, status in self.pending_sires:
            breed = self.sire_breed.get(name)
            if not breed:
                continue
            code, coat, raw_color = parse_color(row[4])
            chip = norm_chip(row[7])
            if norm(row[7]) and (not chip or len(chip) != 15):
                self.add_review(sheet, r, 'マイクロチップの桁数', f'{name} : 「{norm(row[7])}」')

            birthday = norm_date(row[1])
            self_bred = '自家繁殖' in norm(row[11])
            supplier = self.add_partner(row[12], row[13])

            missing = [lbl for lbl, ok in
                       [('誕生日', birthday), ('体重', norm_num(row[3])),
                        ('マイクロチップ', chip), ('カラー', raw_color)] if not ok]
            if len(missing) >= 3:
                self.add_review(sheet, r, '必須項目がほぼ空',
                                f'{name} : {"・".join(missing)} が未入力です')

            self.register_name(name, sheet, r)
            self.dogs.append(dict(
                breed_code=breed, sex='♂', name=name, birthday=birthday,
                color=raw_color, color_code=code, coat_type_code=coat,
                weight_kg=norm_num(row[3]), microchip=chip,
                genes=norm(row[9]), breeder_note=norm(row[5]),
                is_self_bred=self_bred, is_external=False, note='',
                breeder_name='', supplier_name=supplier or '',
                acquired_on=birthday if self_bred else '', status=status))
            self.push_vac(name, '混合', row[6])
            self.push_vac(name, '狂犬病', row[8])


    # ── 外部の種雄犬（外交配） ──
    def emit_external_sires(self):
        """他犬舎から借りた父。交配記録の父としてだけ必要で、自舎の所有ではない。
        is_external=true にして【法令】帳簿・定期報告から外す。"""
        used = {l['sire_name'] for l in self.litters if l['sire_name']}
        for name, breed in EXTERNAL_SIRES.items():
            if any(d['name'] == name for d in self.dogs):
                self.add_review('種雄犬', '', '外部の種雄犬が台帳にもいる',
                                f'{name} : EXTERNAL_SIRES と♂シートの両方にあります。'
                                'どちらか一方にしてください')
                continue
            if name not in used:
                self.add_review('種雄犬', '', '使われていない外部の種雄犬',
                                f'{name} : 交配記録に登場しないため登録しません')
                continue
            ev = self.sire_ev.get(name, {})
            inferred = self.sire_breed.get(name)
            if inferred and inferred != breed:
                self.add_review('種雄犬', '', '外部の種雄犬の犬種が交配記録と食い違う',
                                f'{name} : 指定は {breed}、交配記録からは {inferred}')
            self.sire_breed[name] = breed
            self.dogs.append(dict(
                breed_code=breed, sex='♂', name=name, birthday='',
                color='', color_code=None, coat_type_code=None,
                weight_kg=None, microchip=None, genes='',
                breeder_note='', is_self_bred=False, is_external=True, note='',
                breeder_name='', supplier_name='',
                acquired_on='', status='退役'))
            self.add_review('種雄犬', '', '外部の種雄犬として登録',
                            f'{name}（{breed}）: 外交配の父として登録しました。'
                            '自舎の所有ではないので法令の帳簿・定期報告には出ません')

    # ── 犬として登録されない父の扱い ──
    def resolve_litter_sires(self):
        """父が犬の台帳に無い出産記録は、名前を備考に逃がしてから空にする。
        名前を残さず落とすと帳簿の記録が消えるため、必ず備考へ移す。"""
        known = {d['name'] for d in self.dogs if d['sex'] == '♂'}
        for l in self.litters:
            s = l['sire_name']
            if not s or s in known:
                continue
            if s in DOG_DROP:
                reason = DOG_DROP[s]
            elif not any(p[3] == s for p in self.pending_sires):
                reason = (f'♂シートに行がありません。外部の種雄犬（他犬舎から借りた父）か、'
                          f'台帳への記入漏れです'
                          + (f'。交配記録からは {self.sire_breed[s]} と判定できています'
                             if s in self.sire_breed else ''))
            else:
                reason = '犬種が未確定のため犬として登録していません'
            self.add_review('litters.csv', '', '★父を紐付けできない出産記録',
                            f'{l["dam_name"]} {l["birth_date"]}（♂{l["male_count"]}・♀{l["female_count"]}）: '
                            f'父「{s}」が犬の台帳にありません（{reason}）。'
                            '父を空欄にし、備考に名前を残しました')
            l['note'] = (f'{l["note"]} / ' if l['note'] else '') + f'父：{s}（犬の台帳に未登録）'
            l['sire_name'] = ''

    # ── 投入前に落ちる重複を先に潰す ──
    def check_duplicates(self):
        # マイクロチップは schema 側で unique 制約。重複したまま流すと投入が落ちる
        # 犬種未判定でCSVに出ていない種雄犬も含める（判定がついた途端に投入が落ちるため）
        pool = list(self.dogs) + [
            dict(name=n, birthday=norm_date(row[1]), microchip=norm_chip(row[7]),
                 _pending=True)
            for _s, _r, row, n, _b, _st in self.pending_sires
            if not self.sire_breed.get(n)]
        seen = {}
        for d in pool:
            chip = d.get('microchip')
            if not chip:
                continue
            if chip in seen:
                a, b = seen[chip], d
                # 先に出たほう（=誕生日が新しい現役側）に番号を残し、後から出たほうを保留にする。
                # 空にしないと unique 制約で投入自体が落ちるため。
                keep, hold = (a, b) if (a.get('birthday') or '') >= (b.get('birthday') or '') else (b, a)
                if not hold.get('_pending'):
                    hold['microchip'] = None
                    hold['note'] = ((hold.get('note') or '') +
                                    f'【移行時保留】マイクロチップ {chip} は'
                                    f'「{keep["name"]}」と重複していたため空にしています。'
                                    '正しい番号を確認して入力してください。')
                self.add_review('dogs.csv', '', '★マイクロチップの重複',
                                f'「{a["name"]}」（{a.get("birthday") or "誕生日なし"}）と'
                                f'「{b["name"]}」（{b.get("birthday") or "誕生日なし"}）が'
                                f'同じ番号 {chip} です。重複禁止のため'
                                f'「{hold["name"]}」側を空にして投入します。'
                                '台帳を確認して正しい番号を入れてください')
            else:
                seen[chip] = d
        # 同名も血統の解決を誤らせる
        names = {}
        for d in pool:
            names.setdefault(d['name'], []).append(d)
        for name, ds in names.items():
            if len(ds) > 1:
                self.add_review('dogs.csv', '', '同名の犬',
                                f'「{name}」が{len(ds)}頭います'
                                f'（{"・".join(x.get("birthday") or "誕生日なし" for x in ds)}）。'
                                f'父母の紐付けが名前依存のため、改名するか手で対応付けてください')


# ── シート判定 ────────────────────────────
def is_dam_header(row):
    return norm(row[1]) == '犬種' and norm(row[3]) == '名前'


def is_sire_header(row):
    return norm(row[0]) == '犬種' and norm(row[2]) == '名前' and norm(row[3]) == '体重'


def main(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    cv = Converter()

    for ws in wb.worksheets:
        rows = list(ws.iter_rows(values_only=True))
        mode = None
        for idx, row in enumerate(rows, start=1):
            row = list(row) + [None] * (60 - len(row))
            if is_dam_header(row):
                mode = 'dam'; continue
            if is_sire_header(row):
                mode = 'sire'; continue
            if mode == 'dam':
                cv.parse_dam(ws.title, idx, row)
            elif mode == 'sire':
                cv.collect_sire(ws.title, idx, row)

    cv.infer_sire_breeds()
    cv.resolve_blocks()
    cv.emit_sires()
    cv.emit_external_sires()
    cv.resolve_litter_sires()
    cv.check_duplicates()
    write_all(pathlib.Path(path).parent, cv)
    return cv


def w(folder, fname, header, rows):
    with open(folder / fname, 'w', newline='', encoding='utf-8-sig') as f:
        wr = csv.writer(f)
        wr.writerow(header)
        wr.writerows(rows)


def write_all(folder, cv):
    dog_cols = ['breed_code', 'sex', 'name', 'birthday', 'color', 'color_code',
                'coat_type_code', 'weight_kg', 'microchip', 'genes', 'breeder_note',
                'is_self_bred', 'is_external', 'breeder_name', 'supplier_name',
                'acquired_on', 'status', 'note']
    w(folder, 'dogs.csv', dog_cols,
      [[d[c] if d[c] is not None else '' for c in dog_cols] for d in cv.dogs])

    lit_cols = ['dam_name', 'sire_name', 'birth_date', 'gestation_days', 'method',
                'male_count', 'female_count', 'stillborn_count', 'note']
    w(folder, 'litters.csv', lit_cols,
      [[l[c] if l[c] is not None else '' for c in lit_cols] for l in cv.litters])

    w(folder, 'vaccinations.csv', ['dog_name', 'kind', 'dosed_on'],
      [[v['dog_name'], v['kind'], v['dosed_on']] for v in cv.vaccinations])

    w(folder, 'partners.csv', ['name', 'contact_name', 'license_no'],
      [[k, v, ''] for k, v in cv.partners.items()])

    w(folder, 'review.csv', ['シート', '行', '種別', '内容'], cv.review)

    w(folder, 'excluded.csv', ['シート', '行', '犬種', '名前', '最終ワクチン', '除外理由'], cv.excluded)

    w(folder, 'sire_breeds.csv', ['種雄犬', '犬種', '判定根拠', '交配記録'],
      [[n, cv.sire_breed.get(n, '（判定不能）'), e['how'], ' / '.join(e['rows'])]
       for n, e in sorted(cv.sire_ev.items())])

    by = defaultdict(int)
    for d in cv.dogs:
        by[f"{d['breed_code']} {d['sex']}"] += 1
    pups = sum(l['male_count'] + l['female_count'] for l in cv.litters)
    still = sum(l['stillborn_count'] for l in cv.litters)

    summary = [[k, by[k]] for k in sorted(by)]
    summary += [['犬 合計', len(cv.dogs)], ['出産記録', len(cv.litters)],
                ['産子数 合計（♂＋♀）', pups], ['死産 合計', still],
                ['ワクチン記録', len(cv.vaccinations)], ['相手先', len(cv.partners)],
                ['★要確認', len(cv.review)], ['', '']]
    colors, coats = defaultdict(int), defaultdict(int)
    for d in cv.dogs:
        if d['color']:
            colors[d['color']] += 1
        if d['coat_type_code']:
            coats[d['coat_type_code']] += 1
    summary.append(['カラー欄の原文', '出現数'])
    summary += [[k, colors[k]] for k in sorted(colors)]
    summary += [['', ''], ['毛質', '出現数']]
    summary += [[k, coats[k]] for k in sorted(coats)]
    w(folder, 'summary.csv', ['項目', '件数'], summary)


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'daichou.xlsx'
    cv = main(src)
    print(f'犬 {len(cv.dogs)}頭 / 出産 {len(cv.litters)}件 / '
          f'ワクチン {len(cv.vaccinations)}件 / 相手先 {len(cv.partners)}件')
    print(f'★要確認 {len(cv.review)}件 → review.csv')
    print(f'除外（連番なし）{len(cv.excluded)}頭 → excluded.csv')
