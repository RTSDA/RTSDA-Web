import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🎯 Fetching years...');
    const response = await fetch('https://api.rockvilletollandsda.church/api/v1/sermons/years', {
      headers: {
        'Authorization': `Bearer ThyWordisaLamp=4890`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('❌ Error response:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response text:', text);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Years data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching years:', error);
    return NextResponse.json({ error: 'Failed to fetch years', details: error.message }, { status: 500 });
  }
}
