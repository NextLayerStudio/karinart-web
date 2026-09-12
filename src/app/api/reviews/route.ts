import { NextResponse } from 'next/server';

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
}

export async function GET() {
  try {
    const placeId = process.env.GOOGLE_PLACE_ID;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!placeId || !apiKey) {
      console.log('Missing Google API credentials, using fallback reviews');
      return NextResponse.json(getFallbackReviews());
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&language=sk&key=${apiKey}`
    );

    if (!response.ok) {
      console.log('Google API request failed, using fallback reviews');
      return NextResponse.json(getFallbackReviews());
    }

    const data = await response.json();
    
    // Check if API returned an error
    if (data.status === 'REQUEST_DENIED' || data.status === 'INVALID_REQUEST' || data.status === 'OVER_QUERY_LIMIT') {
      console.log('Google API error:', data.error_message || data.status, 'using fallback reviews');
      return NextResponse.json(getFallbackReviews());
    }
    
    if (!data.result?.reviews) {
      console.log('No reviews found in Google API response, using fallback reviews');
      return NextResponse.json(getFallbackReviews());
    }

    // Get 5 random reviews
    const reviews = data.result.reviews
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map((review: GoogleReview) => ({
        authorName: review.author_name,
        rating: review.rating,
        text: review.text,
        timestamp: review.time
      }));

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    console.log('Using fallback reviews due to error');
    return NextResponse.json(getFallbackReviews());
  }
}

function getFallbackReviews() {
  // Import real reviews data
  const realReviews = [
    {
      authorName: "Katarína Benkovská",
      rating: 5,
      text: "Tatterka mi bola odporučená a ja ju môžem vrelo odporučiť ďalej. Hľadala som niekoho, kto sa ,,nebojí,, tetovať aj tenký text a dopadlo to na výbornú. Skvelá práca, príjemné prostredie :) Zážitok z tetovania! Určite sme sa nevideli posledný krát. ĎAKUJEM",
      timestamp: 1711929600000
    },
    {
      authorName: "Martin Weiss",
      rating: 5,
      text: "Bol som u Karin ART na tetovaní a skvelá skúsenosť. Profesionálny prístup, príjemná atmosféra a precízna práca. Výsledok je nad moje očakávania. Určite odporúčam! 5/5 ⭐",
      timestamp: 1714348800000
    },
    {
      authorName: "Zuzana Vidrova",
      rating: 5,
      text: "Nemohla som si vybrať lepšiu taterku na moje prvé tetovanie 😍. Precízna práca a dôraz na detail + vynikajúce prostredie. Všetko mi pekne vysvetlila a poradila ohľadom tetovaní. Keď si budem chcieť dať spraviť ďalšie tetovanie tak len tu.",
      timestamp: 1709251200000
    },
    {
      authorName: "Beti S.",
      rating: 5,
      text: "Som nadmieru spokojná! Od prvého momentu som sa cítila veľmi príjemne – krásne prostredie, Karin je milá a má profesionálny prístup.",
      timestamp: 1709251200000
    },
    {
      authorName: "sofia",
      rating: 5,
      text: "Som veľmi spokojná aj s tetovaním aj s Karin, je velmi milá, profesionálna a ma vytvorené veľmi príjemne štúdio. Odporúčam A dúfam že sa vrátim k nej čím skôr",
      timestamp: 1711929600000
    },
    {
      authorName: "Simona Haritunová",
      rating: 5,
      text: "profesionálny prístup a skvelá komunikácia zo strany Karin, všetko krásne vysvetlila a tetovanie prebehlo bez problémov 🥰 vrelo odporúčam!!",
      timestamp: 1714348800000
    },
    {
      authorName: "klaudia Bakalová",
      rating: 5,
      text: "Môžem vyjadriť len tu najväčšiu spokojnosť s prácou, ktorú karin odvádza na svojich zákazníkoch. Je naozaj veľmi profesionálna, šikovná, nie len že poradí ale",
      timestamp: 1693526400000
    },
    {
      authorName: "Áron Szijarto",
      rating: 5,
      text: "Naozaj skvelý zážitok! Tatérka je veľmi šikovná a od začiatku som mal pocit, že som v dobrých rukách. Jej štúdio je útulné a hneď som sa tam cítil pohodlne.",
      timestamp: 1693526400000
    },
    {
      authorName: "Michaela Uhrová",
      rating: 5,
      text: "Veľmi veľmi šikovná a talentovaná baba! Profesionálny a aj ľudský prístup. Poradí, odporučí, naozaj s ničím nebol najmenší problém. A napriek tomu, že moje",
      timestamp: 1693526400000
    },
    {
      authorName: "Riccardo Malavasi",
      rating: 5,
      text: "Veľmi šikovná a talentovaná baba, išiel som prvý krát na tetovanie a urobila to perfektné. Citlivo, vždy sa opýtala že či je všetko v poriadku. Ak budem chcieť ísť na ďalšie tetovanie tak fakt jedine k nej. Ešte raz ďakujem 😊.",
      timestamp: 1693526400000
    },
    {
      authorName: "Michal Hodul",
      rating: 5,
      text: "Skvelá tatérka, šikovná, precízna. Nemám prvé tetovanie, ale u karin zatiaľ najlepsie a hlavne nevypýta od vás obličku. Už plánujeme ďalšie tetovania. Aj by som pridal fotku, ale jedna sa o chúlostivé miesto 😄",
      timestamp: 1693526400000
    },
    {
      authorName: "Veronika Gunišová",
      rating: 5,
      text: "odporucam 11/10, profesionalny pristup, prijemne studio, comfortna atmosfera, nemohla som si lepsie vybrat 💜",
      timestamp: 1711929600000
    },
    {
      authorName: "Martin Haizer",
      rating: 5,
      text: "Šikovná a milá taterka s dôrazom na detail. Veľmi pekný a útulný salón kde som sa cítil veľmi príjemne.😊 Bol som už 3x a nie naposledy😊 Vrelo odporúčam👍👍👍",
      timestamp: 1693526400000
    },
    {
      authorName: "Lenka Wursterová",
      rating: 5,
      text: "Mladá talentovaná umelkyňa 🙏♥️🥰 ktorá nielen neskutočne kreslí, ale umenie krásnym spôsobom prenáša aj na telo 🙏🙏🙏 ďakujem Karin 🙏🙏🙏 a teším sa k Tebe na obočko a kolagénové nite 😉🥰♥️",
      timestamp: 1693526400000
    },
    {
      authorName: "Karin Alexyová",
      rating: 5,
      text: "Milý a profesionálny prístup určite odporúčam:))",
      timestamp: 1714348800000
    },
    {
      authorName: "Simona Garčeková",
      rating: 5,
      text: "Veľmi milá šikovná tatérka.:) Bola som tu na svojom prvom tetovaní a už nechcem nikam inam! Precízna krásna práca.🩷",
      timestamp: 1693526400000
    },
    {
      authorName: "zuzana kapralikova",
      rating: 5,
      text: "Som veľmi spokojna. Mila,sikovna,precizna a rychla taterka. Nadmieru splnila moje ocakavania. Ďakujem",
      timestamp: 1701388800000
    },
    {
      authorName: "Viktória Jakušová",
      rating: 5,
      text: "Odporúčam!! Krásne tetovania, profesionálny prístup, super návrhy.",
      timestamp: 1693526400000
    },
    {
      authorName: "miriam macáková",
      rating: 5,
      text: "Je veľmi šikovná. Z pokazeného tetovania dokázala vytvoriť umelecké dielo 😇",
      timestamp: 1693526400000
    },
    {
      authorName: "Tinky Winky",
      rating: 5,
      text: "Šikovná baba, odporúčam♡.",
      timestamp: 1693526400000
    },
    {
      authorName: "Vanessa Domianova",
      rating: 5,
      text: "Úžasné zaobchádzanie,príjemná atmosféra v štúdiu",
      timestamp: 1693526400000
    },
    {
      authorName: "Benjamin Blaho",
      rating: 5,
      text: "Great artist 🥰 very satisfied got two tattoos with no problems",
      timestamp: 1693526400000
    },
    {
      authorName: "kocurko 123",
      rating: 5,
      text: "Dobrá cena a hlavne kvalitne",
      timestamp: 1701388800000
    }
  ];

  // Filter out reviews with empty text and get 5 random ones
  const reviewsWithText = realReviews.filter(review => review.text && review.text.trim() !== '');
  const shuffled = reviewsWithText.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
} 