import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Decision } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterIcon, EyeIcon, CheckCircleIcon, PlusIcon } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DecisionListProps {
  decisions: Decision[];
  isLoading: boolean;
  setSelectedDecision: (decision: Decision | null) => void;
  onNewDecisionClick?: () => void;
}

const DecisionList = ({ decisions, isLoading, setSelectedDecision, onNewDecisionClick }: DecisionListProps) => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
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

  const handleMarkSuccessful = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    updateStatusMutation.mutate(id);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value === "all" ? null : value);
    setPage(1);
  };

  const handleNewDecisionClick = () => {
    setSelectedDecision(null);
    if (onNewDecisionClick) {
      onNewDecisionClick();
    }
  };

  // Filter decisions
  const filteredDecisions = filter
    ? decisions.filter(decision => decision.category === filter)
    : decisions;

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Decisions</h2>
        <div>
          <Select onValueChange={handleFilterChange} defaultValue="all">
            <SelectTrigger className="w-[180px] h-9 text-sm mr-2 bg-white border border-gray-300">
              <FilterIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Strategy">Strategy</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="Product">Product</SelectItem>
              <SelectItem value="Hiring">Hiring</SelectItem>
              <SelectItem value="Financial">Financial</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleNewDecisionClick}
            className="bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium"
          >
            <PlusIcon className="mr-1 h-4 w-4" /> New Decision
          </Button>
        </div>
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
                  <button 
                    className="text-success hover:text-green-700 mr-3 font-medium transition-colors flex items-center text-sm"
                    onClick={(e) => handleMarkSuccessful(decision.id, e)}
                  >
                    <CheckCircleIcon className="mr-1 h-4 w-4" /> Mark as Successful
                  </button>
                )}
                <button className="text-gray-600 hover:text-primary font-medium transition-colors flex items-center text-sm">
                  <EyeIcon className="mr-1 h-4 w-4" /> View Details
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