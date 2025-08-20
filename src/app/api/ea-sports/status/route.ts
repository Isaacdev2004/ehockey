import { NextResponse } from 'next/server';
import { EAStatsProvider } from '@/lib/providers/stats-provider';

export async function GET() {
  try {
    const eaProvider = new EAStatsProvider();
    const isConnected = await eaProvider.validateConnection();

    return NextResponse.json({
      connected: isConnected,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('EA Sports status check failed:', error);
    return NextResponse.json(
      { 
        connected: false, 
        error: 'Failed to check connection',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
