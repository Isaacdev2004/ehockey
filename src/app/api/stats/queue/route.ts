import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { hasPermission } from '@/types/auth';
import { createQueueManager } from '@/lib/utils/automated-stats';

const queueGameSchema = z.object({
  gameIds: z.array(z.string().uuid('Invalid game ID')),
  provider: z.enum(['ea_sports', 'manual']).default('ea_sports'),
});

const processQueueSchema = z.object({
  batchSize: z.number().min(1).max(50).default(10),
});

// GET /api/stats/queue - Get queue status
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      // Check if user has permission to manage stats
      const userRole = user.role || 'PLAYER';
      if (!hasPermission(userRole, 'canEnterStats')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to view stats queue' },
          { status: 403 }
        );
      }

      const queueManager = createQueueManager();
      const status = await queueManager.getQueueStatus();

      return NextResponse.json({ data: status });
    } catch (error) {
      console.error('Error getting queue status:', error);
      return NextResponse.json(
        { error: 'Failed to get queue status' },
        { status: 500 }
      );
    }
  });
}

// POST /api/stats/queue - Add games to processing queue
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      // Check if user has permission to manage stats
      const userRole = user.role || 'PLAYER';
      if (!hasPermission(userRole, 'canEnterStats')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to queue stats processing' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validatedData = queueGameSchema.parse(body);

      const queueManager = createQueueManager();
      const queueIds = await queueManager.addToQueue(validatedData.gameIds, validatedData.provider);

      return NextResponse.json({ 
        data: { 
          message: `Added ${validatedData.gameIds.length} games to processing queue`,
          queueIds 
        } 
      }, { status: 201 });
    } catch (error) {
      console.error('Error adding games to queue:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to add games to queue' },
        { status: 500 }
      );
    }
  });
}

// PUT /api/stats/queue - Process queue
export async function PUT(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      // Check if user has permission to manage stats
      const userRole = user.role || 'PLAYER';
      if (!hasPermission(userRole, 'canEnterStats')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to process stats queue' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validatedData = processQueueSchema.parse(body);

      const queueManager = createQueueManager();
      await queueManager.processQueue();

      return NextResponse.json({ 
        data: { 
          message: 'Queue processing started',
          batchSize: validatedData.batchSize
        } 
      });
    } catch (error) {
      console.error('Error processing queue:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to process queue' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/stats/queue - Clear completed items
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      // Check if user has permission to manage stats
      const userRole = user.role || 'PLAYER';
      if (!hasPermission(userRole, 'canEnterStats')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to clear stats queue' },
          { status: 403 }
        );
      }

      const queueManager = createQueueManager();
      await queueManager.clearCompletedItems();

      return NextResponse.json({ 
        data: { 
          message: 'Completed items cleared from queue'
        } 
      });
    } catch (error) {
      console.error('Error clearing queue:', error);
      return NextResponse.json(
        { error: 'Failed to clear queue' },
        { status: 500 }
      );
    }
  });
}
