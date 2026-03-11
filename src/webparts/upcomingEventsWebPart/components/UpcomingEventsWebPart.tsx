import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react';
import { IUpcomingEventsWebPartProps } from './IUpcomingEventsWebPartProps';
import { EventSection } from './EventSection';
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
  const [userEvents, setUserEvents] = React.useState<IEvent[]>(normalizeEvents(props.events || []));
  const [holidayEvents, setHolidayEvents] = React.useState<IEvent[]>([]);
  const [loadingHolidays, setLoadingHolidays] = React.useState<boolean>(false);
  const [holidayError, setHolidayError] = React.useState<string>('');

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
    return filterEvents(mergedEvents, undefined, props.showPastEvents, props.eventsToShow);
  }, [mergedEvents, props.showPastEvents, props.eventsToShow]);

  const body = (
    <section className={styles.upcomingEventsWebPart} aria-label="Upcoming events web part">
      {loadingHolidays && <div className={styles.loadingState}>Loading Nigerian holidays...</div>}
      {holidayError && <div className={styles.warningState}>{holidayError}</div>}

      {props.isEditor && (!props.clientId || !props.tenantId) && (
        <MessageBar messageBarType={MessageBarType.warning}>
          Please configure Azure IDs in the webpart property pane to enable event management.
        </MessageBar>
      )}

      <EventSection events={filteredEvents} />
    </section>
  );

  return <ErrorBoundary>{body}</ErrorBoundary>;
};

export default UpcomingEventsWebPart;
