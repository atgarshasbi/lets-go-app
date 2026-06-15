export default function ProgressBar({ done, total }) {
  const pct = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="w-full max-w-md mt-3">
      <div className="flex justify-between text-sm font-bold text-purple-600 mb-1">
        <span>✨ Progress</span>
        <span>{done} of {total} done!</span>
      </div>
      <div className="w-full h-5 bg-purple-100 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #a78bfa, #ec4899, #f59e0b)',
          }}
        />
      </div>
    </div>
  );
}
