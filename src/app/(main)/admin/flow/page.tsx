'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  LogOut, Plus, Save, Trash2, Upload, Play, Pause, X, Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  uploadFlowAudio,
  saveFlowNode,
  getFlowNodes,
  deleteFlowNode,
  saveNodePositions,
} from '@/lib/admin/flow';
import {
  FlowNode,
  FlowNodeType,
  NODE_TYPE_CONFIG,
  DEFAULT_QUESTION_ANSWERS,
  DEFAULT_TRACK_CHECK_ANSWERS,
} from '@/types/flow';
import AudioNodeComponent from '@/components/admin/nodes/AudioNode';
import QuestionNodeComponent from '@/components/admin/nodes/QuestionNode';
import TrackCheckNodeComponent from '@/components/admin/nodes/TrackCheckNode';
import { seedFlow } from '@/lib/admin/seed-flow';

const ADMIN_EMAILS = ['dulatea.dot@gmail.com', 'servile4853@gmail.com'];

const NODE_TYPES_LIST: FlowNodeType[] = [
  'welcome', 'registration', 'intro', 'rule', 'thesis', 'practice',
  'question', 'track_check', 'first_days', 'breakdown', 'stop', 'rollback', 'content',
];

function flowNodesToReactFlow(flowNodes: FlowNode[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  for (const fn of flowNodes) {
    const config = NODE_TYPE_CONFIG[fn.type];
    let rfType = 'audioNode';
    if (fn.type === 'question') rfType = 'questionNode';
    else if (fn.type === 'track_check') rfType = 'trackCheckNode';

    nodes.push({
      id: fn.id,
      type: rfType,
      position: fn.position || { x: 0, y: 0 },
      data: {
        label: fn.title,
        nodeType: fn.type,
        audioUrl: fn.audioUrl,
        text: fn.text,
        answers: fn.answers,
      },
    });

    if (fn.nextNodeId) {
      edges.push({
        id: `e-${fn.id}-${fn.nextNodeId}`,
        source: fn.id,
        target: fn.nextNodeId,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: config.color, strokeWidth: 2 },
      });
    }

    if (fn.answers) {
      for (const ans of fn.answers) {
        if (ans.nextNodeId) {
          edges.push({
            id: `e-${fn.id}-${ans.id}-${ans.nextNodeId}`,
            source: fn.id,
            sourceHandle: ans.id,
            target: ans.nextNodeId,
            label: ans.label,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: config.color, strokeWidth: 2 },
            labelStyle: { fontSize: 10 },
          });
        }
      }
    }
  }

  return { nodes, edges };
}

