import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { OrderStatus } from '../types/store';

export function StatusText({ status }: { status: OrderStatus }) {
  if (status === 'Sukses') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 whitespace-nowrap shrink-0">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Sukses</span>
      </span>
    );
  }

  if (status === 'Gagal') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 whitespace-nowrap shrink-0">
        <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Gagal</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 whitespace-nowrap shrink-0">
      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>Pending</span>
    </span>
  );
}
