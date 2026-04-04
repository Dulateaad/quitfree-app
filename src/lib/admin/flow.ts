import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase';
import { FlowNode, Flow } from '@/types/flow';

const FLOW_COLLECTION = 'flows';
const FLOW_NODES_COLLECTION = 'flowNodes';

function serializeNode(node: FlowNode): Record<string, unknown> {
  const data: Record<string, unknown> = {
    ...node,
    createdAt: Timestamp.fromDate(node.createdAt),
    updatedAt: Timestamp.fromDate(node.updatedAt),
  };
  // Firestore rejects undefined values
  for (const key of Object.keys(data)) {
    if (data[key] === undefined) delete data[key];
  }
  return data;
}

function deserializeNode(id: string, data: Record<string, unknown>): FlowNode {
  return {
    ...data,
    id,
    position: (data.position as { x: number; y: number }) || { x: 0, y: 0 },
    createdAt: (data.createdAt as Timestamp)?.toDate?.() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate?.() || new Date(),
  } as FlowNode;
}

export async function saveFlowNode(node: FlowNode): Promise<void> {
  const nodeRef = doc(db, FLOW_NODES_COLLECTION, node.id);
  await setDoc(nodeRef, serializeNode(node));
}

export async function getFlowNodes(): Promise<FlowNode[]> {
  const snapshot = await getDocs(collection(db, FLOW_NODES_COLLECTION));
  return snapshot.docs.map((d) => deserializeNode(d.id, d.data() as Record<string, unknown>));
}

export async function getFlowNode(nodeId: string): Promise<FlowNode | null> {
  const snap = await getDoc(doc(db, FLOW_NODES_COLLECTION, nodeId));
  if (!snap.exists()) return null;
  return deserializeNode(snap.id, snap.data() as Record<string, unknown>);
}

export async function deleteFlowNode(nodeId: string): Promise<void> {
  const allNodes = await getFlowNodes();
  const batch = writeBatch(db);

  batch.delete(doc(db, FLOW_NODES_COLLECTION, nodeId));

  for (const node of allNodes) {
    let changed = false;

    if (node.nextNodeId === nodeId) {
      node.nextNodeId = null;
      changed = true;
    }

    if (node.answers) {
      for (const ans of node.answers) {
        if (ans.nextNodeId === nodeId) {
          ans.nextNodeId = null;
          changed = true;
        }
      }
    }

    if (changed) {
      node.updatedAt = new Date();
      batch.set(doc(db, FLOW_NODES_COLLECTION, node.id), serializeNode(node));
    }
  }

  await batch.commit();
}

export async function saveNodePositions(
  positions: Record<string, { x: number; y: number }>
): Promise<void> {
  const batch = writeBatch(db);
  for (const [id, pos] of Object.entries(positions)) {
    const nodeRef = doc(db, FLOW_NODES_COLLECTION, id);
    batch.update(nodeRef, { position: pos, updatedAt: Timestamp.fromDate(new Date()) });
  }
  await batch.commit();
}

export async function uploadFlowAudio(file: File, nodeId: string): Promise<string> {
  const storageInstance = getStorage();
  const ext = file.name.split('.').pop() || 'mp3';
  const storagePath = `flow-audio/${nodeId}.${ext}`;
  const storageRef = ref(storageInstance, storagePath);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function saveFlow(flow: Flow): Promise<void> {
  const flowRef = doc(db, FLOW_COLLECTION, flow.id);
  await setDoc(flowRef, {
    ...flow,
    createdAt: Timestamp.fromDate(flow.createdAt),
    updatedAt: Timestamp.fromDate(flow.updatedAt),
  });
}

export async function getFlow(flowId: string): Promise<Flow | null> {
  const snap = await getDoc(doc(db, FLOW_COLLECTION, flowId));
  if (!snap.exists()) return null;
  const data = snap.data();
  const nodes = await getFlowNodes();
  return {
    ...data,
    id: snap.id,
    nodes,
    createdAt: (data.createdAt as Timestamp)?.toDate?.() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate?.() || new Date(),
  } as Flow;
}
