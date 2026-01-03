import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getExecution } from '@/store/slices/executionSlice';
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ExecutionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentExecution, isLoading } = useSelector((state) => state.execution);

  useEffect(() => {
    dispatch(getExecution(id));
    
    const interval = setInterval(() => {
      dispatch(getExecution(id));
    }, 3000);
    
    return () => clearInterval(interval);
  }, [dispatch, id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'running':
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      running: 'secondary',
      waiting: 'secondary',
      canceled: 'outline',
    };
    return (
      <Badge variant={variants[status]} className="capitalize text-sm">
        {status}
      </Badge>
    );
  };

  if (isLoading || !currentExecution) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const duration = currentExecution.finishedAt
    ? Math.round(
        (new Date(currentExecution.finishedAt) - new Date(currentExecution.startedAt)) / 1000
      )
    : null;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/executions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Execution Details</h1>
            <p className="text-muted-foreground">
              {currentExecution.workflowId?.name || 'Unknown workflow'}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              {getStatusIcon(currentExecution.status)}
            </CardHeader>
            <CardContent>
              {getStatusBadge(currentExecution.status)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Started At</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {format(new Date(currentExecution.startedAt), 'PPpp')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {duration !== null ? `${duration}s` : 'Running...'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="capitalize">
                {currentExecution.mode}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {currentExecution.error && (
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Error Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium mb-1">Message:</p>
                  <p className="text-sm text-muted-foreground">
                    {currentExecution.error.message}
                  </p>
                </div>
                {currentExecution.error.node && (
                  <div>
                    <p className="text-sm font-medium mb-1">Failed Node:</p>
                    <Badge variant="destructive">{currentExecution.error.node}</Badge>
                  </div>
                )}
                {currentExecution.error.stack && (
                  <div>
                    <p className="text-sm font-medium mb-1">Stack Trace:</p>
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                      {currentExecution.error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Node Execution Results</CardTitle>
          </CardHeader>
          <CardContent>
            {currentExecution.data?.resultData?.runData &&
            Object.keys(currentExecution.data.resultData.runData).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(currentExecution.data.resultData.runData).map(
                  ([nodeId, nodeData]) => (
                    <div key={nodeId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{nodeId}</h4>
                        {nodeData.error ? (
                          <Badge variant="destructive">Error</Badge>
                        ) : (
                          <Badge variant="default">Success</Badge>
                        )}
                      </div>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-60">
                        {JSON.stringify(nodeData, null, 2)}
                      </pre>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No execution data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Raw Execution Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto max-h-96">
              {JSON.stringify(currentExecution, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}