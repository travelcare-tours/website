import { TourPackage, Destination, Testimonial, FAQItem } from '../types';

export const COMPANY_DETAILS = {
  name: "Travel Care Tours Pvt Ltd",
  shortName: "Travel Care Tours",
  tagline: "Your Journey, Our Care",
  phone: "+91 91435 43444",
  phoneSecondary: "+91 91435 43666",
  phoneAlt: "+91 8129070109",
  whatsappNumber: "919143543444",
  businessNumbers: [
    { label: "Primary & WhatsApp", number: "+91 91435 43444", tel: "+919143543444", isWhatsApp: true },
    { label: "Booking Desk", number: "+91 91435 43666", tel: "+919143543666", isWhatsApp: false },
    { label: "Support Hotline", number: "+91 8129070109", tel: "+918129070109", isWhatsApp: false },
  ],
  email: "travelcare598@gmail.com",
  location: "Kerala, South India",
  address: "Ground Flr, Mannath Bld, 36/267. Seaport-Airport Rd, Thrikkakara Ernakulam, Kerala",
  experience: "12+ Years",
  openingHours: "Open Daily 8:00 AM – 8:00 PM (12/7 Guest Support)",
  website: "https://travelcaretours.in",
  // Optional: Paste your Google Apps Script Web App URL here or set VITE_GOOGLE_SHEET_WEBHOOK_URL in .env
  googleSheetWebhookUrl: "https://script.google.com/macros/s/AKfycbyZjrG1vzNOf-P3Jl0Scs3ml2X0ey0YYDsWA9yA8LO48pDL-AR4iO_qivvp3LQppBKv/exec",
};

