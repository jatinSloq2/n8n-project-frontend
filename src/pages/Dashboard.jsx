import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getWorkflows } from '@/store/slices/workflowSlice';
import { getExecutionStats } from '@/store/slices/executionSlice';
import { GitBranch, Activity, CheckCircle, XCircle, Clock, Plus, TrendingUp, Zap, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { workflows } = useSelector((state) => state.workflow);
  const { stats } = useSelector((state) => state.execution);

  useEffect(() => {
    dispatch(getWorkflows());
    dispatch(getExecutionStats());
  }, [dispatch]);

  const activeWorkflows = workflows.filter((w) => w.isActive).length;
  const totalWorkflows = workflows.length;
  const successRate = stats?.success && (stats.success + stats.error) > 0
    ? Math.round((stats.success / (stats.success + stats.error)) * 100)
    : 0;

  const statsCards = [
    {
      title: 'Total Workflows',
      value: totalWorkflows,
      description: `${activeWorkflows} active`,
      icon: GitBranch,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Successful',
      value: stats?.success || 0,
      description: 'Completed executions',
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Failed',
      value: stats?.error || 0,
      description: 'Failed executions',
      icon: XCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Running',
      value: stats?.running || 0,
      description: 'In progress',
      icon: Clock,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back! Here's an overview of your automation workflows
            </p>
          </div>
          <Link to="/workflows">
            <Button size="lg" className="w-full md:w-auto">
              <Plus className="h-5 w-5 mr-2" />
              New Workflow
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Success Rate Card */}
        {(stats?.success + stats?.error > 0) && (
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Success Rate</CardTitle>
                  <CardDescription>Overall workflow execution performance</CardDescription>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-5xl font-bold">{successRate}%</div>
                <div className="text-muted-foreground">
                  of {stats.success + stats.error} total executions
                </div>
              </div>
              <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Workflows */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Workflows</CardTitle>
                  <CardDescription>Your most recently created workflows</CardDescription>
                </div>
                <Link to="/workflows">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflows.slice(0, 5).map((workflow) => (
                  <Link
                    key={workflow._id}
                    to={`/workflows/${workflow._id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent hover:border-primary/50 transition-all cursor-pointer group">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <GitBranch className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{workflow.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {workflow.nodes?.length || 0} nodes
                          </p>
                        </div>
                      </div>
                      <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </Link>
                ))}
                {workflows.length === 0 && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <GitBranch className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">No workflows yet</p>
                    <Link to="/workflows">
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Create your first workflow
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/workflows">
                <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-accent hover:border-primary/50 transition-all group">
                  <div className="flex items-center w-full">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Plus className="h-4 w-4" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">Create New Workflow</div>
                      <div className="text-xs text-muted-foreground">Start automating tasks</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Button>
              </Link>
              <Link to="/workflows">
                <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-accent hover:border-primary/50 transition-all group">
                  <div className="flex items-center w-full">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 mr-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <GitBranch className="h-4 w-4" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">View All Workflows</div>
                      <div className="text-xs text-muted-foreground">Manage your automations</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Button>
              </Link>
              <Link to="/executions">
                <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-accent hover:border-primary/50 transition-all group">
                  <div className="flex items-center w-full">
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-500 mr-3 group-hover:bg-green-500 group-hover:text-white transition-colors">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">Execution History</div>
                      <div className="text-xs text-muted-foreground">Monitor workflow runs</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}