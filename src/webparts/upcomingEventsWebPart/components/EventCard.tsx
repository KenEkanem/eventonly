import * as React from 'react';
import {
  Briefcase,
  CalendarDays,
  Camera,
  Clock3,
  Flag,
  MapPin,
  PartyPopper,
  Star,
  Trophy,
  Users
} from 'lucide-react';
import styles from './UpcomingEventsWebPart.module.scss';
import { IEvent } from '../models/IEvent';

export interface IEventCardProps {
  event: IEvent;
  cardLayout: 'horizontal' | 'vertical';
  showEventImages: boolean;
  showDateMetadata: boolean;
  showTimeMetadata: boolean;
  showLocationMetadata: boolean;
  dateLabel: string;
}

const resolveIcon = (iconType: string): JSX.Element => {
  const iconClass = styles.cardIcon;

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
  const categoryClassMap: Record<IEvent['category'], string> = {
    townhall: styles.categoryTownhall,
    celebration: styles.categoryCelebration,
    training: styles.categoryTraining,
    social: styles.categorySocial,
    holiday: styles.categoryHoliday,
    custom: styles.categoryCustom
  };
  const categoryClass = categoryClassMap[props.event.category] || styles.categoryCustom;

  return (
    <article className={`${styles.eventCard} ${styles[props.cardLayout]} ${categoryClass}`} aria-label={props.event.title}>
      {props.showEventImages && props.event.imageUrl && (
        <div className={styles.cardImageWrap}>
          <img
            src={props.event.imageUrl}
            alt={props.event.imageAlt || props.event.title}
            loading="lazy"
            className={styles.cardImage}
          />
        </div>
      )}
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <span className={styles.iconCircle}>{resolveIcon(props.event.iconType)}</span>
          <div className={styles.cardHeaderText}>
            <h3 className={styles.cardTitle}>{props.event.title}</h3>
            <p className={styles.cardDescription}>{props.event.description}</p>
          </div>
          <span className={styles.badge}>{props.event.badgeText}</span>
        </div>
        <div className={styles.metadataRow}>
          {props.showDateMetadata && (
            <span className={styles.metaPill}><CalendarDays className={styles.metaIcon} aria-hidden="true" />{props.dateLabel}</span>
          )}
          {props.showTimeMetadata && (
            <span className={styles.metaPill}><Clock3 className={styles.metaIcon} aria-hidden="true" />{props.event.time}</span>
          )}
          {props.showLocationMetadata && (
            <span className={styles.metaPill}><MapPin className={styles.metaIcon} aria-hidden="true" />{props.event.location}</span>
          )}
        </div>
        {props.event.detailPageUrl && (
          <a href={props.event.detailPageUrl} className={styles.detailLink}>
            View Details
          </a>
        )}
      </div>
    </article>
  );
};
