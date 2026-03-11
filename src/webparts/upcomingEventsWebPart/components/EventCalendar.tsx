import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay } from 'date-fns';
import styles from './UpcomingEventsWebPart.module.scss';
import { IEvent } from '../models/IEvent';
import { ICalendarSettings } from '../models/ICalendarSettings';

export interface IEventCalendarProps {
  events: IEvent[];
  selectedDate?: Date;
  calendarSettings: ICalendarSettings;
  onDateSelect: (date?: Date) => void;
}

export const EventCalendar: React.FC<IEventCalendarProps> = (props: IEventCalendarProps) => {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(props.selectedDate || new Date());
  const themeClass =
    props.calendarSettings.theme === 'minimal'
      ? styles.calendarThemeMinimal
      : props.calendarSettings.theme === 'colorful'
        ? styles.calendarThemeColorful
        : styles.calendarThemeDefault;

  const eventDates = React.useMemo((): Date[] => props.events.map((event: IEvent) => event.date), [props.events]);

  const dayEventCount = React.useCallback((date: Date): number => {
    return eventDates.filter((eventDate: Date) => isSameDay(eventDate, date)).length;
  }, [eventDates]);

  const modifiers = React.useMemo(() => ({
    hasEvent: (date: Date) => dayEventCount(date) > 0,
    hasMultipleEvents: (date: Date) => dayEventCount(date) > 1,
    today: (date: Date) => isSameDay(date, new Date())
  }), [dayEventCount]);

  return (
    <div className={`${styles.calendarContainer} ${themeClass}`}>
      <div className={styles.calendarHeader}>Event Calendar</div>
      <DayPicker
        mode="single"
        selected={props.selectedDate}
        onSelect={props.onDateSelect}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        weekStartsOn={props.calendarSettings.firstDayOfWeek}
        showWeekNumber={props.calendarSettings.showWeekNumbers}
        className={styles.dayPicker}
        modifiers={modifiers}
        modifiersClassNames={{
          hasEvent: props.calendarSettings.markerStyle === 'dot' ? styles.hasEventDot : props.calendarSettings.markerStyle === 'bold' ? styles.hasEventBold : styles.hasEventHighlight,
          hasMultipleEvents: styles.hasMultipleEvents,
          today: styles.today
        }}
      />
      <button
        type="button"
        className={styles.clearDateFilter}
        onClick={() => props.onDateSelect(undefined)}
        aria-label="Clear selected date"
      >
        Clear date filter
      </button>
      <div className={styles.calendarLegend}>
        <span className={styles.legendIndicator} />
        <span>Dates with scheduled events</span>
      </div>
      <div className={styles.calendarLegendSubtext}>Current month: {format(currentMonth, 'MMMM yyyy')}</div>
    </div>
  );
};
