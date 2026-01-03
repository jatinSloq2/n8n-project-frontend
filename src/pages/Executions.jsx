import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getExecutions, deleteExecution } from '@/store/slices/executionSlice';
import { CheckCircle, XCircle, Clock, Eye, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

export default function Executions() {
  const dispatch = useDispatch();
  const { executions, isLoading } = useSelector((state) => state.execution);

  useEffect(() => {
    dispatch(getExecutions());
    
    const interval = setInterval(() => {
      dispatch(getExecutions());
    }, 5000);
    
    return () => clearInterval(interval);
  }, [dispatch]);

  const getStatusBadge = (status) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      running: 'secondary',
      waiting: 'secondary',
      canceled: 'outline',
    };
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this execution?')) {
      await dispatch(deleteExecution(id));
      toast.success('Execution deleted');
    }
  };

  const getDuration = (execution) => {
    if (!execution.finishedAt) return 'Running...';
    const duration = new Date(execution.finishedAt) - new Date(execution.startedAt);
    return `${Math.round(duration / 1000)}s`;
  };

  if (isLoading && executions.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading executions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Executions</h1>
          <p className="text-muted-foreground">View and monitor workflow executions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Execution History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {executions.map((execution) => (
                <div
                  key={execution._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getStatusIcon(execution.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {execution.workflowId?.name || 'Unknown Workflow'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(execution.startedAt), {
                            addSuffix: true,
                          })}
                        </p>
                        <span className="text-muted-foreground">•</span>
                        <p className="text-sm text-muted-foreground">
                          Duration: {getDuration(execution)}
                        </p>
                        <span className="text-muted-foreground">•</span>
                        <p className="text-sm text-muted-foreground capitalize">
                          Mode: {execution.mode}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(execution.status)}
                    <Link to={`/executions/${execution._id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-2" />
                        Details
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => handleDelete(execution._id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {executions.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No executions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Execute a workflow to see results here
                  </p>
                  <Link to="/workflows">
                    <Button>Go to Workflows</Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}