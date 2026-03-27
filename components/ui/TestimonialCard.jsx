export default function TestimonialCard({ testimonial }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
      <div className="flex items-center mb-6">
        {[...Array(testimonial.rating)].map((_, index) => (
          <div key={index} className="w-5 h-5 text-accent">
            <i className="fa-solid fa-star"></i>
          </div>
        ))}
      </div>
      <p className="text-gray-700 leading-relaxed mb-6 text-lg">&quot;{testimonial.text}&quot;</p>
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center text-primary font-black text-lg shrink-0">
          {testimonial.initials}
        </div>
        <div>
          <div className="font-bold text-primary">{testimonial.position}</div>
          <div className="text-sm text-gray-600">Secteur {testimonial.sector}</div>
        </div>
      </div>
      {testimonial.sector && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              <i className="fa-solid fa-industry text-secondary mr-2"></i>
              {testimonial.sector}
            </div>
            {testimonial.amount && <div className="text-gray-600 font-semibold">{testimonial.amount}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