export const DESTINATIONS: Destination[] = [
  {
    id: "munnar",
    name: "Munnar",
    subtitle: "Tea gardens & misty mountains",
    tagline: "The Kashmir of South India",
    category: "Hill Station",
    image: "https://www.thefogmunnar.com/images/munnar-banner-mob.webp?auto=format&fit=crop&w=1200&q=85",
    description: "Perched at 1,600 meters above sea level, Munnar features rolling emerald tea plantations, cool mountain breeze, cascading waterfalls, and the rare Nilgiri Tahr.",
    keyAttractions: ["Tea Museum & Estates", "Eravikulam National Park", "Mattupetty Dam", "Top Station & Echo Point", "Attukad Waterfalls"],
    bestTime: "September to May"
  },
  {
    id: "thekkady",
    name: "Thekkady",
    subtitle: "Wildlife, forest & spice country",
    tagline: "Periyar Tiger Reserve & Spices",
    category: "Wildlife & Nature",
    image: "https://thekkady.org/wp-content/uploads/2025/04/elephant-safari-thekkady-1024x640.jpg?auto=format&fit=crop&w=1200&q=85",
    description: "Home to India's most fascinating natural wildlife sanctuary, Periyar Lake boat safari, aromatic spice gardens, and martial arts (Kalaripayattu) performances.",
    keyAttractions: ["Periyar Wildlife Boat Safari", "Spice Plantation Walk", "Elephant Junction", "Kalaripayattu & Kathakali Show", "Bamboo Rafting"],
    bestTime: "October to April"
  },
  {
    id: "alleppey",
    name: "Alleppey",
    subtitle: "Backwaters & houseboat cruises",
    tagline: "The Venice of the East",
    category: "Backwaters",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=85",
    description: "Glide through tranquil palm-fringed canals, emerald paddy fields, and serene lagoons aboard a traditional thatch-roof Kerala houseboat with authentic onboard meals.",
    keyAttractions: ["Private Houseboat Cruise", "Vembanad Lake", "Alappuzha Beach & Lighthouse", "Canoe Village Tours", "Marari Beach"],
    bestTime: "Year Round (Winter Best)"
  },
  {
    id: "kovalam",
    name: "Kovalam",
    subtitle: "Beach, lighthouse & relaxation",
    tagline: "Golden Crescent Beaches",
    category: "Beaches",
    image: "https://images.trvl-media.com/place/6053347/c20151bd-9cba-4257-b8b0-0ea3163f0459.jpg?auto=format&fit=crop&w=1200&q=85",
    description: "Famous for its red-and-white striped lighthouse, gentle waves, Ayurvedic rejuvenation therapies, fresh seafood beachside dining, and golden sands.",
    keyAttractions: ["Lighthouse Beach", "Hawa Beach & Samudra Beach", "Ayurvedic Massages", "Vizhinjam Marine Aquarium", "Sunset Promenade"],
    bestTime: "October to March"
  },
  {
    id: "varkala",
    name: "Varkala",
    subtitle: "Cliffs, palms & Arabian Sea views",
    tagline: "Majestic Cliffs & Sacred Springs",
    category: "Coastal Cliffs",
    image: "https://images.trvl-media.com/place/6104784/594a64e9-f895-4633-8959-43902aeda026.jpg?auto=format&fit=crop&w=1200&q=85",
    description: "Striking red laterite cliffs bordering the Arabian Sea, bohemian cliff-top cafés, stunning sunset panoramic viewpoints, and the spiritual Janardhanaswamy Temple.",
    keyAttractions: ["North Cliff Promenade", "Papanasam Sacred Beach", "Black Sand Beach", "Cliffside Cafes", "Janardhana Swamy Temple"],
    bestTime: "October to April"
  },
  {
    id: "kochi",
    name: "Kochi",
    subtitle: "Fort Kochi & Chinese fishing nets",
    tagline: "Queen of the Arabian Sea",
    category: "Heritage & Culture",
    image: "https://assets.cntraveller.in/photos/6780dce9687bfbbf08fb402e/3:2/w_4977,h_3318,c_limit/GettyImages-2171354215.jpg?auto=format&fit=crop&w=1200&q=85",
    description: "A fascinating blend of Portuguese, Dutch, British, and Jewish heritage with cantilevered Chinese fishing nets, boutique art cafes, spice markets, and harbor cruises.",
    keyAttractions: ["Chinese Fishing Nets", "Fort Kochi Colonial Streets", "Mattancherry Dutch Palace", "Jew Town & Synagogue", "Marine Drive Boating"],
    bestTime: "October to April"
  },
  {
    id: "vagamon",
    name: "Vagamon",
    subtitle: "Green hills & outdoor adventures",
    tagline: "Untouched Highland Paradise",
    category: "Offbeat Hills",
    image: "https://www.capturedayz.com/assets/img/Gallery/img8.jpg?auto=format&fit=crop&w=1200&q=85",
    description: "A tranquil highland haven free from commercial crowds, surrounded by pine forests, misty green meadows, tea valleys, and thrilling off-road jeep trails.",
    keyAttractions: ["Vagamon Pine Forest", "Vagamon Kurisumala", "Green Meadows (Vagamon Lake)", "Marmala Waterfalls", "Off-Road Jeep Safari"],
    bestTime: "September to May"
  },
  {
    id: "kanyakumari",
    name: "Kanyakumari",
    subtitle: "Vivekananda Rock & coastal views",
    tagline: "Triconfluence of Three Oceans",
    category: "Coastal Heritage",
    image: "https://images.unsplash.com/photo-1610902552120-c577dbde88a8?auto=format&fit=crop&w=1200&q=85",
    description: "The southernmost tip of the Indian peninsula where the Arabian Sea, Bay of Bengal, and Indian Ocean meet. Renowned for spectacular sunrise and sunset over the water.",
    keyAttractions: ["Vivekananda Rock Memorial", "Thiruvalluvar Statue", "Triveni Sangam", "Sunset Point", "Kanyakumari Amman Temple"],
    bestTime: "October to March"
  }
];

