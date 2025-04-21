import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Trash2 } from 'lucide-react';
import { useDemoStorage } from '@/context/demo-storage-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/**
 * DemoModeToggle - A component for toggling demo mode and managing demo data
 * 
 * Features:
 * - Toggle demo mode on/off
 * - Show time remaining until demo data expires
 * - Allow extending the demo expiration time
 * - Allow clearing all demo data
 */
export function DemoModeToggle() {
  const { 
    demoMode, 
    setDemoMode, 
    formattedTimeRemaining, 
    resetExpirationTimer,
    clearAllDemoData
  } = useDemoStorage();

  return (
    <div className="flex flex-col space-y-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <Label htmlFor="demo-mode" className="font-medium">Demo Mode</Label>
            {demoMode && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                Active
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {demoMode
              ? "Data is stored locally and will expire after 4 hours"
              : "Switch to demo mode for offline testing"}
          </p>
        </div>
        <Switch
          id="demo-mode"
          checked={demoMode}
          onCheckedChange={setDemoMode}
        />
      </div>

      {demoMode && (
        <>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formattedTimeRemaining}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetExpirationTimer}
            >
              Extend Time
            </Button>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Demo Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all demo data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove all locally stored demo data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearAllDemoData}>
                  Clear Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}