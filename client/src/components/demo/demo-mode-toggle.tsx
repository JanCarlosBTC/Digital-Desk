import React from 'react';
import { Switch } from '@/components/ui/switch';
import { useDemoStorage } from '@/context/demo-storage-context';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Trash2 } from 'lucide-react';

export const DemoModeToggle: React.FC = () => {
  const { 
    demoMode, 
    setDemoMode, 
    timeRemaining, 
    formattedTimeRemaining, 
    resetExpirationTimer,
    clearAllDemoData
  } = useDemoStorage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="font-medium">Demo Mode</div>
          <div className="text-sm text-muted-foreground">
            Store data locally for demonstration purposes
          </div>
        </div>
        <Switch
          checked={demoMode}
          onCheckedChange={setDemoMode}
        />
      </div>

      {demoMode && (
        <>
          <div className="space-y-2">
            <div className="text-sm font-medium">Time Remaining</div>
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground">
                {formattedTimeRemaining}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetExpirationTimer}
                className="flex gap-1 items-center"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Reset Timer
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={clearAllDemoData}
              className="w-full flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All Demo Data
            </Button>
          </div>
        </>
      )}
    </div>
  );
};