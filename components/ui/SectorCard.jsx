import Link from 'next/link';

export default function SectorCard({ sector }) {
  return (
    <div id={sector.id} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-secondary cursor-pointer h-full flex flex-col">
      <div className={`w-16 h-16 bg-gradient-to-br ${sector.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <i className={`fa-solid ${sector.icon} text-white text-3xl`}></i>
      </div>
      <h3 className="text-2xl font-bold text-primary mb-3">{sector.title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed">{sector.description}</p>
      {sector.equipments && (
        <div className="space-y-2 mb-6">
          {sector.equipments.slice(0, 3).map((equipment, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
              <i className="fa-solid fa-check text-accent"></i>
              <span>{equipment}</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-auto">
        <Link href={`/sectors/${sector.id}`} className="inline-flex items-center space-x-2 text-secondary font-semibold group-hover:gap-3 transition-all">
          <span>En savoir plus</span>
          <i className="fa-solid fa-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
}
