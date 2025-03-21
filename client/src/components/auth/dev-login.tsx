import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export function DevLogin() {
  const [username, setUsername] = useState('demo');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      toast({
        title: 'Error',
        description: 'Username is required',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }
      
      const data = await response.json();
      console.log('Dev login successful', data);
      
      // Save the token to localStorage
      localStorage.setItem('authToken', data.token);
      
      // Show success toast
      toast({
        title: 'Success',
        description: 'Logged in successfully',
        variant: 'default'
      });
      
      // Redirect to home page
      navigate('/');
      
      // Reload the page to update auth state
      window.location.reload();
    } catch (error) {
      console.error('Dev login error:', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px] mx-auto mt-12">
      <CardHeader>
        <CardTitle>Developer Login</CardTitle>
        <CardDescription>Login with the demo account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                placeholder="Enter username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/login')}>
            Back to Login
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}