export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    "name": "Karin Art Tattoo Studio",
    "alternateName": "Karin Art",
    "description": "Profesionálne tetovanie Bratislava - tatérske štúdio s kvalitnými tetovaniami. Malé tetovanie, čiernobiele, farebné tetovania. Online rezervácia.",
    "url": "https://karinart.sk",
    "telephone": "+421902482967",
    "email": "info@karinart.sk",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ondavská 1",
      "addressLocality": "Bratislava",
      "postalCode": "821 07",
      "addressCountry": "SK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 48.1614264,
      "longitude": 17.1451263
    },
    "openingHours": "Mo-Fr 10:00-18:00, Sa 10:00-16:00",
    "priceRange": "€€",
    "currenciesAccepted": "EUR",
    "paymentAccepted": "Cash, Card",
    "areaServed": {
      "@type": "City",
      "name": "Bratislava"
    },
    "serviceArea": {
      "@type": "City",
      "name": "Bratislava"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Tattoo Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Malé tetovanie / Small Tattoo",
            "description": "Malé a mini tetovania v čiernobielej alebo farebnej technike"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Čiernobiele tetovanie / Black and Grey Tattoo",
            "description": "Realistické čiernobiele tetovania"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Farebné tetovanie / Color Tattoo",
            "description": "Farebné tetovania v rôznych štýloch"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Line Art tetovanie / Line Art Tattoo",
            "description": "Minimalistické line art tetovania"
          }
        }
      ]
    },
    "sameAs": [
      "https://www.instagram.com/karin_art_tattoo",
      "https://www.facebook.com/profile.php?id=61560932097231"
    ],
    "image": [
      "https://karinart.sk/images/karin.webp",
      "https://karinart.sk/images/studio.webp"
    ],
    "founder": {
      "@type": "Person",
      "name": "Karin Haizerová",
      "jobTitle": "Tattoo Artist",
      "description": "Profesionálna tatérka s dlhoročnými skúsenosťami v tetovaní"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "50+",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Katarína Benkovská"
        },
        "reviewBody": "Tatterka mi bola odporúčaná a ja ju môžem vrelo odporučiť ďalej. Hľadala som niekoho, kto sa ,,nebojí,, tetovať aj tenký text a dopadlo to na výbornú. Skvelá práca, príjemné prostredie :)"
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
} 