export type EventCategory = 'townhall' | 'celebration' | 'training' | 'social' | 'holiday' | 'quarterly' | 'custom';
export type BadgeColorScheme = 'primary' | 'accent' | 'secondary' | 'muted' | 'custom';

export interface IEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  imageUrl?: string;
  imageAlt?: string;
  detailPageUrl?: string;
  category: EventCategory;
  badgeText: string;
  badgeColorScheme: BadgeColorScheme;
  iconType: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  isHoliday?: boolean;
  userAdded?: boolean;
  sortOrder?: number;
}
