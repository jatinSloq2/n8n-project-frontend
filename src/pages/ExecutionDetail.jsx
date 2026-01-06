import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getExecution } from '@/store/slices/executionSlice';
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function ExecutionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentExecution, isLoading } = useSelector((state) => state.execution);

  useEffect(() => {
    dispatch(getExecution(id));
  }, [dispatch, id]);

  const handleRefresh = () => {
    dispatch(getExecution(id));
  };

  const getStatusIcon = (status) => {
    const iconClass = "h-6 w-6";
    switch (status) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'error':
        return <XCircle className={`${iconClass} text-red-500`} />;
      case 'running':
        return <Loader2 className={`${iconClass} text-blue-500 animate-spin`} />;
      default:
        return <Clock className={`${iconClass} text-gray-500`} />;
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      success: { variant: 'default', className: 'bg-green-500 hover:bg-green-600' },
      error: { variant: 'destructive', className: '' },
      running: { variant: 'secondary', className: 'bg-blue-500 hover:bg-blue-600 text-white' },
      waiting: { variant: 'secondary', className: '' },
      canceled: { variant: 'outline', className: '' },
    };
    
    const config = configs[status] || configs.waiting;
    
    return (
      <Badge variant={config.variant} className={`capitalize text-sm ${config.className}`}>
        {status}
      </Badge>
    );
  };

  if (isLoading && !currentExecution) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground font-medium">Loading execution details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentExecution) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Execution not found</p>
          </div>
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
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/executions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Execution Details</h1>
            <p className="text-muted-foreground mt-1">
              {currentExecution.workflowId?.name || 'Unknown workflow'}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <div className="text-sm font-medium">
                {format(new Date(currentExecution.startedAt), 'PPpp')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {duration !== null ? `${duration}s` : (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Running...
                  </span>
                )}
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

        {/* Error Details */}
        {currentExecution.error && (
          <Card className="border-destructive bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Error Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Message:</p>
                  <p className="text-sm text-muted-foreground bg-background p-3 rounded-lg">
                    {currentExecution.error.message}
                  </p>
                </div>
                {currentExecution.error.node && (
                  <div>
                    <p className="text-sm font-medium mb-2">Failed Node:</p>
                    <Badge variant="destructive">{currentExecution.error.node}</Badge>
                  </div>
                )}
                {currentExecution.error.stack && (
                  <div>
                    <p className="text-sm font-medium mb-2">Stack Trace:</p>
                    <pre className="text-xs bg-background p-4 rounded-lg overflow-x-auto max-h-60 scrollbar-hide">
                      {currentExecution.error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Node Execution Results */}
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
                    <div key={nodeId} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{nodeId}</h4>
                        {nodeData.error ? (
                          <Badge variant="destructive">Error</Badge>
                        ) : (
                          <Badge className="bg-green-500 hover:bg-green-600">Success</Badge>
                        )}
                      </div>
                      <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto max-h-60 scrollbar-hide">
                        {JSON.stringify(nodeData, null, 2)}
                      </pre>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No execution data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Raw Execution Data */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Execution Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto max-h-96 scrollbar-hide">
              {JSON.stringify(currentExecution, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}