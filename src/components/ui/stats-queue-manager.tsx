"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, RefreshCw, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface QueueStatus {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

interface QueueItem {
  id: string;
  game_id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  processed_at?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
}

export function StatsQueueManager() {
  const { toast } = useToast();
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch queue status
  const fetchQueueStatus = async () => {
    try {
      const response = await fetch('/api/stats/queue');
      if (response.ok) {
        const data = await response.json();
        setQueueStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching queue status:', error);
    }
  };

  // Fetch queue items
  const fetchQueueItems = async () => {
    try {
      const response = await fetch('/api/stats/queue/items');
      if (response.ok) {
        const data = await response.json();
        setQueueItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching queue items:', error);
    }
  };

  // Process queue
  const processQueue = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/stats/queue', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batchSize: 10 }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Queue Processing Started",
          description: data.data.message,
          variant: "success",
        });
        
        // Refresh status after a short delay
        setTimeout(() => {
          fetchQueueStatus();
          fetchQueueItems();
        }, 2000);
      } else {
        throw new Error('Failed to start queue processing');
      }
    } catch (error) {
      console.error('Error processing queue:', error);
      toast({
        title: "Error",
        description: "Failed to start queue processing",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Clear completed items
  const clearCompleted = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stats/queue', {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Queue Cleared",
          description: data.data.message,
          variant: "success",
        });
        
        fetchQueueStatus();
        fetchQueueItems();
      } else {
        throw new Error('Failed to clear queue');
      }
    } catch (error) {
      console.error('Error clearing queue:', error);
      toast({
        title: "Error",
        description: "Failed to clear completed items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add games to queue (for testing)
  const addTestGames = async () => {
    setLoading(true);
    try {
      // Get some game IDs from the system
      const gamesResponse = await fetch('/api/games?limit=5');
      if (gamesResponse.ok) {
        const gamesData = await gamesResponse.json();
        const gameIds = gamesData.data?.map((game: any) => game.id) || [];

        if (gameIds.length > 0) {
          const response = await fetch('/api/stats/queue', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              gameIds,
              provider: 'ea_sports',
            }),
          });

          if (response.ok) {
            const data = await response.json();
            toast({
              title: "Games Added to Queue",
              description: data.data.message,
              variant: "success",
            });
            
            fetchQueueStatus();
            fetchQueueItems();
          } else {
            throw new Error('Failed to add games to queue');
          }
        }
      }
    } catch (error) {
      console.error('Error adding test games:', error);
      toast({
        title: "Error",
        description: "Failed to add games to queue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchQueueStatus();
    fetchQueueItems();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchQueueStatus();
        fetchQueueItems();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const totalItems = queueStatus.pending + queueStatus.processing + queueStatus.completed + queueStatus.failed;
  const progressPercentage = totalItems > 0 ? ((queueStatus.completed + queueStatus.failed) / totalItems) * 100 : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'PROCESSING':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      case 'PROCESSING':
        return <Badge variant="default">Processing</Badge>;
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Queue Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Stats Processing Queue</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-blue-50' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchQueueStatus();
                  fetchQueueItems();
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{queueStatus.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{queueStatus.processing}</div>
              <div className="text-sm text-muted-foreground">Processing</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{queueStatus.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{queueStatus.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={processQueue}
              disabled={processing || queueStatus.pending === 0}
              className="flex items-center gap-2"
            >
              {processing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Process Queue
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={addTestGames}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Add Test Games
            </Button>
            
            <Button
              variant="outline"
              onClick={clearCompleted}
              disabled={loading || queueStatus.completed === 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Completed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Queue Items List */}
      {queueItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Queue Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {queueItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <div className="font-medium">Game {item.game_id.slice(0, 8)}...</div>
                      <div className="text-sm text-muted-foreground">
                        Created: {new Date(item.created_at).toLocaleString()}
                        {item.processed_at && (
                          <span className="ml-2">
                            • Processed: {new Date(item.processed_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {item.error_message && (
                        <div className="text-sm text-red-600 mt-1">
                          Error: {item.error_message}
                        </div>
                      )}
                      {item.retry_count > 0 && (
                        <div className="text-sm text-orange-600">
                          Retries: {item.retry_count}/{item.max_retries}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Provider Status */}
      <Card>
        <CardHeader>
          <CardTitle>Stats Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">EA Sports NHL</div>
                <div className="text-sm text-muted-foreground">
                  Automated statistics from EA Sports NHL games
                </div>
              </div>
              <Badge variant="default" className="bg-green-500">
                Available
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Manual Entry</div>
                <div className="text-sm text-muted-foreground">
                  Manually enter game statistics
                </div>
              </div>
              <Badge variant="default" className="bg-green-500">
                Available
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
