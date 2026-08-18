'use client';

import type { ReactNode } from 'react';

/**
 * 入力画面の共通部品。
 *
 * 現場は屋外・手袋・片手での操作がある。以下は崩さないこと。
 *   ・押せるものは高さ44px以上（.tap）
 *   ・ラベルは入力欄の上（横並びにすると幅が足りず折り返す）
 *   ・数字を入れる欄は inputMode を必ず指定（テンキーが出ないと入力できない）
 *   ・日付は type="date" を使う（手打ちさせない。台帳は1日ずれると意味が変わる）
 */

export function FormSection({
  title,
  note,
  help,
  children,
}: {
  title: string;
  note?: string;
  help?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="px-4 pt-3.5">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-[13px] font-bold tracking-wide">{title}</h2>
        {note && <span className="text-[12px] text-adm-muted">{note}</span>}
      </div>
      <div className="overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">{children}</div>
      {help && (
        <p className="mt-2 rounded-xl border border-adm-rule bg-adm-hint px-3 py-2.5 text-[11.5px] leading-relaxed text-adm-muted">
          {help}
        </p>
      )}
    </section>
  );
}

export function Row({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-adm-rule px-3.5 py-2.5 last:border-b-0">
      <label htmlFor={htmlFor} className="block text-[12px] font-medium text-adm-muted">
        {label}
        {required && <span className="ml-1.5 text-[10.5px] text-adm-danger">必須</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1.5 text-[11px] leading-relaxed text-adm-muted">{hint}</p>}
    </div>
  );
}

const BOX =
  'tap w-full rounded-lg border border-adm-rule bg-adm-surface px-3 py-2 text-[15px] text-adm-ink ' +
  'focus:border-adm-action focus:outline-none focus:ring-2 focus:ring-adm-action/25 disabled:bg-adm-paper disabled:text-adm-muted';

export function TextField({
  id,
  value,
  onChange,
  placeholder,
  numeric,
  maxLength,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** テンキーを出す。桁の多い数字（マイクロチップ・価格）に使う */
  numeric?: 'numeric' | 'decimal';
  maxLength?: number;
  disabled?: boolean;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={numeric}
      maxLength={maxLength}
      disabled={disabled}
      autoComplete="off"
      className={`${BOX} ${numeric ? 'num' : ''}`}
    />
  );
}

export function DateField({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      id={id}
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`${BOX} num`}
    />
  );
}

export function SelectField<T extends string>({
  id,
  value,
  onChange,
  options,
  empty,
  disabled,
}: {
  id: string;
  value: T | '';
  onChange: (v: string) => void;
  options: { value: T; label: string }[];
  /** 空欄のときの表示。指定しなければ空欄を選べない */
  empty?: string;
  disabled?: boolean;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`${BOX} appearance-none bg-[length:10px] bg-[right_0.9rem_center] bg-no-repeat pr-9`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%236B6F6B' stroke-width='1.6'/%3E%3C/svg%3E\")",
      }}
    >
      {empty !== undefined && <option value="">{empty}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** 2〜4択の切り替え。選択肢が多いときは SelectField を使う */
export function Segment<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1.5">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`tap flex-1 rounded-lg border px-2 py-2 text-[14px] ${
              on
                ? 'border-adm-action bg-adm-action font-bold text-white'
                : 'border-adm-rule bg-adm-surface text-adm-muted'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function TextArea({
  id,
  value,
  onChange,
  rows = 3,
  placeholder,
  maxLength,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`${BOX} leading-relaxed`}
    />
  );
}

export function Toggle({
  id,
  checked,
  onChange,
  label,
  note,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  note?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-adm-rule px-3.5 py-2.5 last:border-b-0">
      <span className="min-w-0">
        <label htmlFor={id} className="block text-[14px] font-medium">
          {label}
        </label>
        {note && <span className="mt-0.5 block text-[11.5px] leading-relaxed text-adm-muted">{note}</span>}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-[30px] w-[52px] shrink-0 rounded-full border transition-colors disabled:opacity-40 ${
          checked ? 'border-adm-action bg-adm-action' : 'border-adm-rule bg-adm-hint'
        }`}
      >
        <span
          className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow transition-all ${
            checked ? 'left-[27px]' : 'left-[3px]'
          }`}
        />
      </button>
    </div>
  );
}

/**
 * 画面下に固定する保存バー。
 * 下部タブ（58px）に重ならない位置に置く。
 */
export function SaveBar({
  busy,
  onSave,
  label = '保存する',
  disabled,
}: {
  busy: boolean;
  onSave: () => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <>
      {/* バーの下に隠れる分の余白 */}
      <div className="h-24" />
      <div className="fixed inset-x-0 bottom-[58px] z-30 mx-auto max-w-2xl px-4 pb-3">
        <button
          type="button"
          onClick={onSave}
          disabled={busy || disabled}
          className="tap flex w-full items-center justify-center rounded-xl bg-adm-action px-4 py-3.5 text-[15px] font-bold text-white shadow-lg disabled:opacity-50"
        >
          {busy ? '保存中…' : label}
        </button>
      </div>
    </>
  );
}

export function Notice({ kind, children }: { kind: 'error' | 'ok'; children: ReactNode }) {
  return (
    <p
      className={`mx-4 mt-3 rounded-xl border px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
        kind === 'error'
          ? 'border-[#E3C9C7] bg-[#FBF3F2] text-adm-danger'
          : 'border-adm-rule bg-adm-hint text-adm-action'
      }`}
      role={kind === 'error' ? 'alert' : 'status'}
    >
      {children}
    </p>
  );
}
