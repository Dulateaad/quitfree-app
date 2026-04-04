import { getFlowNodes, getFlowNode } from './admin/flow';
import { FlowNode, FlowNodeType, NODE_TYPE_CONFIG } from '@/types/flow';

export async function getStartNode(): Promise<FlowNode | null> {
  const nodes = await getFlowNodes();
  return nodes.find((n) => n.type === 'welcome') || null;
}

export async function getNextNode(currentNode: FlowNode): Promise<FlowNode | null> {
  if (NODE_TYPE_CONFIG[currentNode.type].hasAnswers) {
    return null;
  }

  if (currentNode.nextNodeId) {
    return getFlowNode(currentNode.nextNodeId);
  }

  // Legacy fallback: use order field if nextNodeId isn't set
  if (currentNode.order !== undefined) {
    const nodes = await getFlowNodes();
    const sorted = nodes.filter((n) => n.order !== undefined).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex((n) => n.id === currentNode.id);
    if (idx >= 0 && idx < sorted.length - 1) {
      return sorted[idx + 1];
    }
  }

  return null;
}

export async function getNodeAfterAnswer(
  questionNode: FlowNode,
  answerType: string
): Promise<FlowNode | null> {
  if (!questionNode.answers) return null;
  const answer = questionNode.answers.find((a) => a.type === answerType);
  if (!answer?.nextNodeId) return null;
  return getFlowNode(answer.nextNodeId);
}

export async function getNodeById(id: string): Promise<FlowNode | null> {
  return getFlowNode(id);
}

export async function getNodeByType(type: FlowNodeType): Promise<FlowNode | null> {
  const nodes = await getFlowNodes();
  return nodes.find((n) => n.type === type) || null;
}

export async function getTrackCheckNode(): Promise<FlowNode | null> {
  const nodes = await getFlowNodes();
  return nodes.find((n) => n.type === 'track_check') || null;
}

export async function getAllNodesInOrder(): Promise<FlowNode[]> {
  const nodes = await getFlowNodes();
  return nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** Walk the main flow chain from welcome node, returning ordered IDs */
export async function getMainFlowChain(): Promise<string[]> {
  const nodes = await getFlowNodes();
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const chain: string[] = [];
  const visited = new Set<string>();

  let current: FlowNode | undefined = nodes.find(n => n.type === 'welcome');
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    chain.push(current.id);

    let nextId = current.nextNodeId;
    if (!nextId && current.answers?.length) {
      nextId = current.answers[0]?.nextNodeId ?? null;
    }
    current = nextId ? nodeMap.get(nextId) || undefined : undefined;
  }

  return chain;
}
