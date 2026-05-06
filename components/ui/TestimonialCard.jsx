export default function TestimonialCard({ testimonial }) {
  return (
    <div className="bg-white rounded-3xl p-7 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-secondary/30 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/5 to-accent/5 rounded-full blur-2xl -translate-y-12 translate-x-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-amber-400 text-sm gap-0.5">
            {[...Array(testimonial.rating)].map((_, index) => (
              <i key={index} className="fa-solid fa-star"></i>
            ))}
          </div>
          <i className="fa-solid fa-quote-right text-3xl text-secondary/20"></i>
        </div>

        <p className="text-gray-700 leading-relaxed mb-6 text-base">
          &laquo;&nbsp;{testimonial.text}&nbsp;&raquo;
        </p>

        <div className="flex items-center gap-4 pt-5 border-t border-gray-100">
          {testimonial.avatar ? (
            <img
              src={testimonial.avatar}
              alt={testimonial.name || testimonial.initials}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-secondary/20 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center text-primary font-black text-base shrink-0">
              {testimonial.initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-primary truncate">{testimonial.name || testimonial.position}</div>
            <div className="text-xs text-gray-500 truncate">
              {testimonial.position}{testimonial.company ? ` · ${testimonial.company}` : ''}
            </div>
          </div>
        </div>

        {(testimonial.sector || testimonial.amount) && (
          <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-dashed border-gray-100">
            {testimonial.sector && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary/10 text-secondary rounded-full text-[11px] font-bold">
                <i className="fa-solid fa-industry text-[9px]"></i>
                {testimonial.sector}
              </span>
            )}
            {testimonial.amount && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent rounded-full text-[11px] font-bold">
                <i className="fa-solid fa-coins text-[9px]"></i>
                {testimonial.amount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
