import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { HelpCircle } from 'lucide-react';
import { NODE_TYPE_CONFIG, FlowAnswer } from '@/types/flow';

interface QuestionNodeData {
  label: string;
  text?: string;
  answers?: FlowAnswer[];
}

function QuestionNodeComponent({ data }: NodeProps<QuestionNodeData>) {
  const config = NODE_TYPE_CONFIG.question;
  const answers = data.answers || [];

  return (
    <div
      className="rounded-xl shadow-lg border-2 min-w-[200px] max-w-[240px]"
      style={{ background: config.bgColor, borderColor: config.borderColor }}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white" />

      <div
        className="px-3 py-1.5 rounded-t-[10px] flex items-center gap-1.5"
        style={{ background: config.color }}
      >
        <HelpCircle className="w-3.5 h-3.5 text-white" />
        <span className="text-white text-xs font-semibold">{config.label}</span>
      </div>

      <div className="px-3 py-2.5">
        <div className="text-gray-800 text-sm font-medium leading-tight truncate">
          {data.label}
        </div>
        {data.text && (
          <div className="text-gray-500 text-[11px] mt-1 line-clamp-2">{data.text}</div>
        )}
      </div>

      <div className="border-t border-red-200 px-2 py-1.5 space-y-1">
        {answers.map((ans, i) => (
          <div key={ans.id || i} className="flex items-center justify-between">
            <span className="text-[11px] text-gray-600">{ans.label}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={ans.id || `answer-${i}`}
              className="!w-2.5 !h-2.5 !bg-red-400 !border-2 !border-white !relative !transform-none !top-auto !right-auto"
              style={{ position: 'relative' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(QuestionNodeComponent);
