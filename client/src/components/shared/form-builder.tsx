/**
 * Form Builder Component
 * 
 * A standardized way to create forms across the application.
 * Automatically handles form state, validation, and submission.
 */

import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Path, FieldValues } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Field types for the form
type FieldType = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'custom';

// Base field props
interface BaseFieldProps {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  type: FieldType;
  className?: string;
}

// Text field props
interface TextFieldProps extends BaseFieldProps {
  type: 'text' | 'email' | 'password' | 'number';
}

// Textarea field props
interface TextareaFieldProps extends BaseFieldProps {
  type: 'textarea';
  rows?: number;
}

// Select field props
interface SelectFieldProps extends BaseFieldProps {
  type: 'select';
  options: Array<{ value: string; label: string }>;
}

// Checkbox field props
interface CheckboxFieldProps extends BaseFieldProps {
  type: 'checkbox';
  checkboxLabel?: string;
}

// Radio field props
interface RadioFieldProps extends BaseFieldProps {
  type: 'radio';
  options: Array<{ value: string; label: string }>;
}

// Custom field props
interface CustomFieldProps extends BaseFieldProps {
  type: 'custom';
  render: (props: { field: any; formState: any }) => React.ReactNode;
}

// All field types
type FieldProps = 
  | TextFieldProps 
  | TextareaFieldProps 
  | SelectFieldProps 
  | CheckboxFieldProps 
  | RadioFieldProps 
  | CustomFieldProps;

// Form builder props
interface FormBuilderProps<T extends z.ZodType<any, any>> {
  schema: T;
  onSubmit: (values: z.infer<T>) => Promise<boolean> | boolean;
  fields: FieldProps[];
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<z.infer<T>>;
  className?: string;
  extraFields?: React.ReactNode;
  submitButtonClassName?: string;
  cancelButtonClassName?: string;
}

export function FormBuilder<T extends z.ZodType<any, any>>({
  schema,
  onSubmit,
  fields,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  isSubmitting = false,
  defaultValues = {},
  className,
  extraFields,
  submitButtonClassName,
  cancelButtonClassName,
}: FormBuilderProps<T>) {
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Create form with zod resolver
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  });
  
  // Helper function to cast field name to Path<z.infer<T>>
  const castFieldName = (name: string) => name as Path<z.infer<T>>;

  // Handle form submission
  const handleSubmit = async (values: z.infer<T>) => {
    try {
      setFormSubmitting(true);
      const success = await onSubmit(values);
      if (!success) {
        setFormSubmitting(false);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setFormSubmitting(false);
    }
  };

  // Render field based on type
  const renderField = (field: FieldProps) => {
    const { name, label, description, placeholder, disabled, required } = field;
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <FormField
            key={name}
            control={form.control}
            name={castFieldName(name)}
            render={({ field: formField }) => (
              <FormItem className={field.className}>
                <FormLabel>
                  {label}
                  {required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    type={field.type}
                    placeholder={placeholder}
                    disabled={disabled || isSubmitting || formSubmitting}
                  />
                </FormControl>
                {description && <FormDescription>{description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'textarea':
        return (
          <FormField
            key={name}
            control={form.control}
            name={castFieldName(name)}
            render={({ field: formField }) => (
              <FormItem className={field.className}>
                <FormLabel>
                  {label}
                  {required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...formField}
                    placeholder={placeholder}
                    rows={(field as TextareaFieldProps).rows || 3}
                    disabled={disabled || isSubmitting || formSubmitting}
                  />
                </FormControl>
                {description && <FormDescription>{description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'select': {
        const selectField = field as SelectFieldProps;
        return (
          <FormField
            key={name}
            control={form.control}
            name={castFieldName(name)}
            render={({ field: formField }) => (
              <FormItem className={field.className}>
                <FormLabel>
                  {label}
                  {required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                  disabled={disabled || isSubmitting || formSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectField.options.map((option) => (
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
        
      case 'checkbox': {
        const checkboxField = field as CheckboxFieldProps;
        return (
          <FormField
            key={name}
            control={form.control}
            name={castFieldName(name)}
            render={({ field: formField }) => (
              <FormItem className={cn('flex flex-row items-start space-x-3 space-y-0', field.className)}>
                <FormControl>
                  <Checkbox
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                    disabled={disabled || isSubmitting || formSubmitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {checkboxField.checkboxLabel || label}
                    {required && <span className="text-destructive ml-1">*</span>}
                  </FormLabel>
                  {description && <FormDescription>{description}</FormDescription>}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }
        
      case 'radio': {
        const radioField = field as RadioFieldProps;
        return (
          <FormField
            key={name}
            control={form.control}
            name={castFieldName(name)}
            render={({ field: formField }) => (
              <FormItem className={field.className}>
                <FormLabel>
                  {label}
                  {required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={formField.onChange}
                    defaultValue={formField.value}
                    className="flex flex-col space-y-1"
                    disabled={disabled || isSubmitting || formSubmitting}
                  >
                    {radioField.options.map((option) => (
                      <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={option.value} />
                        </FormControl>
                        <FormLabel className="font-normal">{option.label}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                {description && <FormDescription>{description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }
        
      case 'custom': {
        const customField = field as CustomFieldProps;
        return (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={(props) => (
              <FormItem className={field.className}>
                <FormLabel>
                  {label}
                  {required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  {customField.render(props)}
                </FormControl>
                {description && <FormDescription>{description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }
        
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn('space-y-6', className)}
      >
        <div className="space-y-4">
          {fields.map(renderField)}
          {extraFields}
        </div>
        
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || formSubmitting}
              className={cancelButtonClassName}
            >
              {cancelText}
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={isSubmitting || formSubmitting}
            className={cn(
              submitButtonClassName,
              (isSubmitting || formSubmitting) && 'opacity-70 cursor-not-allowed'
            )}
          >
            {(isSubmitting || formSubmitting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default FormBuilder; 