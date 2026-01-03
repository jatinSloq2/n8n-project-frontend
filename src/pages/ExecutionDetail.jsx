import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getExecution } from '@/store/slices/executionSlice';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ExecutionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentExecution } = useSelector((state) => state.execution);

  useEffect(() => {
    dispatch(getExecution(id));
  }, [dispatch, id]);

  if (!currentExecution) {
    return <Layout><div>Loading...</div></Layout>;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-blue-500" />;
    }
  };

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

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              {getStatusIcon(currentExecution.status)}
            </CardHeader>
            <CardContent>
              <Badge variant={currentExecution.status === 'success' ? 'default' : 'destructive'}>
                {currentExecution.status}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Started At</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {format(new Date(currentExecution.startedAt), 'PPpp')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {currentExecution.finishedAt
                  ? `${Math.round(
                      (new Date(currentExecution.finishedAt) -
                        new Date(currentExecution.startedAt)) /
                        1000
                    )}s`
                  : 'Running...'}
              </p>
            </CardContent>
          </Card>
        </div>

        {currentExecution.error && (
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                {currentExecution.error.message}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Execution Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto max-h-96">
              {JSON.stringify(currentExecution.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}