export const TOUR_PACKAGES: TourPackage[] = [
  {
    id: "kerala-honeymoon-escape",
    title: "Kerala Honeymoon Escape",
    category: "Honeymoon",
    tag: "HONEYMOON SPECIAL",
    duration: "5 Nights / 6 Days",
    nights: 5,
    days: 6,
    route: ["Cochin", "Munnar (2N)", "Thekkady (1N)", "Alleppey Houseboat (1N)", "Cochin (1N)"],
    image: "https://img.traveltriangle.com/apac/attachments/pictures/842404/original/romantic-dinner_kerala_houseboat.jpg?auto=format&fit=crop&w=900&q=85",
    priceNote: "Customized quote based on resort choice",
    highlights: [
      "Romantic candlelit dinner & flower bed decoration",
      "Private luxury bedroom houseboat in Alleppey backwaters",
      "Misty sunrise viewpoints & tea plantation strolls in Munnar",
      "Periyar Lake boat cruise & aromatic spice plantation trail"
    ],
    inclusions: [
      "5 Nights accommodation in romantic boutique resorts",
      "Daily gourmet breakfast at all hotels",
      "All meals (Lunch, Tea/Snacks, Dinner, Breakfast) on Houseboat",
      "Dedicated AC Private Vehicle (Sedan / Ertiga / Innova) throughout",
      "Complimentary honeymoon cake & floral room decor",
      "Driver allowances, tolls, parking, and interstate permits"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Cochin → Scenic Drive to Munnar",
        description: "Warm welcome at Cochin airport/railway station by our private chauffeur. Drive through winding hill roads with stops at Cheeyappara and Valara waterfalls. Check into your romantic Munnar hill resort.",
        activities: ["Airport/Station pickup", "Waterfall view stops", "Evening leisure at resort"]
      },
      {
        day: 2,
        title: "Munnar Tea Hills & Romance in the Clouds",
        description: "Full day sightseeing in Munnar. Visit Eravikulam National Park (home to the Nilgiri Tahr), Tea Museum, Mattupetty Dam, Echo Point, and Photo Point amidst endless lush greenery.",
        activities: ["Tea garden photography", "Eravikulam National Park", "Boating at Mattupetty", "Echo Point fun"]
      },
      {
        day: 3,
        title: "Munnar → Thekkady (Wilderness & Spice Gardens)",
        description: "Travel through the Western Ghats to Thekkady. Check in to your forest resort. Afternoon guided spice plantation walk discovering cardamom, pepper, and cinnamon. Evening Kathakali and martial arts show.",
        activities: ["Scenic hill drive", "Guided spice tour", "Cultural show (Kathakali/Kalaripayattu)"]
      },
      {
        day: 4,
        title: "Thekkady → Alleppey Luxury Houseboat",
        description: "Drive down to Alleppey backwaters. Board your private traditionally crafted Kerala houseboat at 12:00 PM. Enjoy traditional Kerala lunch while cruising along serene canals. Overnight on tranquil waters.",
        activities: ["Houseboat check-in", "Backwater cruise", "Kerala meals with Karimeen fish", "Candlelight dinner"]
      },
      {
        day: 5,
        title: "Alleppey → Fort Kochi Heritage Evening",
        description: "After breakfast, check out from the houseboat. Drive to Cochin. Explore historic Fort Kochi, Chinese fishing nets, Mattancherry Dutch Palace, and shop for Kerala souvenirs and spices.",
        activities: ["Backwater breakfast", "Fort Kochi sightseeing", "Shopping at Jew Town", "Sunset at Marine Drive"]
      },
      {
        day: 6,
        title: "Departure from Cochin with Cherished Memories",
        description: "Enjoy breakfast at your hotel. Transfer to Cochin International Airport or Railway station for your onward journey with beautiful memories of Kerala.",
        activities: ["Hotel checkout", "Optional city shopping", "Airport/Station drop-off"]
      }
    ]
  },
  {
    id: "kerala-family-holiday",
    title: "Kerala Family Holiday Experience",
    category: "Family",
    tag: "FAMILY FAVORITE",
    duration: "6 Nights / 7 Days",
    nights: 6,
    days: 7,
    route: ["Cochin", "Munnar (2N)", "Thekkady (1N)", "Alleppey (1N)", "Kovalam (2N)", "Trivandrum"],
    image: "https://www.tusktravel.com/blog/wp-content/uploads/2022/10/How-to-Plan-a-Family-Holiday-in-Kerala.jpg?auto=format&fit=crop&w=900&q=85",
    priceNote: "Tailored for families with kids and seniors",
    highlights: [
      "Relaxed driving pace with family-friendly resort stays",
      "Exciting elephant junction safari & spice garden exploration",
      "Serene backwater cruise with authentic Kerala feast",
      "Golden sandy beach playtime at Kovalam Lighthouse Beach"
    ],
    inclusions: [
      "6 Nights stay in premium family-friendly hotels/resorts",
      "Daily breakfast included at all stays",
      "Private AC vehicle with dedicated, courteous driver-guide",
      "Alleppey houseboat day cruise or overnight stay option",
      "Assistance with boat tickets, entrance passes, and luggage",
      "All driver fees, fuel, tolls, and parking taxes"
    ],
    itinerary: [
      {
        day: 1,
        title: "Warm Welcome at Cochin → Transfer to Munnar",
        description: "Pick up by our experienced family driver. Scenic drive to Munnar with photo stops at spice farms and waterfalls. Check-in and relax at your scenic hill resort.",
        activities: ["Meet & Greet", "Cheeyappara Waterfall", "Resort relaxation"]
      },
      {
        day: 2,
        title: "Munnar Family Sightseeing & Tea Trails",
        description: "Visit Rajamalai (Eravikulam National Park), Kundala Lake pedal boating, Mattupetty Dam, and the Tata Tea Museum with tea-tasting for adults and chocolates for kids.",
        activities: ["Pedal boating", "Tea factory tour", "Echo point fun"]
      },
      {
        day: 3,
        title: "Munnar to Thekkady Wildlife Country",
        description: "Journey to Thekkady. Visit Periyar National Park for a boat cruise on the lake to spot wild elephants, deer, and birds. Evening elephant feeding and spice shopping.",
        activities: ["Periyar lake boating", "Elephant interactions", "Spice market shopping"]
      },
      {
        day: 4,
        title: "Thekkady to Alleppey Backwaters",
        description: "Descend from the hills to Alleppey. Cruise on emerald backwaters witnessing village life, traditional fishermen, and duck farming. Authentic lunch served on banana leaves.",
        activities: ["Houseboat / Shikhara cruise", "Village life viewing", "Sunset over backwaters"]
      },
      {
        day: 5,
        title: "Alleppey to Kovalam Beach Paradise",
        description: "Drive south along the coastal corridor to Kovalam. Check in to a beach resort. Spend a leisurely afternoon building sandcastles and watching the sun set over the Arabian Sea.",
        activities: ["Drive to Kovalam", "Lighthouse Beach stroll", "Fresh coastal seafood dinner"]
      },
      {
        day: 6,
        title: "Trivandrum Heritage & Kovalam Beach Relaxation",
        description: "Morning visit to the magnificent Padmanabhaswamy Temple (from outside / darshan as preferred), Napier Museum, and Zoo. Return for sunset at Kovalam beach.",
        activities: ["Padmanabhaswamy Temple", "Museum & Art Gallery", "Beach leisure"]
      },
      {
        day: 7,
        title: "Farewell to Kerala from Trivandrum / Cochin",
        description: "After breakfast, pack your Kerala banana chips and souvenirs. Smooth drop-off at Trivandrum (TRV) airport or railway station.",
        activities: ["Breakfast", "Souvenir shopping", "Drop-off with care"]
      }
    ]
  },
  {
    id: "kerala-premium-journey",
    title: "Kerala Luxury & Comfort Journey",
    category: "Premium",
    tag: "5-STAR LUXURY",
    duration: "7 Nights / 8 Days",
    nights: 7,
    days: 8,
    route: ["Cochin (1N)", "Munnar (2N)", "Thekkady (1N)", "Kumarakom (2N)", "Marari (1N)"],
    image: "https://images.unsplash.com/photo-1576748135861-f254c1582530?auto=format&fit=crop&w=900&q=85",
    priceNote: "Curated 5-Star resorts & private chauffeur",
    highlights: [
      "Stays at luxury heritage properties (Taj, CGH Earth, Kumarakom Lake Resort)",
      "Premium Toyota Innova Crysta with seasoned executive chauffeur",
      "Traditional Ayurvedic rejuvenation therapy session included",
      "Private luxury sunset yacht or motorized canoe ride"
    ],
    inclusions: [
      "7 Nights in handpicked 5-star luxury resorts & heritage suites",
      "Lavish buffet breakfast and curated dining experiences",
      "Dedicated Toyota Innova Crysta private transport throughout",
      "Complimentary Ayurvedic wellness consultation & massage session",
      "VIP entrance arrangements and personalized concierge support 24/7",
      "All taxes, expressway tolls, and driver gratuity assistance"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrive in Kochi → Luxury Heritage Check-in",
        description: "VIP airport reception. Private transfer to a luxury heritage resort in Fort Kochi or Grand Hyatt Bolgatty. Evening private sunset harbor cruise on Cochin port.",
        activities: ["VIP Meet & Greet", "Harbor cruise", "Fine dining welcome dinner"]
      },
      {
        day: 2,
        title: "Kochi to Munnar Highlands in Luxury",
        description: "Scenic ride up the Ghats in your Innova Crysta. Arrive at an exclusive cliff-edge luxury plantation resort. Private estate walk with in-house naturalist.",
        activities: ["Comfort transfer", "Tea estate walk", "High tea with panoramic view"]
      },
      {
        day: 3,
        title: "Exclusive Munnar Vistas & Forest Sanctuary",
        description: "Private guided excursion to Eravikulam sanctuary, botanical flower gardens, and Top Station. Relaxing evening by the resort fireplace.",
        activities: ["Private vehicle tour", "High altitude viewpoints", "Resort spa session"]
      },
      {
        day: 4,
        title: "Munnar to Thekkady Wilderness",
        description: "Travel through tea to cardamom hills. Check in to a secluded luxury eco-lodge. Private plantation walking tour followed by a private tea tasting session.",
        activities: ["Scenic drive", "Curated spice tasting", "Forest canopy sunset"]
      },
      {
        day: 5,
        title: "Thekkady to Kumarakom Lake Resort",
        description: "Descend to Kumarakom on the banks of Vembanad Lake. Check into an iconic pool villa or luxury heritage cottage. Evening flute music and sunset canoe ride.",
        activities: ["Resort check-in", "Sunset canoe tour", "Lakeside dining"]
      },
      {
        day: 6,
        title: "Kumarakom Rejuvenation & Bird Sanctuary",
        description: "Early morning boat tour inside Kumarakom Bird Sanctuary. Afternoon authentic Abhyanga Ayurvedic herbal oil massage to deeply refresh body and mind.",
        activities: ["Bird watching", "Ayurvedic therapy", "Village cycling"]
      },
      {
        day: 7,
        title: "Kumarakom to Marari Beach Resort",
        description: "Short transfer to Marari, Kerala's pristine eco-friendly beach. Indulge in barefoot luxury, sea breeze, and quiet palm groves.",
        activities: ["Beach villa stay", "Organic farm tour", "Candlelit seafood dinner"]
      },
      {
        day: 8,
        title: "Farewell Kerala Transfer to Cochin Airport",
        description: "Enjoy a relaxed coastal breakfast before your chauffeur drives you smoothly to Cochin International Airport for departure.",
        activities: ["Breakfast", "Airport transfer", "End of luxury journey"]
      }
    ]
  },
  {
    id: "kerala-group-getaway",
    title: "Vagamon & Munnar Group Getaway",
    category: "Groups",
    tag: "ADVENTURE & GROUPS",
    duration: "4 Nights / 5 Days",
    nights: 4,
    days: 5,
    route: ["Cochin", "Vagamon (2N)", "Munnar (2N)", "Cochin"],
    image: "https://content.r9cdn.net/rimg/dimg/a9/dd/d6b29241-city-44818-166a7453734.jpg?auto=format&fit=crop&w=900&q=85",
    priceNote: "Special group pricing for friends & corporate teams",
    highlights: [
      "Thrilling 4x4 off-road jeep safari to Vagamon hilltops",
      "Campfire with music and barbecue under star-filled skies",
      "Pine forest treks, misty valleys, and waterfall visits",
      "Spacious AC Tempo Traveller or Luxury Urbania with professional driver"
    ],
    inclusions: [
      "4 Nights resort / private villa stays with group sharing rooms",
      "Daily hearty breakfast and dinner included",
      "Dedicated AC Tempo Traveller (12 to 26 seater) with fuel & driver",
      "1 Off-road 4x4 Jeep Safari in Vagamon included",
      "Campfire with music arrangement (subject to weather)",
      "Sightseeing and coordinator support throughout"
    ],
    itinerary: [
      {
        day: 1,
        title: "Cochin to Vagamon Pine Forests & Campfire",
        description: "Group meetup in Cochin and comfortable drive up into the offbeat paradise of Vagamon. Check in to group villas or hillside resort. Evening campfire with music.",
        activities: ["Group pickup", "Scenic hill road", "Campfire & BBQ evening"]
      },
      {
        day: 2,
        title: "Vagamon Off-Road Jeep Safari & Adventure",
        description: "Exciting 4x4 jeep safari crossing steep rocky slopes, pine forest trails, and suicide point vistas. Visit Vagamon Lake and Kurisumala hills.",
        activities: ["Jeep Safari", "Pine forest photography", "Trekking viewpoints"]
      },
      {
        day: 3,
        title: "Vagamon to Munnar Highlands",
        description: "Drive through scenic tea country to Munnar. Visit Lockhart Gap viewpoint and tea factory. Check into resort with valley views.",
        activities: ["Scenic route", "Tea factory tour", "Group dinner"]
      },
      {
        day: 4,
        title: "Munnar Adventures & Waterfalls",
        description: "Explore Mattupetty Dam with group speedboat rides, Echo Point, and Anayirangal Dam. Fun group shopping in Munnar town market.",
        activities: ["Speedboating", "Echo contest", "Spice & chocolate shopping"]
      },
      {
        day: 5,
        title: "Return to Cochin & Drop-off",
        description: "Check out after breakfast. Stop at Cheeyappara waterfalls for final group photos. Drop off at Cochin airport/railway station.",
        activities: ["Waterfall stop", "Group photo session", "Safe return"]
      }
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Dr. Anirudh & Shreya Sharma",
    location: "New Delhi",
    tripType: "Honeymoon (5N/6D Munnar & Alleppey)",
    rating: 4.5,
    date: "January 2025",
    comment: "Travel Care Tours planned our Kerala honeymoon to perfection. The Munnar resort was right in the middle of tea gardens, and the private houseboat in Alleppey was immaculate with delicious hot Kerala food. Our driver Pradeep was punctual, courteous, and very respectful. Highly recommended!"
  },
  {
    id: "t2",
    name: "Rajesh Kulkarni & Family",
    location: "Pune, Maharashtra",
    tripType: "Family Trip (6 Adults + 2 Kids)",
    rating: 4,
    date: "December 2024",
    comment: "Planning a trip with elderly parents and two young kids can be stressful, but Travel Care handled everything effortlessly. The Innova Crysta was super clean, the hotels had elevators and great food, and we never felt rushed. Transparent pricing and seamless WhatsApp communication."
  },
  {
    id: "t3",
    name: "Sarah & Mark Davies",
    location: "London, United Kingdom",
    tripType: "Kerala 8 Days Cultural & Backwater Tour",
    rating: 5,
    date: "February 2025",
    comment: "Exceptional service from Travel Care Tours! Booking through WhatsApp was quick and clear. The driver was a fantastic guide, safe on mountain roads, and introduced us to wonderful local tea stalls and spice farms. Kerala is truly paradise."
  },
  {
    id: "t4",
    name: "Vikram & Group of Friends",
    location: "Bengaluru, Karnataka",
    tripType: "Vagamon & Munnar Adventure (12 Pax)",
    rating: 4.5,
    date: "November 2024",
    comment: "We booked a 17-seater Tempo Traveller for our college friends reunion. The Vagamon off-road safari, campfire night, and Munnar stay were unforgettable. Best value for money and totally genuine team."
  }
];

