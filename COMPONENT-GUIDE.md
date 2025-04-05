# Component Usage Guide for Digital Desk

This guide provides an overview of the reusable UI components in Digital Desk and how to use them effectively.

## State Handling Components

Digital Desk includes several components for handling different UI states consistently across the application.

### Loading States

The `LoadingState` component provides consistent loading indicators for various scenarios.

#### Usage:

```jsx
// Default spinner
<LoadingState />

// Custom count and variant
<LoadingState 
  itemCount={3} 
  variant="card" // 'default' | 'card' | 'list'
  className="my-custom-class" 
/>

// Card-specific skeleton (shorthand)
<CardsSkeleton count={4} />
```

### Empty States

The `EmptyState` component provides a consistent way to display when no data is available.

#### Usage:

```jsx
<EmptyState
  title="No items found"
  description="Try adjusting your filters or creating a new item"
  icon="info" // 'info' | 'tree' | 'warning' | 'check' or React node
  actionLabel="Create New"
  onAction={() => handleCreate()}
  className="my-custom-class"
/>
```

### Error States

The `ErrorState` component displays error messages with optional retry functionality.

#### Usage:

```jsx
<ErrorState
  title="Unable to load data"
  message="There was a problem connecting to the server"
  onRetry={() => refetch()}
  variant="destructive" // 'destructive' | 'default'
  className="my-custom-class"
/>

// Network-specific error (shorthand)
<NetworkError 
  message="Please check your internet connection"
  onRetry={() => refetch()}
/>
```

## Form Components

Digital Desk uses a combination of shadcn UI components and custom form elements.

### Form Wrapper

The `Form` component integrates with `react-hook-form` and handles validation.

#### Usage:

```jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { z } from "zod";

// Define validation schema
const formSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().optional(),
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  function onSubmit(values) {
    // Handle form submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Form fields go here */}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Common Form Field Patterns

#### Text Input

```jsx
<FormField
  control={form.control}
  name="title"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Title</FormLabel>
      <FormControl>
        <Input placeholder="Enter title..." {...field} />
      </FormControl>
      <FormDescription>
        The title of your item
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### Select Input

```jsx
<FormField
  control={form.control}
  name="priority"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Priority</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Card Components

Digital Desk uses various card components for displaying data in a consistent format.

### Basic Card

```jsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Interactive Card

```jsx
<Card className="hover:shadow-md transition-all">
  <CardHeader className="pb-2">
    <CardTitle className="flex justify-between items-center">
      <span>Item Title</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleEdit()}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDelete()}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardTitle>
    <CardDescription>{item.description}</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
</Card>
```

## Dialog Components

Digital Desk uses dialog components for modals, confirmations, and forms.

### Confirmation Dialog

```jsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Item</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete the item.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Form Dialog

```jsx
const [open, setOpen] = useState(false);

return (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button>Edit Profile</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>
          Make changes to your profile here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      {/* Form component here */}
      <DialogFooter>
        <Button type="submit" onClick={handleSubmit}>Save changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
```

## Best Practices

1. **Consistent Error Handling**
   - Use ErrorState components for all error states
   - Include retry functionality where applicable
   - Use toast notifications for transient errors

2. **Loading States**
   - Always show loading indicators during data fetching
   - Use appropriate loading variants for the content type
   - Maintain consistent layout during loading states

3. **Empty States**
   - Provide clear messaging for empty states
   - Include action options when appropriate
   - Use consistent styling across empty states

4. **Form Validation**
   - Always use Zod schemas for validation
   - Provide helpful error messages and descriptions
   - Include field descriptions for complex inputs
