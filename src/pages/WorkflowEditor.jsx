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
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  getWorkflow,
  updateWorkflow,
  executeWorkflow,
} from '@/store/slices/workflowSlice';
import { getNodeTemplates } from '@/store/slices/nodeSlice';
import { Save, Play, ArrowLeft, Trash2 } from 'lucide-react';

function CustomNode({ data, selected }) {
  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-card min-w-[180px] ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
      style={{ borderColor: data.color || '#6B7280' }}
    >
      <div className="flex items-center space-x-2">
        <span className="text-2xl">{data.icon || '📦'}</span>
        <div className="flex-1">
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
  const { currentWorkflow, isLoading } = useSelector((state) => state.workflow);
  const { nodeTemplates } = useSelector((state) => state.node);

  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    dispatch(getWorkflow(id));
    dispatch(getNodeTemplates());
  }, [dispatch, id]);

  useEffect(() => {
    if (currentWorkflow) {
      setWorkflowName(currentWorkflow.name);
      setWorkflowDescription(currentWorkflow.description || '');

      const flowNodes = (currentWorkflow.nodes || []).map((node) => ({
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

      const flowEdges = (currentWorkflow.connections || []).map((conn, idx) => ({
        id: conn.id || `edge-${idx}`,
        source: conn.source,
        target: conn.target,
        sourceHandle: conn.sourceHandle,
        targetHandle: conn.targetHandle,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [currentWorkflow]);

  const getNodeIcon = (type) => {
    const template = nodeTemplates.find((t) => t.id === type || t.type === type);
    return template?.icon || '📦';
  };

  const getNodeColor = (type) => {
    const template = nodeTemplates.find((t) => t.id === type || t.type === type);
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

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const backendNodes = nodes.map((node) => ({
        id: node.id,
        type: node.data.type,
        position: node.position,
        data: node.data,
      }));

      const backendConnections = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      }));

      await dispatch(
        updateWorkflow({
          id,
          workflowData: {
            name: workflowName,
            description: workflowDescription,
            nodes: backendNodes,
            connections: backendConnections,
          },
        })
      ).unwrap();
      
      toast.success('Workflow saved successfully');
    } catch (error) {
      toast.error('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await handleSave();
      await dispatch(executeWorkflow({ id, executionData: {} })).unwrap();
      toast.success('Workflow execution started');
      navigate('/executions');
    } catch (error) {
      toast.error('Failed to execute workflow');
    } finally {
      setIsExecuting(false);
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
        type: template.id || template.type,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    toast.success(`Added ${template.name} node`);
  };

  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      );
      setSelectedNode(null);
      toast.success('Node deleted');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate('/workflows')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 max-w-md">
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Workflow name"
                className="font-semibold"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {selectedNode && (
              <Button variant="outline" size="sm" onClick={deleteSelectedNode}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Node
              </Button>
            )}
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handleExecute} disabled={isExecuting}>
              <Play className="h-4 w-4 mr-2" />
              {isExecuting ? 'Executing...' : 'Execute'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4" style={{ height: 'calc(100vh - 220px)' }}>
          <Card className="col-span-2 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4 text-sm">Node Palette</h3>
            <div className="space-y-2">
              {nodeTemplates.map((template) => (
                <button
                  key={template.id || template.type}
                  onClick={() => addNode(template)}
                  className="w-full p-3 text-left border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{template.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {template.category}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <div className="col-span-8 border rounded-lg overflow-hidden bg-background">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-background"
            >
              <Controls />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          </div>

          <Card className="col-span-2 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4 text-sm">Properties</h3>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium">Node ID</label>
                  <p className="text-xs text-muted-foreground mt-1 break-all">
                    {selectedNode.id}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium">Node Type</label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedNode.data.type}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Label</label>
                  <Input
                    value={selectedNode.data.label}
                    onChange={(e) => {
                      setNodes((nds) =>
                        nds.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, data: { ...n.data, label: e.target.value } }
                            : n
                        )
                      );
                      setSelectedNode({
                        ...selectedNode,
                        data: { ...selectedNode.data, label: e.target.value },
                      });
                    }}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Position</label>
                  <p className="text-xs text-muted-foreground mt-1">
                    X: {Math.round(selectedNode.position.x)}, Y:{' '}
                    {Math.round(selectedNode.position.y)}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground mb-4">
                  Select a node to view properties
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Description</label>
                    <Textarea
                      value={workflowDescription}
                      onChange={(e) => setWorkflowDescription(e.target.value)}
                      placeholder="Workflow description..."
                      className="text-xs min-h-[80px]"
                    />
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium mb-2">Stats</p>
                    <p className="text-xs text-muted-foreground">
                      Nodes: {nodes.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Connections: {edges.length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}