import * as React from 'react';
import styles from './UpcomingEventsWebPart.module.scss';
import { EventRecurrence, EventType, ICreateEventPayload, PublishingChannel } from '../../../services/GraphService';

interface IEventFormState {
  title: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  type: EventType;
  recurrence: EventRecurrence;
  description: string;
  imageUrl: string;
  channels: PublishingChannel[];
}

export interface IAddEventModalProps {
  isOpen: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: ICreateEventPayload, channels: PublishingChannel[]) => Promise<void>;
}

const defaultFormState: IEventFormState = {
  title: '',
  date: '',
  time: '10:00 AM',
  endTime: '11:00 AM',
  location: 'Conference Room / Teams',
  type: 'townhall',
  recurrence: 'none',
  description: '',
  imageUrl: '',
  channels: ['intranet']
};

const toIsoDateTime = (date: string, timeValue: string): string => {
  const raw = (timeValue || '').trim().toUpperCase();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?:\s?(AM|PM))?$/);

  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const meridiem = match[3];

    if (meridiem === 'PM' && hour < 12) {
      hour += 12;
    }
    if (meridiem === 'AM' && hour === 12) {
      hour = 0;
    }

    const dateValue = new Date(`${date}T00:00:00`);
    dateValue.setHours(hour, minute, 0, 0);
    return dateValue.toISOString();
  }

  return new Date(`${date}T${timeValue}`).toISOString();
};

export const AddEventModal: React.FC<IAddEventModalProps> = (props: IAddEventModalProps) => {
  const [form, setForm] = React.useState<IEventFormState>(defaultFormState);
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    if (props.isOpen) {
      setForm(defaultFormState);
      setError('');
    }
  }, [props.isOpen]);

  if (!props.isOpen) {
    return null;
  }

  const toggleChannel = (channel: PublishingChannel): void => {
    setForm((current: IEventFormState) => ({
      ...current,
      channels:
        current.channels.indexOf(channel) > -1
          ? current.channels.filter((value: PublishingChannel) => value !== channel)
          : [...current.channels, channel]
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!form.date.trim()) {
      setError('Date is required.');
      return;
    }

    if (form.channels.length === 0) {
      setError('Select at least one publishing channel.');
      return;
    }

    try {
      await props.onSubmit(
        {
          title: form.title.trim(),
          description: form.description.trim(),
          startDateTime: toIsoDateTime(form.date, form.time),
          endDateTime: toIsoDateTime(form.date, form.endTime),
          location: form.location.trim() || 'Conference Room / Teams',
          type: form.type,
          recurrence: form.recurrence,
          imageUrl: form.imageUrl.trim()
        },
        form.channels
      );
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to create event. Check Graph permissions.';
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
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={styles.modalInput}
              placeholder="Event title"
              required
            />
          </label>

          <div className={styles.modalSplit}>
            <label className={styles.modalLabel}>
              Date
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={styles.modalInput}
                required
              />
            </label>
            <label className={styles.modalLabel}>
              Time
              <input
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className={styles.modalInput}
                placeholder="10:00 AM"
                required
              />
            </label>
          </div>

          <label className={styles.modalLabel}>
            End Time
            <input
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className={styles.modalInput}
              placeholder="11:00 AM"
              required
            />
          </label>

          <label className={styles.modalLabel}>
            Location
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={styles.modalInput}
            />
          </label>

          <div className={styles.modalSplit}>
            <label className={styles.modalLabel}>
              Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EventType })} className={styles.modalInput}>
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
              <select
                value={form.recurrence}
                onChange={(e) => setForm({ ...form, recurrence: e.target.value as EventRecurrence })}
                className={styles.modalInput}
              >
                <option value="none">none</option>
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="monthly">monthly</option>
              </select>
            </label>
          </div>

          <label className={styles.modalLabel}>
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={styles.modalTextarea}
              placeholder="Event description"
            />
          </label>

          <label className={styles.modalLabel}>
            Image URL (optional)
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className={styles.modalInput}
              placeholder="https://..."
            />
          </label>

          <fieldset className={styles.channelGroup}>
            <legend>Publishing Channels</legend>
            <label><input type="checkbox" checked={form.channels.indexOf('intranet') > -1} onChange={() => toggleChannel('intranet')} /> Intranet</label>
            <label><input type="checkbox" checked={form.channels.indexOf('teams') > -1} onChange={() => toggleChannel('teams')} /> Teams</label>
            <label><input type="checkbox" checked={form.channels.indexOf('vivaEngage') > -1} onChange={() => toggleChannel('vivaEngage')} /> Viva Engage</label>
            <label><input type="checkbox" checked={form.channels.indexOf('email') > -1} onChange={() => toggleChannel('email')} /> Email</label>
          </fieldset>

          <label className={styles.modalLabel}>
            Reminder
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
