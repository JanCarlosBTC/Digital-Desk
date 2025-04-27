import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/components/molecules/card.js';
import { Button } from '../../../shared/components/atoms/button.js';
import { CalendarIcon, EditIcon, TrashIcon } from 'lucide-react';

interface DecisionDetails {
  id: number;
  title: string;
  context: string;
  outcome: string;
  reasoning: string;
  stakeholders: string[];
  confidence: number;
  createdAt: string;
}

interface DecisionCardProps {
  decision: DecisionDetails;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

/**
 * Decision Card component for displaying decision log entries
 * 
 * @example
 * ```tsx
 * <DecisionCard 
 *   decision={decisionData} 
 *   onEdit={handleEdit} 
 *   onDelete={handleDelete} 
 * />
 * ```
 */
export function DecisionCard({ decision, onEdit, onDelete }: DecisionCardProps) {
  // Function to render confidence level indicator
  const renderConfidenceIndicator = (confidenceLevel: number) => {
    const level = Math.min(Math.max(confidenceLevel, 1), 5);
    const baseClasses = "h-2 w-2 rounded-full";
    
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs mr-2">Confidence:</span>
        {Array.from({ length: 5 }).map((_, index) => (
          <div 
            key={index}
            className={`${baseClasses} ${
              index < level 
                ? "bg-decision-log-primary" 
                : "bg-muted"
            }`}
          />
        ))}
      </div>
    );
  };
  
  return (
    <Card domain="decision-log">
      <CardHeader className="pb-2">
        <CardTitle>{decision.title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <CalendarIcon size={14} className="mr-1" />
          <span>{decision.createdAt}</span>
        </div>
        <div className="mt-2">
          {renderConfidenceIndicator(decision.confidence)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          <div>
            <h4 className="text-sm font-medium">Context:</h4>
            <p className="text-sm mt-1">{decision.context}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium">Outcome:</h4>
            <p className="text-sm mt-1">{decision.outcome}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium">Reasoning:</h4>
            <p className="text-sm mt-1">{decision.reasoning}</p>
          </div>
          
          {decision.stakeholders.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">Stakeholders:</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {decision.stakeholders.map((stakeholder, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-decision-log-secondary text-decision-log-accent"
                  >
                    {stakeholder}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            leadingIcon={<EditIcon size={16} />}
            onClick={() => onEdit(decision.id)}
          >
            Edit
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            leadingIcon={<TrashIcon size={16} />}
            onClick={() => onDelete(decision.id)}
            className="text-destructive hover:text-destructive"
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}