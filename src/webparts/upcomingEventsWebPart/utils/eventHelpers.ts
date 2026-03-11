import { isAfter, isSameDay, startOfDay } from 'date-fns';
import { IEvent } from '../models/IEvent';

export const normalizeEvents = (events: IEvent[] = []): IEvent[] => {
  return events.map((event: IEvent, index: number) => ({
    ...event,
    date: event.date instanceof Date ? event.date : new Date(event.date),
    sortOrder: event.sortOrder ?? index
  }));
};

export const sortEvents = (events: IEvent[], sortOrder: 'dateAsc' | 'dateDesc' | 'custom'): IEvent[] => {
  const cloned: IEvent[] = [...events];

  if (sortOrder === 'custom') {
    return cloned.sort((a: IEvent, b: IEvent) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }

  return cloned.sort((a: IEvent, b: IEvent) => {
    const left = a.date.getTime();
    const right = b.date.getTime();
    return sortOrder === 'dateAsc' ? left - right : right - left;
  });
};

export const filterEvents = (
  events: IEvent[],
  selectedDate?: Date,
  showPastEvents: boolean = false,
  maxEvents?: number
): IEvent[] => {
  const today = startOfDay(new Date());

  let filtered: IEvent[] = events.filter((event: IEvent) => {
    if (showPastEvents) {
      return true;
    }

    return isAfter(event.date, today) || isSameDay(event.date, today);
  });

  if (selectedDate) {
    filtered = filtered.filter((event: IEvent) => isSameDay(event.date, selectedDate));
  }

  if (typeof maxEvents === 'number' && maxEvents > 0) {
    filtered = filtered.slice(0, maxEvents);
  }

  return filtered;
};

export const compareDayEvents = (event: IEvent, day: Date): boolean => {
  return isSameDay(event.date, day);
};
