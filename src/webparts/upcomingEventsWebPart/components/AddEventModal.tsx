import * as React from 'react';
import { Calendar, Loader2, X } from 'lucide-react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import styles from './UpcomingEventsWebPart.module.scss';

interface IAddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
  context: WebPartContext;
  siteId: string;
  listId: string;
  groupId: string;
  emailRecipients: string;
}

interface IModalFormState {
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  recurrence: string;
  description: string;
  imageUrl: string;
  channels: string[];
  reminder: string;
}

const convertTo24hr = (timeValue: string, addHours: number = 0): string => {
  const raw = (timeValue || '').trim().toUpperCase();
  const amPm = raw.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/);

  let hours: number;
  let minutes: number;

  if (amPm) {
    hours = parseInt(amPm[1], 10);
    minutes = parseInt(amPm[2], 10);
    const suffix = amPm[3];

    if (suffix === 'PM' && hours < 12) {
      hours += 12;
    }
    if (suffix === 'AM' && hours === 12) {
      hours = 0;
    }
  } else {
    const regular = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (!regular) {
      return '00:00';
    }
    hours = parseInt(regular[1], 10);
    minutes = parseInt(regular[2], 10);
  }

  const shifted = new Date();
  shifted.setHours(hours, minutes, 0, 0);
  shifted.setHours(shifted.getHours() + addHours);

  const hhRaw = String(shifted.getHours());
  const mmRaw = String(shifted.getMinutes());
  const hh = hhRaw.length === 1 ? `0${hhRaw}` : hhRaw;
  const mm = mmRaw.length === 1 ? `0${mmRaw}` : mmRaw;
  return `${hh}:${mm}`;
};

