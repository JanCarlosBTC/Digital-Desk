import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DemoModeToggle } from '@/components/demo/demo-mode-toggle';
import { useDemoStorage } from '@/context/demo-storage-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DemoPage: React.FC = () => {
  const [location, navigate] = useLocation();
  const { demoMode, insights, addInsight } = useDemoStorage();
  const [insightTitle, setInsightTitle] = React.useState('');
  const [insightDescription, setInsightDescription] = React.useState('');
  const [insightImpact, setInsightImpact] = React.useState<'High' | 'Medium' | 'Low'>('Medium');

  const handleAddInsight = () => {
    if (!insightTitle || !insightDescription) return;

    addInsight({
      title: insightTitle,
      description: insightDescription,
      impact: insightImpact,
      source: 'Demo',
      tags: ['demo', 'test'],
      status: 'New',
      appliedOn: null,
    });

    // Reset form
    setInsightTitle('');
    setInsightDescription('');
    setInsightImpact('Medium');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Demo Storage Example</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Demo Mode Settings</CardTitle>
              <CardDescription>
                Toggle demo mode to store data locally with a 4-hour expiration timer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DemoModeToggle />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-8">
          {demoMode ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Demo Insight</CardTitle>
                  <CardDescription>
                    Create a new insight that will be stored locally and expire after 4 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Insight Title</Label>
                      <Input
                        id="title"
                        value={insightTitle}
                        onChange={(e) => setInsightTitle(e.target.value)}
                        placeholder="Enter insight title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={insightDescription}
                        onChange={(e) => setInsightDescription(e.target.value)}
                        placeholder="Enter insight description"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="impact">Impact Level</Label>
                      <Select
                        value={insightImpact}
                        onValueChange={(value) => setInsightImpact(value as 'High' | 'Medium' | 'Low')}
                      >
                        <SelectTrigger id="impact">
                          <SelectValue placeholder="Select impact level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High Impact</SelectItem>
                          <SelectItem value="Medium">Medium Impact</SelectItem>
                          <SelectItem value="Low">Low Impact</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleAddInsight}>Add Insight</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Demo Insights</CardTitle>
                  <CardDescription>
                    These insights are stored locally and will expire after 4 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {insights.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No demo insights yet. Add one above!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {insights.map((insight) => (
                        <div key={insight.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{insight.title}</h3>
                              <p className="text-sm text-muted-foreground">{insight.description}</p>
                            </div>
                            <Badge impact={insight.impact} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Demo Mode is Off</CardTitle>
                <CardDescription>
                  Enable demo mode to see this example in action
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Demo mode allows you to store data locally for demonstration purposes.
                  The data will automatically expire after 4 hours to keep demos fresh.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Return to Home
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple Badge component to show impact level with appropriate colors
const Badge = ({ impact }: { impact: 'High' | 'Medium' | 'Low' }) => {
  const colorMap = {
    High: 'bg-red-100 text-red-800 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-green-100 text-green-800 border-green-200',
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${colorMap[impact]}`}>
      {impact}
    </span>
  );
};

export default DemoPage;