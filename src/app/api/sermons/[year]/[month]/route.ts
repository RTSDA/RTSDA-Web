import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { year: string; month: string } }
) {
  try {
    const response = await fetch(
      `https://api.rockvilletollandsda.church/api/v1/sermons/${params.year}/${params.month}`,
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
    console.error('Error fetching sermons:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch sermons', details: errorMessage }, { status: 500 });
  }
}
