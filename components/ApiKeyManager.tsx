'use client';

import { useState, useEffect } from 'react';

interface Props {
  onApiKeyChange: (key: string) => void;
}

export default function ApiKeyManager({ onApiKeyChange }: Props) {
  const [inputKey, setInputKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('yt_api_key') || '';
    if (stored) {
      setSavedKey(stored);
      setInputKey(stored);
      onApiKeyChange(stored);
    }
  }, [onApiKeyChange]);

  const handleSave = () => {
    const key = inputKey.trim();
    if (!key) return;
    localStorage.setItem('yt_api_key', key);
    setSavedKey(key);
    onApiKeyChange(key);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem('yt_api_key');
    setSavedKey('');
    setInputKey('');
    onApiKeyChange('');
    setEditing(false);
  };

  const maskedKey = savedKey
    ? savedKey.slice(0, 6) + '••••••••••••' + savedKey.slice(-4)
    : '';

  // 저장된 키가 있고 편집 중이 아닐 때 → 작은 버튼
  if (savedKey && !editing) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg transition-all group"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">
            API 키
          </span>
          <span className="text-xs text-gray-600 font-mono">{maskedKey}</span>
          <svg className="w-3 h-3 text-gray-600 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        {saved && (
          <span className="text-xs text-green-400">✓ 저장됨</span>
        )}
      </div>
    );
  }

  // 미저장 또는 편집 중 → 전체 폼
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${savedKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <h2 className="text-sm font-semibold text-gray-300">YouTube Data API 키</h2>
        {editing && (
          <button
            onClick={() => setEditing(false)}
            className="ml-auto text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            취소
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={showKey ? 'text' : 'password'}
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="AIza... YouTube Data API v3 키를 입력하세요"
            autoFocus={editing}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
          >
            {showKey ? '숨김' : '표시'}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!inputKey.trim()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          저장
        </button>
        {savedKey && (
          <button
            onClick={handleClear}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
          >
            삭제
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-600">
        키는 브라우저 로컬 스토리지에만 저장됩니다. 서버로 전송되지 않습니다.
      </p>
    </div>
  );
}
