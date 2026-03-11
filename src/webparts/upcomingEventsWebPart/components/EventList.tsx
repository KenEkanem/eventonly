import * as React from 'react';
import { IEvent } from '../models/IEvent';
import { EventCard } from './EventCard';
import styles from './UpcomingEventsWebPart.module.scss';
import { formatEventDate } from '../utils/dateHelpers';

export interface IEventListProps {
  events: IEvent[];
  isEditor: boolean;
  cardLayout: 'horizontal' | 'vertical';
  showEventImages: boolean;
  showDateMetadata: boolean;
  showTimeMetadata: boolean;
  showLocationMetadata: boolean;
  dateFormat: string;
  onEditEvent?: (event: IEvent) => void;
  onDeleteEvent?: (event: IEvent) => void;
}

export const EventList: React.FC<IEventListProps> = (props: IEventListProps) => {
  if (props.events.length === 0) {
    return <div className={styles.emptyState}>No upcoming events found for the selected criteria.</div>;
  }

  return (
    <div className={styles.eventList}>
      {props.events.map((event: IEvent) => (
        <EventCard
          key={event.id}
          event={event}
          isEditor={props.isEditor}
          cardLayout={props.cardLayout}
          showEventImages={props.showEventImages}
          showDateMetadata={props.showDateMetadata}
          showTimeMetadata={props.showTimeMetadata}
          showLocationMetadata={props.showLocationMetadata}
          dateLabel={formatEventDate(event.date, props.dateFormat)}
          onEditEvent={props.onEditEvent}
          onDeleteEvent={props.onDeleteEvent}
        />
      ))}
    </div>
  );
};
