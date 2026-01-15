'use client';

import { useState } from 'react';

export default function TestAPIPage() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testAPI = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/game/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: '请生成一个简短的游戏开场场景，返回纯 JSON 格式。',
            },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          setResponse(fullResponse);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">API 测试页面</h1>

      <button
        onClick={testAPI}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded mb-8"
      >
        {loading ? '测试中...' : '测试 API'}
      </button>

      {error && (
        <div className="mb-8 p-4 bg-red-900/50 border border-red-600 rounded">
          <h2 className="font-bold mb-2">错误:</h2>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {response && (
        <div className="mb-8 p-4 bg-gray-800 rounded">
          <h2 className="font-bold mb-2">响应:</h2>
          <pre className="whitespace-pre-wrap text-sm break-all">{response}</pre>

          <div className="mt-4 p-4 bg-gray-900 rounded">
            <h3 className="font-bold mb-2">尝试解析为 JSON:</h3>
            <pre className="whitespace-pre-wrap text-sm break-all">
              {(() => {
                try {
                  const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
                  const parsed = JSON.parse(cleaned);
                  return JSON.stringify(parsed, null, 2);
                } catch (e) {
                  return `解析失败: ${e instanceof Error ? e.message : 'Unknown error'}`;
                }
              })()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
