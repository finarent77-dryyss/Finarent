export default function PartnerLoading() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded-lg mb-8"></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-slate-100 rounded-2xl"></div>
        ))}
      </div>
    </div>
  );
}
