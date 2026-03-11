import * as React from 'react';
import styles from './UpcomingEventsWebPart.module.scss';
import { EventRecurrence, EventType, ICreateEventPayload, PublishingChannel } from '../../../services/GraphService';

export interface IAddEventModalProps {
  isOpen: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: ICreateEventPayload, channels: PublishingChannel[]) => Promise<void>;
}

const defaultStart = (): string => {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  return now.toISOString().slice(0, 16);
};

export const AddEventModal: React.FC<IAddEventModalProps> = (props: IAddEventModalProps) => {
  const [title, setTitle] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [startDateTime, setStartDateTime] = React.useState<string>(defaultStart());
  const [endDateTime, setEndDateTime] = React.useState<string>(defaultStart());
  const [location, setLocation] = React.useState<string>('Conference Room / Teams');
  const [type, setType] = React.useState<EventType>('townhall');
  const [recurrence, setRecurrence] = React.useState<EventRecurrence>('none');
  const [imageUrl, setImageUrl] = React.useState<string>('');
  const [channels, setChannels] = React.useState<PublishingChannel[]>(['intranet']);
  const [error, setError] = React.useState<string>('');

  if (!props.isOpen) {
    return null;
  }

  const toggleChannel = (channel: PublishingChannel): void => {
    setChannels((current: PublishingChannel[]) =>
      current.indexOf(channel) > -1 ? current.filter((item: PublishingChannel) => item !== channel) : [...current, channel]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!startDateTime || !endDateTime) {
      setError('Start and end date/time are required.');
      return;
    }

    if (channels.length === 0) {
      setError('Select at least one publishing channel.');
      return;
    }

    try {
      await props.onSubmit(
        {
          title: title.trim(),
          description: description.trim(),
          startDateTime: new Date(startDateTime).toISOString(),
          endDateTime: new Date(endDateTime).toISOString(),
          location: location.trim() || 'Conference Room / Teams',
          type,
          recurrence,
          imageUrl: imageUrl.trim()
        },
        channels
      );
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to create event.';
      setError(message);
    }
  };

  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Add new event">
      <form className={styles.modalPanel} onSubmit={handleSubmit}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Add New Event</h3>
          <button type="button" className={styles.modalClose} onClick={props.onClose} aria-label="Close add event modal">
            x
          </button>
        </div>

        <div className={styles.modalGrid}>
          <label className={styles.modalLabel}>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={styles.modalInput} required />
          </label>

          <div className={styles.modalSplit}>
            <label className={styles.modalLabel}>
              Start
              <input
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className={styles.modalInput}
                required
              />
            </label>
            <label className={styles.modalLabel}>
              End
              <input
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                className={styles.modalInput}
                required
              />
            </label>
          </div>

          <label className={styles.modalLabel}>
            Location
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={styles.modalInput} />
          </label>

          <div className={styles.modalSplit}>
            <label className={styles.modalLabel}>
              Type
              <select value={type} onChange={(e) => setType(e.target.value as EventType)} className={styles.modalInput}>
                <option value="townhall">townhall</option>
                <option value="celebration">celebration</option>
                <option value="holiday">holiday</option>
                <option value="quarterly">quarterly</option>
                <option value="training">training</option>
                <option value="social">social</option>
                <option value="custom">custom</option>
              </select>
            </label>
            <label className={styles.modalLabel}>
              Recurrence
              <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as EventRecurrence)} className={styles.modalInput}>
                <option value="none">none</option>
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="monthly">monthly</option>
              </select>
            </label>
          </div>

          <label className={styles.modalLabel}>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={styles.modalTextarea} />
          </label>

          <label className={styles.modalLabel}>
            Image URL (optional)
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={styles.modalInput} />
          </label>

          <fieldset className={styles.channelGroup}>
            <legend>Publishing channels</legend>
            <label><input type="checkbox" checked={channels.indexOf('intranet') > -1} onChange={() => toggleChannel('intranet')} /> Intranet</label>
            <label><input type="checkbox" checked={channels.indexOf('teams') > -1} onChange={() => toggleChannel('teams')} /> Teams</label>
            <label><input type="checkbox" checked={channels.indexOf('vivaEngage') > -1} onChange={() => toggleChannel('vivaEngage')} /> Viva Engage</label>
            <label><input type="checkbox" checked={channels.indexOf('email') > -1} onChange={() => toggleChannel('email')} /> Email</label>
          </fieldset>

          <label className={styles.modalLabel}>
            Reminder (Coming Soon)
            <select className={styles.modalInput} disabled>
              <option>Coming Soon</option>
            </select>
          </label>
        </div>

        {error && <div className={styles.warningState}>{error}</div>}

        <div className={styles.modalFooter}>
          <button type="button" className={styles.secondaryButton} onClick={props.onClose}>Cancel</button>
          <button type="submit" className={styles.primaryButton} disabled={props.busy}>
            {props.busy ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};
