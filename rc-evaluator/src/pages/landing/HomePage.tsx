import { Link } from 'react-router-dom';
import { Button } from '../../common/ui/button';
import { Star } from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full mb-6">
        <Star size={16} className="fill-current" />
        <span className="text-sm font-medium">Now with Real-time Evaluation</span>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
        Build Trust in <br /> AI Responses.
      </h1>
      
      <p className="text-slate-400 text-lg max-w-2xl mb-10 leading-relaxed">
        The first chat interface designed for fine-tuning. Chat with LLMs, 
        evaluate performance in real-time, and build better datasets.
      </p>

      <div className="flex gap-4">
        <Button asChild size="lg" className="h-12 px-8">
          <Link to="/chat">Start Chatting (Guest)</Link>
        </Button>
        <Button variant="outline" size="lg" className="h-12 px-8">
          View Demo
        </Button>
      </div>
    </div>
  );
};