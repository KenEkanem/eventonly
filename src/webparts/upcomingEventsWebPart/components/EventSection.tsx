import * as React from 'react';
import { addDays, endOfMonth, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { IEvent } from '../models/IEvent';

export interface IEventSectionProps {
  events: IEvent[];
}

const weekdayLabels: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getEventStatus = (event: IEvent): string => {
  if (event.isHoliday || event.category === 'holiday') {
    return 'Confirmed';
  }

  if (event.category === 'training' || event.category === 'custom') {
    return 'Pending';
  }

  return 'Confirmed';
};

const toDayKey = (value: Date): string => format(value, 'yyyy-MM-dd');

export const EventSection: React.FC<IEventSectionProps> = (props: IEventSectionProps) => {
  const [displayMonth, setDisplayMonth] = React.useState<Date>(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  const dayEventCount = React.useMemo(() => {
    const map: Record<string, number> = {};
    props.events.forEach((event: IEvent) => {
      const key = toDayKey(event.date);
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [props.events]);

  const gridDays = React.useMemo(() => {
    const monthStart = startOfMonth(displayMonth);
    const monthEnd = endOfMonth(displayMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const days: Date[] = [];

    let cursor = gridStart;
    while (days.length < 42) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
      if (cursor > monthEnd && days.length % 7 === 0 && days.length >= 35) {
        break;
      }
    }

    while (days.length < 42) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }

    return days;
  }, [displayMonth]);

  const buildDotIndexes = (count: number): number[] => {
    const size = Math.min(3, count);
    const indexes: number[] = [];
    for (let i = 0; i < size; i += 1) {
      indexes.push(i);
    }
    return indexes;
  };

  const filteredUpcoming = React.useMemo(() => {
    const base = props.events
      .slice()
      .sort((left: IEvent, right: IEvent) => left.date.getTime() - right.date.getTime());

    if (!selectedDate) {
      return base.slice(0, 7);
    }

    const sameDay = base.filter((event: IEvent) => isSameDay(event.date, selectedDate));
    return (sameDay.length > 0 ? sameDay : base).slice(0, 7);
  }, [props.events, selectedDate]);

  const goPrevMonth = (): void => {
    const next = new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1);
    setDisplayMonth(next);
  };

  const goNextMonth = (): void => {
    const next = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1);
    setDisplayMonth(next);
  };

  return (
    <section className="event-section-container" aria-label="Events section">
      <article className="event-section-calendar-card">
        <header className="event-section-calendar-header">
          <button
            type="button"
            className="event-section-nav-button"
            onClick={goPrevMonth}
            aria-label="Go to previous month"
          >
            ‹
          </button>
          <h3 className="event-section-calendar-title">{format(displayMonth, 'MMMM yyyy')}</h3>
          <button
            type="button"
            className="event-section-nav-button"
            onClick={goNextMonth}
            aria-label="Go to next month"
          >
            ›
          </button>
        </header>

        <div className="event-section-weekdays" aria-hidden="true">
          {weekdayLabels.map((weekday: string) => (
            <span key={weekday} className="event-section-weekday">{weekday}</span>
          ))}
        </div>

        <div className="event-section-date-grid">
          {gridDays.map((day: Date) => {
            const key = toDayKey(day);
            const count = dayEventCount[key] || 0;
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const isOtherMonth = !isSameMonth(day, displayMonth);

            return (
              <button
                type="button"
                key={key}
                className={[
                  'event-section-day-cell',
                  isSelected ? 'event-section-day-selected' : '',
                  !isSelected && isToday ? 'event-section-day-today' : '',
                  isOtherMonth ? 'event-section-day-other-month' : ''
                ].join(' ').trim()}
                aria-label={`Select ${format(day, 'EEEE, MMMM d, yyyy')}`}
                onClick={() => setSelectedDate(day)}
              >
                <span className="event-section-day-number">{format(day, 'd')}</span>
                {count > 0 && (
                  <span className="event-section-dots" aria-hidden="true">
                    {buildDotIndexes(count).map((index: number) => (
                      <span key={index} className="event-section-dot" />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </article>

      <article className="event-section-upcoming-card">
        <h3 className="event-section-upcoming-title">Upcoming Events</h3>
        <div className="event-section-upcoming-list">
          {filteredUpcoming.map((event: IEvent) => (
            <div key={event.id} className="event-section-item" tabIndex={0} role="article" aria-label={event.title}>
              <div className="event-section-date-badge">
                <span className="event-section-date-day">{format(event.date, 'd')}</span>
                <span className="event-section-date-month">{format(event.date, 'MMM')}</span>
              </div>

              <div className="event-section-item-content">
                <h4 className="event-section-item-title">{event.title}</h4>
                <p className="event-section-item-time">{event.time} - {event.time === 'All Day' ? 'All Day' : 'Scheduled'}</p>
                <p className="event-section-item-location">{event.location}</p>
              </div>

              <span className="event-section-status-pill">{getEventStatus(event)}</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
};
