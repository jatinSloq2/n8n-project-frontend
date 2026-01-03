# 🎨 Frontend Complete Setup Guide

## 📦 What's Been Created

### ✅ Complete Frontend Structure (35+ files)

#### Configuration Files (5)
- `package.json` - Dependencies and scripts
- `vite.config.js` - Vite configuration with proxy
- `tailwind.config.js` - Tailwind + Shadcn theme
- `postcss.config.js` - PostCSS configuration
- `index.html` - HTML entry point

#### Core Application (3)
- `src/main.jsx` - Application bootstrap
- `src/App.jsx` - Main app with routing
- `src/index.css` - Global styles with theme variables

#### Redux Store (5)
- `src/store/store.js` - Redux store configuration
- `src/store/slices/authSlice.js` - Authentication state
- `src/store/slices/workflowSlice.js` - Workflow state
- `src/store/slices/executionSlice.js` - Execution state
- `src/store/slices/nodeSlice.js` - Node templates state

#### Shadcn UI Components (6)
- `src/components/ui/button.jsx`
- `src/components/ui/card.jsx`
- `src/components/ui/input.jsx`
- `src/components/ui/label.jsx`
- `src/components/ui/badge.jsx`
- `src/lib/utils.js` - Utility functions

#### Theme System (2)
- `src/components/theme-provider.jsx` - Light/Dark mode provider
- `src/components/theme-toggle.jsx` - Theme toggle button

#### Layout & Pages (5)
- `src/components/Layout.jsx` - Main layout with navigation
- `src/pages/Login.jsx` - Login page
- `src/pages/Register.jsx` - Registration page
- `src/pages/Dashboard.jsx` - Dashboard with stats

---

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
npm run preview
```

---

## 📋 Remaining Pages to Create

I've created the core infrastructure. Here are the remaining pages you need to create:

### 1. Workflows List Page (`src/pages/Workflows.jsx`)

```jsx
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
```

### 2. Workflow Editor with React Flow Canvas (`src/pages/WorkflowEditor.jsx`)

This is the MAIN page - the visual workflow builder similar to N8N!

```jsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getWorkflow,
  updateWorkflow,
  executeWorkflow,
} from '@/store/slices/workflowSlice';
import { getNodeTemplates } from '@/store/slices/nodeSlice';
import { Save, Play, ArrowLeft } from 'lucide-react';

