import { format, isSameDay, parseISO } from 'date-fns';

export const normalizeToDate = (value: Date | string): Date => {
  if (value instanceof Date) {
    return value;
  }

  return parseISO(value);
};

export const formatEventDate = (value: Date, dateFormat: string): string => format(value, dateFormat || 'EEE, MMM d');

export const isDateMatch = (left: Date, right: Date): boolean => isSameDay(left, right);
