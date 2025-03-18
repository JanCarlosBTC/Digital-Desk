import React, { useState, useMemo, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Decision } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FilterIcon, 
  EyeIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  PlusIcon, 
  EditIcon, 
  BarChart3Icon, 
  SortAscIcon,
  SearchIcon,
  CalendarIcon,
  TagIcon 
} from "lucide-react";
import { format, subMonths, isAfter } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FeatureCard, StatusBadge, ActionItem } from "@/components/ui/feature-card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DecisionListProps {
  decisions: Decision[];
  isLoading: boolean;
  setSelectedDecision: (decision: Decision | null) => void;
  onNewDecisionClick?: () => void;
  onViewDetailsClick?: (decision: Decision) => void;
}

const DecisionList = ({ 
  decisions, 
  isLoading, 
  setSelectedDecision, 
  onNewDecisionClick,
  onViewDetailsClick 
}: DecisionListProps) => {
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const decisionsPerPage = 5;

  // Update decision status (mark as successful)
  const updateStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('PUT', `/api/decisions/${id}`, { status: "Successful" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/decisions'] });
      toast({
        title: "Status updated",
        description: "Decision has been marked as successful.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating status",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSelectDecision = (decision: Decision) => {
    setSelectedDecision(decision);
  };

  const handleViewDetails = (decision: Decision, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetailsClick) {
      onViewDetailsClick(decision);
    } else {
      // Default behavior: select the decision to view in detail
      setSelectedDecision(decision);
    }
  };

  const handleEditDecision = (decision: Decision, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDecision(decision);
  };

  const handleMarkSuccessful = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    updateStatusMutation.mutate(id);
  };

  // Update status to Failed
  const markFailedMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('PUT', `/api/decisions/${id}`, { status: "Failed" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/decisions'] });
      toast({
        title: "Status updated",
        description: "Decision has been marked as failed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating status",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleMarkFailed = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    markFailedMutation.mutate(id);
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value === "all" ? null : value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? null : value);
    setPage(1);
  };

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value === "all" ? null : value);
    setPage(1);
  };

  const handleSortByChange = (value: "newest" | "oldest") => {
    setSortBy(value);
  };

  const handleNewDecisionClick = () => {
    setSelectedDecision(null);
    if (onNewDecisionClick) {
      onNewDecisionClick();
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Reset all filters when changing tabs
    setCategoryFilter(null);
    setStatusFilter(null);
    setTimeFilter(null);
    setSearchQuery("");
    setPage(1);
  };

  // Compute decision metrics
  const metrics = useMemo(() => {
    if (!decisions.length) return { total: 0, pending: 0, successful: 0, failed: 0 };
    
    const total = decisions.length;
    const pending = decisions.filter(d => d.status === "Pending").length;
    const successful = decisions.filter(d => d.status === "Successful").length;
    const failed = decisions.filter(d => d.status === "Failed").length;
    
    return { total, pending, successful, failed };
  }, [decisions]);

  // Filter and sort decisions
  const filteredDecisions = useMemo(() => {
    let filtered = [...decisions];
    
    // Apply tab filters first
    if (activeTab === "pending") {
      filtered = filtered.filter(d => d.status === "Pending");
    } else if (activeTab === "successful") {
      filtered = filtered.filter(d => d.status === "Successful");
    } else if (activeTab === "failed") {
      filtered = filtered.filter(d => d.status === "Failed");
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(d => d.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    
    // Apply time filter
    if (timeFilter) {
      const now = new Date();
      if (timeFilter === "last30days") {
        const thirtyDaysAgo = subMonths(now, 1);
        filtered = filtered.filter(d => isAfter(new Date(d.decisionDate), thirtyDaysAgo));
      } else if (timeFilter === "last3months") {
        const threeMonthsAgo = subMonths(now, 3);
        filtered = filtered.filter(d => isAfter(new Date(d.decisionDate), threeMonthsAgo));
      } else if (timeFilter === "last6months") {
        const sixMonthsAgo = subMonths(now, 6);
        filtered = filtered.filter(d => isAfter(new Date(d.decisionDate), sixMonthsAgo));
      }
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.title.toLowerCase().includes(query) || 
        d.why.toLowerCase().includes(query) ||
        (d.alternatives && d.alternatives.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.decisionDate).getTime() - new Date(a.decisionDate).getTime());
    } else {
      filtered.sort((a, b) => new Date(a.decisionDate).getTime() - new Date(b.decisionDate).getTime());
    }
    
    return filtered;
  }, [decisions, activeTab, categoryFilter, statusFilter, timeFilter, searchQuery, sortBy]);

  // Paginate decisions
  const totalPages = Math.ceil(filteredDecisions.length / decisionsPerPage);
  const currentDecisions = filteredDecisions.slice(
    (page - 1) * decisionsPerPage,
    page * decisionsPerPage
  );

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Strategy":
        return "bg-blue-100 text-blue-800";
      case "Marketing":
        return "bg-amber-100 text-amber-800";
      case "Operations":
        return "bg-purple-100 text-purple-800";
      case "Product":
        return "bg-green-100 text-green-800";
      case "Hiring":
        return "bg-indigo-100 text-indigo-800";
      case "Financial":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Successful":
        return "bg-green-100 text-green-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* Decision Metrics and Tabs */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-blue-700 font-medium mb-1">Total Decisions</p>
            <p className="text-2xl font-bold text-blue-800">{metrics.total}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
            <p className="text-sm text-amber-700 font-medium mb-1">Pending</p>
            <p className="text-2xl font-bold text-amber-800">{metrics.pending}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <p className="text-sm text-green-700 font-medium mb-1">Successful</p>
            <p className="text-2xl font-bold text-green-800">{metrics.successful}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <p className="text-sm text-red-700 font-medium mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-800">{metrics.failed}</p>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <TabsList className="h-10">
              <TabsTrigger value="all" className="text-sm px-4">
                All Decisions
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-sm px-4">
                Pending
              </TabsTrigger>
              <TabsTrigger value="successful" className="text-sm px-4">
                Successful
              </TabsTrigger>
              <TabsTrigger value="failed" className="text-sm px-4">
                Failed
              </TabsTrigger>
            </TabsList>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search decisions..."
                  className="pl-9 h-10 text-sm w-full sm:w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              
              <Button
                onClick={handleNewDecisionClick}
                variant="default"
                className="h-10 px-4 py-2 flex-shrink-0 flex items-center whitespace-nowrap"
              >
                <PlusIcon className="mr-2 h-4 w-4" /> New Decision
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Category Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 px-4 py-2 text-sm flex items-center">
                  <TagIcon className="h-4 w-4 mr-2" />
                  {categoryFilter || "Category"}
                  {categoryFilter && <span className="ml-1 text-xs">×</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-2">
                <div className="space-y-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm h-8" 
                    onClick={() => handleCategoryFilterChange("all")}
                  >
                    All Categories
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm h-8" 
                    onClick={() => handleCategoryFilterChange("Strategy")}
                  >
                    Strategy
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm h-8" 
                    onClick={() => handleCategoryFilterChange("Marketing")}
                  >
                    Marketing
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm h-8" 
                    onClick={() => handleCategoryFilterChange("Operations")}
                  >
                    Operations
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm h-8" 
                    onClick={() => handleCategoryFilterChange("Product")}
                  >
                    Product
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm h-8" 
                    onClick={() => handleCategoryFilterChange("Hiring")}
                  >
                    Hiring
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm h-8" 
                    onClick={() => handleCategoryFilterChange("Financial")}
                  >
                    Financial
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Time Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 px-4 py-2 text-sm flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {timeFilter === "last30days" 
                    ? "Last 30 Days" 
                    : timeFilter === "last3months" 
                      ? "Last 3 Months" 
                      : timeFilter === "last6months" 
                        ? "Last 6 Months" 
                        : "Time Period"}
                  {timeFilter && <span className="ml-1 text-xs">×</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-2">
                <div className="space-y-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm h-8" 
                    onClick={() => handleTimeFilterChange("all")}
                  >
                    All Time
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm h-8" 
                    onClick={() => handleTimeFilterChange("last30days")}
                  >
                    Last 30 Days
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm h-8" 
                    onClick={() => handleTimeFilterChange("last3months")}
                  >
                    Last 3 Months
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm h-8" 
                    onClick={() => handleTimeFilterChange("last6months")}
                  >
                    Last 6 Months
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Sort By */}
            <Select value={sortBy} onValueChange={handleSortByChange}>
              <SelectTrigger className="h-10 px-4 py-2 w-[130px] text-sm flex items-center">
                <SortAscIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Clear Filters */}
            {(categoryFilter || statusFilter || timeFilter || searchQuery) && (
              <Button 
                variant="ghost" 
                className="h-10 px-4 py-2 text-sm text-gray-500 flex items-center"
                onClick={() => {
                  setCategoryFilter(null);
                  setStatusFilter(null);
                  setTimeFilter(null);
                  setSearchQuery("");
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-4 mt-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : filteredDecisions.length === 0 ? (
        <div className="text-center py-10 mt-6 border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Decisions Found</h3>
          <p className="text-gray-500 mb-4">
            {decisions.length === 0 
              ? "Start logging your important decisions to track outcomes over time."
              : "Try adjusting your filters to see more results."}
          </p>
          {decisions.length === 0 && (
            <Button onClick={handleNewDecisionClick}>
              <PlusIcon className="mr-2 h-4 w-4" /> Log Your First Decision
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {currentDecisions.map((decision) => (
            <FeatureCard
              key={decision.id}
              title={decision.title}
              description={decision.why.length > 120 ? decision.why.substring(0, 120) + "..." : decision.why}
              status={decision.status}
              date={new Date(decision.decisionDate)}
              metadata={[
                { label: "Category", value: <StatusBadge status={decision.category} /> },
                ...(decision.followUpDate ? [{ 
                  label: "Follow-up", 
                  value: format(new Date(decision.followUpDate), "MMM d, yyyy") 
                }] : [])
              ]}
              actions={[
                {
                  label: "View",
                  onClick: () => {
                    if (onViewDetailsClick) onViewDetailsClick(decision);
                  },
                  icon: <EyeIcon className="h-4 w-4 mr-2" />,
                  variant: "ghost"
                },
                {
                  label: "Edit",
                  onClick: () => handleSelectDecision(decision),
                  icon: <EditIcon className="h-4 w-4 mr-2" />,
                  variant: "ghost"
                },
                ...(decision.status === "Pending" ? [
                  {
                    label: "Success",
                    onClick: () => updateStatusMutation.mutate(decision.id),
                    icon: <CheckCircleIcon className="h-4 w-4 mr-2" />,
                    variant: "outline"
                  },
                  {
                    label: "Failed",
                    onClick: () => markFailedMutation.mutate(decision.id),
                    icon: <XCircleIcon className="h-4 w-4 mr-2" />,
                    variant: "outline"
                  }
                ] : [])
              ]}
              className="cursor-pointer hover:border-gray-300 transition-colors"
              onClick={() => handleSelectDecision(decision)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DecisionList;