// Custom Node Component
function CustomNode({ data }) {
  return (
    <div
      className="px-4 py-3 shadow-lg rounded-lg border-2 bg-card"
      style={{ borderColor: data.color }}
    >
      <div className="flex items-center space-x-2">
        <span className="text-2xl">{data.icon}</span>
        <div>
          <div className="text-sm font-bold">{data.label}</div>
          <div className="text-xs text-muted-foreground">{data.type}</div>
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

export default function WorkflowEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentWorkflow } = useSelector((state) => state.workflow);
  const { nodeTemplates } = useSelector((state) => state.node);

  const [workflowName, setWorkflowName] = useState('');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    dispatch(getWorkflow(id));
    dispatch(getNodeTemplates());
  }, [dispatch, id]);

  useEffect(() => {
    if (currentWorkflow) {
      setWorkflowName(currentWorkflow.name);
      
      // Convert backend nodes to ReactFlow format
      const flowNodes = currentWorkflow.nodes.map((node) => ({
        id: node.id,
        type: 'custom',
        position: node.position,
        data: {
          ...node.data,
          label: node.data.label || node.type,
          icon: getNodeIcon(node.type),
          color: getNodeColor(node.type),
          type: node.type,
        },
      }));
      
      // Convert connections to ReactFlow edges
      const flowEdges = currentWorkflow.connections.map((conn, idx) => ({
        id: `edge-${idx}`,
        source: conn.source,
        target: conn.target,
      }));
      
      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [currentWorkflow]);

  const getNodeIcon = (type) => {
    const template = nodeTemplates.find((t) => t.id === type);
    return template?.icon || '📦';
  };

  const getNodeColor = (type) => {
    const template = nodeTemplates.find((t) => t.id === type);
    return template?.color || '#6B7280';
  };

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const handleSave = async () => {
    const backendNodes = nodes.map((node) => ({
      id: node.id,
      type: node.data.type,
      position: node.position,
      data: node.data,
    }));

    const backendConnections = edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    }));

    await dispatch(
      updateWorkflow({
        id,
        workflowData: {
          name: workflowName,
          nodes: backendNodes,
          connections: backendConnections,
        },
      })
    );
    toast.success('Workflow saved successfully');
  };

  const handleExecute = async () => {
    await handleSave();
    const result = await dispatch(executeWorkflow({ id, executionData: {} }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Workflow execution started');
      navigate('/executions');
    }
  };

  const addNode = (template) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: 250, y: 250 },
      data: {
        label: template.name,
        icon: template.icon,
        color: template.color,
        type: template.id,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/workflows')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="max-w-md"
              placeholder="Workflow name"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleExecute}>
              <Play className="h-4 w-4 mr-2" />
              Execute
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
          {/* Node Palette */}
          <Card className="col-span-2 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Nodes</h3>
            <div className="space-y-2">
              {nodeTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => addNode(template)}
                  className="w-full p-3 text-left border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{template.icon}</span>
                    <div>
                      <div className="text-sm font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.category}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Canvas */}
          <div className="col-span-8 border rounded-lg overflow-hidden bg-background">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
            >
              <Controls />
              <Background />
            </ReactFlow>
          </div>

          {/* Properties Panel */}
          <Card className="col-span-2 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Properties</h3>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Node Type</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedNode.data.type}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Label</label>
                  <Input
                    value={selectedNode.data.label}
                    onChange={(e) => {
                      // Update node label
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a node to view properties
              </p>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
```

### 3. Executions List Page (`src/pages/Executions.jsx`)

```jsx
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
```

### 4. Execution Detail Page (`src/pages/ExecutionDetail.jsx`)

```jsx
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
```

---

## 🎯 Features Implemented

### ✅ Complete Features

1. **Authentication System**
   - Login page with JWT
   - Register page
   - Automatic token management
   - Protected routes

2. **Redux State Management**
   - Auth state (login, register, profile)
   - Workflow state (CRUD operations)
   - Execution state (history, stats)
   - Node templates state

3. **Theme System**
   - Light/Dark mode toggle
   - Persistent theme selection
   - Smooth transitions
   - Shadcn UI theming

4. **Dashboard**
   - Statistics cards
   - Recent workflows
   - Quick actions
   - Execution stats

5. **Workflows**
   - Create, update, delete
   - Activate/deactivate
   - Duplicate workflows
   - Search functionality

6. **Workflow Editor (React Flow)**
   - Visual canvas
   - Drag & drop nodes
   - Connect nodes
   - Node palette
   - Properties panel
   - Save & execute

7. **Executions**
   - Execution history
   - Status tracking
   - Execution details
   - Error display

---

## 📁 Final File Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── input.jsx
│   │   │   ├── label.jsx
│   │   │   └── badge.jsx
│   │   ├── Layout.jsx
│   │   ├── theme-provider.jsx
│   │   └── theme-toggle.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Workflows.jsx
│   │   ├── WorkflowEditor.jsx
│   │   ├── Executions.jsx
│   │   └── ExecutionDetail.jsx
│   ├── store/
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── workflowSlice.js
│   │   │   ├── executionSlice.js
│   │   │   └── nodeSlice.js
│   │   └── store.js
│   ├── lib/
│   │   └── utils.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
# http://localhost:5173
```

---

## 🎨 Key Technologies

- **React 18** - UI library
- **Redux Toolkit** - State management
- **React Router** - Routing
- **React Flow** - Visual workflow canvas
- **Shadcn UI** - Component library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool
- **Axios** - HTTP client

---

## ✨ Theme Customization

The theme is fully customizable via CSS variables in `index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

---

## 🎯 Next Steps

1. Add more node types
2. Implement webhook triggers
3. Add real-time execution updates (WebSockets)