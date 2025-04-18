import React, { useState, useMemo, useEffect, memo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { API_ENDPOINTS } from "@/lib/api-utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Decision } from "@shared/schema";
import { LoadingState } from "@/components/ui/loading-state";
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
  TagIcon,
  ChevronDownIcon,
  ChevronUpIcon 
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface DecisionListProps {
  decisions: Decision[];
  isLoading: boolean;
  setSelectedDecision: (decision: Decision | null) => void;
  onNewDecisionClick?: () => void;
  onViewDetailsClick?: (decision: Decision) => void;
}

// Type-safe function to get status color classes
function getStatusColorClasses(status: string): string {
  switch (status) {
    case "Successful":
      return "bg-green-100 text-green-800";
    case "Failed":
      return "bg-red-100 text-red-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
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
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);
  const decisionsPerPage = 5;

  // Define return type for status updates
  type StatusUpdateResponse = {
    id: number;
    status: string;
  };

  // Update decision status (mark as successful) with improved type safety
  const updateStatusMutation = useMutation<StatusUpdateResponse, Error, number>({
    mutationFn: async (id: number) => {
      return apiRequest<StatusUpdateResponse>(
        'PUT', 
        `${API_ENDPOINTS.DECISIONS}/${id}`, 
        { status: "Successful" }
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.DECISIONS] });
      
      toast({
        title: "Status updated",
        description: "Decision has been marked as successful.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating status",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update status to Failed with improved type safety
  const markFailedMutation = useMutation<StatusUpdateResponse, Error, number>({
    mutationFn: async (id: number) => {
      return apiRequest<StatusUpdateResponse>(
        'PUT', 
        `${API_ENDPOINTS.DECISIONS}/${id}`, 
        { status: "Failed" }
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.DECISIONS] });
      
      toast({
        title: "Status updated",
        description: "Decision has been marked as failed.",
        variant: "success", 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating status",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle events with proper typing
  const handleSelectDecision = useCallback((decision: Decision) => {
    setSelectedDecision(decision);
  }, [setSelectedDecision]);

  const handleViewDetails = useCallback((decision: Decision, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetailsClick) {
      onViewDetailsClick(decision);
    } else {
      setSelectedDecision(decision);
    }
  }, [onViewDetailsClick, setSelectedDecision]);

  const handleEditDecision = useCallback((decision: Decision, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDecision(decision);
  }, [setSelectedDecision]);

  const handleMarkSuccessful = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    updateStatusMutation.mutate(id);
  }, [updateStatusMutation]);

  const handleMarkFailed = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    markFailedMutation.mutate(id);
  }, [markFailedMutation]);

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

  // Reset all filters
  const resetFilters = () => {
    setCategoryFilter(null);
    setStatusFilter(null);
    setTimeFilter(null);
    setSearchQuery("");
    setPage(1);
    setActiveTab("all");
    setSortBy("newest");
    setIsFilterMobileOpen(false);
  };

  // Compute decision metrics
  const metrics = useMemo(() => {
    if (!decisions?.length) return { total: 0, pending: 0, successful: 0, failed: 0 };
    
    const total = decisions.length;
    const pending = decisions.filter(d => d.status === "Pending").length;
    const successful = decisions.filter(d => d.status === "Successful").length;
    const failed = decisions.filter(d => d.status === "Failed").length;
    
    return { total, pending, successful, failed };
  }, [decisions]);

  // Get unique categories for filter options
  const categories = useMemo(() => {
    if (!decisions?.length) return [];
    return Array.from(new Set(decisions.map(d => d.category))).filter(Boolean);
  }, [decisions]);

  // Filter and sort decisions
  const filteredDecisions = useMemo(() => {
    if (!decisions) return [];
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
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(d => 
        d.title.toLowerCase().includes(query) || 
        d.why.toLowerCase().includes(query) ||
        (d.expectedOutcome && d.expectedOutcome.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.decisionDate);
      const dateB = new Date(b.decisionDate);
      return sortBy === "newest" 
        ? dateB.getTime() - dateA.getTime() 
        : dateA.getTime() - dateB.getTime();
    });
    
    return filtered;
  }, [decisions, activeTab, categoryFilter, statusFilter, timeFilter, searchQuery, sortBy]);
  
  // Pagination
  const totalPages = Math.ceil(filteredDecisions.length / decisionsPerPage);
  const paginatedDecisions = useMemo(() => {
    const start = (page - 1) * decisionsPerPage;
    const end = start + decisionsPerPage;
    return filteredDecisions.slice(start, end);
  }, [filteredDecisions, page, decisionsPerPage]);

  // Responsive filter panel for mobile
  const MobileFilterPanel = () => (
    <Sheet open={isFilterMobileOpen} onOpenChange={setIsFilterMobileOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="md:hidden flex items-center gap-1"
          onClick={() => setIsFilterMobileOpen(true)}
        >
          <FilterIcon size={16} />
          <span>Filters</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85%] sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle>Filter Decisions</SheetTitle>
          <SheetDescription>
            Apply filters to narrow down your decisions
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <Select value={categoryFilter || "all"} onValueChange={handleCategoryFilterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent position="popper" className="bg-white shadow-lg" style={{zIndex: 1000}}>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select value={statusFilter || "all"} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent position="popper" className="bg-white shadow-lg" style={{zIndex: 1000}}>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Successful">Successful</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Time Period</label>
            <Select value={timeFilter || "all"} onValueChange={handleTimeFilterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent position="popper" className="bg-white shadow-lg" style={{zIndex: 1000}}>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last3months">Last 3 Months</SelectItem>
                <SelectItem value="last6months">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Sort By</label>
            <Select value={sortBy} onValueChange={handleSortByChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort Order" />
              </SelectTrigger>
              <SelectContent position="popper" className="bg-white shadow-lg" style={{zIndex: 1000}}>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4 flex gap-2">
            <Button variant="default" className="flex-1" onClick={() => setIsFilterMobileOpen(false)}>
              Apply Filters
            </Button>
            <Button variant="outline" className="flex-1" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-semibold">{metrics.total}</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="text-2xl font-semibold text-yellow-600">{metrics.pending}</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500">Successful</div>
          <div className="text-2xl font-semibold text-green-600">{metrics.successful}</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500">Failed</div>
          <div className="text-2xl font-semibold text-red-600">{metrics.failed}</div>
        </div>
      </div>
      
      {/* Tabs and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="successful">Successful</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:flex-none">
            <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          
          <Button
            onClick={handleNewDecisionClick}
            variant="default"
            size="sm"
            className="whitespace-nowrap"
          >
            <PlusIcon className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">New Decision</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>
      
      {/* Filter Row - Desktop */}
      <div className="hidden md:flex gap-3 flex-wrap">
        <Select value={categoryFilter || "all"} onValueChange={handleCategoryFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent position="popper" className="bg-white shadow-lg" style={{zIndex: 1000}}>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={timeFilter || "all"} onValueChange={handleTimeFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent position="popper" className="bg-white shadow-lg" style={{zIndex: 1000}}>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="last30days">Last 30 Days</SelectItem>
            <SelectItem value="last3months">Last 3 Months</SelectItem>
            <SelectItem value="last6months">Last 6 Months</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={handleSortByChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort Order" />
          </SelectTrigger>
          <SelectContent position="popper" className="bg-white shadow-lg" style={{zIndex: 1000}}>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
        
        {(categoryFilter || timeFilter || sortBy !== "newest" || statusFilter) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="text-gray-500"
          >
            Clear Filters
          </Button>
        )}
      </div>
      
      {/* Filter Row - Mobile */}
      <div className="md:hidden flex justify-between">
        <MobileFilterPanel />
        
        {(categoryFilter || timeFilter || sortBy !== "newest" || statusFilter || searchQuery) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="text-gray-500"
          >
            Clear
          </Button>
        )}
      </div>
      
      {/* Results count */}
      {!isLoading && (
        <div className="text-sm text-gray-500">
          Showing {filteredDecisions.length} {filteredDecisions.length === 1 ? 'decision' : 'decisions'}
        </div>
      )}
      
      {/* Decision List */}
      <LoadingState 
        variant="skeleton" 
        count={3} 
        height="h-32"
        isLoading={isLoading}
      >
        {filteredDecisions.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-gray-50">
            <p className="text-gray-500 mb-4">No decisions found matching your filters</p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedDecisions.map((decision) => (
              <div 
                key={decision.id} 
                className="border p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
                onClick={() => handleSelectDecision(decision)}
              >
                <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{decision.title}</h3>
                      <span 
                        className={`text-xs px-2 py-0.5 rounded-full ${getStatusColorClasses(decision.status)}`}
                      >
                        {decision.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 line-clamp-2 mb-2">{decision.why}</p>
                    
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {format(new Date(decision.decisionDate), 'MMM d, yyyy')}
                      </span>
                      
                      {decision.category && (
                        <span className="flex items-center">
                          <TagIcon className="h-3 w-3 mr-1" />
                          {decision.category}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex mt-2 sm:mt-0 justify-end sm:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 sm:w-8"
                      onClick={(e) => handleViewDetails(decision, e)}
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span className="ml-1 sm:hidden">View</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 sm:w-8"
                      onClick={(e) => handleEditDecision(decision, e)}
                    >
                      <EditIcon className="h-4 w-4" />
                      <span className="ml-1 sm:hidden">Edit</span>
                    </Button>
                    
                    {decision.status === "Pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 sm:w-8 text-green-600 hover:bg-green-50"
                          onClick={(e) => handleMarkSuccessful(decision.id, e)}
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          <span className="ml-1 sm:hidden">Success</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 sm:w-8 text-red-600 hover:bg-red-50"
                          onClick={(e) => handleMarkFailed(decision.id, e)}
                        >
                          <XCircleIcon className="h-4 w-4" />
                          <span className="ml-1 sm:hidden">Fail</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </LoadingState>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default memo(DecisionList);