export const FAQS: FAQItem[] = [
  {
    question: "When is the best time to visit Kerala?",
    answer: "Kerala is a wonderful year-round destination. September to March brings pleasant, cool weather ideal for sightseeing in Munnar, Thekkady, and relaxing in backwaters. June to August is monsoon season, known worldwide for Ayurvedic wellness and breathtaking green scenery.",
    category: "General"
  },
  {
    question: "How does the Alleppey Houseboat check-in and checkout work?",
    answer: "Standard houseboat check-in is at 12:00 PM (noon) and checkout is at 9:00 AM the next morning. During the cruise, you are served welcome drinks, authentic Kerala lunch, evening tea/snacks, dinner, and breakfast by the dedicated onboard chef and captain.",
    category: "Houseboats"
  },
  {
    question: "Are the vehicles and drivers private or shared?",
    answer: "All our tour packages include 100% private, dedicated air-conditioned vehicles (Sedan, Ertiga, Innova Crysta, or Tempo Traveller). Your vehicle and professional driver remain exclusively with your family/group throughout the tour for your safety, flexibility, and comfort.",
    category: "Transport"
  },
  {
    question: "Can we customize the destinations, nights, and hotels?",
    answer: "Absolutely! Every package on our website is completely customizable. You can adjust the number of nights, choose 3-star, 4-star, or 5-star luxury resorts, add destinations like Wayanad or Kanyakumari, and set your own travel pace. Just send us your requirements on WhatsApp.",
    category: "Customization"
  },
  {
    question: "What is the booking process and payment terms?",
    answer: "Booking is simple and transparent. After you review and approve your customized itinerary, you pay a small initial token advance to confirm hotel and cab reservations. The remaining balance is paid upon arrival in Kerala. No hidden fees or surprise charges.",
    category: "Payment"
  },
  {
    question: "Is Kerala safe for family travelers and senior citizens?",
    answer: "Kerala has one of the highest safety ratings in India with courteous locals, peaceful tourist centers, and world-class healthcare facilities. We specifically select hotels with ground-floor rooms or elevators, and our drivers ensure gentle, comfortable driving on hill roads.",
    category: "Safety"
  },
  {
    question: "Do you organize Kerala tour packages for travelers from Delhi, Mumbai, Bangalore, and across India?",
    answer: "Yes! Over 80% of our guests arrive from major Indian metros including Delhi NCR, Mumbai, Pune, Bengaluru, Hyderabad, Chennai, Kolkata, and Ahmedabad. We coordinate seamless airport pickups at Cochin International Airport (COK) or Trivandrum (TRV) directly synchronized with your domestic flight or train timings.",
    category: "Pan-India Travel"
  },
  {
    question: "Is Pure Vegetarian, Jain, or North Indian food easily available during the tour?",
    answer: "Yes, absolutely. Every popular destination in Kerala (Munnar, Thekkady, Alleppey, Kochi, Kovalam) has excellent Pure Vegetarian, Gujarati, Marwari, and North Indian restaurants. Our local chauffeurs know the finest hygienic dining spots along every highway and hill route, and our Alleppey houseboats can prepare 100% vegetarian meals upon prior request.",
    category: "Dining"
  },
  {
    question: "Which airport should we book our flights to for a Kerala holiday?",
    answer: "For most popular itineraries covering Munnar, Thekkady, and Alleppey, we recommend booking flights arriving at Cochin International Airport (COK). If your tour finishes in Kovalam or Kanyakumari, you can depart conveniently from Trivandrum International Airport (TRV). Our travel desk will advise you on the most cost-effective flight route before you book tickets.",
    category: "Flights & Connectivity"
  }
];
