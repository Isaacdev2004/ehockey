import { NextResponse } from 'next/server';
import { EAStatsProvider } from '@/lib/providers/stats-provider';

export async function GET() {
  try {
    const eaProvider = new EAStatsProvider();
    
    // Use the private method to fetch matches
    const matches = await (eaProvider as any).fetchAllMatches();

    return NextResponse.json({
      success: true,
      matches: matches,
      count: matches.length,
    });
  } catch (error) {
    console.error('Failed to fetch EA Sports matches:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch matches',
        matches: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
