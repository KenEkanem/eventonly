import { ICalendarSettings } from '../models/ICalendarSettings';
import { IEvent } from '../models/IEvent';
import { ICreateEventPayload, PublishingChannel } from '../../../services/GraphService';

export interface IUpcomingEventsWebPartProps {
  bannerTitle: string;
  bannerDescription: string;
  showEventCount: boolean;
  calendarPosition: 'left' | 'right';
  enableNigerianHolidays: boolean;
  holidayBadgeText: string;
  holidayBadgeColor: string;
  holidayIconType: string;
  autoRefreshHolidays: boolean;
  events: IEvent[];
  eventsToShow: number;
  showPastEvents: boolean;
  sortOrder: 'dateAsc' | 'dateDesc' | 'custom';
  cardLayout: 'horizontal' | 'vertical';
  showEventImages: boolean;
  calendarSettings: ICalendarSettings;
  showDateMetadata: boolean;
  showTimeMetadata: boolean;
  showLocationMetadata: boolean;
  authorizedEditors: string;
  siteId: string;
  listId: string;
  teamId: string;
  channelId: string;
  groupId: string;
  vivaCommunityId: string;
  isEditor: boolean;
  currentUserEmail: string;
  onEventsChange?: (events: IEvent[]) => void;
  onCreateEvent?: (payload: ICreateEventPayload, channels: PublishingChannel[]) => Promise<void>;
}
