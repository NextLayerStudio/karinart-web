import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testGoogleAPI() {
  try {
    const placeId = process.env.GOOGLE_PLACE_ID;
    const apiKey = process.env.GOOGLE_API_KEY;

    console.log('Environment variables:');
    console.log('GOOGLE_PLACE_ID:', placeId);
    console.log('GOOGLE_API_KEY:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');

    if (!placeId || !apiKey) {
      console.error('❌ Missing required environment variables');
      return;
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&language=sk&key=${apiKey}`;
    console.log('\nMaking request to:', url.replace(apiKey, 'API_KEY_HIDDEN'));

    const response = await fetch(url);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    console.log('\nAPI Response:');
    console.log('Status:', data.status);
    
    if (data.error_message) {
      console.error('❌ Google API Error:', data.error_message);
      return;
    }

    if (data.result?.reviews) {
      console.log('✅ Success! Found', data.result.reviews.length, 'reviews');
      console.log('Sample review:', data.result.reviews[0]);
    } else {
      console.log('⚠️ No reviews found in response');
      console.log('Available fields:', Object.keys(data.result || {}));
    }

  } catch (error) {
    console.error('❌ Error testing Google API:', error);
  }
}

testGoogleAPI(); 