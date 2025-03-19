import { format, parse, isValid, formatDistanceToNow } from "date-fns";

export const dateUtils = {
  format: (date: Date | string | null, formatStr = 'MMMM d, yyyy'): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isValid(dateObj) ? format(dateObj, formatStr) : '';
  },

  parse: (dateString: string, formatStr = 'yyyy-MM-dd'): Date | null => {
    try {
      const parsed = parse(dateString, formatStr, new Date());
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },

  formatRelative: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isValid(dateObj) ? formatDistanceToNow(dateObj, { addSuffix: true }) : '';
  },

  isValid: (date: Date | string | null): boolean => {
    if (!date) return false;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isValid(dateObj);
  },

  getMonthName: (month: number): string => {
    return format(new Date(2024, month - 1, 1), 'MMMM');
  },

  toISOString: (date: Date | string | null): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isValid(dateObj) ? dateObj.toISOString() : '';
  }
}; 