import * as React from 'react';
import { IUpcomingEventsWebPartProps } from './IUpcomingEventsWebPartProps';
import { EventCalendar } from './EventCalendar';
import { EventList } from './EventList';
import { AddEventModal } from './AddEventModal';
import styles from './UpcomingEventsWebPart.module.scss';
import { IEvent } from '../models/IEvent';
import { HolidayService } from '../services/HolidayService';
import { filterEvents, normalizeEvents, sortEvents } from '../utils/eventHelpers';
import { ICreateEventPayload, PublishingChannel } from '../../../services/GraphService';
import 'react-day-picker/dist/style.css';

interface IErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, IErrorBoundaryState> {
  public state: IErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): IErrorBoundaryState {
    return { hasError: true };
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return <div className={styles.errorState}>Something went wrong while rendering events.</div>;
    }

    return this.props.children;
  }
}

const iconByType: Record<string, string> = {
  townhall: 'users',
  celebration: 'party-popper',
  training: 'trophy',
  social: 'camera',
  quarterly: 'briefcase',
  holiday: 'flag',
  custom: 'calendar'
};

const UpcomingEventsWebPart: React.FC<IUpcomingEventsWebPartProps> = (props: IUpcomingEventsWebPartProps) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [userEvents, setUserEvents] = React.useState<IEvent[]>(normalizeEvents(props.events || []));
  const [holidayEvents, setHolidayEvents] = React.useState<IEvent[]>([]);
  const [loadingHolidays, setLoadingHolidays] = React.useState<boolean>(false);
  const [holidayError, setHolidayError] = React.useState<string>('');
  const [showAddModal, setShowAddModal] = React.useState<boolean>(false);
  const [creatingEvent, setCreatingEvent] = React.useState<boolean>(false);

  React.useEffect(() => {
    setUserEvents(normalizeEvents(props.events || []));
  }, [props.events]);

  React.useEffect(() => {
    let mounted = true;

    const fetchHolidays = async (): Promise<void> => {
      if (!props.enableNigerianHolidays) {
        setHolidayEvents([]);
        setHolidayError('');
        return;
      }

      setLoadingHolidays(true);
      setHolidayError('');

      const year = new Date().getFullYear();
      const holidays = await HolidayService.getNigerianHolidays(year, props.autoRefreshHolidays);

      if (!mounted) {
        return;
      }

      if (holidays.length === 0) {
        setHolidayError('Holiday feed is unavailable right now.');
      }

      const converted = HolidayService.convertHolidaysToEvents(
        holidays,
        props.holidayBadgeText,
        props.holidayBadgeColor,
        props.holidayIconType
      );
      setHolidayEvents(converted);
      setLoadingHolidays(false);
    };

    fetchHolidays().catch(() => {
      if (mounted) {
        setHolidayEvents([]);
        setLoadingHolidays(false);
        setHolidayError('Holiday feed is unavailable right now.');
      }
    });

    return () => {
      mounted = false;
    };
  }, [
    props.enableNigerianHolidays,
    props.autoRefreshHolidays,
    props.holidayBadgeText,
    props.holidayBadgeColor,
    props.holidayIconType
  ]);

  const mergedEvents = React.useMemo(() => {
    const all = [...userEvents, ...holidayEvents];
    return sortEvents(all, props.sortOrder);
  }, [userEvents, holidayEvents, props.sortOrder]);

  const filteredEvents = React.useMemo(() => {
    return filterEvents(mergedEvents, selectedDate, props.showPastEvents, props.eventsToShow);
  }, [mergedEvents, selectedDate, props.showPastEvents, props.eventsToShow]);

  const persistEvents = React.useCallback((next: IEvent[]) => {
    const normalized = normalizeEvents(next);
    setUserEvents(normalized);
    props.onEventsChange?.(normalized);
  }, [props.onEventsChange]);

  const handleDeleteEvent = React.useCallback((event: IEvent) => {
    if (event.isHoliday || event.category === 'holiday') {
      return;
    }

    persistEvents(userEvents.filter((item: IEvent) => item.id !== event.id));
  }, [persistEvents, userEvents]);

  const handleEditEvent = React.useCallback((event: IEvent) => {
    if (event.isHoliday || event.category === 'holiday') {
      return;
    }

    const nextTitle = window.prompt('Edit event title', event.title);
    if (nextTitle === null) {
      return;
    }

    const nextDescription = window.prompt('Edit event description', event.description || '');
    if (nextDescription === null) {
      return;
    }

    persistEvents(
      userEvents.map((item: IEvent) => (
        item.id === event.id
          ? { ...item, title: nextTitle.trim() || item.title, description: nextDescription.trim() }
          : item
      ))
    );
  }, [persistEvents, userEvents]);

  const handleCreateEvent = React.useCallback(async (payload: ICreateEventPayload, channels: PublishingChannel[]): Promise<void> => {
    setCreatingEvent(true);
    try {
      await props.onCreateEvent?.(payload, channels);

      const startDate = new Date(payload.startDateTime);
      const localEvent: IEvent = {
        id: `event-${Date.now()}`,
        title: payload.title,
        description: payload.description,
        date: startDate,
        time: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: payload.location,
        imageUrl: payload.imageUrl || '',
        imageAlt: payload.title,
        category: payload.type,
        badgeText: payload.type,
        badgeColorScheme: payload.type === 'holiday' ? 'accent' : 'primary',
        iconType: iconByType[payload.type] || 'calendar',
        userAdded: true,
        sortOrder: userEvents.length
      };

      persistEvents([...userEvents, localEvent]);
      setShowAddModal(false);
    } finally {
      setCreatingEvent(false);
    }
  }, [persistEvents, props, userEvents]);

  const body = (
    <section className={styles.upcomingEventsWebPart} aria-label="Upcoming events web part">
      <header className={styles.banner}>
        <div>
          <h2 className={styles.bannerTitle}>{props.bannerTitle}</h2>
          <p className={styles.bannerDescription}>{props.bannerDescription}</p>
        </div>
        <div className={styles.bannerActions}>
          {props.showEventCount && <span className={styles.countBadge}>{filteredEvents.length} events</span>}
          {props.isEditor && (
            <button type="button" className={styles.primaryButton} onClick={() => setShowAddModal(true)}>
              + Add Event
            </button>
          )}
        </div>
      </header>

      {loadingHolidays && <div className={styles.loadingState}>Loading Nigerian holidays...</div>}
      {holidayError && <div className={styles.warningState}>{holidayError}</div>}

      <div className={`${styles.mainGrid} ${props.calendarPosition === 'right' ? styles.calendarRight : styles.calendarLeft}`}>
        {props.calendarSettings.showCalendar && (
          <div className={styles.calendarPane}>
            <EventCalendar
              events={mergedEvents}
              selectedDate={selectedDate}
              calendarSettings={props.calendarSettings}
              onDateSelect={setSelectedDate}
            />
          </div>
        )}

        <div className={styles.listPane}>
          <EventList
            events={filteredEvents}
            isEditor={props.isEditor}
            cardLayout={props.cardLayout}
            showEventImages={props.showEventImages}
            showDateMetadata={props.showDateMetadata}
            showTimeMetadata={props.showTimeMetadata}
            showLocationMetadata={props.showLocationMetadata}
            dateFormat={props.calendarSettings.dateFormat}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        </div>
      </div>
      {props.isEditor && (
        <AddEventModal
          isOpen={showAddModal}
          busy={creatingEvent}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateEvent}
        />
      )}
    </section>
  );

  return <ErrorBoundary>{body}</ErrorBoundary>;
};

export default UpcomingEventsWebPart;
