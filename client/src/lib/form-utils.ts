import { useForm, UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useErrorHandler } from "./error-utils";

export function useFormWithValidation<T extends z.ZodType>(
  schema: T,
  options: Omit<UseFormProps<z.infer<T>>, 'resolver'> = {}
) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    ...options,
  });

  const handleError = useErrorHandler();

  const onSubmit = async (
    handler: (data: z.infer<T>) => Promise<void>,
    successMessage?: string
  ) => {
    try {
      await form.handleSubmit(handler)();
      if (successMessage) {
        // You can implement success toast here if needed
      }
    } catch (error) {
      handleError(error);
    }
  };

  return {
    ...form,
    onSubmit,
  };
}

export const formFieldErrorClass = 'border-destructive focus-visible:ring-destructive';

export function getFieldError(fieldName: string, form: ReturnType<typeof useForm>) {
  const error = form.formState.errors[fieldName];
  return error ? String(error.message) : undefined;
}

export function getFieldClassName(fieldName: string, form: ReturnType<typeof useForm>, baseClass = '') {
  const error = form.formState.errors[fieldName];
  return error ? `${baseClass} ${formFieldErrorClass}` : baseClass;
} 