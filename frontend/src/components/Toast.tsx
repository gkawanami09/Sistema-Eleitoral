export function Toast({
  message,
  type = 'success',
  onClose
}: {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-[90vw] max-w-md rounded-xl border p-4 shadow-xl ${
        type === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
      }`}
    >
      <p className="font-semibold">{message}</p>
      <button onClick={onClose} className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-white">
        OK
      </button>
    </div>
  );
}
