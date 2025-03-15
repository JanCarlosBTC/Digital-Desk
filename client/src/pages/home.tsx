import { useQuery } from "@tanstack/react-query";
import ToolCard from "@/components/tool-card";
import { BrainIcon, ClipboardCheckIcon, ListChecksIcon, ArchiveIcon } from "lucide-react";
import { Activity, ActivityMetadata } from "@shared/schema";

const Home = () => {
  // Fetch recent activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  return (
    <section className="p-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to your Digital Desk</h1>
        <p className="text-gray-600 mt-2">Select a tool to get started with your productivity journey</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <ToolCard
          title="Thinking Desk"
          subtext="Organize your thoughts and ideas"
          description="A structured space for capturing ideas, solving problems, and planning initiatives."
          icon={BrainIcon}
          href="/thinking-desk"
          stats={{
            sections: 4,
            updatedText: "Updated 2h ago"
          }}
          color="primary"
        />

        <ToolCard
          title="Personal Clarity System"
          subtext="Track your progress and reflections"
          description="Review your journey with weekly reflections, monthly check-ins, and priority tracking."
          icon={ClipboardCheckIcon}
          href="/personal-clarity-system"
          stats={{
            sections: 3,
            updatedText: "Updated 1d ago"
          }}
          color="secondary"
        />

        <ToolCard
          title="Decision Log"
          subtext="Record and learn from your decisions"
          description="Document what you decided, why you made that choice, and what you'd do differently."
          icon={ListChecksIcon}
          href="/decision-log"
          stats={{
            entries: 12,
            updatedText: "Updated 3d ago"
          }}
          color="success"
        />

        <ToolCard
          title="Offer Vault"
          subtext="Refine your products and services"
          description="Store and iterate on your pricing, positioning, and product offerings over time."
          icon={ArchiveIcon}
          href="/offer-vault"
          stats={{
            entries: 5,
            updatedText: "Updated 1w ago"
          }}
          color="warning"
        />
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Recent Activity</h2>
        {activitiesLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start bg-white p-3 rounded-md shadow-sm animate-pulse">
                <div className="h-8 w-8 rounded-full bg-gray-200 mr-3 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <ul className="space-y-3">
            {activities.slice(0, 3).map((activity, index) => {
              const icons = {
                "add": "fas fa-plus",
                "edit": "fas fa-pencil-alt",
                "update": "fas fa-edit",
                "delete": "fas fa-trash-alt",
                "complete": "fas fa-check"
              };
              
              const colors = {
                "Thinking Desk": "bg-blue-100 text-primary",
                "Problem Tree": "bg-blue-100 text-primary",
                "Drafted Plan": "bg-blue-100 text-primary",
                "Clarity Lab": "bg-blue-100 text-primary",
                "Weekly Reflection": "bg-violet-100 text-secondary",
                "Monthly Check-in": "bg-violet-100 text-secondary",
                "Priority": "bg-violet-100 text-secondary",
                "Decision Log": "bg-green-100 text-success",
                "Offer": "bg-amber-100 text-warning"
              };

              const getIcon = () => {
                // Map entity types to specific icons
                const entityIcons = {
                  "Problem Tree": BrainIcon,
                  "Drafted Plan": BrainIcon,
                  "Clarity Lab": BrainIcon,
                  "Weekly Reflection": ClipboardCheckIcon,
                  "Monthly Check-in": ClipboardCheckIcon,
                  "Priority": ClipboardCheckIcon,
                  "Decision Log": ListChecksIcon,
                  "Offer": ArchiveIcon
                };
                
                // @ts-ignore - We know the entity type is in the map
                const Icon = entityIcons[activity.entityType] || BrainIcon;
                
                return (
                  <div className={`h-8 w-8 rounded-full ${colors[activity.entityType as keyof typeof colors] || "bg-blue-100 text-primary"} flex items-center justify-center mr-3 flex-shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                );
              };
              
              // Format the activity message based on type and entity
              const formatMessage = () => {
                const actionVerb = {
                  "add": "added",
                  "edit": "updated",
                  "update": "updated",
                  "delete": "deleted",
                  "complete": "completed",
                  "status_change": "updated the status of"
                };
                
                // Special handling for status changes to be more descriptive
                if (activity.type === "status_change" && activity.entityType === "Decision" && activity.metadata) {
                  const metadata = activity.metadata as ActivityMetadata;
                  return (
                    <p className="text-gray-700">
                      You changed the status of <span className="font-medium">{activity.entityName}</span> 
                      from <span className="text-gray-800 font-medium">{metadata.oldStatus}</span> to <span className="text-gray-800 font-medium">{metadata.newStatus}</span>
                    </p>
                  );
                }
                
                // For adding decisions with metadata
                if (activity.type === "add" && activity.entityType === "Decision" && activity.metadata) {
                  const metadata = activity.metadata as ActivityMetadata;
                  return (
                    <p className="text-gray-700">
                      You created a new decision <span className="font-medium">{activity.entityName}</span> with 
                      initial status <span className="text-gray-800 font-medium">{metadata.initialStatus || 'Unknown'}</span>
                    </p>
                  );
                }
                
                // For deleting decisions with metadata
                if (activity.type === "delete" && activity.entityType === "Decision" && activity.metadata) {
                  const metadata = activity.metadata as ActivityMetadata;
                  return (
                    <p className="text-gray-700">
                      You deleted the decision <span className="font-medium">{activity.entityName}</span> that had 
                      status <span className="text-gray-800 font-medium">{metadata.status}</span>
                    </p>
                  );
                }
                
                // Default case
                return (
                  <p className="text-gray-700">
                    You {actionVerb[activity.type as keyof typeof actionVerb] || activity.type} <span className="font-medium">{activity.entityName}</span>
                  </p>
                );
              };

              // Format the time ago
              const getTimeAgo = () => {
                const now = new Date();
                const activityTime = new Date(activity.createdAt);
                const diffMs = now.getTime() - activityTime.getTime();
                const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                
                if (diffHrs < 1) {
                  return "Just now";
                } else if (diffHrs < 24) {
                  return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
                } else {
                  const diffDays = Math.floor(diffHrs / 24);
                  if (diffDays === 1) return "Yesterday";
                  if (diffDays < 7) return `${diffDays} days ago`;
                  return activityTime.toLocaleDateString();
                }
              };

              return (
                <li key={activity.id || index} className="flex items-start bg-white p-3 rounded-md shadow-sm">
                  {getIcon()}
                  <div>
                    {formatMessage()}
                    <p className="text-sm text-gray-500">{getTimeAgo()}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-600 text-center py-4">No recent activities to display.</p>
        )}
      </div>
    </section>
  );
};

export default Home;
