import React, { useState, memo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  PlusIcon, 
  NetworkIcon, 
  SearchIcon, 
  FilterIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  TrashIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureCard } from '@/components/ui/feature-card';
import { LoadingState } from '@/components/ui/loading-state';
import { useThinkingDesk } from '@/pages/thinking-desk-new';
import { Badge } from '@/components/ui/badge';

// Interface for Problem Tree
interface ProblemTree {
  id: number;
  userId: number;
  title: string;
  mainProblem: string;
  subProblems: string[];
  rootCauses: string[];
  potentialSolutions: string[];
  nextActions: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ProblemTreeListProps {
  onViewDetailsClick?: (tree: ProblemTree) => void;
  setSelectedProblemTree?: (tree: ProblemTree) => void;
  onNewProblemTreeClick?: () => void;
  onDeleteProblemTree?: (id: number) => void;
}

const ProblemTreeList = memo(function ProblemTreeList({ 
  onViewDetailsClick, 
  setSelectedProblemTree,
  onNewProblemTreeClick,
  onDeleteProblemTree
}: ProblemTreeListProps) {
  const { toast } = useToast();
  const { createProblemTree } = useThinkingDesk();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof ProblemTree>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Fetch problem trees
  const { data: problemTrees, isLoading, error } = useQuery<ProblemTree[]>({
    queryKey: ['/api/problem-trees'],
  });

  // Function to handle sorting
  const handleSort = (field: keyof ProblemTree) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle creating a new problem tree
  const handleNewProblemTree = () => {
    if (onNewProblemTreeClick) {
      onNewProblemTreeClick();
    } else {
      createProblemTree();
    }
  };

  // Handle selecting a problem tree for editing
  const handleSelectProblemTree = (tree: ProblemTree) => {
    if (setSelectedProblemTree) {
      setSelectedProblemTree(tree);
    }
  };

  // Handle delete of a problem tree
  const handleDelete = useCallback((id: number) => {
    if (onDeleteProblemTree) {
      onDeleteProblemTree(id);
    }
  }, [onDeleteProblemTree]);

  // Format date for display
  const formatDate = (dateString: Date | string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  // Filter and sort problem trees
  const filteredTrees = problemTrees 
    ? problemTrees.filter(tree => 
        tree.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tree.mainProblem.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const sortedTrees = [...filteredTrees].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    } else if (fieldA instanceof Date && fieldB instanceof Date) {
      return sortDirection === 'asc' 
        ? fieldA.getTime() - fieldB.getTime()
        : fieldB.getTime() - fieldA.getTime();
    } else if (typeof fieldA === 'string' && fieldB instanceof Date) {
      const dateA = new Date(fieldA);
      return sortDirection === 'asc' 
        ? dateA.getTime() - fieldB.getTime()
        : fieldB.getTime() - dateA.getTime();
    } else if (fieldA instanceof Date && typeof fieldB === 'string') {
      const dateB = new Date(fieldB);
      return sortDirection === 'asc' 
        ? fieldA.getTime() - dateB.getTime()
        : dateB.getTime() - fieldA.getTime();
    }
    return 0;
  });

  if (isLoading) {
    return <LoadingState type="list" count={3} />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        <h3 className="font-medium">Error Loading Problem Trees</h3>
        <p className="text-sm mt-1">
          {error instanceof Error ? error.message : "An unknown error occurred. Please try again."}
        </p>
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center mb-2">
          <div>
            <CardTitle>Problem Trees</CardTitle>
            <CardDescription>Break down complex problems into manageable components</CardDescription>
          </div>
          <Button
            onClick={handleNewProblemTree}
            variant="thinkingDesk"
            className="h-10"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> New Problem Tree
          </Button>
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-between">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search problem trees..."
              className="pl-9 h-10 text-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex space-x-2">
            <Select
              value={sortField}
              onValueChange={(value) => handleSort(value as keyof ProblemTree)}
            >
              <SelectTrigger className="h-10 w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
                <SelectItem value="createdAt">Date Created</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            >
              {sortDirection === 'asc' ? (
                <ArrowUpIcon className="h-4 w-4" />
              ) : (
                <ArrowDownIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {sortedTrees.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
            <NetworkIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Problem Trees Yet</h3>
            <p className="text-gray-500 mb-4">Start breaking down complex problems into manageable parts.</p>
            <Button
              onClick={handleNewProblemTree}
              variant="thinkingDesk"
            >
              <PlusIcon className="mr-2 h-4 w-4" /> Create Your First Problem Tree
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTrees.map(tree => (
              <FeatureCard
                key={tree.id}
                title={tree.title}
                description={tree.mainProblem}
                date={new Date(tree.updatedAt)}
                metadata={[
                  { label: "Sub-Problems", value: tree.subProblems.length.toString() },
                  { label: "Root Causes", value: tree.rootCauses.length.toString() },
                  { label: "Solutions", value: tree.potentialSolutions.length.toString() },
                ]}
                actions={[
                  {
                    label: "View Details",
                    onClick: () => onViewDetailsClick ? onViewDetailsClick(tree) : null,
                    variant: "thinkingDeskOutline"
                  },
                  {
                    label: "Edit",
                    onClick: () => handleSelectProblemTree(tree),
                    variant: "thinkingDeskOutline"
                  },
                  {
                    label: "Delete",
                    onClick: () => handleDelete(tree.id),
                    variant: "destructive",
                    icon: <TrashIcon className="h-4 w-4" />
                  }
                ]}
                className="hover:shadow-md transition-shadow"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default ProblemTreeList;