import { NextResponse } from 'next/server';
import { EAStatsProvider } from '@/lib/providers/stats-provider';

export async function POST(request: Request) {
  try {
    const { matchId } = await request.json();

    if (!matchId) {
      return NextResponse.json(
        { success: false, error: 'Match ID is required' },
        { status: 400 }
      );
    }

    const eaProvider = new EAStatsProvider();
    const gameStats = await eaProvider.importGameFromEA(matchId);

    return NextResponse.json({
      success: true,
      matchId: matchId,
      statsCount: gameStats.length,
      stats: gameStats,
    });
  } catch (error) {
    console.error('Failed to import EA Sports game:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to import game',
      },
      { status: 500 }
    );
  }
}
