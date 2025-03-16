import React from 'react';
import { Calendar } from './calendar';
import { Checkbox } from './checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Textarea } from './textarea';
import { Button } from './button';
import { Input } from './input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from './form';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

// Re-export form components to centralize form element usage
export { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription };

interface TextFieldProps {
  form: any;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Standard text input field with consistent styling
 */
export function TextField({
  form,
  name,
  label,
  placeholder,
  description,
  disabled,
  className
}: TextFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder={placeholder}
              disabled={disabled}
              value={field.value || ''}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface TextAreaFieldProps extends TextFieldProps {
  rows?: number;
}

/**
 * Standard text area field with consistent styling
 */
export function TextAreaField({
  form,
  name,
  label,
  placeholder,
  description,
  disabled,
  rows = 3,
  className
}: TextAreaFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              value={field.value || ''}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface SelectFieldProps extends TextFieldProps {
  options: {
    value: string;
    label: string;
  }[];
}

/**
 * Standard select field with consistent styling
 */
export function SelectField({
  form,
  name,
  label,
  placeholder,
  description,
  disabled,
  options,
  className
}: SelectFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface DateFieldProps extends TextFieldProps {
  maxDate?: Date;
  minDate?: Date;
}

/**
 * Standard date picker field with consistent styling
 */
export function DateField({
  form,
  name,
  label,
  placeholder,
  description,
  disabled,
  maxDate,
  minDate,
  className
}: DateFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", className)}>
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={disabled}
                >
                  {field.value ? (
                    format(new Date(field.value), "PPP")
                  ) : (
                    <span>{placeholder || "Select a date"}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={field.onChange}
                disabled={(date) => {
                  const isDisabled = disabled || false;
                  const isTooEarly = minDate ? date < minDate : false;
                  const isTooLate = maxDate ? date > maxDate : false;
                  return isDisabled || isTooEarly || isTooLate;
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface CheckboxFieldProps {
  form: any;
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Standard checkbox field with consistent styling
 */
export function CheckboxField({
  form,
  name,
  label,
  description,
  disabled,
  className
}: CheckboxFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4", className)}>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
            </FormLabel>
            {description && (
              <FormDescription className="text-xs">
                {description}
              </FormDescription>
            )}
          </div>
        </FormItem>
      )}
    />
  );
}