// frontend/src/components/shared/LoadingScreen.tsx
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  messages?: string[];
}

export default function LoadingScreen({ messages }: Props) {
  const defaultMessages = [
    'Analyzing your preferences...',
    'Finding the perfect options...',
    'Calculating recommendations...',
    'Almost there...'
  ];

  const displayMessages = messages || defaultMessages;
  const [messageIndex, setMessageIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(i => (i + 1) % displayMessages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [displayMessages.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <Sparkles className="w-24 h-24 text-yellow-300 mx-auto animate-pulse" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">
          Creating Your Perfect Plan
        </h2>
        <p className="text-2xl text-white/90 mb-8 animate-pulse">
          {displayMessages[messageIndex]}
        </p>
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}