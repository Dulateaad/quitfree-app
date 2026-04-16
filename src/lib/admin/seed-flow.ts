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

/**
 * Единый флоу по двум схемам (онбординг + трек-чек).
 * Старт приложения: узел `qf-flow-start` (см. FLOW_ROOT_NODE_ID в lib/flow.ts).
 * После «День X» пользователь переходит в ветку трек-чека.
 */
export function buildSeedNodes(): FlowNode[] {
  const nodes: FlowNode[] = [];
  const DX = 260;
  const DY = 140;
  const Y = 0;
  const TCY = 780;

  // ── Часть 1: онбординг (схема 1) ─────────────────────────────────────────
  nodes.push(
    node('qf-flow-start', 'content', 'Метод cookie и эффекта', 0, Y, {
      nextNodeId: 'onb-greet',
      text: 'Старт: объяснение метода cookie и эффекта.',
    })
  );

  nodes.push(
    node('onb-greet', 'welcome', 'Приветствие 20-40 сек', DX, Y, {
      nextNodeId: 'onb-click',
      text: 'Короткое приветствие 20–40 сек.',
    })
  );

  nodes.push(node('onb-click', 'content', 'Клик', DX * 2, Y, { nextNodeId: 'onb-rule-0', text: 'Переход по клику.' }));

  nodes.push(node('onb-rule-0', 'rule', 'Правило №0', DX * 3, Y, { nextNodeId: 'onb-rule-1' }));

  nodes.push(node('onb-rule-1', 'rule', 'Правило №1', DX * 4, Y, { nextNodeId: 'onb-th-1a' }));

  nodes.push(node('onb-th-1a', 'thesis', 'Тезисно', DX * 5, Y - DY * 0.4, { nextNodeId: 'onb-th-1b' }));
  nodes.push(node('onb-th-1b', 'thesis', 'Тезисно', DX * 6, Y - DY * 0.4, { nextNodeId: 'onb-q-1' }));

  nodes.push(
    node('onb-q-1', 'question', 'Вопрос?', DX * 7, Y, {
      text: 'Вопрос появляется при новом входе в систему. Как прошёл блок?',
      answers: [
        qa('onb-q-1-plus', 'understood', '+', 'onb-rule-2'),
        qa('onb-q-1-eq', 'half-understood', '=', 'onb-continue-1'),
        qa('onb-q-1-minus', 'not-understood', '−', 'onb-pause-1'),
      ],
    })
  );

  nodes.push(node('onb-continue-1', 'content', 'Продолжить', DX * 8, Y + DY * 1.2, { nextNodeId: 'onb-rule-1-1', text: 'Ветка «Продолжить» → Правило №1.1' }));
  nodes.push(node('onb-pause-1', 'content', 'Пауза', DX * 8, Y - DY * 1.2, { nextNodeId: 'onb-greet-after-pause', text: 'Ветка «Пауза»' }));

  nodes.push(
    node('onb-greet-after-pause', 'welcome', 'Приветствие после паузы', DX * 9, Y - DY * 1.2, {
      nextNodeId: 'onb-rule-1-1',
      text: 'Снова приветствие после паузы.',
    })
  );

  nodes.push(node('onb-rule-2', 'rule', 'Правило №2', DX * 8, Y - DY * 2.4, { nextNodeId: 'onb-rule-1-1' }));

  nodes.push(node('onb-rule-1-1', 'rule', 'Правило №1.1', DX * 10, Y, { nextNodeId: 'onb-th-2a' }));

  nodes.push(node('onb-th-2a', 'thesis', 'Тезисно', DX * 11, Y - DY * 0.4, { nextNodeId: 'onb-th-2b' }));
  nodes.push(node('onb-th-2b', 'thesis', 'Тезисно', DX * 12, Y - DY * 0.4, { nextNodeId: 'onb-q-2' }));

  nodes.push(
    node('onb-q-2', 'question', 'Вопрос?', DX * 13, Y, {
      text: 'Второй цикл: оценка после Правила №1.1 и тезисов.',
      answers: [
        qa('onb-q-2-plus', 'understood', '+', 'onb-rule-6'),
        qa('onb-q-2-eq', 'half-understood', '=', 'onb-continue-2'),
        qa('onb-q-2-minus', 'not-understood', '−', 'onb-pause-2'),
      ],
    })
  );

  nodes.push(node('onb-continue-2', 'content', 'Продолжить', DX * 14, Y + DY * 1.2, { nextNodeId: 'onb-rule-7-1', text: 'Продолжить → Правило №7.1' }));
  nodes.push(node('onb-pause-2', 'content', 'Пауза', DX * 14, Y - DY * 1.2, { nextNodeId: 'onb-greet-after-pause-2', text: 'Пауза' }));

  nodes.push(
    node('onb-greet-after-pause-2', 'welcome', 'Приветствие после паузы', DX * 15, Y - DY * 1.2, {
      nextNodeId: 'onb-rule-7-1',
      text: 'Приветствие после паузы (цикл 2).',
    })
  );

  nodes.push(node('onb-rule-6', 'rule', 'Правило №6', DX * 14, Y - DY * 2.4, { nextNodeId: 'onb-rule-7-1' }));

  nodes.push(node('onb-rule-7-1', 'rule', 'Правило №7.1', DX * 16, Y, { nextNodeId: 'onb-th-3a' }));

  nodes.push(node('onb-th-3a', 'thesis', 'Тезисно', DX * 17, Y - DY * 0.4, { nextNodeId: 'onb-th-3b' }));
  nodes.push(node('onb-th-3b', 'thesis', 'Тезисно', DX * 18, Y - DY * 0.4, { nextNodeId: 'onb-q-3' }));

  nodes.push(
    node('onb-q-3', 'question', 'Вопрос?', DX * 19, Y, {
      text: 'Финальный вопрос онбординга перед трек-чеком.',
      answers: [
        qa('onb-q-3-plus', 'understood', '+', 'onb-day-x'),
        qa('onb-q-3-eq', 'half-understood', '=', 'onb-day-x'),
        qa('onb-q-3-minus', 'not-understood', '−', 'onb-day-x'),
      ],
    })
  );

  nodes.push(
    node('onb-day-x', 'content', 'День X', DX * 20, Y, {
      nextNodeId: 'tc-q1',
      text: 'Спустя 6 месяцев — дорабатывать по факту. Переход к трек-чеку.',
    })
  );

  // ── Часть 2: трек-чек (схема 2) ───────────────────────────────────────────
  nodes.push(
    node('tc-q1', 'track_check', 'Трек-чек вопрос', 0, TCY, {
      text: 'Трек-чек: появляется при новом входе в систему.',
      answers: [
        qa('tc-q1-a1', 'positive', '+', 'fd-q'),
        qa('tc-q1-a2', 'neutral', '=', 'tc-ans-1-1'),
        qa('tc-q1-a3', 'negative', '−', 'tc-neg-split'),
        qa('tc-q1-a4', 'breakdown', 'Я сорвался', 'breakdown-1'),
      ],
    })
  );

  nodes.push(
    node('fd-q', 'question', 'Вопрос? (первые дни)', DX * 2, TCY - DY * 2.2, {
      text: 'Ветка «+»: первые дни.',
      answers: [
        qa('fd-q-plus', 'understood', '+', 'fd-1'),
        qa('fd-q-eq', 'half-understood', '=', 'breakdown-1'),
        qa('fd-q-minus', 'not-understood', '−', 'breakdown-1'),
      ],
    })
  );

  nodes.push(node('fd-1', 'first_days', 'Первые дни 1', DX * 4, TCY - DY * 2.8, { nextNodeId: 'tc-q2' }));
  nodes.push(node('fd-1-1', 'first_days', 'Первые дни 1.1', DX * 4, TCY - DY * 1.6, { nextNodeId: 'tc-q2' }));
  nodes.push(node('fd-1-2', 'first_days', 'Первые дни 1.2', DX * 4, TCY - DY * 0.4, { nextNodeId: 'tc-q2' }));

  nodes.push(node('tc-ans-1-1', 'content', 'Трек-чек ответ 1.1', DX * 2, TCY, { nextNodeId: 'tc-q2' }));

  nodes.push(node('tc-neg-split', 'content', 'Оч плохо / плохо / Ужасно', DX * 2, TCY + DY * 1.5, { nextNodeId: 'tc-ans-3-1', text: 'Выбор интенсивности негатива' }));

  nodes.push(node('tc-ans-3-1', 'content', 'Трек-чек ответ 3.1', DX * 4, TCY + DY * 2, { nextNodeId: 'tc-q2' }));
  nodes.push(node('tc-ans-3-2', 'content', 'Трек-чек ответ 3.2', DX * 4, TCY + DY * 3, { nextNodeId: 'tc-q2' }));
  nodes.push(node('tc-ans-3-3', 'content', 'Трек-чек ответ 3.3', DX * 4, TCY + DY * 4, { nextNodeId: 'tc-q2' }));

  nodes.push(node('breakdown-1', 'breakdown', 'Срыв', DX * 2, TCY + DY * 5.5, { nextNodeId: 'stop-1' }));
  nodes.push(node('stop-1', 'stop', 'Остановка', DX * 4, TCY + DY * 5, { nextNodeId: null }));
  nodes.push(node('rollback-1', 'rollback', 'Откат', DX * 4, TCY + DY * 6.2, { nextNodeId: null }));

  nodes.push(
    node('tc-q2', 'track_check', 'Трек-чек вопрос?', DX * 6, TCY, {
      text: 'Второй трек-чек вопрос (+ / = / − / Я сорвался).',
      answers: [
        qa('tc-q2-a1', 'positive', '+', 'tc-ans-1'),
        qa('tc-q2-a2', 'neutral', '=', 'tc-ans-1-1b'),
        qa('tc-q2-a3', 'negative', '−', 'tc-ans-3-neg'),
        qa('tc-q2-a4', 'breakdown', 'Я сорвался', 'breakdown-2'),
      ],
    })
  );

  nodes.push(node('tc-ans-1', 'content', 'Трек-чек ответ 1', DX * 8, TCY - DY * 1.2, { nextNodeId: 'tc-q3' }));
  nodes.push(node('tc-ans-1-1b', 'content', 'Трек-чек ответ 1.1', DX * 8, TCY, { nextNodeId: 'tc-q3' }));
  nodes.push(node('tc-ans-3-neg', 'content', 'Трек-чек ответ 1.2 / негатив', DX * 8, TCY + DY * 1.2, { nextNodeId: 'tc-q3' }));

  nodes.push(node('breakdown-2', 'breakdown', 'Срыв', DX * 8, TCY + DY * 3.2, { nextNodeId: 'stop-2' }));
  nodes.push(node('stop-2', 'stop', 'Остановка 2', DX * 10, TCY + DY * 2.8, { nextNodeId: null }));
  nodes.push(node('rollback-2', 'rollback', 'Откат 2', DX * 10, TCY + DY * 3.8, { nextNodeId: null }));

  nodes.push(
    node('tc-q3', 'track_check', 'Трек-чек вопрос?', DX * 10, TCY, {
      text: 'Третий трек-чек вопрос.',
      answers: [
        qa('tc-q3-a1', 'positive', '+', 'tc-final-pos'),
        qa('tc-q3-a2', 'neutral', '=', 'tc-final-pos'),
        qa('tc-q3-a3', 'negative', '−', 'tc-final-neg'),
        qa('tc-q3-a4', 'breakdown', 'Я сорвался', 'breakdown-3'),
      ],
    })
  );

  nodes.push(node('tc-final-pos', 'content', 'Отлично! Продолжайте', DX * 12, TCY - DY * 0.6, { nextNodeId: null }));
  nodes.push(node('tc-final-neg', 'content', 'Держитесь', DX * 12, TCY + DY * 0.6, { nextNodeId: null }));
  nodes.push(node('breakdown-3', 'breakdown', 'Срыв 3', DX * 12, TCY + DY * 2.4, { nextNodeId: 'stop-3' }));
  nodes.push(node('stop-3', 'stop', 'Остановка 3', DX * 14, TCY + DY * 2, { nextNodeId: null }));
  nodes.push(node('rollback-3', 'rollback', 'Откат 3', DX * 14, TCY + DY * 3, { nextNodeId: null }));

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
