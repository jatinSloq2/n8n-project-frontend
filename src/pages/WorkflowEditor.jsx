import Layout from '@/components/Layout';
import { NodeConfigDialog } from '@/components/NodeConfigDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getNodeTemplates } from '@/store/slices/nodeSlice';
import {
  executeWorkflow,
  getWorkflow,
  updateWorkflow,
} from '@/store/slices/workflowSlice';
import { ArrowLeft, Plus, Save, Settings, Trash2, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from 'sonner';

// Custom Node Component with proper handles
function CustomNode({ data, selected }) {
  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-card min-w-[200px] relative ${selected ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}
      style={{ borderColor: data.color || '#6B7280' }}
    >
      {/* Input Handle */}
      {data.inputs > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        />
      )}

      <div className="flex items-center space-x-3">
        <div className="text-3xl">{data.icon || '📦'}</div>
        <div className="flex-1">
          <div className="text-sm font-bold text-foreground">{data.label}</div>
          <div className="text-xs text-muted-foreground">{data.type}</div>
        </div>
      </div>

      {data.description && (
        <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {data.description}
        </div>
      )}

      {/* Configuration Badge */}
      {data.config && Object.keys(data.config).length > 0 && (
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs">
            <Settings className="h-3 w-3" />
          </Badge>
        </div>
      )}

      {/* Output Handle */}
      {data.outputs > 0 && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
        />
      )}
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

