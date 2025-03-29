import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  SaveIcon, 
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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
  
  // Format text as paragraph (properly formatted with line breaks)
  const formatAsParagraph = () => {
    if (!textareaRef.current) return;
    
    // Get current selection or cursor position
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    // Get selected text
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      // Format selected text: ensure double line breaks between paragraphs
      const formattedText = selectedText
        .split(/\n{3,}/).join("\n\n")  // Replace 3+ line breaks with 2
        .split(/\n/).filter(line => line.trim() !== "").join("\n\n");  // Add double line breaks between non-empty lines
          
      // Replace the selected text with formatted text
      const newContent = content.substring(0, start) + formattedText + content.substring(end);
      setContent(newContent);
      isDirtyRef.current = true;
      
      // Adjust cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start;
          textareaRef.current.selectionEnd = start + formattedText.length;
          textareaRef.current.focus();
        }
      }, 0);
      
      toast({
        title: "Text formatted",
        description: "Selected text has been formatted as paragraphs.",
      });
    } else {
      toast({
        title: "No text selected",
        description: "Please select text to format.",
        variant: "destructive",
      });
    }
  };
  
  // Format text as bullet points
  const formatAsBulletList = () => {
    if (!textareaRef.current) return;
    
    // Get current selection or cursor position
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    // Get selected text
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      // Format selected text as bullet points
      const lines = selectedText.split('\n').filter(line => line.trim() !== "");
      const bulletedText = lines.map(line => {
        // If line already starts with a bullet, don't add another
        return line.trim().startsWith('• ') ? line : `• ${line.trim()}`;
      }).join('\n');
      
      // Replace the selected text with bulleted text
      const newContent = content.substring(0, start) + bulletedText + content.substring(end);
      setContent(newContent);
      isDirtyRef.current = true;
      
      // Adjust cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start;
          textareaRef.current.selectionEnd = start + bulletedText.length;
          textareaRef.current.focus();
        }
      }, 0);
      
      toast({
        title: "Text formatted",
        description: "Selected text has been formatted as bullet points.",
      });
    } else {
      toast({
        title: "No text selected",
        description: "Please select text to format.",
        variant: "destructive",
      });
    }
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
    <Card className="shadow-md border border-gray-200 rounded-lg">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold">
              Brain Dump
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm mt-1">
              Quickly capture your thoughts, ideas, and inspirations without worrying about organization
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {isSaving && (
              <span className="text-xs text-gray-600 animate-pulse flex items-center">
                <ClockIcon className="h-3 w-3 mr-1" />
                Auto-saving...
              </span>
            )}
            {lastSaved && !isSaving && (
              <span className="text-xs text-gray-600 flex items-center">
                <ClockIcon className="h-3 w-3 mr-1" />
                Saved {formatLastEdited(lastSaved)}
              </span>
            )}
            <Button 
              variant="default" 
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
        <div className="bg-white shadow-sm border rounded-lg p-4 mb-6">
          {/* Text formatting toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-gray-50 rounded-md">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={formatAsParagraph} 
                    size="sm" 
                    variant="ghost" 
                    className="h-8"
                  >
                    <FileTextIcon className="h-4 w-4 mr-1" /> Paragraph
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Format text with proper paragraph spacing</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={formatAsBulletList} 
                    size="sm" 
                    variant="ghost" 
                    className="h-8"
                  >
                    <ListIcon className="h-4 w-4 mr-1" /> Bullet List
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Format text as a bullet list</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {isLoading ? (
            <div className="mb-4">
              <Skeleton className="w-full h-64" />
            </div>
          ) : (
            <div className="mb-1">
              <Textarea
                ref={textareaRef}
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
                  className={`w-32 h-2 ${characterCount > MAX_CHARACTERS * 0.9 ? "[&>div]:bg-red-500" : "[&>div]:bg-primary"}`}
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
            <Button variant="thinkingDeskOutline" size="sm" className="text-gray-600">
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
