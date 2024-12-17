import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { year: string } }
) {
  try {
    const response = await fetch(
      `https://api.rockvilletollandsda.church/api/v1/sermons/${params.year}/months`,
      {
        headers: {
          'Authorization': `Bearer ThyWordisaLamp=4890`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching months:', error);
    return NextResponse.json({ error: 'Failed to fetch months' }, { status: 500 });
  }
}
