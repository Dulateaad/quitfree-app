'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getNodeByType, getNodeAfterAnswer, getNodeById } from '@/lib/flow';
import { FlowNode, NODE_TYPE_CONFIG } from '@/types/flow';

function QuestionContent() {
  const [questionNode, setQuestionNode] = useState<FlowNode | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nodeId = searchParams.get('id');

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        let node: FlowNode | null = null;
        if (nodeId) {
          node = await getNodeById(nodeId);
        } else {
          node = await getNodeByType('question');
        }
        setQuestionNode(node);
      } catch (error) {
        console.error('Ошибка загрузки вопроса:', error);
      } finally {
        setLoading(false);
      }
    };
    loadQuestion();
  }, [nodeId]);

  const navigateToNode = (node: FlowNode) => {
    const config = NODE_TYPE_CONFIG[node.type];
    if (config.hasAnswers) {
      router.push(`/question?id=${node.id}`);
    } else if (node.type === 'welcome') {
      router.push('/');
    } else {
      router.push(`/lesson?id=${node.id}`);
    }
  };

  const handleAnswer = async (answerType: string) => {
    if (!questionNode) return;
    setSelectedAnswer(answerType);

    if (typeof window !== 'undefined') {
      try {
        const completed = JSON.parse(localStorage.getItem('qf_completed') || '[]');
        if (!completed.includes(questionNode.id)) {
          completed.push(questionNode.id);
          localStorage.setItem('qf_completed', JSON.stringify(completed));
        }
      } catch { /* ignore */ }
    }

    try {
      const nextNode = await getNodeAfterAnswer(questionNode, answerType);
      if (nextNode) {
        setTimeout(() => navigateToNode(nextNode), 400);
      }
    } catch (error) {
      console.error('Ошибка обработки ответа:', error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Загрузка...</div>
      </main>
    );
  }

  if (!questionNode || !questionNode.text) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400">Вопрос еще не настроен в админке</p>
        </div>
      </main>
    );
  }

  const answers = questionNode.answers || [];
  const isTrackCheck = questionNode.type === 'track_check';

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <div className="mb-8">
        <div className="text-sm text-gray-400 mb-1">
          {isTrackCheck ? 'Трек-чек' : 'Вопрос'}
        </div>
        <h1 className="text-xl font-bold text-white mb-1">{questionNode.title}</h1>
        <p className="text-sm text-gray-300">Выберите ответ</p>
      </div>

      <div className="mb-8">
        <p className="text-lg text-white">{questionNode.text}</p>
      </div>

      <div className="space-y-3">
        {answers.map((answer) => (
          <button
            key={answer.id}
            onClick={() => handleAnswer(answer.type)}
            disabled={selectedAnswer !== null}
            className={`w-full px-4 py-4 rounded-lg text-left transition-all ${
              selectedAnswer === answer.type
                ? 'bg-purple-600 text-white border-2 border-purple-500'
                : selectedAnswer !== null
                ? 'bg-gray-800 text-gray-500 border border-gray-700'
                : 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700'
            }`}
          >
            {answer.label}
          </button>
        ))}
      </div>
    </main>
  );
}

export default function QuestionPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center">
          <div>Загрузка...</div>
        </main>
      }
    >
      <QuestionContent />
    </Suspense>
  );
}
