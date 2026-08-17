import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="px-4 py-16 text-center">
      <p className="text-[15px] font-medium">この犬は見つかりませんでした</p>
      <p className="mt-2 text-[12.5px] text-adm-muted">削除されたか、URLが違う可能性があります。</p>
      <Link href="/admin/dogs" className="mt-5 inline-block text-[13px] text-adm-action underline underline-offset-4">
        犬一覧へ戻る
      </Link>
    </div>
  );
}
