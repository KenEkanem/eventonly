import * as React from 'react';
import {
  Briefcase,
  CalendarDays,
  Camera,
  Clock3,
  Pencil,
  Flag,
  MapPin,
  PartyPopper,
  Trash2,
  Trophy,
  Users
} from 'lucide-react';
import styles from './UpcomingEventsWebPart.module.scss';
import { IEvent } from '../models/IEvent';

export interface IEventCardProps {
  event: IEvent;
  showEventImages: boolean;
  showDateMetadata: boolean;
  showTimeMetadata: boolean;
  showLocationMetadata: boolean;
  dateLabel: string;
  isEditor: boolean;
  onEditEvent?: (event: IEvent) => void;
  onDeleteEvent?: (event: IEvent) => void;
}

const resolveIcon = (iconType: string): JSX.Element => {
  const iconClass = styles.thumbnailIcon;

  switch (iconType) {
    case 'users':
      return <Users className={iconClass} aria-hidden="true" />;
    case 'party-popper':
      return <PartyPopper className={iconClass} aria-hidden="true" />;
    case 'trophy':
      return <Trophy className={iconClass} aria-hidden="true" />;
    case 'camera':
      return <Camera className={iconClass} aria-hidden="true" />;
    case 'briefcase':
      return <Briefcase className={iconClass} aria-hidden="true" />;
    case 'flag':
      return <Flag className={iconClass} aria-hidden="true" />;
    case 'calendar-star':
      return <CalendarDays className={iconClass} aria-hidden="true" />;
    default:
      return <CalendarDays className={iconClass} aria-hidden="true" />;
  }
};

export const EventCard: React.FC<IEventCardProps> = (props: IEventCardProps) => {
  const badgeStyles: Record<IEvent['category'], string> = {
    holiday: styles.badgeHoliday,
    celebration: styles.badgeCelebration,
    townhall: styles.badgeTownhall,
    training: styles.badgeTraining,
    social: styles.badgeSocial,
    quarterly: styles.badgeQuarterly,
    custom: styles.badgeCustom
  };
  const eventType = props.event.category;
  const badgeClass = badgeStyles[eventType] || styles.badgeDefault;
  const isHoliday = !!props.event.isHoliday || props.event.category === 'holiday';
  const showActionControls = props.isEditor && !!props.event.userAdded;

  return (
    <div
      className={`${styles.eventCard} ${isHoliday ? styles.eventCardHoliday : styles.eventCardDefault}`}
      aria-label={props.event.title}
    >
      {props.showEventImages && props.event.imageUrl && (
        <div className={styles.cardThumbnail}>
          <img
            src={props.event.imageUrl}
            alt={props.event.imageAlt || props.event.title}
            loading="lazy"
            className={styles.cardThumbnailImage}
          />
        </div>
      )}

      <div className={`${styles.eventBody} ${showActionControls ? styles.eventBodyWithActions : ''}`}>
        <div className={styles.eventBodyRow}>
          <span className={styles.eventTypeIcon}>{resolveIcon(props.event.iconType)}</span>
          <div className={styles.eventBodyContent}>
            <div className={styles.cardTitleRow}>
              <h3 className={styles.cardTitle}>{props.event.title}</h3>
              <div className={styles.badgeSlot}>
                {props.event.recurrence && props.event.recurrence !== 'none' && (
                  <span className={styles.recurrenceTag}>{props.event.recurrence}</span>
                )}
                <span className={`${styles.typeBadge} ${badgeClass}`}>
                  {props.event.badgeText || eventType}
                </span>
              </div>
            </div>

            <p className={styles.cardDescription}>{props.event.description}</p>

            <div className={styles.cardMeta}>
              {props.showDateMetadata && (
                <span className={styles.metaBubble}><CalendarDays className={styles.metaIcon} aria-hidden="true" />{props.dateLabel}</span>
              )}
              {props.showTimeMetadata && (
                <span className={styles.metaBubble}><Clock3 className={styles.metaIcon} aria-hidden="true" />{props.event.time}</span>
              )}
              {props.showLocationMetadata && (
                <span className={styles.metaBubble}><MapPin className={styles.metaIcon} aria-hidden="true" />{props.event.location}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {showActionControls && (
        <div className={styles.cardActionsOverlay}>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.editButton}`}
            onClick={() => props.onEditEvent?.(props.event)}
            aria-label={`Edit ${props.event.title}`}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.deleteButton}`}
            onClick={() => props.onDeleteEvent?.(props.event)}
            aria-label={`Delete ${props.event.title}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
