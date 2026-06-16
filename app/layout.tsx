import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YouTube 트렌드 분석기',
  description: '유튜브 급상승 동영상 분석 도구',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-[#0a0a0a] text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