export const AddEventModal: React.FC<IAddEventModalProps> = (props: IAddEventModalProps) => {
  const [form, setForm] = React.useState<IModalFormState>({
    title: '',
    date: '',
    time: '10:00',
    location: 'Conference Room / Teams',
    type: 'townhall',
    recurrence: 'none',
    description: '',
    imageUrl: '',
    channels: ['intranet'],
    reminder: 'none'
  });
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (props.isOpen) {
      setForm({
        title: '',
        date: '',
        time: '10:00',
        location: 'Conference Room / Teams',
        type: 'townhall',
        recurrence: 'none',
        description: '',
        imageUrl: '',
        channels: ['intranet'],
        reminder: 'none'
      });
      setError(null);
    }
  }, [props.isOpen]);

  const update = (field: string, value: string): void =>
    setForm((prev: IModalFormState) => ({ ...prev, [field]: value }));

  const toggleChannel = (ch: string): void =>
    setForm((prev: IModalFormState) => ({
      ...prev,
      channels: prev.channels.indexOf(ch) > -1
        ? prev.channels.filter((c: string) => c !== ch)
        : [...prev.channels, ch]
    }));

  const handleCreateEvent = async (): Promise<void> => {
    if (!form.title || !form.date) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const graphClient = await props.context.msGraphClientFactory.getClient('3');
      const startDateTime = `${form.date}T${convertTo24hr(form.time)}:00`;
      const endDateTime = `${form.date}T${convertTo24hr(form.time, 1)}:00`;

      const payload = {
        subject: form.title,
        body: { contentType: 'HTML', content: form.description },
        start: { dateTime: startDateTime, timeZone: 'UTC' },
        end: { dateTime: endDateTime, timeZone: 'UTC' },
        location: { displayName: form.location },
        categories: [form.type]
      };

      if (form.channels.indexOf('intranet') > -1 && props.siteId && props.listId) {
        await graphClient
          .api(`/sites/${props.siteId}/lists/${props.listId}/items`)
          .post({
            fields: {
              Title: form.title,
              Description: form.description,
              EventDate: startDateTime,
              Location: form.location,
              EventType: form.type,
              Recurrence: form.recurrence,
              ImageUrl: form.imageUrl,
              UserAdded: true
            }
          });
      }

      if (form.channels.indexOf('teams') > -1 && props.groupId) {
        await graphClient.api(`/groups/${props.groupId}/calendar/events`).post(payload);
      }

      if (form.channels.indexOf('email') > -1) {
        await graphClient.api('/me/sendMail').post({
          message: {
            subject: `New Event: ${form.title}`,
            body: {
              contentType: 'HTML',
              content: `
                <h2>${form.title}</h2>
                <p>${form.description}</p>
                <p><strong>Date:</strong> ${form.date}</p>
                <p><strong>Time:</strong> ${form.time}</p>
                <p><strong>Location:</strong> ${form.location}</p>
              `
            },
            toRecipients: props.emailRecipients
              .split(',')
              .map((email: string) => email.trim())
              .filter((email: string) => !!email)
              .map((email: string) => ({
                emailAddress: { address: email }
              }))
          }
        });
      }

      props.onClose();
      props.onEventCreated();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create event. Check permissions.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!props.isOpen) {
    return null;
  }

  return (
    <div className={styles.modalRoot}>
      <div className={styles.modalBackdrop} onClick={props.onClose} />
      <div className={styles.modalPanel}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add New Event</h2>
          <button onClick={props.onClose} className={styles.modalClose} type="button" aria-label="Close modal">
            <X className={styles.modalCloseIcon} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Title</label>
            <input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Event title"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGrid2}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Date</label>
              <div className={styles.dateInputWrap}>
                <Calendar className={styles.dateIcon} />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => update('date', e.target.value)}
                  className={`${styles.formInput} ${styles.formInputWithIcon}`}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => update('time', e.target.value)}
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Location</label>
            <input
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="Conference Room / Teams"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGrid2}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Type</label>
              <select
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
                className={styles.formSelect}
              >
                {['townhall', 'celebration', 'holiday', 'training', 'social', 'quarterly'].map((type: string) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Recurrence</label>
              <select
                value={form.recurrence}
                onChange={(e) => update('recurrence', e.target.value)}
                className={styles.formSelect}
              >
                {['none', 'daily', 'weekly', 'monthly', 'yearly'].map((recurrence: string) => (
                  <option key={recurrence} value={recurrence}>{recurrence}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Event description"
              rows={3}
              className={styles.formTextarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Image URL <span className={styles.formLabelSub}>(optional)</span>
            </label>
            <input
              value={form.imageUrl}
              onChange={(e) => update('imageUrl', e.target.value)}
              placeholder="https://..."
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabelRow}>
              <label className={styles.formLabel}>Publishing Channels</label>
              <span className={styles.comingSoonBadge}>Coming Soon</span>
            </div>
            <div className={styles.channelsGrid}>
              {[
                { id: 'intranet', label: 'Intranet', enabled: true },
                { id: 'teams', label: 'Teams', enabled: false },
                { id: 'viva-engage', label: 'Viva Engage', enabled: false },
                { id: 'email', label: 'Email', enabled: false }
              ].map(({ id, label, enabled }: { id: string; label: string; enabled: boolean }) => (
                <label
                  key={id}
                  className={`${styles.channelLabel} ${!enabled ? styles.channelDisabled : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={form.channels.indexOf(id) > -1}
                    onChange={() => enabled && toggleChannel(id)}
                    disabled={!enabled}
                    className={styles.channelCheckbox}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabelRow}>
              <label className={styles.formLabelMuted}>Reminder</label>
              <span className={styles.comingSoonBadge}>Coming Soon</span>
            </div>
            <select disabled className={styles.formSelectDisabled}>
              <option>{form.reminder}</option>
            </select>
          </div>

          {error && (
            <p className={styles.errorBox}>{error}</p>
          )}

          <button
            onClick={handleCreateEvent}
            disabled={loading || !form.title || !form.date}
            className={styles.submitButton}
            type="button"
          >
            {loading
              ? <><Loader2 className={styles.spinnerIcon} /> Creating...</>
              : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  );
};