function FlowEditor() {
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [seeding, setSeeding] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const nodeTypes = useMemo(() => ({
    audioNode: AudioNodeComponent,
    questionNode: QuestionNodeComponent,
    trackCheckNode: TrackCheckNodeComponent,
  }), []);

  useEffect(() => {
    const check = async () => {
      const { getAuth, onAuthStateChanged } = await import('firebase/auth');
      const { default: app } = await import('@/lib/firebase');
      const auth = getAuth(app);
      const unsub = onAuthStateChanged(auth, (user) => {
        if (user && user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
          setIsAuthorized(true);
          loadNodes();
        } else {
          router.push('/admin/login');
        }
        setCheckingAuth(false);
      });
      return unsub;
    };
    let unsub: (() => void) | undefined;
    check().then((u) => { unsub = u; });
    return () => unsub?.();
  }, [router]);

  const loadNodes = async () => {
    setLoading(true);
    try {
      const loaded = await getFlowNodes();
      setFlowNodes(loaded);
      const { nodes: rfNodes, edges: rfEdges } = flowNodesToReactFlow(loaded);
      setNodes(rfNodes);
      setEdges(rfEdges);
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    async (params: Connection) => {
      if (!params.source || !params.target) return;

      const sourceFlowNode = flowNodes.find((n) => n.id === params.source);
      if (!sourceFlowNode) return;

      const sourceConfig = NODE_TYPE_CONFIG[sourceFlowNode.type];

      if (sourceConfig.hasAnswers && params.sourceHandle) {
        if (sourceFlowNode.answers) {
          const updatedAnswers = sourceFlowNode.answers.map((a) =>
            a.id === params.sourceHandle ? { ...a, nextNodeId: params.target } : a
          );
          sourceFlowNode.answers = updatedAnswers;
        }
      } else {
        sourceFlowNode.nextNodeId = params.target;
      }

      sourceFlowNode.updatedAt = new Date();
      await saveFlowNode(sourceFlowNode);

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: sourceConfig.color, strokeWidth: 2 },
          },
          eds
        )
      );
      setFlowNodes((prev) => prev.map((n) => (n.id === sourceFlowNode.id ? { ...sourceFlowNode } : n)));
    },
    [flowNodes, setEdges]
  );

  const onEdgesDelete = useCallback(
    async (deletedEdges: Edge[]) => {
      for (const edge of deletedEdges) {
        const sourceNode = flowNodes.find((n) => n.id === edge.source);
        if (!sourceNode) continue;

        if (edge.sourceHandle && sourceNode.answers) {
          sourceNode.answers = sourceNode.answers.map((a) =>
            a.id === edge.sourceHandle ? { ...a, nextNodeId: null } : a
          );
        } else {
          sourceNode.nextNodeId = null;
        }
        sourceNode.updatedAt = new Date();
        await saveFlowNode(sourceNode);
      }
      setFlowNodes((prev) => {
        const map = new Map(prev.map((n) => [n.id, n]));
        for (const edge of deletedEdges) {
          const fn = flowNodes.find((n) => n.id === edge.source);
          if (fn) map.set(fn.id, { ...fn });
        }
        return Array.from(map.values());
      });
    },
    [flowNodes]
  );

  const onNodeDragStop = useCallback(
    async (_: unknown, node: Node) => {
      const fn = flowNodes.find((n) => n.id === node.id);
      if (fn) {
        fn.position = node.position;
        await saveNodePositions({ [node.id]: node.position });
      }
    },
    [flowNodes]
  );

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      const fn = flowNodes.find((n) => n.id === node.id);
      if (fn) {
        setSelectedNode(fn);
        setEditTitle(fn.title);
        setEditText(fn.text || '');
      }
    },
    [flowNodes]
  );

  const handleAddNode = async (type: FlowNodeType) => {
    const config = NODE_TYPE_CONFIG[type];
    const id = `${type}-${Date.now()}`;
    const existingOfType = flowNodes.filter((n) => n.type === type).length;
    const title = existingOfType > 0 ? `${config.label} ${existingOfType + 1}` : config.label;

    let answers;
    if (type === 'question') {
      answers = DEFAULT_QUESTION_ANSWERS.map((a, i) => ({ ...a, id: `${id}-ans-${i}` }));
    } else if (type === 'track_check') {
      answers = DEFAULT_TRACK_CHECK_ANSWERS.map((a, i) => ({ ...a, id: `${id}-ans-${i}` }));
    }

    const maxX = flowNodes.length > 0 ? Math.max(...flowNodes.map((n) => n.position.x)) : 0;

    const newNode: FlowNode = {
      id,
      type,
      title,
      position: { x: maxX + 300, y: Math.random() * 300 },
      answers,
      nextNodeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await saveFlowNode(newNode);
    setShowAddMenu(false);
    await loadNodes();
  };

  const handleDeleteNode = async () => {
    if (!selectedNode) return;
    if (!confirm(`Удалить "${selectedNode.title}"?`)) return;
    await deleteFlowNode(selectedNode.id);
    setSelectedNode(null);
    await loadNodes();
  };

  const handleSaveNodeProps = async () => {
    if (!selectedNode) return;
    selectedNode.title = editTitle;
    selectedNode.text = editText;
    selectedNode.updatedAt = new Date();
    await saveFlowNode(selectedNode);
    await loadNodes();
    const refreshed = (await getFlowNodes()).find((n) => n.id === selectedNode.id) || null;
    setSelectedNode(refreshed);
  };

  const handleUploadAudio = async (file: File) => {
    if (!selectedNode) return;
    setUploading(true);
    try {
      const url = await uploadFlowAudio(file, selectedNode.id);
      selectedNode.audioUrl = url;
      selectedNode.updatedAt = new Date();
      await saveFlowNode(selectedNode);
      await loadNodes();
      setSelectedNode({ ...selectedNode, audioUrl: url });
    } catch (e) {
      alert('Ошибка загрузки: ' + (e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const togglePlay = (url: string) => {
    if (!audioRef.current) return;
    if (playingUrl === url) {
      audioRef.current.pause();
      setPlayingUrl(null);
    } else {
      audioRef.current.src = url;
      audioRef.current.play();
      setPlayingUrl(url);
    }
  };

  const handleSeedFlow = async () => {
    if (!confirm('Это удалит все текущие узлы и заполнит флоу по схеме. Продолжить?')) return;
    setSeeding(true);
    try {
      const count = await seedFlow();
      alert(`Создано ${count} узлов по схеме!`);
      await loadNodes();
    } catch (e) {
      alert('Ошибка: ' + (e as Error).message);
    } finally {
      setSeeding(false);
    }
  };

  const handleLogout = async () => {
    const { getAuth, signOut } = await import('firebase/auth');
    const { default: app } = await import('@/lib/firebase');
    await signOut(getAuth(app));
    router.push('/admin/login');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Проверка авторизации...</div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <audio ref={audioRef} onEnded={() => setPlayingUrl(null)} />
      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUploadAudio(f);
          e.target.value = '';
        }}
      />

      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">Конструктор Flow</h1>
          <div className="relative">
            <Button
              size="sm"
              onClick={() => setShowAddMenu(!showAddMenu)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Добавить узел
            </Button>
            {showAddMenu && (
              <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 p-2 w-56 max-h-80 overflow-y-auto">
                {NODE_TYPES_LIST.map((t) => {
                  const c = NODE_TYPE_CONFIG[t];
                  return (
                    <button
                      key={t}
                      onClick={() => handleAddNode(t)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-left"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ background: c.color }}
                      />
                      <span className="text-sm">{c.label}</span>
                      {!c.hasAudio && (
                        <span className="text-gray-500 text-[10px] ml-auto">без аудио</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleSeedFlow}
            disabled={seeding}
          >
            {seeding ? 'Создание...' : 'Заполнить по схеме'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/admin')}
            className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Назад
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Выйти
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* React Flow canvas */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-gray-400">Загрузка...</div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgesDelete={onEdgesDelete}
              onNodeDragStop={onNodeDragStop}
              onNodeClick={onNodeClick}
              onPaneClick={() => setSelectedNode(null)}
              nodeTypes={nodeTypes}
              fitView
              deleteKeyCode="Delete"
              className="bg-gray-900"
            >
              <Controls className="!bg-gray-800 !border-gray-600 !rounded-lg [&>button]:!bg-gray-700 [&>button]:!border-gray-600 [&>button]:!text-white [&>button:hover]:!bg-gray-600" />
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#374151" />
            </ReactFlow>
          )}
        </div>

        {/* Side panel */}
        {selectedNode && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto shrink-0">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: NODE_TYPE_CONFIG[selectedNode.type].color }}
                  />
                  <span className="text-sm font-semibold">
                    {NODE_TYPE_CONFIG[selectedNode.type].label}
                  </span>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Название</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Text */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  {NODE_TYPE_CONFIG[selectedNode.type].hasAnswers ? 'Текст вопроса' : 'Описание'}
                </label>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <Button size="sm" onClick={handleSaveNodeProps} className="w-full">
                <Save className="w-3.5 h-3.5 mr-1" />
                Сохранить
              </Button>

              {/* Audio section */}
              {NODE_TYPE_CONFIG[selectedNode.type].hasAudio && (
                <div className="border-t border-gray-700 pt-4">
                  <label className="text-xs text-gray-400 mb-2 block">Аудио</label>
                  {selectedNode.audioUrl ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <Volume2 className="w-4 h-4" />
                        <span>Аудио загружено</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => togglePlay(selectedNode.audioUrl!)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
                        >
                          {playingUrl === selectedNode.audioUrl ? (
                            <><Pause className="w-3.5 h-3.5" /> Пауза</>
                          ) : (
                            <><Play className="w-3.5 h-3.5" /> Играть</>
                          )}
                        </button>
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                        >
                          Заменить
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="w-full"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      {uploading ? 'Загрузка...' : 'Загрузить аудио'}
                    </Button>
                  )}
                </div>
              )}

              {/* Answers (read-only summary for question/track_check) */}
              {selectedNode.answers && selectedNode.answers.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <label className="text-xs text-gray-400 mb-2 block">Ответы (ветки)</label>
                  <div className="space-y-2">
                    {selectedNode.answers.map((ans) => {
                      const target = flowNodes.find((n) => n.id === ans.nextNodeId);
                      return (
                        <div key={ans.id} className="bg-gray-700/50 rounded-lg p-2">
                          <span className="text-sm font-medium">{ans.label}</span>
                          {target ? (
                            <span className="text-purple-400 text-xs ml-2">→ {target.title}</span>
                          ) : (
                            <span className="text-gray-500 text-xs ml-2">не подключен</span>
                          )}
                        </div>
                      );
                    })}
                    <p className="text-gray-500 text-[11px]">
                      Соедините выходы узла с целевыми узлами на графе перетаскиванием
                    </p>
                  </div>
                </div>
              )}

              {/* Delete */}
              <div className="border-t border-gray-700 pt-4">
                <button
                  onClick={handleDeleteNode}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Удалить узел
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FlowManagementPage() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}
