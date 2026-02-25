export function ConfirmModal({
  open,
  title,
  description,
  onConfirm,
  onCancel
}: {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-slate-600">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2" onClick={onCancel}>
            Cancelar
          </button>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-white" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
