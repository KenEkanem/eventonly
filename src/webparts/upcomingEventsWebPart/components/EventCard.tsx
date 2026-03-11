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
  Star,
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
    case 'star':
      return <Star className={iconClass} aria-hidden="true" />;
    case 'calendar-star':
      return <CalendarDays className={iconClass} aria-hidden="true" />;
    default:
      return <CalendarDays className={iconClass} aria-hidden="true" />;
  }
};

export const EventCard: React.FC<IEventCardProps> = (props: IEventCardProps) => {
  const [hovered, setHovered] = React.useState<boolean>(false);
  const cardClassMap: Record<IEvent['category'], string> = {
    townhall: styles.cardTownhall,
    celebration: styles.cardCelebration,
    training: styles.cardTraining,
    social: styles.cardSocial,
    holiday: styles.cardHoliday,
    quarterly: styles.cardQuarterly,
    custom: styles.cardCustom
  };
  const badgeClassMap: Record<IEvent['category'], string> = {
    townhall: styles.badgeTownhall,
    celebration: styles.badgeCelebration,
    training: styles.badgeTraining,
    social: styles.badgeSocial,
    holiday: styles.badgeHoliday,
    quarterly: styles.badgeQuarterly,
    custom: styles.badgeCustom
  };
  const cardClass = cardClassMap[props.event.category] || styles.cardCustom;
  const badgeClass = badgeClassMap[props.event.category] || styles.badgeCustom;
  const isHoliday = !!props.event.isHoliday || props.event.category === 'holiday';
  const isUserAdded = props.event.userAdded !== undefined ? props.event.userAdded : !isHoliday;
  const showActionControls = props.isEditor && isUserAdded;

  return (
    <div
      className={`${styles.eventCard} ${cardClass}`}
      aria-label={props.event.title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.cardThumbnail}>
        {props.showEventImages && props.event.imageUrl ? (
          <img
            src={props.event.imageUrl}
            alt={props.event.imageAlt || props.event.title}
            loading="lazy"
            className={styles.cardThumbnailImage}
          />
        ) : (
          <span className={styles.thumbnailFallback}>{resolveIcon(props.event.iconType)}</span>
        )}
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardTitleRow}>
          <h3 className={styles.cardTitle}>{props.event.title}</h3>
          <div className={styles.cardActions}>
            {showActionControls && (
              <div className={`${styles.actionButtons} ${hovered ? styles.actionButtonsVisible : styles.actionButtonsHidden}`}>
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
            {!showActionControls && (
              <span className={`${styles.typeBadge} ${badgeClass}`}>
                {props.event.badgeText || props.event.category}
              </span>
            )}
            {props.event.recurrence && props.event.recurrence !== 'none' && (
              <span className={styles.recurrenceTag}>{props.event.recurrence}</span>
            )}
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
  );
};
