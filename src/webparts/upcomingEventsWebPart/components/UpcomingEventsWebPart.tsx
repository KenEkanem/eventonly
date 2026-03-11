import * as React from 'react';
import { IUpcomingEventsWebPartProps } from './IUpcomingEventsWebPartProps';
import { EventCalendar } from './EventCalendar';
import { EventList } from './EventList';
import styles from './UpcomingEventsWebPart.module.scss';
import { IEvent } from '../models/IEvent';
import { HolidayService } from '../services/HolidayService';
import { filterEvents, normalizeEvents, sortEvents } from '../utils/eventHelpers';
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

const UpcomingEventsWebPart: React.FC<IUpcomingEventsWebPartProps> = (props: IUpcomingEventsWebPartProps) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [holidayEvents, setHolidayEvents] = React.useState<IEvent[]>([]);
  const [loadingHolidays, setLoadingHolidays] = React.useState<boolean>(false);
  const [holidayError, setHolidayError] = React.useState<string>('');

  const normalizedEvents = React.useMemo(() => normalizeEvents(props.events || []), [props.events]);

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
    const all = [...normalizedEvents, ...holidayEvents];
    return sortEvents(all, props.sortOrder);
  }, [normalizedEvents, holidayEvents, props.sortOrder]);

  const filteredEvents = React.useMemo(() => {
    return filterEvents(mergedEvents, selectedDate, props.showPastEvents, props.eventsToShow);
  }, [mergedEvents, selectedDate, props.showPastEvents, props.eventsToShow]);

  const body = (
    <section className={styles.upcomingEventsWebPart} aria-label="Upcoming events web part">
      <header className={styles.banner}>
        <div>
          <h2 className={styles.bannerTitle}>{props.bannerTitle}</h2>
          <p className={styles.bannerDescription}>{props.bannerDescription}</p>
        </div>
        {props.showEventCount && <span className={styles.countBadge}>{filteredEvents.length} events</span>}
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
            cardLayout={props.cardLayout}
            showEventImages={props.showEventImages}
            showDateMetadata={props.showDateMetadata}
            showTimeMetadata={props.showTimeMetadata}
            showLocationMetadata={props.showLocationMetadata}
            dateFormat={props.calendarSettings.dateFormat}
          />
        </div>
      </div>
    </section>
  );

  return <ErrorBoundary>{body}</ErrorBoundary>;
};

export default UpcomingEventsWebPart;
