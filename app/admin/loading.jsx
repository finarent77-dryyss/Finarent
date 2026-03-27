export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-64 bg-slate-100 rounded"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-2xl" style={{ animationDelay: `${i * 80}ms` }}></div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-56 bg-slate-100 rounded-2xl"></div>
        ))}
      </div>
      <div className="h-64 bg-slate-100 rounded-2xl"></div>
    </div>
  );
}
