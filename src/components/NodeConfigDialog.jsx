import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  AlertCircle, 
  Code2, 
  Key, 
  Plus, 
  Trash2, 
  Upload, 
  FileIcon, 
  Loader2,
  Sparkles,
  Copy,
  Check,
  Info,
  ChevronRight
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { filesService } from '../services/files.service';

// Enhanced Expression Input Component with Variable Suggestions
function ExpressionInput({ value, onChange, availableNodes, placeholder, property, allUpstreamNodes, nodeType }) {
  const [showHelper, setShowHelper] = useState(false);
  const [copiedVar, setCopiedVar] = useState(null);

  // Generate variable suggestions based on node type
  const getVariableSuggestions = () => {
    const suggestions = [];

    // Built-in variables
    suggestions.push({
      category: 'Built-in Variables',
      variables: [
        { label: 'Current timestamp', value: '{{$now}}', desc: 'ISO date string' },
        { label: 'Unix timestamp', value: '{{$timestamp}}', desc: 'Milliseconds since epoch' },
        { label: 'Random UUID', value: '{{$uuid}}', desc: 'Generate unique ID' },
        { label: 'Random number', value: '{{$random(1,100)}}', desc: 'Random between 1-100' },
      ]
    });

    // Previous node data (direct predecessors)
    if (availableNodes.length > 0) {
      suggestions.push({
        category: 'Previous Node Output',
        variables: availableNodes.flatMap(prevNode => 
          generateNodeVariables(prevNode, '$prev')
        )
      });
    }

    // All upstream nodes grouped by type
    const nodesByType = {};
    allUpstreamNodes.forEach(upstreamNode => {
      const type = upstreamNode.data.type;
      if (!nodesByType[type]) nodesByType[type] = [];
      nodesByType[type].push(upstreamNode);
    });

    Object.entries(nodesByType).forEach(([type, nodes]) => {
      nodes.forEach((upstreamNode, index) => {
        const nodeLabel = nodes.length > 1 
          ? `${upstreamNode.data.label} (${index + 1})` 
          : upstreamNode.data.label;
        
        suggestions.push({
          category: nodeLabel,
          variables: generateNodeVariables(upstreamNode, `$node.${upstreamNode.id}`)
        });
      });
    });

    // Context-specific suggestions for certain fields
    if (property.name === 'prompt' && nodeType?.includes('ai')) {
      suggestions.push({
        category: 'AI Context Suggestions',
        variables: getAISuggestions(allUpstreamNodes)
      });
    }

    if ((property.name === 'toEmail' || property.name === 'body') && nodeType === 'email') {
      suggestions.push({
        category: 'Email Suggestions',
        variables: getEmailSuggestions(allUpstreamNodes)
      });
    }

    return suggestions;
  };

  // Generate sample variables based on node type
  const generateNodeVariables = (nodeData, prefix) => {
    const variables = [];
    const type = nodeData.data.type;

    // Common for all nodes
    variables.push({
      label: 'Full output',
      value: `{{${prefix}.data}}`,
      desc: 'Complete node output'
    });

    // Type-specific suggestions
    switch (type) {
      case 'httpRequest':
        variables.push(
          { label: 'Response body', value: `{{${prefix}.data}}`, desc: 'API response data' },
          { label: 'Specific field', value: `{{${prefix}.data.fieldName}}`, desc: 'Access specific field' },
          { label: 'Status code', value: `{{${prefix}.metadata.statusCode}}`, desc: 'HTTP status' }
        );
        break;

      case 'aiChat':
      case 'aiTextGeneration':
        variables.push(
          { label: 'AI Response', value: `{{${prefix}.data.response}}`, desc: 'Generated text' },
          { label: 'Model used', value: `{{${prefix}.data.model}}`, desc: 'AI model name' }
        );
        break;

      case 'uploadFile':
        variables.push(
          { label: 'File data', value: `{{${prefix}.data}}`, desc: 'Parsed file content' },
          { label: 'First row', value: `{{${prefix}.data[0]}}`, desc: 'First data row' },
          { label: 'Loop item', value: '{{$item.fieldName}}', desc: 'When processing array items' }
        );
        break;

      case 'code':
      case 'function':
        variables.push(
          { label: 'Code output', value: `{{${prefix}.data}}`, desc: 'Function result' }
        );
        break;

      case 'filter':
      case 'sort':
        variables.push(
          { label: 'Filtered items', value: `{{${prefix}.data}}`, desc: 'Processed array' },
          { label: 'First item', value: `{{${prefix}.data[0]}}`, desc: 'First result' }
        );
        break;
    }

    return variables;
  };

  // AI-specific suggestions
  const getAISuggestions = (nodes) => {
    const suggestions = [];
    
    nodes.forEach(node => {
      if (node.data.type === 'uploadFile') {
        suggestions.push({
          label: `Analyze uploaded data`,
          value: `Analyze this data: {{$node.${node.id}.data}}`,
          desc: 'Use file content as AI context'
        });
      }
      if (node.data.type === 'httpRequest') {
        suggestions.push({
          label: `Process API response`,
          value: `Process: {{$node.${node.id}.data}}`,
          desc: 'Use API data as AI input'
        });
      }
    });

    return suggestions;
  };

  // Email-specific suggestions
  const getEmailSuggestions = (nodes) => {
    const suggestions = [];
    
    nodes.forEach(node => {
      if (node.data.type === 'uploadFile') {
        suggestions.push(
          { label: 'Recipient email', value: '{{$item.email}}', desc: 'Email from uploaded file' },
          { label: 'Recipient name', value: '{{$item.name}}', desc: 'Name from uploaded file' }
        );
      }
      if (node.data.type === 'aiChat') {
        suggestions.push({
          label: 'AI-generated content',
          value: `{{$node.${node.id}.data.response}}`,
          desc: 'Use AI output as email body'
        });
      }
    });

    return suggestions;
  };

  const insertVariable = (variable) => {
    const currentValue = value || '';
    onChange(currentValue + variable);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(null), 2000);
    toast.success('Variable inserted');
    setShowHelper(false);
  };

  const copyVariable = (variable) => {
    navigator.clipboard.writeText(variable);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(null), 2000);
    toast.success('Copied to clipboard');
  };

  const suggestions = getVariableSuggestions();

  return (
    <div className="space-y-2 px-1">
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Enter value or use {{expressions}}"}
          className="font-mono text-sm pr-20"
          rows={3}
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <Popover open={showHelper} onOpenChange={setShowHelper}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                title="Insert variable"
              >
                <Sparkles className="h-3 w-3" />
                Variables
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 max-h-[500px] overflow-y-auto p-0" align="end">
              <div className="sticky top-0 bg-background border-b p-3 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    <h4 className="font-semibold text-sm">Insert Variable</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHelper(false)}
                    className="h-6 px-2"
                  >
                    Close
                  </Button>
                </div>
              </div>

              <div className="p-3 space-y-4">
                {suggestions.map((group, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                      {group.category}
                    </p>
                    <div className="space-y-1">
                      {group.variables.map((variable, vIdx) => (
                        <button
                          key={vIdx}
                          onClick={() => insertVariable(variable.value)}
                          className="w-full p-2 text-left hover:bg-accent rounded-lg transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{variable.label}</p>
                              <code className="text-xs text-muted-foreground bg-muted px-1 rounded break-all">
                                {variable.value}
                              </code>
                              {variable.desc && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {variable.desc}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyVariable(variable.value);
                              }}
                            >
                              {copiedVar === variable.value ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {availableNodes.length === 0 && (
        <Card className="p-3 bg-amber-50 dark:bg-amber-950/20 border-amber-200">
          <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <Info className="h-3 w-3 mt-0.5 shrink-0" />
            Connect previous nodes to use dynamic data in expressions
          </p>
        </Card>
      )}
    </div>
  );
}

export function NodeConfigDialog({ node, nodeTemplate, onClose, onSave, allNodes, connections }) {
  const [config, setConfig] = useState(() => {
    const initialConfig = { ...(node?.data?.config || {}) };
    if (nodeTemplate?.properties) {
      nodeTemplate.properties.forEach((property) => {
        if (property.default !== undefined && initialConfig[property.name] === undefined) {
          initialConfig[property.name] = property.default;
        }
      });
    }
    return initialConfig;
  });
  
  const [errors, setErrors] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [sampleResponse, setSampleResponse] = useState(null);

  // Get nodes that come before this node
  const getPreviousNodes = () => {
    if (!node || !allNodes || !connections) return [];
    const incomingConnections = connections.filter(c => c.target === node.id);
    const sourceNodeIds = incomingConnections.map(c => c.source);
    return allNodes.filter(n => sourceNodeIds.includes(n.id));
  };

  // Get all upstream nodes
  const getUpstreamNodes = () => {
    const upstream = [];
    const visited = new Set();

    const traverse = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const incoming = connections.filter(c => c.target === nodeId);
      incoming.forEach(conn => {
        const sourceNode = allNodes.find(n => n.id === conn.source);
        if (sourceNode && !upstream.find(n => n.id === sourceNode.id)) {
          upstream.push(sourceNode);
          traverse(sourceNode.id);
        }
      });
    };

    traverse(node.id);
    return upstream;
  };

  const availableNodes = getPreviousNodes();
  const upstreamNodes = getUpstreamNodes();

  // Generate sample response for testing
  const generateSampleResponse = () => {
    const type = node.data.type;
    let sample = {};

    switch (type) {
      case 'httpRequest':
        sample = {
          data: {
            id: 123,
            name: "John Doe",
            email: "john@example.com",
            status: "active",
            created_at: "2024-01-01T00:00:00Z"
          },
          metadata: {
            statusCode: 200,
            headers: { "content-type": "application/json" }
          }
        };
        break;

      case 'aiChat':
      case 'aiTextGeneration':
        sample = {
          data: {
            response: "This is a sample AI-generated response that demonstrates the output structure.",
            model: "gpt-4",
            usage: { 
              prompt_tokens: 25, 
              completion_tokens: 50,
              total_tokens: 75 
            }
          }
        };
        break;

      case 'uploadFile':
        sample = {
          data: [
            { id: 1, name: "Alice Smith", email: "alice@example.com", age: 25 },
            { id: 2, name: "Bob Johnson", email: "bob@example.com", age: 30 },
            { id: 3, name: "Charlie Brown", email: "charlie@example.com", age: 35 }
          ],
          metadata: {
            type: "csv",
            rowCount: 3,
            columns: ["id", "name", "email", "age"]
          }
        };
        break;

      case 'database':
        sample = {
          data: [
            { id: 1, user_id: 101, amount: 150.50, status: "completed" },
            { id: 2, user_id: 102, amount: 75.25, status: "pending" }
          ]
        };
        break;

      default:
        sample = { 
          data: { 
            result: "Sample output",
            status: "success",
            timestamp: "2024-01-01T00:00:00Z"
          } 
        };
    }

    setSampleResponse(sample);
    toast.success('Sample response generated');
  };

  const handleFileUpload = async (property, file) => {
    setUploadingFiles(prev => ({ ...prev, [property.name]: true }));

    try {
      const uploadedFile = await filesService.uploadFile(file);
      setUploadedFiles(prev => ({
        ...prev,
        [property.name]: uploadedFile
      }));
      updateConfig(property.name, uploadedFile._id);
      toast.success(`✅ File uploaded: ${file.name}`);
    } catch (error) {
      toast.error(`❌ Failed to upload file: ${error.message}`);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [property.name]: false }));
    }
  };

  useEffect(() => {
    if (node?.data?.config) {
      setConfig(node.data.config);
    }
  }, [node]);

  const validateField = (property, value) => {
    const actualValue = value !== undefined ? value : property.default;

    if (property.required && actualValue !== 0 && actualValue !== false && !actualValue) {
      return `${property.label} is required`;
    }

    if (property.type === 'string' && property.name === 'url' && value) {
      if (value.includes('{{') && value.includes('}}')) {
        return null;
      }
      try {
        new URL(value);
      } catch {
        return 'Please enter a valid URL or use an expression';
      }
    }

    if (property.type === 'string' && property.name?.includes('Email') && value) {
      if (value.includes('{{') && value.includes('}}')) {
        return null;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address or use an expression';
      }
    }

    return null;
  };

  const handleSave = () => {
    const newErrors = {};
    const finalConfig = { ...config };

    nodeTemplate.properties?.forEach((property) => {
      if (finalConfig[property.name] === undefined && property.default !== undefined) {
        finalConfig[property.name] = property.default;
      }

      const error = validateField(property, finalConfig[property.name]);
      if (error) {
        newErrors[property.name] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('❌ Please fill in all required fields');
      return;
    }

    onSave(finalConfig);
    onClose();
  };

  const updateConfig = (name, value) => {
    setConfig({ ...config, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const supportsExpressions = (property) => {
    return ['string', 'text', 'code'].includes(property.type);
  };

  // Key-Value pair management
  const addKeyValuePair = (fieldName) => {
    const current = config[fieldName] || {};
    const newKey = `key${Object.keys(current).length + 1}`;
    updateConfig(fieldName, { ...current, [newKey]: '' });
  };

  const updateKeyValuePair = (fieldName, oldKey, newKey, value) => {
    const current = config[fieldName] || {};
    const updated = { ...current };
    if (oldKey !== newKey && oldKey in updated) {
      delete updated[oldKey];
    }
    updated[newKey] = value;
    updateConfig(fieldName, updated);
  };

  const removeKeyValuePair = (fieldName, key) => {
    const current = config[fieldName] || {};
    const updated = { ...current };
    delete updated[key];
    updateConfig(fieldName, updated);
  };

  // Array management
  const addArrayItem = (fieldName) => {
    const current = config[fieldName] || [];
    updateConfig(fieldName, [...current, '']);
  };

  const updateArrayItem = (fieldName, index, value) => {
    const current = config[fieldName] || [];
    const updated = [...current];
    updated[index] = value;
    updateConfig(fieldName, updated);
  };

  const removeArrayItem = (fieldName, index) => {
    const current = config[fieldName] || [];
    const updated = current.filter((_, i) => i !== index);
    updateConfig(fieldName, updated);
  };

  // Condition management
  const addCondition = (fieldName) => {
    const current = config[fieldName] || [];
    updateConfig(fieldName, [
      ...current,
      { field: '', operator: 'equals', value: '' }
    ]);
  };

  const updateCondition = (fieldName, index, field, value) => {
    const current = config[fieldName] || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig(fieldName, updated);
  };

  const removeCondition = (fieldName, index) => {
    const current = config[fieldName] || [];
    const updated = current.filter((_, i) => i !== index);
    updateConfig(fieldName, updated);
  };

  const renderField = (property) => {
    const value = config[property.name] ?? property.default ?? '';
    const hasError = errors[property.name];
    const canUseExpressions = supportsExpressions(property);

    switch (property.type) {
      case 'string':
        if (canUseExpressions && (availableNodes.length > 0 || upstreamNodes.length > 0)) {
          return (
            <ExpressionInput
              value={value}
              onChange={(val) => updateConfig(property.name, val)}
              availableNodes={availableNodes}
              allUpstreamNodes={upstreamNodes}
              placeholder={property.placeholder}
              property={property}
              nodeType={node.data.type}
            />
          );
        }
        return (
          <div className="space-y-2 px-1">
            <Input
              value={value}
              onChange={(e) => updateConfig(property.name, e.target.value)}
              placeholder={property.placeholder || `Enter ${property.label.toLowerCase()}`}
              className={hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {hasError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {hasError}
              </p>
            )}
          </div>
        );

      case 'text':
      case 'code':
        if (canUseExpressions && (availableNodes.length > 0 || upstreamNodes.length > 0)) {
          return (
            <ExpressionInput
              value={value}
              onChange={(val) => updateConfig(property.name, val)}
              availableNodes={availableNodes}
              allUpstreamNodes={upstreamNodes}
              placeholder={property.placeholder}
              property={property}
              nodeType={node.data.type}
            />
          );
        }
        return (
          <div className="space-y-2 px-1">
            <Textarea
              value={value}
              onChange={(e) => updateConfig(property.name, e.target.value)}
              placeholder={property.placeholder || `Enter ${property.label.toLowerCase()}`}
              className={`min-h-[120px] ${property.type === 'code' ? 'font-mono text-sm' : ''} ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {hasError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {hasError}
              </p>
            )}
          </div>
        );

      case 'file':
        const uploadedFile = uploadedFiles[property.name];
        const isUploading = uploadingFiles[property.name];

        return (
          <div className="space-y-2 px-1">
            <Card className="p-4">
              {value && uploadedFile ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <FileIcon className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {uploadedFile.mimetype} • {(uploadedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        updateConfig(property.name, '');
                        setUploadedFiles(prev => {
                          const updated = { ...prev };
                          delete updated[property.name];
                          return updated;
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                    <p className="font-medium mb-1">File ID:</p>
                    <code className="text-xs">{value}</code>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <input
                    type="file"
                    id={`file-${property.name}`}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(property, file);
                    }}
                    disabled={isUploading}
                    accept=".csv,.xlsx,.xls,.json,.txt,.pdf,.png,.jpg,.jpeg"
                  />
                  <label
                    htmlFor={`file-${property.name}`}
                    className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed transition-colors ${isUploading
                      ? 'border-muted bg-muted cursor-not-allowed'
                      : 'border-primary/50 hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span className="text-sm font-medium">Choose File</span>
                      </>
                    )}
                  </label>
                  <p className="text-xs text-muted-foreground mt-3">
                    Supported: CSV, Excel, JSON, Text, PDF, Images
                  </p>
                </div>
              )}
              {hasError && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-2">
                  <AlertCircle className="h-3 w-3" />
                  {hasError}
                </p>
              )}
            </Card>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2 px-1">
            <Input
              type="number"
              value={value}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                updateConfig(property.name, val);
              }}
              placeholder={property.placeholder || '0'}
              step={property.step || 'any'}
              min={property.min}
              max={property.max}
              className={hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {hasError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {hasError}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2 px-1">
            <Select
              value={value || ''}
              onValueChange={(val) => updateConfig(property.name, val)}
            >
              <SelectTrigger className={hasError ? 'border-red-500 focus:ring-red-500' : ''}>
                <SelectValue placeholder={`Select ${property.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {property.options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {hasError}
              </p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">
                {property.label}
              </Label>
              {property.description && (
                <p className="text-xs text-muted-foreground">
                  {property.description}
                </p>
              )}
            </div>
            <Switch
              checked={!!value}
              onCheckedChange={(checked) => updateConfig(property.name, checked)}
            />
          </div>
        );

      case 'json':
        return (
          <div className="space-y-2 px-1">
            <Textarea
              value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  updateConfig(property.name, parsed);
                } catch {
                  updateConfig(property.name, e.target.value);
                }
              }}
              placeholder={property.placeholder || '{\n  "key": "value"\n}'}
              className={`min-h-[120px] font-mono text-sm ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {hasError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {hasError}
              </p>
            )}
          </div>
        );

      case 'keyValue':
        const kvPairs = value || {};
        return (
          <div className="space-y-2 px-1">
            <Card className="p-3 space-y-2">
              {Object.entries(kvPairs).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No values set. Click "Add Value" to get started.
                </p>
              ) : (
                Object.entries(kvPairs).map(([key, val], idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <Input
                      value={key}
                      onChange={(e) => updateKeyValuePair(property.name, key, e.target.value, val)}
                      placeholder="Key"
                      className="flex-1"
                    />
                    <Input
                      value={val}
                      onChange={(e) => updateKeyValuePair(property.name, key, key, e.target.value)}
                      placeholder="Value (supports expressions)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeKeyValuePair(property.name, key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </Card>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addKeyValuePair(property.name)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Value
            </Button>
          </div>
        );

      case 'array':
        const arrItems = value || [];
        return (
          <div className="space-y-2 px-1">
            <Card className="p-3 space-y-2">
              {arrItems.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No items added yet.
                </p>
              ) : (
                arrItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateArrayItem(property.name, idx, e.target.value)}
                      placeholder={`Item ${idx + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem(property.name, idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </Card>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem(property.name)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        );

      case 'conditions':
        const conditions = value || [];
        return (
          <div className="space-y-2 px-1">
            <Card className="p-3 space-y-3">
              {conditions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No conditions set. Click "Add Condition" to get started.
                </p>
              ) : (
                conditions.map((condition, idx) => (
                  <div key={idx} className="space-y-2 pb-3 border-b last:border-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-medium">Condition {idx + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCondition(property.name, idx)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        value={condition.field || ''}
                        onChange={(e) => updateCondition(property.name, idx, 'field', e.target.value)}
                        placeholder="Field"
                      />
                      <Select
                        value={condition.operator || 'equals'}
                        onValueChange={(val) => updateCondition(property.name, idx, 'operator', val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="notEquals">Not Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="greaterThan">Greater Than</SelectItem>
                          <SelectItem value="lessThan">Less Than</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={condition.value || ''}
                        onChange={(e) => updateCondition(property.name, idx, 'value', e.target.value)}
                        placeholder="Value"
                      />
                    </div>
                  </div>
                ))
              )}
            </Card>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addCondition(property.name)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </div>
        );

      default:
        return (
          <div className="space-y-2 px-1">
            <Input
              value={value}
              onChange={(e) => updateConfig(property.name, e.target.value)}
              placeholder={property.placeholder || `Enter ${property.label.toLowerCase()}`}
              className={hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {hasError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {hasError}
              </p>
            )}
          </div>
        );
    }
  };

  if (!node || !nodeTemplate) return null;

  const hasAuthProps = nodeTemplate.properties?.some(p => p.name === 'authentication');
  const authProperties = hasAuthProps ?
    nodeTemplate.properties.filter(p =>
      ['authentication', 'username', 'password', 'apiKey', 'apiKeyHeader', 'smtpUser', 'smtpPassword', 'webhookUrl', 'botToken'].includes(p.name)
    ) : [];
  const regularProperties = nodeTemplate.properties?.filter(p =>
    !authProperties.find(ap => ap.name === p.name)
  ) || [];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-2xl">{nodeTemplate.icon}</span>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">
                Configure {nodeTemplate.name}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {nodeTemplate.description}
              </DialogDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {nodeTemplate.category}
            </Badge>
          </div>
        </DialogHeader>

        {/* Sample Response Preview for API/AI nodes */}
        {['httpRequest', 'aiChat', 'aiTextGeneration', 'uploadFile', 'database'].includes(node.data.type) && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-sm">Sample Response Preview</h4>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateSampleResponse}
                  className="h-7"
                >
                  Generate Sample
                </Button>
              </div>
              
              {sampleResponse && (
                <pre className="text-xs bg-white dark:bg-gray-950 p-3 rounded border overflow-x-auto max-h-40">
                  {JSON.stringify(sampleResponse, null, 2)}
                </pre>
              )}
              
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Use this sample to understand the output structure and reference it in downstream nodes
              </p>
            </div>
          </Card>
        )}

        {(availableNodes.length > 0 || upstreamNodes.length > 0) && (
          <Card className="p-3 bg-green-50 dark:bg-green-950/20 border-green-200">
            <div className="flex items-start gap-2 text-sm">
              <Sparkles className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">Smart Variables Available</p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Click <Badge variant="outline" className="mx-1 text-xs">Variables</Badge> on text fields to insert data from previous nodes
                </p>
              </div>
            </div>
          </Card>
        )}

        <ScrollArea className="max-h-[calc(90vh-300px)] pr-4">
          {hasAuthProps ? (
            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="auth">
                  <Key className="h-3 w-3 mr-2" />
                  Authentication
                </TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="space-y-6 py-4">
                {regularProperties.length > 0 ? (
                  regularProperties.map((property) => (
                    <div key={property.name} className="space-y-3">
                      {property.type !== 'boolean' && (
                        <div className="space-y-1.5">
                          <Label htmlFor={property.name} className="text-sm font-medium">
                            {property.label}
                            {property.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>
                          {property.description && property.type !== 'boolean' && (
                            <p className="text-xs text-muted-foreground">
                              {property.description}
                            </p>
                          )}
                        </div>
                      )}
                      {renderField(property)}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      All configuration is in the Authentication tab
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="auth" className="space-y-6 py-4">
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500" />
                    <div>
                      <p className="font-medium">Credentials Required</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Configure authentication to use this node
                      </p>
                    </div>
                  </div>
                </Card>
                {authProperties.map((property) => (
                  <div key={property.name} className="space-y-3">
                    {property.type !== 'boolean' && (
                      <div className="space-y-1.5">
                        <Label htmlFor={property.name} className="text-sm font-medium">
                          {property.label}
                          {property.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        {property.description && (
                          <p className="text-xs text-muted-foreground">
                            {property.description}
                          </p>
                        )}
                      </div>
                    )}
                    {renderField(property)}
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-6 py-4">
              {nodeTemplate.properties?.length > 0 ? (
                nodeTemplate.properties.map((property) => (
                  <div key={property.name} className="space-y-3">
                    {property.type !== 'boolean' && (
                      <div className="space-y-1.5">
                        <Label htmlFor={property.name} className="text-sm font-medium">
                          {property.label}
                          {property.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        {property.description && property.type !== 'boolean' && (
                          <p className="text-xs text-muted-foreground">
                            {property.description}
                          </p>
                        )}
                      </div>
                    )}
                    {renderField(property)}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No configuration needed</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This node works without any additional settings
                  </p>
                </div>
              )}

              {/* Variable Usage Guide */}
              {(availableNodes.length > 0 || upstreamNodes.length > 0) && (
                <Card className="p-4 bg-muted/50 mt-6">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    Variable Usage Guide
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <ChevronRight className="h-3 w-3 mt-0.5 text-primary" />
                      <div>
                        <code className="bg-background px-1 rounded">{'{{$prev.data}}'}</code>
                        <span className="text-muted-foreground ml-2">Access previous node output</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <ChevronRight className="h-3 w-3 mt-0.5 text-primary" />
                      <div>
                        <code className="bg-background px-1 rounded">{'{{$node.xxx.data.field}}'}</code>
                        <span className="text-muted-foreground ml-2">Access specific node by ID</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <ChevronRight className="h-3 w-3 mt-0.5 text-primary" />
                      <div>
                        <code className="bg-background px-1 rounded">{'{{$item.email}}'}</code>
                        <span className="text-muted-foreground ml-2">Loop through array items</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}