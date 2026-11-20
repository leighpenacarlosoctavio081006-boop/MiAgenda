import React, { useState } from 'react';
import { BottomSheetModal } from './BottomSheetModal';

interface ConfirmDeleteSheetProps {
  open: boolean;
  itemLabel: string;
  itemName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmDeleteSheet({
  open,
  itemLabel,
  itemName,
  onClose,
  onConfirm,
}: ConfirmDeleteSheetProps) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <BottomSheetModal open={open} title={`Eliminar ${itemLabel}`} onClose={onClose}>
      <div className="space-y-5">
        <p className="text-base text-slate-700 leading-relaxed">
          ¿Seguro que deseas eliminar <span className="font-semibold text-slate-900">“{itemName}”</span>? Esta acción no se puede deshacer.
        </p>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-base hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleConfirm}
            className="w-full sm:flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-red-600 text-white font-semibold text-base hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {deleting ? 'Eliminando...' : `Sí, eliminar ${itemLabel}`}
          </button>
        </div>
      </div>
    </BottomSheetModal>
  );
}
