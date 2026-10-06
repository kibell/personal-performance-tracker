import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div><h1 className="text-xl font-semibold">Page not found</h1><p className="mt-1 text-sm text-muted">That year or record doesn’t exist, or isn’t shared.</p><Link href="/" className="btn mt-4">Go home</Link></div>
    </div>
  );
}
