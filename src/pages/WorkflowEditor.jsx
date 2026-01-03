import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getNodeTemplates } from '@/store/slices/nodeSlice';
import {
  executeWorkflow,
  getWorkflow,
  updateWorkflow,
} from '@/store/slices/workflowSlice';
import { ArrowLeft, Play, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from 'sonner';

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