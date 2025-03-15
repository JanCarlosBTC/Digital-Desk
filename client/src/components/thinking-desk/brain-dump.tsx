import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  SaveIcon, 
  TagIcon, 
  ShareIcon, 
  BrainIcon, 
  ClockIcon, 
  FileTextIcon, 
  ListIcon,
  InfoIcon 
} from "lucide-react";
import { BrainDump as BrainDumpType } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

const AUTO_SAVE_INTERVAL = 5000; // Auto-save every 5 seconds
const MAX_CHARACTERS = 10000; // Limit of 10,000 characters

const BrainDump = () => {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [characterCount, setCharacterCount] = useState(0);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);
  
  // Fetch brain dump
  const { data: brainDump, isLoading } = useQuery<BrainDumpType>({
    queryKey: ['/api/brain-dump']
  });
  
  // Update brain dump
  const mutation = useMutation({
    mutationFn: async (content: string) => {
      if (!brainDump) return null;
      return apiRequest('PUT', `/api/brain-dump/${brainDump.id}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brain-dump'] });
      setIsSaving(false);
      setLastSaved(new Date());
      isDirtyRef.current = false;
      
      // Don't show toast for auto-save to avoid notification fatigue
      if (!autoSaveTimerRef.current) {
        toast({
          title: "Changes saved",
          description: "Your brain dump has been updated successfully.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error saving changes",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  });
  
  // Auto-save functionality
  useEffect(() => {
    // Set up auto-save timer
    if (brainDump) {
      autoSaveTimerRef.current = setInterval(() => {
        if (isDirtyRef.current && content !== brainDump.content) {
          setIsSaving(true);
          mutation.mutate(content);
        }
      }, AUTO_SAVE_INTERVAL);
    }
    
    // Clean up timer on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [brainDump, content, mutation]);

  // Initialize content when brain dump is loaded
  useEffect(() => {
    if (brainDump) {
      setContent(brainDump.content || "");
      setCharacterCount(brainDump.content?.length || 0);
      setLastSaved(new Date(brainDump.updatedAt));
    }
  }, [brainDump]);
  
  // Update character count when content changes
  useEffect(() => {
    setCharacterCount(content.length);
  }, [content]);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_CHARACTERS) {
      setContent(newContent);
      isDirtyRef.current = true;
    }
  };
  
  const handleSave = () => {
    if (!brainDump || content === brainDump.content) return;
    setIsSaving(true);
    mutation.mutate(content);
  };
  
  // Format the last edited time
  const formatLastEdited = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 24) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffHrs < 48) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Brain Dump
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm mt-1">
              Quickly capture your thoughts, ideas, and inspirations without worrying about organization
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {isSaving && (
              <span className="text-xs text-amber-600 animate-pulse flex items-center">
                <ClockIcon className="h-3 w-3 mr-1" />
                Auto-saving...
              </span>
            )}
            {lastSaved && !isSaving && (
              <span className="text-xs text-green-600 flex items-center">
                <ClockIcon className="h-3 w-3 mr-1" />
                Saved {formatLastEdited(lastSaved)}
              </span>
            )}
            <Button 
              variant="default" 
              className="bg-primary/90 text-white hover:bg-primary transition-all"
              onClick={handleSave}
              disabled={isLoading || isSaving || mutation.isPending}
              size="sm"
            >
              <SaveIcon className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="bg-gradient-to-b from-white to-gray-50 shadow-sm border rounded-lg p-4 mb-6">
          {/* Text formatting toolbar */}
          <div className="flex items-center mb-3 bg-white border rounded-md p-1 shadow-sm justify-between">
            <div className="flex space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700">
                      <FileTextIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Format as paragraph</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-700">
                      <ListIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Format as bullet list</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Free-form
              </Badge>
              <div className="flex items-center text-sm text-gray-500">
                <ClockIcon className="h-3.5 w-3.5 mr-1 text-gray-400" />
                Last edited: {brainDump ? formatLastEdited(new Date(brainDump.updatedAt)) : "Never"}
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="mb-4">
              <Skeleton className="w-full h-64" />
            </div>
          ) : (
            <div className="mb-1">
              <Textarea
                className="w-full h-64 border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-inner"
                placeholder="Start typing your thoughts here..."
                value={content}
                onChange={handleContentChange}
              />
              
              {/* Character count and progress bar */}
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center cursor-help">
                          <InfoIcon className="h-3 w-3 mr-1 text-gray-400" />
                          <span>Character count: {characterCount} / {MAX_CHARACTERS}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Maximum {MAX_CHARACTERS} characters allowed</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Progress 
                  value={(characterCount / MAX_CHARACTERS) * 100} 
                  className="w-32 h-2"
                  indicatorClassName={characterCount > MAX_CHARACTERS * 0.9 ? "bg-red-500" : "bg-primary"}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <BrainIcon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-gray-700 font-medium">Your brain dump is private by default</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-200">
              <TagIcon className="mr-1 h-4 w-4" /> Add Tags
            </Button>
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-200">
              <ShareIcon className="mr-1 h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 border-t mt-4 text-xs text-gray-500 flex justify-between">
        <span>Auto-save enabled (every 5 seconds)</span>
        <span>Last edit by: You</span>
      </CardFooter>
    </Card>
  );
};

export default BrainDump;