// Default edge style
const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#6B7280',
  },
  style: {
    strokeWidth: 2,
    stroke: '#6B7280',
  },
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
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  useEffect(() => {
    dispatch(getWorkflow(id));
    dispatch(getNodeTemplates());
  }, [dispatch, id]);

  useEffect(() => {
    if (currentWorkflow) {
      setWorkflowName(currentWorkflow.name);
      setWorkflowDescription(currentWorkflow.description || '');

      const flowNodes = (currentWorkflow.nodes || []).map((node) => {
        const template = getNodeTemplate(node.type);
        return {
          id: node.id,
          type: 'custom',
          position: node.position,
          data: {
            ...node.data,
            label: node.data.label || getNodeName(node.type),
            icon: getNodeIcon(node.type),
            color: getNodeColor(node.type),
            type: node.type,
            description: getNodeDescription(node.type),
            config: node.data.config || {},
            inputs: template?.inputs || 1,
            outputs: template?.outputs || 1,
          },
        };
      });

      const flowEdges = (currentWorkflow.connections || []).map((conn, idx) => ({
        id: conn.id || `edge-${idx}`,
        source: conn.source,
        target: conn.target,
        sourceHandle: conn.sourceHandle,
        targetHandle: conn.targetHandle,
        ...defaultEdgeOptions,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [currentWorkflow, nodeTemplates]);

  const getNodeTemplate = (type) => {
    return nodeTemplates.find((t) => t.id === type || t.type === type);
  };

  const getNodeIcon = (type) => {
    const template = getNodeTemplate(type);
    return template?.icon || '📦';
  };

  const getNodeColor = (type) => {
    const template = getNodeTemplate(type);
    return template?.color || '#6B7280';
  };

  const getNodeName = (type) => {
    const template = getNodeTemplate(type);
    return template?.name || type;
  };

  const getNodeDescription = (type) => {
    const template = getNodeTemplate(type);
    return template?.description || '';
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
    (params) => {
      const newEdge = {
        ...params,
        ...defaultEdgeOptions,
        id: `edge-${Date.now()}`,
      };
      setEdges((eds) => addEdge(newEdge, eds));
      toast.success('✅ Nodes connected');
    },
    []
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onNodeDoubleClick = useCallback((event, node) => {
    setSelectedNode(node);
    setShowConfigDialog(true);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const backendNodes = nodes.map((node) => ({
        id: node.id,
        type: node.data.type,
        position: node.position,
        data: {
          label: node.data.label,
          type: node.data.type,
          config: node.data.config || {},
          icon: node.data.icon,
          color: node.data.color,
          description: node.data.description,
        },
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

      toast.success('✅ Workflow saved successfully');
    } catch (error) {
      toast.error('❌ Failed to save workflow: ' + error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async () => {
    if (nodes.length === 0) {
      toast.error('❌ Add at least one node to execute');
      return;
    }

    setIsExecuting(true);
    try {
      await handleSave();
      await dispatch(executeWorkflow({ id, executionData: {} })).unwrap();
      toast.success('✅ Workflow execution started');
      setTimeout(() => navigate('/executions'), 1000);
    } catch (error) {
      toast.error('❌ Failed to execute workflow: ' + error);
    } finally {
      setIsExecuting(false);
    }
  };

  const addNode = (template) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100
      },
      data: {
        label: template.name,
        icon: template.icon,
        color: template.color,
        type: template.id || template.type,
        description: template.description,
        config: {},
        inputs: template.inputs || 1,
        outputs: template.outputs || 1,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    toast.success(`✅ Added ${template.name}`);
  };

  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      );
      setSelectedNode(null);
      toast.success('🗑️ Node deleted');
    }
  };

  const handleConfigSave = (config) => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNode.id
            ? { ...n, data: { ...n.data, config } }
            : n
        )
      );
      setSelectedNode({
        ...selectedNode,
        data: { ...selectedNode.data, config },
      });
      toast.success('✅ Configuration saved');
    }
  };

  const filteredTemplates = nodeTemplates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedNodes = filteredTemplates.reduce((acc, template) => {
    const category = template.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading workflow...</p>
          </div>
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
                className="font-semibold text-lg"
              />
            </div>
            <Badge variant={nodes.length > 0 ? 'default' : 'secondary'}>
              {nodes.length} nodes
            </Badge>
            <Badge variant={edges.length > 0 ? 'default' : 'secondary'}>
              {edges.length} connections
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {selectedNode && (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowConfigDialog(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
                <Button variant="destructive" size="sm" onClick={deleteSelectedNode}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handleExecute} disabled={isExecuting}>
              <Zap className="h-4 w-4 mr-2" />
              {isExecuting ? 'Executing...' : 'Execute'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4" style={{ height: 'calc(100vh - 220px)' }}>
          <Card className="col-span-3 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Nodes</h3>
                <Input
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-3"
                />
              </div>

              {Object.entries(groupedNodes).map(([category, templates]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <button
                        key={template.id || template.type}
                        onClick={() => addNode(template)}
                        className="w-full p-3 text-left border rounded-lg hover:bg-accent hover:border-primary transition-all group"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl group-hover:scale-110 transition-transform">
                            {template.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{template.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {template.description}
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="col-span-7 border-2 rounded-lg overflow-hidden bg-background">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onNodeDoubleClick={onNodeDoubleClick}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              fitView
              snapToGrid
              snapGrid={[15, 15]}
              className="bg-background"
            >
              <Controls />
              {/* <MiniMap /> */}
              <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            </ReactFlow>
          </div>

          <Card className="col-span-2 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Properties</h3>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Node Type</label>
                  <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                    <span className="text-xl">{selectedNode.data.icon}</span>
                    {selectedNode.data.type}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Label</label>
                  <Input
                    value={selectedNode.data.label || ''}
                    onChange={(e) => {
                      const newLabel = e.target.value;
                      setNodes((nds) =>
                        nds.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, data: { ...n.data, label: newLabel } }
                            : n
                        )
                      );
                      setSelectedNode({
                        ...selectedNode,
                        data: { ...selectedNode.data, label: newLabel },
                      });
                    }}
                    className="text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowConfigDialog(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Node
                </Button>
                {selectedNode.data.config && Object.keys(selectedNode.data.config).length > 0 && (
                  <div className="p-2 bg-muted rounded text-xs">
                    <p className="font-medium mb-1">Configuration:</p>
                    <pre className="overflow-x-auto">
                      {JSON.stringify(selectedNode.data.config, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Double-click a node to configure it
                </p>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    placeholder="Add workflow description..."
                    className="text-sm min-h-[100px]"
                  />
                </div>
                <div className="pt-3 border-t space-y-2">
                  <p className="text-sm font-medium">Workflow Stats</p>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      📦 Nodes: {nodes.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      🔗 Connections: {edges.length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {showConfigDialog && selectedNode && (
        <NodeConfigDialog
          node={selectedNode}
          nodeTemplate={getNodeTemplate(selectedNode.data.type)}
          onClose={() => setShowConfigDialog(false)}
          onSave={handleConfigSave}
          allNodes={nodes}  // ← ADD THIS
          connections={edges}  // ← ADD THIS
        />
      )}
    </Layout>
  );
}