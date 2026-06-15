export default function StarCounter({ total }) {
  return (
    <div className="flex items-center gap-2 bg-yellow-100 border-2 border-yellow-300 rounded-full px-5 py-2 shadow mb-3">
      <span className="text-2xl">⭐</span>
      <span className="text-xl font-black text-yellow-600">{total} stars total</span>
      <span className="text-2xl">⭐</span>
    </div>
  );
}
