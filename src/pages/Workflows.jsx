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
  Edit,
  MoreVertical,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
        description: 'A new workflow',
        nodes: [],
        connections: [],
      })
    );
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Workflow created successfully');
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this workflow?')) {
      await dispatch(deleteWorkflow(id));
      toast.success('Workflow deleted');
    }
  };

  const handleToggleActive = async (workflow, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (workflow.isActive) {
      await dispatch(deactivateWorkflow(workflow._id));
      toast.success('Workflow deactivated');
    } else {
      await dispatch(activateWorkflow(workflow._id));
      toast.success('Workflow activated');
    }
  };

  const handleDuplicate = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    await dispatch(duplicateWorkflow(id));
    toast.success('Workflow duplicated');
  };

  const filteredWorkflows = workflows.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground font-medium">Loading workflows...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Workflows</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your automation workflows
            </p>
          </div>
          <Button onClick={handleCreateWorkflow} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            New Workflow
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Workflows Grid */}
        {filteredWorkflows.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWorkflows.map((workflow) => (
              <Card
                key={workflow._id}
                className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{workflow.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={workflow.isActive ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {workflow.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {workflow.nodes?.length || 0} nodes
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => handleToggleActive(workflow, e)}
                        >
                          {workflow.isActive ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDuplicate(workflow._id, e)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => handleDelete(workflow._id, e)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {workflow.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Updated{' '}
                      {formatDistanceToNow(new Date(workflow.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                    <Link to={`/workflows/${workflow._id}`}>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <GitBranch className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No workflows found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {search
                ? 'Try a different search term'
                : 'Get started by creating your first workflow to automate your tasks'}
            </p>
            {!search && (
              <Button onClick={handleCreateWorkflow} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Workflow
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}