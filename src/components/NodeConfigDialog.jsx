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
import { AlertCircle, Code2, Key, Plus, Trash2, Upload, FileIcon, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { filesService } from '../services/files.service';

// Expression Input Component
function ExpressionInput({ value, onChange, availableNodes, placeholder }) {
  const [showHelper, setShowHelper] = useState(false);

  const insertExpression = (nodeId, path) => {
    const expression = `{{$node.${nodeId}.${path}}}`;
    const currentValue = value || '';
    // Insert at cursor position or append
    onChange(currentValue + expression);
    setShowHelper(false);
  };

  return (
    <div className="space-y-2 px-1">
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Enter value or use {{expressions}}"}
          className="font-mono text-sm pr-10"
          rows={3}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2"
          onClick={() => setShowHelper(!showHelper)}
          title="Insert expression from previous nodes"
        >
          <Code2 className="h-4 w-4" />
        </Button>
      </div>

      {showHelper && availableNodes.length > 0 && (
        <Card className="p-3 border-2 border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium">Available Node Data:</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelper(false)}
              className="h-6 px-2"
            >
              Close
            </Button>
          </div>
          <ScrollArea className="max-h-48">
            <div className="space-y-2 px-1">
              <button
                className="w-full text-left text-xs p-2 hover:bg-muted rounded border"
                onClick={() => {
                  onChange((value || '') + '{{$input.fieldName}}');
                  setShowHelper(false);
                }}
              >
                <span className="font-medium text-primary">Workflow Input</span>
                <br />
                <code className="text-xs text-muted-foreground">
                  {'{{$input.fieldName}}'} - Access workflow input data
                </code>
              </button>
              {availableNodes.map((node) => (
                <button
                  key={node.id}
                  className="w-full text-left text-xs p-2 hover:bg-muted rounded border"
                  onClick={() => insertExpression(node.id, 'data')}
                >
                  <span className="font-medium">{node.data.label}</span>
                  <br />
                  <code className="text-xs text-muted-foreground">
                    {`{{$node.${node.id}.data}}`}
                  </code>
                </button>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              <strong>Examples:</strong>
              <br />• <code>{'{{$node.node_123.data.name}}'}</code> - Access specific field
              <br />• <code>{'{{$input.userId}}'}</code> - Workflow input field
            </p>
          </div>
        </Card>
      )}

      {showHelper && availableNodes.length === 0 && (
        <Card className="p-3">
          <p className="text-xs text-muted-foreground text-center">
            No previous nodes available. Connect nodes first to use expressions.
          </p>
        </Card>
      )}
    </div>
  );
}

export function NodeConfigDialog({ node, nodeTemplate, onClose, onSave, allNodes, connections }) {
  const [config, setConfig] = useState(() => {
    const initialConfig = node?.data?.config || {};

    // Apply default values for properties that don't have values
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

  // Add this function inside NodeConfigDialog component
  const handleFileUpload = async (property, file) => {
    setUploadingFiles(prev => ({ ...prev, [property.name]: true }));

    try {
      const uploadedFile = await filesService.uploadFile(file);

      // Store the file info
      setUploadedFiles(prev => ({
        ...prev,
        [property.name]: uploadedFile
      }));

      // Update config with the file ID
      updateConfig(property.name, uploadedFile._id);

      toast.success(`✅ File uploaded: ${file.name}`);
    } catch (error) {
      toast.error(`❌ Failed to upload file: ${error.message}`);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [property.name]: false }));
    }
  };


  // Get nodes that come before this node in the workflow
  const getPreviousNodes = () => {
    if (!node || !allNodes || !connections) return [];

    const incomingConnections = connections.filter(c => c.target === node.id);
    const sourceNodeIds = incomingConnections.map(c => c.source);

    return allNodes.filter(n => sourceNodeIds.includes(n.id));
  };

  const availableNodes = getPreviousNodes();

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
      // Skip validation if it contains expressions
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
      // Use default value if not set
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

  // Helper to determine if a field supports expressions
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
        if (canUseExpressions && availableNodes.length > 0) {
          return (
            <ExpressionInput
              value={value}
              onChange={(val) => updateConfig(property.name, val)}
              availableNodes={availableNodes}
              placeholder={property.placeholder || `Enter ${property.label.toLowerCase()} or use expressions`}
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
        if (canUseExpressions && availableNodes.length > 0) {
          return (
            <ExpressionInput
              value={value}
              onChange={(val) => updateConfig(property.name, val)}
              availableNodes={availableNodes}
              placeholder={property.placeholder || `Enter ${property.label.toLowerCase()} or use expressions`}
            />
          );
        }
        return (
          <div className="space-y-2 px-1">
            <Textarea
              value={value}
              onChange={(e) => updateConfig(property.name, e.target.value)}
              placeholder={property.placeholder || `Enter ${property.label.toLowerCase()}`}
              className={`min-h-[120px] ${property.type === 'code' ? 'font-mono text-sm' : ''} ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
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
                // Show uploaded file info
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
                // Show upload button
                <div className="text-center py-6">
                  <input
                    type="file"
                    id={`file-${property.name}`}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(property, file);
                      }
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
              className={`min-h-[120px] font-mono text-sm ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
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

        {availableNodes.length > 0 && (
          <Card className="p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
            <div className="flex items-start gap-2 text-sm">
              <Code2 className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Expressions Available</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Use <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{'{{expressions}}'}</code> to reference data from previous nodes
                </p>
              </div>
            </div>
          </Card>
        )}

        <ScrollArea className="max-h-[calc(90vh-250px)] pr-4">
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