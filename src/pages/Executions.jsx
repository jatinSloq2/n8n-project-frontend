import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getExecutions } from '@/store/slices/executionSlice';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Executions() {
  const dispatch = useDispatch();
  const { executions, isLoading } = useSelector((state) => state.execution);

  useEffect(() => {
    dispatch(getExecutions());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      running: 'secondary',
      waiting: 'secondary',
      canceled: 'outline',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

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
            <div className="space-y-4">
              {executions.map((execution) => (
                <div
                  key={execution._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(execution.status)}
                    <div>
                      <p className="font-medium">{execution.workflowId?.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true })}
                      </p>
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
                  </div>
                </div>
              ))}
              {executions.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No executions yet</h3>
                  <p className="text-muted-foreground">
                    Execute a workflow to see results here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}