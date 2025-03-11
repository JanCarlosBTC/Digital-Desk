import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { SaveIcon, TagIcon, ShareIcon, BrainIcon, ClockIcon } from "lucide-react";
import { BrainDump as BrainDumpType } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BrainDump = () => {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
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
      toast({
        title: "Changes saved",
        description: "Your brain dump has been updated successfully.",
      });
      setIsSaving(false);
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
  
  useEffect(() => {
    if (brainDump) {
      setContent(brainDump.content || "");
    }
  }, [brainDump]);
  
  const handleSave = () => {
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
      </CardHeader>
      
      <CardContent>
        <div className="bg-gradient-to-b from-white to-gray-50 shadow-sm border rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mr-2">
              Free-form
            </Badge>
            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="h-3.5 w-3.5 mr-1 text-gray-400" />
              Last edited: {brainDump ? formatLastEdited(new Date(brainDump.updatedAt)) : "Never"}
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
                onChange={(e) => setContent(e.target.value)}
              />
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
          <div>
            <Button variant="outline" size="sm" className="text-gray-600 mr-2 border-gray-200">
              <TagIcon className="mr-1 h-4 w-4" /> Add Tags
            </Button>
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-200">
              <ShareIcon className="mr-1 h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrainDump;
