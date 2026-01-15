import { Badge } from '@/components/ui/badge';
import {
    Settings
} from 'lucide-react';
import {
    Handle,
    Position
} from 'reactflow';
import 'reactflow/dist/style.css';



export function CustomNode({ data, selected }) {
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