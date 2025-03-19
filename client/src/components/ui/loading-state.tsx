import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadingStateType = 'list' | 'form' | 'card' | 'table';

interface LoadingStateProps {
  type: LoadingStateType;
  count?: number;
  className?: string;
}

const skeletonConfigs: Record<LoadingStateType, { height: string; className?: string }> = {
  list: { height: 'h-16', className: 'space-y-4' },
  form: { height: 'h-96' },
  card: { height: 'h-40' },
  table: { height: 'h-12', className: 'space-y-2' }
};

export function LoadingState({ type, count = 1, className }: LoadingStateProps) {
  const config = skeletonConfigs[type];
  const items = Array.from({ length: count }, (_, i) => (
    <Skeleton
      key={i}
      className={cn(config.height, 'w-full rounded-md', className)}
    />
  ));

  return (
    <div className={cn('w-full', config.className)}>
      {items}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
} 