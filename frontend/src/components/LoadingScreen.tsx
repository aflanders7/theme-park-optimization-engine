// frontend/src/components/shared/LoadingScreen.tsx
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function LoadingScreen() {
  const messages = [
    'Analyzing your preferences...',
    'Finding the perfect hotels...',
    'Comparing prices across dates...',
    'Calculating match scores...',
    'Almost there...'
  ];
  
  const [messageIndex, setMessageIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(i => (i + 1) % messages.length);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <Sparkles className="w-24 h-24 text-yellow-300 mx-auto animate-pulse" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Finding Your Perfect Hotels</h2>
        <p className="text-2xl text-white/90 mb-8 animate-pulse">{messages[messageIndex]}</p>
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}