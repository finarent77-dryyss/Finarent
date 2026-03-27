export default function EspaceLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex items-center gap-5 mb-10 animate-pulse">
          <div className="w-18 h-18 bg-slate-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-7 w-48 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-32 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
          ))}
        </div>
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-16 bg-slate-200 rounded-2xl animate-pulse"></div>
            <div className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
            <div className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
