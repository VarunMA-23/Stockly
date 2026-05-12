import { Sparkles } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: any;
}

export function ComingSoon({ title, description, icon: Icon }: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-gradient-from to-emerald-gradient-to flex items-center justify-center">
          {Icon ? <Icon className="w-10 h-10 text-white" /> : <Sparkles className="w-10 h-10 text-white" />}
        </div>
        <h1 className="text-3xl font-bold mb-3">{title}</h1>
        <p className="text-muted-foreground mb-6">{description}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-lg">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
