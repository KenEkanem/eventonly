export type EventCategory = 'townhall' | 'celebration' | 'training' | 'social' | 'holiday' | 'custom';
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
  isHoliday?: boolean;
  sortOrder?: number;
}
