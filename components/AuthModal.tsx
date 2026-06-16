'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  onClose: () => void;
}

type Mode = 'login' | 'signup';

export default function AuthModal({ onClose }: Props) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reset = (m: Mode) => { setMode(m); setError(''); setSuccess(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (mode === 'signup' && password !== confirmPassword) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (password.length < 6) { setError('비밀번호는 최소 6자 이상이어야 합니다.'); return; }
    setLoading(true);
    const { error } = await (mode === 'login' ? signInWithEmail : signUpWithEmail)(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else if (mode === 'signup') {
      setSuccess('이메일 인증 링크를 발송했습니다. 메일함을 확인해주세요.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">YouTube 트렌드 분석기</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode tab */}
        <div className="flex gap-1 bg-gray-800 rounded-xl p-1 mb-5">
          {(['login', 'signup'] as Mode[]).map((m) => (
            <button key={m} onClick={() => reset(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}>
              {m === 'login' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        {/* Google OAuth */}
        <button onClick={() => signInWithGoogle()}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium text-sm py-2.5 rounded-xl transition-colors mb-4">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google로 {mode === 'login' ? '로그인' : '가입'}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-xs text-gray-500">또는 이메일로</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">이메일</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="example@email.com"
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 placeholder-gray-600" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">비밀번호</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              placeholder="최소 6자 이상"
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 placeholder-gray-600" />
          </div>
          {mode === 'signup' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">비밀번호 확인</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                placeholder="비밀번호 재입력"
                className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 placeholder-gray-600" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-950/50 border border-green-800 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-xs text-green-300">{success}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-colors">
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

        {mode === 'login' && (
          <p className="text-center text-xs text-gray-600 mt-4">
            계정이 없으신가요?{' '}
            <button onClick={() => reset('signup')} className="text-red-400 hover:text-red-300">회원가입</button>
          </p>
        )}
      </div>
    </div>
  );
}
