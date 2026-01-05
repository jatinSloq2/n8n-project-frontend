import Layout from '@/components/Layout';
import { NodeConfigDialog } from '@/components/NodeConfigDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getNodeTemplates } from '@/store/slices/nodeSlice';
import {
  executeWorkflow,
  getWorkflow,
  updateWorkflow,
} from '@/store/slices/workflowSlice';
import {
  ArrowLeft,
  Plus,
  Save,
  Settings,
  Trash2,
  Zap,
  Copy,
  Unplug,
  Code2,
  Download,
  Upload,
  Play,
  Pause,
  MoreVertical,
  Check,
  FileJson,
  Search,
  X,
  ChevronDown,
  Maximize2,
  Minimize2,
  Grid3x3,
  Layers,
  GitBranch,
  Clock,
  Info,
  AlertCircle,
  CheckCircle2,
  Keyboard
} from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

// Custom Node Component
function CustomNode({ data, selected }) {
  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-card min-w-[200px] relative transition-all ${selected ? 'ring-2 ring-primary ring-offset-2 scale-105' : 'hover:shadow-xl'
        }`}
      style={{ borderColor: data.color || '#6B7280' }}
    >
      {data.inputs > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white hover:!scale-150 transition-transform"
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

      {data.config && Object.keys(data.config).length > 0 && (
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs">
            <Settings className="h-3 w-3" />
          </Badge>
        </div>
      )}

      {data.outputs > 0 && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-green-500 !border-2 !border-white hover:!scale-150 transition-transform"
        />
      )}
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

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
  const [jsonConfig, setJsonConfig] = useState('{}');
  const [jsonError, setJsonError] = useState(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [sidebarView, setSidebarView] = useState('nodes'); // 'nodes' or 'properties'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const fileInputRef = useRef(null);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl/Cmd + E - Execute
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExecute();
      }
      // Delete - Delete selected node
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode && !e.target.matches('input, textarea')) {
        e.preventDefault();
        deleteSelectedNode();
      }
      // Ctrl/Cmd + D - Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedNode) {
        e.preventDefault();
        duplicateSelectedNode();
      }
      // Escape - Deselect
      if (e.key === 'Escape') {
        setSelectedNode(null);
        setShowConfigDialog(false);
        setShowImportDialog(false);
        setShowShortcuts(false);
      }
      // ? - Show shortcuts
      if (e.key === '?' && !e.target.matches('input, textarea')) {
        setShowShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode]);

  useEffect(() => {
    if (selectedNode) {
      setJsonConfig(JSON.stringify(selectedNode.data.config || {}, null, 2));
      setJsonError(null);
    }
  }, [selectedNode]);

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
    setSidebarView('properties');
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
        y: Math.random() * 300 + 100,
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

  const duplicateSelectedNode = () => {
    if (selectedNode) {
      const newNode = {
        ...selectedNode,
        id: `node-${Date.now()}`,
        position: {
          x: selectedNode.position.x + 50,
          y: selectedNode.position.y + 50,
        },
        data: {
          ...selectedNode.data,
          label: `${selectedNode.data.label} (Copy)`,
        },
      };
      setNodes((nds) => [...nds, newNode]);
      setSelectedNode(newNode);
      toast.success('✅ Node duplicated');
    }
  };

  const disconnectSelectedNode = () => {
    if (selectedNode) {
      const disconnectedEdges = edges.filter(
        (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
      );
      const removedCount = edges.length - disconnectedEdges.length;
      setEdges(disconnectedEdges);
      toast.success(`🔌 Disconnected ${removedCount} connection(s)`);
    }
  };

  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
        )
      );
      setSelectedNode(null);
      toast.success('🗑️ Node deleted');
    }
  };

  const handleConfigSave = (config) => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNode.id ? { ...n, data: { ...n.data, config } } : n
        )
      );
      setSelectedNode({
        ...selectedNode,
        data: { ...selectedNode.data, config },
      });
      toast.success('✅ Configuration saved');
    }
  };

  const handleJsonConfigChange = (value) => {
    setJsonConfig(value);
    try {
      const parsed = JSON.parse(value);
      setJsonError(null);
      if (selectedNode) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === selectedNode.id
              ? { ...n, data: { ...n.data, config: parsed } }
              : n
          )
        );
        setSelectedNode({
          ...selectedNode,
          data: { ...selectedNode.data, config: parsed },
        });
      }
    } catch (err) {
      setJsonError(err.message);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonConfig);
      setJsonConfig(JSON.stringify(parsed, null, 2));
      setJsonError(null);
      toast.success('✅ JSON formatted');
    } catch (err) {
      toast.error('❌ Invalid JSON: ' + err.message);
    }
  };

  // Export workflow
  const handleExport = () => {
    const exportData = {
      name: workflowName,
      description: workflowDescription,
      nodes: nodes,
      edges: edges,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflowName.replace(/\s+/g, '_')}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('✅ Workflow exported successfully');
  };

  // Import workflow
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImportData(event.target.result);
        setShowImportDialog(true);
      };
      reader.readAsText(file);
    }
  };

  const confirmImport = () => {
    try {
      const imported = JSON.parse(importData);

      if (imported.nodes && imported.edges) {
        setNodes(imported.nodes);
        setEdges(imported.edges);
        if (imported.name) setWorkflowName(imported.name);
        if (imported.description) setWorkflowDescription(imported.description);
        toast.success('✅ Workflow imported successfully');
        setShowImportDialog(false);
        setImportData('');
      } else {
        toast.error('❌ Invalid workflow format');
      }
    } catch (error) {
      toast.error('❌ Failed to import: ' + error.message);
    }
  };

  // Copy functions
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`📋 ${label} copied to clipboard`);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const filteredTemplates = nodeTemplates.filter(
    (template) =>
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
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-lg font-medium text-muted-foreground">Loading workflow...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/workflows')}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 max-w-md min-w-0">
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Workflow name"
                className="font-semibold text-lg"
              />
            </div>
            <Badge variant="outline" className="gap-1 shrink-0">
              <Layers className="h-3 w-3" />
              {nodes.length}
            </Badge>
            <Badge variant="outline" className="gap-1 shrink-0">
              <GitBranch className="h-3 w-3" />
              {edges.length}
            </Badge>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedNode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfigDialog(true)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configure
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <MoreVertical className="h-4 w-4" />
                      Actions
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={duplicateSelectedNode}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate Node
                      <Badge variant="secondary" className="ml-auto text-xs">⌘D</Badge>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={disconnectSelectedNode}>
                      <Unplug className="h-4 w-4 mr-2" />
                      Disconnect
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(JSON.stringify(selectedNode.data.config, null, 2), 'Config')}>
                      <FileJson className="h-4 w-4 mr-2" />
                      Copy Config
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={deleteSelectedNode} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Node
                      <Badge variant="secondary" className="ml-auto text-xs">Del</Badge>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <FileJson className="h-4 w-4" />
                  Import/Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => copyToClipboard(JSON.stringify({ nodes, edges, name: workflowName, description: workflowDescription }, null, 2), 'Workflow')}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShortcuts(true)}
              className="gap-2"
            >
              <Keyboard className="h-4 w-4" />
              <span className="hidden sm:inline">Shortcuts</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
              <Badge variant="secondary" className="ml-1 text-xs hidden sm:inline-flex">⌘S</Badge>
            </Button>

            <Button onClick={handleExecute} disabled={isExecuting} className="gap-2">
              {isExecuting ? <Pause className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4" />}
              {isExecuting ? 'Running...' : 'Run'}
              <Badge variant="secondary" className="ml-1 text-xs bg-white/20 hidden sm:inline-flex">⌘E</Badge>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-4" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Sidebar */}
          <Card className={`${isFullscreen ? 'hidden' : 'col-span-12 md:col-span-3'} p-4 overflow-hidden flex flex-col`}>
            <Tabs value={sidebarView} onValueChange={setSidebarView} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="nodes" className="gap-2">
                  <Grid3x3 className="h-4 w-4" />
                  Nodes
                </TabsTrigger>
                <TabsTrigger value="properties" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Properties
                </TabsTrigger>
              </TabsList>

              <TabsContent value="nodes" className="flex-1 overflow-y-auto space-y-4 mt-0">
                <div className="sticky top-0 bg-card z-10 pb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search nodes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                        onClick={() => setSearchTerm('')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {Object.entries(groupedNodes).map(([category, templates]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 px-2">
                      <div className="h-px flex-1 bg-border"></div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {category}
                      </h4>
                      <div className="h-px flex-1 bg-border"></div>
                    </div>
                    <div className="space-y-2">
                      {templates.map((template) => (
                        <button
                          key={template.id || template.type}
                          onClick={() => addNode(template)}
                          className="w-full p-3 text-left border-2 rounded-lg hover:bg-accent hover:border-primary transition-all group relative"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl group-hover:scale-110 transition-transform">
                              {template.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">
                                {template.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {template.description}
                              </div>
                            </div>
                            <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {filteredTemplates.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No nodes found</p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setSearchTerm('')}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="properties" className="flex-1 overflow-y-auto space-y-4 mt-0">
                {selectedNode ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                      <span className="text-3xl">{selectedNode.data.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{selectedNode.data.label}</p>
                        <p className="text-xs text-muted-foreground">{selectedNode.data.type}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const nodeInfo = `${selectedNode.data.type} (${selectedNode.id})`;
                          copyToClipboard(nodeInfo, 'Node Info');
                        }}
                      >
                        {copiedText === 'Node Info' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">
                          Label
                        </label>
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

                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">
                          Node ID
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={selectedNode.id}
                            readOnly
                            className="text-sm font-mono"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(selectedNode.id, 'Node ID')}
                          >
                            {copiedText === 'Node ID' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">
                          Configuration
                        </label>
                        <Textarea
                          value={jsonConfig}
                          onChange={(e) => handleJsonConfigChange(e.target.value)}
                          className={`font-mono text-xs min-h-[200px] ${jsonError ? 'border-red-500' : ''
                            }`}
                          placeholder="{}"
                        />
                        {jsonError && (
                          <div className="text-xs text-red-500 mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded">
                            <p className="font-medium">Invalid JSON:</p>
                            <p className="mt-1">{jsonError}</p>
                          </div>
                        )}
                        {!jsonError && Object.keys(selectedNode.data.config || {}).length > 0 && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3" />
                            Valid configuration
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={formatJson}
                            className="flex-1"
                          >
                            <Code2 className="h-3 w-3 mr-2" />
                            Format
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(jsonConfig, 'Config')}
                            className="flex-1"
                          >
                            {copiedText === 'Config' ? <Check className="h-3 w-3 mr-2" /> : <Copy className="h-3 w-3 mr-2" />}
                            Copy
                          </Button>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">
                          Actions
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowConfigDialog(true)}
                          >
                            <Settings className="h-3 w-3 mr-2" />
                            Configure
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={duplicateSelectedNode}
                          >
                            <Copy className="h-3 w-3 mr-2" />
                            Duplicate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={disconnectSelectedNode}
                          >
                            <Unplug className="h-3 w-3 mr-2" />
                            Disconnect
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={deleteSelectedNode}
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Info className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">
                        No node selected
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click a node to view its properties
                      </p>
                    </div>

                    <div className="pt-3 border-t">
                      <label className="text-sm font-medium mb-2 block">
                        Workflow Description
                      </label>
                      <Textarea
                        value={workflowDescription}
                        onChange={(e) => setWorkflowDescription(e.target.value)}
                        placeholder="Add workflow description..."
                        className="text-sm min-h-[100px]"
                      />
                    </div>

                    <div className="pt-3 border-t space-y-3">
                      <p className="text-sm font-medium">Workflow Stats</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Layers className="h-4 w-4 text-primary" />
                            <span className="text-xs text-muted-foreground">Nodes</span>
                          </div>
                          <p className="text-2xl font-bold">{nodes.length}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <GitBranch className="h-4 w-4 text-primary" />
                            <span className="text-xs text-muted-foreground">Connections</span>
                          </div>
                          <p className="text-2xl font-bold">{edges.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          {/* Canvas */}
          <div className={`${isFullscreen ? 'col-span-12' : 'col-span-12 md:col-span-9'} border-2 rounded-lg overflow-hidden bg-background relative`}>
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="shadow-lg"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
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
              <MiniMap className="!bg-muted" zoomable pannable />
              <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* Config Dialog */}
      {showConfigDialog && selectedNode && (
        <NodeConfigDialog
          node={selectedNode}
          nodeTemplate={getNodeTemplate(selectedNode.data.type)}
          onClose={() => setShowConfigDialog(false)}
          onSave={handleConfigSave}
          allNodes={nodes}
          connections={edges}
        />
      )}

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Workflow</DialogTitle>
            <DialogDescription>
              Paste your workflow JSON below. This will replace your current workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste JSON here..."
              className="font-mono text-xs min-h-[300px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImportDialog(false);
                  setImportData('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={confirmImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Speed up your workflow with these keyboard shortcuts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { key: '⌘ + S', action: 'Save workflow' },
              { key: '⌘ + E', action: 'Execute workflow' },
              { key: '⌘ + D', action: 'Duplicate selected node' },
              { key: 'Delete', action: 'Delete selected node' },
              { key: 'Escape', action: 'Deselect / Close dialogs' },
              { key: '?', action: 'Show keyboard shortcuts' },
              { key: 'Double Click', action: 'Configure node' },
            ].map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">{shortcut.action}</span>
                <Badge variant="secondary" className="font-mono">
                  {shortcut.key}
                </Badge>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Press <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd> anytime to see shortcuts
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportFile}
        className="hidden"
      />
    </Layout>
  );
}