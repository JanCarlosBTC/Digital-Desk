import React from 'react';
import { DashboardPanel } from '../../../../shared/components/organisms/dashboard-panel';
import { Button } from '../../../../shared/components/atoms/button';
import { BrainIcon } from 'lucide-react';

interface BrainDumpCardProps {
  content: string;
  onSave: (content: string) => void;
  isLoading?: boolean;
}

/**
 * Brain Dump Card component for the Thinking Desk feature
 * 
 * @example
 * ```tsx
 * <BrainDumpCard
 *   content={brainDumpContent}
 *   onSave={handleSaveBrainDump}
 *   isLoading={isLoading}
 * />
 * ```
 */
export function BrainDumpCard({ content, onSave, isLoading = false }: BrainDumpCardProps) {
  const [text, setText] = React.useState(content);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(text);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardPanel
      title="Brain Dump"
      description="Quickly capture your thoughts and ideas"
      icon={<BrainIcon size={18} />}
      domain="thinking-desk"
      variant="default"
      actions={
        <Button 
          variant="thinking-desk" 
          size="sm" 
          onClick={handleSave}
          isLoading={isSaving}
        >
          Save
        </Button>
      }
      isLoading={isLoading}
    >
      <div className="min-h-[200px]">
        <textarea
          className="w-full min-h-[200px] p-2 rounded-md border border-input bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-thinking-desk-primary"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start writing your thoughts here..."
          disabled={isLoading || isSaving}
        />
      </div>
    </DashboardPanel>
  );
}