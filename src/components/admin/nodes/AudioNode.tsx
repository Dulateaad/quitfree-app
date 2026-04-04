import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Volume2, Music } from 'lucide-react';
import { NODE_TYPE_CONFIG, FlowNodeType } from '@/types/flow';

interface AudioNodeData {
  label: string;
  nodeType: FlowNodeType;
  audioUrl?: string;
  selected?: boolean;
}

function AudioNodeComponent({ data }: NodeProps<AudioNodeData>) {
  const config = NODE_TYPE_CONFIG[data.nodeType] || NODE_TYPE_CONFIG.content;

  return (
    <div
      className="rounded-xl shadow-lg border-2 min-w-[180px] max-w-[220px] transition-shadow"
      style={{
        background: config.bgColor,
        borderColor: config.borderColor,
      }}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white" />

      <div
        className="px-3 py-1.5 rounded-t-[10px] flex items-center gap-1.5"
        style={{ background: config.color }}
      >
        <Music className="w-3.5 h-3.5 text-white" />
        <span className="text-white text-xs font-semibold">{config.label}</span>
      </div>

      <div className="px-3 py-2.5">
        <div className="text-gray-800 text-sm font-medium leading-tight truncate">
          {data.label}
        </div>
        {data.audioUrl ? (
          <div className="flex items-center gap-1 mt-1.5 text-green-600">
            <Volume2 className="w-3 h-3" />
            <span className="text-[11px]">Аудио загружено</span>
          </div>
        ) : config.hasAudio ? (
          <div className="text-gray-400 text-[11px] mt-1.5">Нет аудио</div>
        ) : null}
      </div>

      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white" />
    </div>
  );
}

export default memo(AudioNodeComponent);
