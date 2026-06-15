import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AskAiLinkProps {
  query: string;
  className?: string;
}

export function AskAiLink({ query, className }: AskAiLinkProps) {
  return (
    <Link
      href={`/chat?query=${encodeURIComponent(query)}`}
      title="Ask AI about this"
      className={cn(
        'inline-flex items-center justify-center rounded-full p-0.5',
        'text-muted-foreground/70 hover:text-primary hover:bg-primary/10',
        'transition-all duration-200',
        className
      )}
    >
      <MessageCircle className="h-3.5 w-3.5" />
    </Link>
  );
}
