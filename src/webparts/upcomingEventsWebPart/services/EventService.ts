import { IEvent } from '../models/IEvent';

export const defaultEvents: IEvent[] = [
  {
    id: '1',
    title: 'Q1 2026 Town Hall Meeting',
    description: 'Quarterly business review and company updates',
    date: new Date('2026-02-15'),
    time: '10:00 AM',
    location: 'Main Conference Room / Teams',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
    imageAlt: 'Q1 2026 Town Hall Meeting',
    category: 'townhall',
    badgeText: 'townhall',
    badgeColorScheme: 'primary',
    iconType: 'users',
    detailPageUrl: '/sites/events/townhall-q1-2026',
    sortOrder: 1
  },
  {
    id: '2',
    title: 'February Birthday Celebration',
    description: 'Celebrating all February birthdays',
    date: new Date('2026-02-28'),
    time: '3:00 PM',
    location: 'Break Room',
    imageUrl: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84',
    imageAlt: 'February Birthday Celebration',
    category: 'celebration',
    badgeText: 'celebration',
    badgeColorScheme: 'accent',
    iconType: 'party-popper',
    sortOrder: 2
  },
  {
    id: '3',
    title: 'New Employee Orientation',
    description: 'Onboarding session for new team members',
    date: new Date('2026-03-05'),
    time: '9:00 AM',
    location: 'Training Room',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
    imageAlt: 'New Employee Orientation',
    category: 'training',
    badgeText: 'training',
    badgeColorScheme: 'secondary',
    iconType: 'trophy',
    sortOrder: 3
  },
  {
    id: '4',
    title: 'Team Building Activity',
    description: 'Quarterly team bonding and games',
    date: new Date('2026-03-20'),
    time: '2:00 PM',
    location: 'Outdoor Area',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac',
    imageAlt: 'Team Building Activity',
    category: 'social',
    badgeText: 'social',
    badgeColorScheme: 'muted',
    iconType: 'camera',
    sortOrder: 4
  }
];

export const getDefaultEvent = (index: number): IEvent => {
  return {
    id: `event-${Date.now()}-${index}`,
    title: 'New Event',
    description: '',
    date: new Date(),
    time: '10:00 AM',
    location: '',
    imageUrl: '',
    imageAlt: '',
    detailPageUrl: '',
    category: 'custom',
    badgeText: 'custom',
    badgeColorScheme: 'custom',
    iconType: 'calendar',
    sortOrder: index
  };
};
