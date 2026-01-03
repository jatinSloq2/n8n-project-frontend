import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  getWorkflows,
  createWorkflow,
  deleteWorkflow,
  activateWorkflow,
  deactivateWorkflow,
  duplicateWorkflow,
} from '@/store/slices/workflowSlice';
import {
  Plus,
  Play,
  Pause,
  Copy,
  Trash2,
  Search,
  GitBranch,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Workflows() {
  const [search, setSearch] = useState('');
  const dispatch = useDispatch();
  const { workflows, isLoading } = useSelector((state) => state.workflow);

  useEffect(() => {
    dispatch(getWorkflows());
  }, [dispatch]);

  const handleCreateWorkflow = async () => {
    const result = await dispatch(
      createWorkflow({
        name: 'New Workflow',
        description: '',
        nodes: [],
        connections: [],
      })
    );
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Workflow created successfully');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      await dispatch(deleteWorkflow(id));
      toast.success('Workflow deleted');
    }
  };

  const handleToggleActive = async (workflow) => {
    if (workflow.isActive) {
      await dispatch(deactivateWorkflow(workflow._id));
      toast.success('Workflow deactivated');
    } else {
      await dispatch(activateWorkflow(workflow._id));
      toast.success('Workflow activated');
    }
  };

  const handleDuplicate = async (id) => {
    await dispatch(duplicateWorkflow(id));
    toast.success('Workflow duplicated');
  };

  const filteredWorkflows = workflows.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workflows</h1>
            <p className="text-muted-foreground">
              Create and manage your automation workflows
            </p>
          </div>
          <Button onClick={handleCreateWorkflow}>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {workflow.nodes?.length || 0} nodes
                    </p>
                  </div>
                  <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {workflow.description || 'No description'}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Updated {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
                </p>
                <div className="flex items-center space-x-2">
                  <Link to={`/workflows/${workflow._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <GitBranch className="h-3 w-3 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleToggleActive(workflow)}
                  >
                    {workflow.isActive ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDuplicate(workflow._id)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(workflow._id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredWorkflows.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workflows found</h3>
            <p className="text-muted-foreground mb-4">
              {search ? 'Try a different search term' : 'Get started by creating your first workflow'}
            </p>
            {!search && (
              <Button onClick={handleCreateWorkflow}>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}