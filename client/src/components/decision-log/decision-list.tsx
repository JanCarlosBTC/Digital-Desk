import { useState, useMemo, useEffect } from "react";
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
            
            <div className="flex gap-2 items-center">
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
                className="bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium h-10"
              >
                <PlusIcon className="mr-1 h-4 w-4" /> New Decision
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Category Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 px-3 text-sm">
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
                <Button variant="outline" className="h-9 px-3 text-sm">
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
              <SelectTrigger className="h-9 w-[130px] text-sm">
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
                className="h-9 px-3 text-sm text-gray-500"
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
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : currentDecisions.length > 0 ? (
        <div className="space-y-4">
          {currentDecisions.map((decision) => (
            <div 
              key={decision.id} 
              className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSelectDecision(decision)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded mb-2 inline-block ${
                    decision.status === "Failed"
                      ? "bg-red-100 text-red-800"
                      : decision.status === "Successful"
                        ? "bg-green-100 text-green-800"
                        : getCategoryColor(decision.category)
                  }`}>
                    {decision.status === "Pending" ? decision.category : decision.status}
                  </span>
                  <h3 className="font-medium text-lg">{decision.title}</h3>
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(decision.decisionDate), "MMMM d, yyyy")}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <h4 className="font-medium text-gray-700 text-sm mb-1">What was decided</h4>
                  <p className="text-gray-600">{decision.title}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 text-sm mb-1">Why</h4>
                  <p className="text-gray-600">{decision.why.length > 100 
                    ? `${decision.why.substring(0, 100)}...` 
                    : decision.why}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 text-sm mb-1">
                    {decision.status === "Failed" ? "What I'd do differently" : "Alternatives considered"}
                  </h4>
                  <p className="text-gray-600">
                    {decision.status === "Failed" && decision.whatDifferent
                      ? decision.whatDifferent
                      : decision.alternatives || "None specified"}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-end">
                {decision.status === "Pending" && (
                  <>
                    <button 
                      className="text-success hover:text-green-700 mr-3 font-medium transition-colors flex items-center text-sm"
                      onClick={(e) => handleMarkSuccessful(decision.id, e)}
                    >
                      <CheckCircleIcon className="mr-1 h-4 w-4" /> Mark as Successful
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-700 mr-3 font-medium transition-colors flex items-center text-sm"
                      onClick={(e) => handleMarkFailed(decision.id, e)}
                    >
                      <XCircleIcon className="mr-1 h-4 w-4" /> Mark as Failed
                    </button>
                  </>
                )}
                <button 
                  className="text-gray-600 hover:text-primary font-medium transition-colors flex items-center text-sm mr-3"
                  onClick={(e) => handleViewDetails(decision, e)}
                >
                  <EyeIcon className="mr-1 h-4 w-4" /> View Details
                </button>
                <button 
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center text-sm"
                  onClick={(e) => handleEditDecision(decision, e)}
                >
                  <EditIcon className="mr-1 h-4 w-4" /> Edit
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button 
                className="text-gray-600 hover:text-primary font-medium disabled:opacity-50 transition-colors flex items-center" 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <span className="mr-1">←</span> Previous
              </button>
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{(page - 1) * decisionsPerPage + 1}-{Math.min(page * decisionsPerPage, filteredDecisions.length)}</span> of <span className="font-medium">{filteredDecisions.length}</span> decisions
              </div>
              <button 
                className="text-gray-600 hover:text-primary font-medium disabled:opacity-50 transition-colors flex items-center" 
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next <span className="ml-1">→</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Decisions Logged Yet</h3>
          <p className="text-gray-500 mb-4">Start documenting your important decisions.</p>
          <Button
            onClick={() => setSelectedDecision(null)}
            variant="outline"
            className="border-success text-success hover:bg-green-50 font-medium"
          >
            Log Your First Decision
          </Button>
        </div>
      )}
    </div>
  );
};

export default DecisionList;