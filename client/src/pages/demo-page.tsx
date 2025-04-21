import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DemoModeToggle } from '@/components/demo/demo-mode-toggle';
import { useDemoStorage } from '@/context/demo-storage-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

const DemoPage: React.FC = () => {
  const [location, navigate] = useLocation();
  const { demoMode, offers, addOffer, insights, addInsight } = useDemoStorage();
  
  // State for offer form
  const [offerTitle, setOfferTitle] = React.useState('');
  const [offerDescription, setOfferDescription] = React.useState('');
  const [offerPrice, setOfferPrice] = React.useState('');
  const [offerCategory, setOfferCategory] = React.useState('Consulting');
  const [offerStatus, setOfferStatus] = React.useState<'Active' | 'Draft'>('Active');

  // State for insight form
  const [insightTitle, setInsightTitle] = React.useState('');
  const [insightDescription, setInsightDescription] = React.useState('');
  const [insightImpact, setInsightImpact] = React.useState<'High' | 'Medium' | 'Low'>('Medium');

  // No auto-populated sample data

  const handleAddOffer = () => {
    if (!offerTitle || !offerDescription || !offerPrice) return;

    addOffer({
      title: offerTitle,
      description: offerDescription,
      price: offerPrice,
      category: offerCategory,
      status: offerStatus,
      clientCount: 0,
      archivedAt: null
    });

    // Reset form
    setOfferTitle('');
    setOfferDescription('');
    setOfferPrice('');
    setOfferCategory('Consulting');
    setOfferStatus('Active');
  };

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

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
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
                  <CardTitle>Add Demo Offer</CardTitle>
                  <CardDescription>
                    Create a new offer that will be stored locally and expire after 4 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="offerTitle">Offer Title</Label>
                      <Input
                        id="offerTitle"
                        value={offerTitle}
                        onChange={(e) => setOfferTitle(e.target.value)}
                        placeholder="Enter offer title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="offerDescription">Description</Label>
                      <Textarea
                        id="offerDescription"
                        value={offerDescription}
                        onChange={(e) => setOfferDescription(e.target.value)}
                        placeholder="Enter offer description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="offerPrice">Price</Label>
                        <Input
                          id="offerPrice"
                          value={offerPrice}
                          onChange={(e) => setOfferPrice(e.target.value)}
                          placeholder="e.g. $1,500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="offerCategory">Category</Label>
                        <Select
                          value={offerCategory}
                          onValueChange={setOfferCategory}
                        >
                          <SelectTrigger id="offerCategory">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Consulting">Consulting</SelectItem>
                            <SelectItem value="Coaching">Coaching</SelectItem>
                            <SelectItem value="Workshop">Workshop</SelectItem>
                            <SelectItem value="Course">Course</SelectItem>
                            <SelectItem value="Digital">Digital Product</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="offerStatus">Status</Label>
                      <Select
                        value={offerStatus}
                        onValueChange={(value) => setOfferStatus(value as 'Active' | 'Draft')}
                      >
                        <SelectTrigger id="offerStatus">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleAddOffer}>Add Offer</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Demo Offers</CardTitle>
                  <CardDescription>
                    These offers are stored locally and will expire after 4 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {offers.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No demo offers yet. Add one above!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {offers.map((offer) => (
                        <div key={offer.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{offer.title}</h3>
                                <StatusBadge status={offer.status} />
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{offer.description}</p>
                              <div className="mt-2 flex items-center gap-3 text-sm">
                                <span className="font-medium">{offer.price}</span>
                                <span className="text-muted-foreground">•</span>
                                <span>{offer.category}</span>
                                {offer.clientCount > 0 && (
                                  <>
                                    <span className="text-muted-foreground">•</span>
                                    <span>{offer.clientCount} clients</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Created on {formatDate(offer.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Demo Insights</CardTitle>
                  <CardDescription>
                    Sample insights are also available in demo mode
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {insights.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No demo insights available
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
                            <ImpactBadge impact={insight.impact} />
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
                <p className="text-muted-foreground mt-2">
                  When enabled, you'll be able to:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                  <li>Create and view demo offers</li>
                  <li>Create and view demo insights</li>
                  <li>All data is stored locally in your browser</li>
                  <li>Data automatically expires after 4 hours</li>
                </ul>
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

// Badge components for status and impact
const StatusBadge = ({ status }: { status: string }) => {
  const colorMap: Record<string, string> = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Archived: 'bg-red-100 text-red-800 border-red-200',
  };
  
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${colorMap[status] || colorMap.Draft}`}>
      {status}
    </span>
  );
};

const ImpactBadge = ({ impact }: { impact: 'High' | 'Medium' | 'Low' }) => {
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