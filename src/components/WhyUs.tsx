import React from 'react';
import { Route, Hotel, Palmtree, MessageSquareQuote, Plane, Utensils, Languages, ShieldCheck } from 'lucide-react';

export const WhyUs: React.FC = () => {
  const pillars = [
    {
      number: "01",
      icon: Route,
      tag: "Tailored For You",
      title: "Personalized Itineraries",
      description: "Your trip is planned strictly around your dates, interests, group size, and preferred travel pace — never rigid mass-tour timetables.",
    },
    {
      number: "02",
      icon: Hotel,
      tag: "Single Point Booking",
      title: "Stay & Transport Together",
      description: "We bundle handpicked resorts, private houseboats, and dedicated AC chauffeur vehicles into one seamless, stress-free package.",
    },
    {
      number: "03",
      icon: Palmtree,
      tag: "Born & Based in Kerala",
      title: "Local Kerala Knowledge",
      description: "Our local team knows which mountain roads are smoothest, the best times to spot wildlife, and authentic culinary stops.",
    },
    {
      number: "04",
      icon: MessageSquareQuote,
      tag: "Instant Direct Support",
      title: "Easy WhatsApp Coordination",
      description: "Direct answers in minutes, transparent pricing with zero surprise charges, and continuous support before and during your vacation.",
    },
  ];

  return (
    <section id="why-us" className="py-16 md:py-24 bg-brand-green-pale/40 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="text-xs font-extrabold tracking-widest text-brand-green uppercase">
            WHY TRAVEL CARE
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-brand-navy">
            Travel planning without the stress
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            From your first enquiry to your safe airport drop-off, experience genuine South Indian hospitality with dedicated on-ground care.
          </p>
        </div>

        {/* 4 Pillar Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-brand-green/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
              >
                {/* Subtle Watermark Number for modern visual depth */}
                <div
                  aria-hidden="true"
                  className="absolute -right-2 -top-2 text-6xl sm:text-7xl font-display font-black text-slate-100/60 group-hover:text-emerald-100/70 transition-colors select-none pointer-events-none"
                >
                  {p.number}
                </div>

                <div className="relative z-10 space-y-4">
                  {/* Top Bar: Icon + Distinctive Tag */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50/90 text-brand-green ring-1 ring-emerald-600/15 flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-all shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-green bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                      {p.tag}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold font-display text-brand-navy group-hover:text-brand-green transition-colors pt-1">
                    {p.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pan-India Guest Connectivity Banner */}
        <div className="mt-10 sm:mt-12 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100">
                <Plane className="w-3.5 h-3.5" />
                <span>Pan-India Flight &amp; Train Pickups</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-brand-navy">
                Welcoming Guests from Across India &amp; Worldwide
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Daily private pickups at Cochin International Airport (COK) and Trivandrum (TRV) connecting regular flights from Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Ahmedabad, Kolkata, and Pune.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700">
                <Plane className="w-4 h-4 text-brand-green shrink-0" />
                <span>Airport &amp; Station Chauffeur Meet</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700">
                <Utensils className="w-4 h-4 text-brand-green shrink-0" />
                <span>Pure Veg &amp; Jain Food Coordination</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700">
                <Languages className="w-4 h-4 text-brand-green shrink-0" />
                <span>Hindi &amp; English Fluent Drivers</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
                <span>Govt-Approved Licensed Fleet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
