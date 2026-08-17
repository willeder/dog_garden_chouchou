'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/_lib/supabase/client';
import { isSupabaseConfigured } from '@/app/_lib/supabase/config';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  // /auth/callback から失敗して戻ってきたとき、原因を出す。
  // 黙って入力画面に戻すと「押したのに入れない」だけが残る。
  //
  // useSearchParams() ではなく window から読む。
  // useSearchParams() を使うとこのページが静的生成できなくなり、
  // Suspense で包む必要が出て、ログイン画面が一瞬空になる。
  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get('error');
    if (!err) return;
    setState('error');
    setMessage(
      err === 'exchange'
        ? 'ログインリンクが使えませんでした。有効期限が切れているか、すでに一度使われています。もう一度送ってください。'
        : 'ログインを完了できませんでした。もう一度送ってください。',
    );
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setState('error');
      setMessage('Supabaseの接続設定がありません。.env.local を確認してください。');
      return;
    }
    setState('sending');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // サインアップは閉じてある。名簿にない人がここから増えないようにする。
        shouldCreateUser: false,
      },
    });
    if (error) {
      setState('error');
      setMessage(
        error.message.includes('Signups not allowed')
          ? 'このメールアドレスは登録されていません。'
          : 'メールを送れませんでした。しばらく置いてもう一度お試しください。',
      );
      return;
    }
    setState('sent');
  }

  return (
    <main className="min-h-dvh flex flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-[22px] font-bold tracking-tight">シュシュ台帳</h1>
        <p className="mt-1 text-[13px] text-adm-muted">ドッグガーデンシュシュ</p>

        {state === 'sent' ? (
          <div className="mt-8 rounded-xl border border-adm-rule bg-adm-surface p-5">
            <p className="text-[15px] font-medium">メールを送りました</p>
            <p className="mt-2 text-[13px] leading-relaxed text-adm-muted">
              <span className="num">{email}</span> 宛のリンクを開くとログインできます。
              このページは閉じてかまいません。
            </p>
            <button
              onClick={() => setState('idle')}
              className="tap mt-4 text-[13px] text-adm-action underline underline-offset-4"
            >
              別のアドレスで送り直す
            </button>
          </div>
        ) : (
          <form onSubmit={send} className="mt-8">
            <label htmlFor="email" className="block text-[13px] text-adm-muted">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="num tap mt-2 w-full rounded-xl border border-adm-rule bg-adm-surface px-4 text-[16px] outline-none focus:border-adm-action"
            />

            {state === 'error' && (
              <p className="mt-3 text-[13px] text-adm-danger">{message}</p>
            )}

            <button
              type="submit"
              disabled={state === 'sending' || email.trim() === ''}
              className="tap mt-5 w-full rounded-xl bg-adm-action px-4 py-3 text-[15px] font-bold text-white disabled:opacity-40"
            >
              {state === 'sending' ? '送信中…' : 'ログインリンクを送る'}
            </button>

            <p className="mt-5 text-[12px] leading-relaxed text-adm-muted">
              パスワードはありません。届いたメールのリンクを開くだけでログインできます。
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
