import { z } from 'zod';

const commonStringValidation = (fieldName: string) => 
  z.string()
    .min(3, `${fieldName} must be at least 3 characters`)
    .max(100, `${fieldName} must be less than 100 characters`)
    .transform(str => str.trim())
    .refine(str => !str.includes('  '), {
      message: `${fieldName} cannot contain multiple spaces`
    });

const commonDescriptionValidation = (fieldName: string) =>
  z.string()
    .min(10, `Please provide more detail for ${fieldName}`)
    .max(1000, `${fieldName} must be less than 1000 characters`)
    .transform(str => str.replace(/\s+/g, ' ').trim());

export const decisionFormSchema = z.object({
  title: commonStringValidation('Title'),
  description: commonDescriptionValidation('Description'),
  date: z.date()
    .min(new Date(), 'Date cannot be in the past')
    .refine(date => date <= new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), {
      message: 'Date cannot be more than 1 year in the future'
    }),
  status: z.enum(['pending', 'completed', 'cancelled']),
  tags: z.array(z.string().min(1, 'Tag cannot be empty')).optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
});

export const offerFormSchema = z.object({
  title: commonStringValidation('Title'),
  description: commonDescriptionValidation('Description'),
  price: z.number()
    .min(0, 'Price must be positive')
    .max(1000000, 'Price must be less than 1,000,000'),
  status: z.enum(['active', 'sold', 'archived']),
  category: z.string()
    .min(1, 'Category is required')
    .transform(str => str.trim()),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
});

export const reflectionFormSchema = z.object({
  type: z.enum(['weekly', 'monthly']),
  content: z.string()
    .min(10, 'Please provide more detail')
    .max(2000, 'Content must be less than 2000 characters')
    .transform(str => str.replace(/\s+/g, ' ').trim()),
  date: z.date()
    .min(new Date(), 'Date cannot be in the past')
    .refine(date => date <= new Date(), {
      message: 'Date cannot be in the future'
    }),
  mood: z.number()
    .min(1, 'Mood must be between 1 and 5')
    .max(5, 'Mood must be between 1 and 5'),
  tags: z.array(z.string().min(1, 'Tag cannot be empty')).optional(),
});

export const clarityFormSchema = z.object({
  title: commonStringValidation('Title'),
  content: commonDescriptionValidation('Content'),
  category: z.enum(['goals', 'values', 'vision']),
  priority: z.number()
    .min(1, 'Priority must be between 1 and 5')
    .max(5, 'Priority must be between 1 and 5'),
  status: z.enum(['active', 'completed', 'archived']),
});

export const thinkingDeskFormSchema = z.object({
  title: commonStringValidation('Title'),
  content: commonDescriptionValidation('Content'),
  category: z.enum(['ideas', 'tasks', 'notes']),
  priority: z.number()
    .min(1, 'Priority must be between 1 and 5')
    .max(5, 'Priority must be between 1 and 5'),
  status: z.enum(['active', 'completed', 'archived']),
  dueDate: z.date()
    .min(new Date(), 'Due date cannot be in the past')
    .refine(date => date <= new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), {
      message: 'Due date cannot be more than 1 year in the future'
    })
    .optional(),
}); 