export default function StatsCard({ icon, number, label, color = 'from-secondary to-secondary/80' }) {
  return (
    <div className="text-center p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl">
      {icon && (
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
          <i className={`fa-solid ${icon} text-white text-xl`}></i>
        </div>
      )}
      <div className="text-3xl font-bold text-secondary mb-1">{number}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
