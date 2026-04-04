import { collection, doc, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { FlowNode, FlowAnswer, AnswerType, TrackCheckAnswerType } from '@/types/flow';
import { saveFlowNode } from './flow';

const FLOW_NODES_COLLECTION = 'flowNodes';

function qa(id: string, type: AnswerType | TrackCheckAnswerType, label: string, nextNodeId: string | null = null): FlowAnswer {
  return { id, type, label, nextNodeId };
}

function node(
  id: string,
  type: FlowNode['type'],
  title: string,
  x: number,
  y: number,
  opts: Partial<Pick<FlowNode, 'nextNodeId' | 'answers' | 'text'>> = {}
): FlowNode {
  return {
    id,
    type,
    title,
    position: { x, y },
    nextNodeId: opts.nextNodeId ?? null,
    answers: opts.answers,
    text: opts.text,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function buildSeedNodes(): FlowNode[] {
  const nodes: FlowNode[] = [];
  const Y = 0;
  const DX = 280;
  const DY = 160;

  // ========== MAIN FLOW ==========
  // Column 0: Start
  nodes.push(node('welcome-1', 'welcome', 'Приветствие', 0, Y, { nextNodeId: 'reg-1' }));

  // Column 1
  nodes.push(node('reg-1', 'registration', 'Регистрация', DX, Y, {
    nextNodeId: 'rule-1',
    text: 'First ask: отзыв, средний стаж, средний за 10 лет',
  }));

  // Column 2
  nodes.push(node('rule-1', 'rule', 'Правило №1', DX * 2, Y, { nextNodeId: 'intro-1' }));

  // Column 3
  nodes.push(node('intro-1', 'intro', 'Вступление', DX * 3, Y, { nextNodeId: 'rule-2' }));

  // ===== MODULE 1: Правило 2 → Вопрос 1 =====
  nodes.push(node('rule-2', 'rule', 'Правило №2', DX * 4, Y, { nextNodeId: 'q1' }));

  nodes.push(node('q1', 'question', 'Вопрос №1', DX * 5, Y, {
    text: 'Насколько вы поняли Правило №2?',
    answers: [
      qa('q1-a1', 'understood', 'Понял', 'rule-3'),
      qa('q1-a2', 'half-understood', 'Понял наполовину', 'thesis-1'),
      qa('q1-a3', 'not-understood', 'Не понял', 'practice-1'),
    ],
  }));

  nodes.push(node('thesis-1', 'thesis', 'Тезис №1', DX * 6, Y - DY, { nextNodeId: 'rule-3' }));
  nodes.push(node('practice-1', 'practice', 'Практика №1', DX * 6, Y + DY, { nextNodeId: 'rule-2' }));

  // ===== MODULE 2: Правило 3 → Вопрос 2 =====
  nodes.push(node('rule-3', 'rule', 'Правило №3', DX * 7, Y, { nextNodeId: 'q2' }));

  nodes.push(node('q2', 'question', 'Вопрос №2', DX * 8, Y, {
    text: 'Насколько вы поняли Правило №3?',
    answers: [
      qa('q2-a1', 'understood', 'Понял', 'rule-4'),
      qa('q2-a2', 'half-understood', 'Понял наполовину', 'thesis-2'),
      qa('q2-a3', 'not-understood', 'Не понял', 'practice-2'),
    ],
  }));

  nodes.push(node('thesis-2', 'thesis', 'Тезис №2', DX * 9, Y - DY, { nextNodeId: 'rule-4' }));
  nodes.push(node('practice-2', 'practice', 'Практика №2', DX * 9, Y + DY, { nextNodeId: 'rule-3' }));

  // ===== MODULE 3: Правило 4 → Вопрос 3 =====
  nodes.push(node('rule-4', 'rule', 'Правило №4', DX * 10, Y, { nextNodeId: 'q3' }));

  nodes.push(node('q3', 'question', 'Вопрос №3', DX * 11, Y, {
    text: 'Насколько вы поняли Правило №4?',
    answers: [
      qa('q3-a1', 'understood', 'Понял', 'rule-5'),
      qa('q3-a2', 'half-understood', 'Понял наполовину', 'thesis-3'),
      qa('q3-a3', 'not-understood', 'Не понял', 'practice-3'),
    ],
  }));

  nodes.push(node('thesis-3', 'thesis', 'Тезис №3', DX * 12, Y - DY, { nextNodeId: 'rule-5' }));
  nodes.push(node('practice-3', 'practice', 'Практика №3', DX * 12, Y + DY, { nextNodeId: 'rule-4' }));

  // ===== MODULE 4: Правило 5 → Вопрос 4 =====
  nodes.push(node('rule-5', 'rule', 'Правило №5', DX * 13, Y, { nextNodeId: 'q4' }));

  nodes.push(node('q4', 'question', 'Вопрос №4', DX * 14, Y, {
    text: 'Насколько вы поняли Правило №5?',
    answers: [
      qa('q4-a1', 'understood', 'Понял', 'rule-6'),
      qa('q4-a2', 'half-understood', 'Понял наполовину', 'thesis-4'),
      qa('q4-a3', 'not-understood', 'Не понял', 'practice-4'),
    ],
  }));

  nodes.push(node('thesis-4', 'thesis', 'Тезис №4', DX * 15, Y - DY, { nextNodeId: 'rule-6' }));
  nodes.push(node('practice-4', 'practice', 'Практика №4', DX * 15, Y + DY, { nextNodeId: 'rule-5' }));

  // ===== MODULE 5: Правило 6 → Вопрос 5 =====
  nodes.push(node('rule-6', 'rule', 'Правило №6', DX * 16, Y, { nextNodeId: 'q5' }));

  nodes.push(node('q5', 'question', 'Вопрос №5', DX * 17, Y, {
    text: 'Насколько вы поняли Правило №6?',
    answers: [
      qa('q5-a1', 'understood', 'Понял', 'rule-7'),
      qa('q5-a2', 'half-understood', 'Понял наполовину', 'thesis-5'),
      qa('q5-a3', 'not-understood', 'Не понял', 'practice-5'),
    ],
  }));

  nodes.push(node('thesis-5', 'thesis', 'Тезис №5', DX * 18, Y - DY, { nextNodeId: 'rule-7' }));
  nodes.push(node('practice-5', 'practice', 'Практика №5', DX * 18, Y + DY, { nextNodeId: 'rule-6' }));

  // ===== MODULE 6: Правило 7 → Вопрос 6 =====
  nodes.push(node('rule-7', 'rule', 'Правило №7', DX * 19, Y, { nextNodeId: 'q6' }));

  nodes.push(node('q6', 'question', 'Вопрос №6', DX * 20, Y, {
    text: 'Насколько вы поняли Правило №7?',
    answers: [
      qa('q6-a1', 'understood', 'Понял', 'rule-8'),
      qa('q6-a2', 'half-understood', 'Понял наполовину', 'thesis-6'),
      qa('q6-a3', 'not-understood', 'Не понял', 'practice-6'),
    ],
  }));

  nodes.push(node('thesis-6', 'thesis', 'Тезис №6', DX * 21, Y - DY, { nextNodeId: 'rule-8' }));
  nodes.push(node('practice-6', 'practice', 'Практика №6', DX * 21, Y + DY, { nextNodeId: 'rule-7' }));

  // ===== MODULE 7: Правило 8 → Вопрос 7 =====
  nodes.push(node('rule-8', 'rule', 'Правило №8', DX * 22, Y, { nextNodeId: 'q7' }));

  nodes.push(node('q7', 'question', 'Вопрос №7', DX * 23, Y, {
    text: 'Насколько вы поняли Правило №8?',
    answers: [
      qa('q7-a1', 'understood', 'Понял', 'q8'),
      qa('q7-a2', 'half-understood', 'Понял наполовину', 'thesis-7'),
      qa('q7-a3', 'not-understood', 'Не понял', 'practice-7'),
    ],
  }));

  nodes.push(node('thesis-7', 'thesis', 'Тезис №7', DX * 24, Y - DY, { nextNodeId: 'q8' }));
  nodes.push(node('practice-7', 'practice', 'Практика №7', DX * 24, Y + DY, { nextNodeId: 'rule-8' }));

  // ===== Финальный Вопрос 8 =====
  nodes.push(node('q8', 'question', 'Вопрос №8', DX * 25, Y, {
    text: 'Итоговая проверка понимания всех правил',
    answers: [
      qa('q8-a1', 'understood', 'Понял', null),
      qa('q8-a2', 'half-understood', 'Понял наполовину', 'rule-7'),
      qa('q8-a3', 'not-understood', 'Не понял', 'rule-1'),
    ],
  }));

  // ========== TRACK-CHECK FLOW (Image 2) ==========
  const TCY = DY * 5;

  // Main track-check question (appears on re-login)
  nodes.push(node('tc-q1', 'track_check', 'Трек-чек вопрос', DX * 5, TCY, {
    text: 'Как ваши дела с момента последнего визита?',
    answers: [
      qa('tc-q1-a1', 'positive', '+', 'fd-1'),
      qa('tc-q1-a2', 'neutral', '=', 'tc-ans-1-1'),
      qa('tc-q1-a3', 'negative', '−', 'tc-ans-3-1'),
      qa('tc-q1-a4', 'breakdown', 'Я сорвался', 'breakdown-1'),
    ],
  }));

  // + path: Первые дни
  nodes.push(node('fd-1', 'first_days', 'Первые дни 1', DX * 7, TCY - DY * 2, { nextNodeId: 'tc-q2' }));
  nodes.push(node('fd-1-1', 'first_days', 'Первые дни 1.1', DX * 9, TCY - DY * 3, { nextNodeId: 'tc-q2' }));
  nodes.push(node('fd-1-2', 'first_days', 'Первые дни 1.2', DX * 9, TCY - DY * 1.5, { nextNodeId: 'tc-q2' }));

  // = path: Трек-чек ответ
  nodes.push(node('tc-ans-1-1', 'content', 'Трек-чек ответ 1.1', DX * 7, TCY, { nextNodeId: 'tc-q2' }));

  // - path: Плохие ответы
  nodes.push(node('tc-ans-3-1', 'content', 'Трек-чек ответ 3.1', DX * 7, TCY + DY, { nextNodeId: 'tc-q3' }));
  nodes.push(node('tc-ans-3-2', 'content', 'Трек-чек ответ 3.2', DX * 7, TCY + DY * 2, { nextNodeId: 'tc-q3' }));
  nodes.push(node('tc-ans-3-3', 'content', 'Трек-чек ответ 3.3', DX * 7, TCY + DY * 3, { nextNodeId: 'tc-q3' }));

  // Breakdown path: СРЫВ → ОСТАНОВКА / ОТКАТ
  nodes.push(node('breakdown-1', 'breakdown', 'Срыв', DX * 7, TCY + DY * 4.5, { nextNodeId: 'stop-1' }));
  nodes.push(node('stop-1', 'stop', 'Остановка', DX * 9, TCY + DY * 4, { nextNodeId: null }));
  nodes.push(node('rollback-1', 'rollback', 'Откат', DX * 9, TCY + DY * 5, { nextNodeId: null }));

  // Second track-check question
  nodes.push(node('tc-q2', 'track_check', 'Трек-чек вопрос 2', DX * 10, TCY, {
    text: 'Как вы себя чувствуете сейчас?',
    answers: [
      qa('tc-q2-a1', 'positive', '+', 'tc-ans-2-1'),
      qa('tc-q2-a2', 'neutral', '=', 'tc-ans-2-1'),
      qa('tc-q2-a3', 'negative', '−', 'tc-ans-3-4'),
      qa('tc-q2-a4', 'breakdown', 'Я сорвался', 'breakdown-2'),
    ],
  }));

  nodes.push(node('tc-ans-2-1', 'content', 'Трек-чек ответ 2.1', DX * 12, TCY - DY, { nextNodeId: 'tc-q3' }));

  nodes.push(node('tc-ans-3-4', 'content', 'Трек-чек ответ 3 (негатив)', DX * 12, TCY + DY, { nextNodeId: 'tc-q3' }));

  nodes.push(node('breakdown-2', 'breakdown', 'Срыв 2', DX * 12, TCY + DY * 3, { nextNodeId: 'stop-2' }));
  nodes.push(node('stop-2', 'stop', 'Остановка 2', DX * 14, TCY + DY * 2.5, { nextNodeId: null }));
  nodes.push(node('rollback-2', 'rollback', 'Откат 2', DX * 14, TCY + DY * 3.5, { nextNodeId: null }));

  // Third track-check question
  nodes.push(node('tc-q3', 'track_check', 'Трек-чек вопрос 3', DX * 15, TCY, {
    text: 'Продолжаем проверку. Как дела?',
    answers: [
      qa('tc-q3-a1', 'positive', '+', 'tc-final-pos'),
      qa('tc-q3-a2', 'neutral', '=', 'tc-final-pos'),
      qa('tc-q3-a3', 'negative', '−', 'tc-final-neg'),
      qa('tc-q3-a4', 'breakdown', 'Я сорвался', 'breakdown-3'),
    ],
  }));

  nodes.push(node('tc-final-pos', 'content', 'Отлично! Продолжайте', DX * 17, TCY - DY, { nextNodeId: null }));
  nodes.push(node('tc-final-neg', 'content', 'Держитесь, всё получится', DX * 17, TCY + DY, { nextNodeId: null }));
  nodes.push(node('breakdown-3', 'breakdown', 'Срыв 3', DX * 17, TCY + DY * 3, { nextNodeId: 'stop-3' }));
  nodes.push(node('stop-3', 'stop', 'Остановка 3', DX * 19, TCY + DY * 2.5, { nextNodeId: null }));
  nodes.push(node('rollback-3', 'rollback', 'Откат 3', DX * 19, TCY + DY * 3.5, { nextNodeId: null }));

  return nodes;
}

export async function seedFlow(): Promise<number> {
  // Bulk delete all existing nodes in one batch
  const snapshot = await getDocs(collection(db, FLOW_NODES_COLLECTION));
  if (!snapshot.empty) {
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  // Create all seed nodes one by one
  const seedNodes = buildSeedNodes();
  for (const n of seedNodes) {
    await saveFlowNode(n);
  }

  return seedNodes.length;
}
