import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  IPropertyPaneCustomFieldProps,
  IPropertyPaneField,
  PropertyPaneFieldType
} from '@microsoft/sp-property-pane';
import { IEvent, EventCategory, BadgeColorScheme } from '../models/IEvent';
import { getDefaultEvent } from '../services/EventService';

export interface IManageEventsPropertyPaneProps {
  key: string;
  label: string;
  events: IEvent[];
  onChange: (events: IEvent[]) => void;
}

interface IManageEventsPropertyPaneInternalProps extends IManageEventsPropertyPaneProps, IPropertyPaneCustomFieldProps {
}

const categoryOptions: EventCategory[] = ['townhall', 'celebration', 'training', 'social', 'custom'];
const badgeOptions: BadgeColorScheme[] = ['primary', 'accent', 'secondary', 'muted', 'custom'];
const iconOptions: string[] = ['users', 'party-popper', 'trophy', 'camera', 'calendar', 'briefcase', 'flag', 'star', 'calendar-star'];

const ManageEventsEditor: React.FC<IManageEventsPropertyPaneProps> = (props: IManageEventsPropertyPaneProps) => {
  const [events, setEvents] = React.useState<IEvent[]>(props.events || []);
  const toInputDate = (value: Date): string => {
    const validDate = value instanceof Date ? value : new Date(value as unknown as string);
    return new Date(validDate.getTime()).toISOString().slice(0, 10);
  };

  React.useEffect(() => {
    setEvents(props.events || []);
  }, [props.events]);

  const updateEvents = (next: IEvent[]): void => {
    setEvents(next);
    props.onChange(next);
  };

  const patchEvent = (index: number, patch: Partial<IEvent>): void => {
    const next = events.map((event: IEvent, currentIndex: number) => {
      if (currentIndex !== index) {
        return event;
      }

      return { ...event, ...patch };
    });

    updateEvents(next);
  };

  const addEvent = (): void => {
    const next = [...events, getDefaultEvent(events.length + 1)];
    updateEvents(next);
  };

  const deleteEvent = (index: number): void => {
    const next = events.filter((_event: IEvent, currentIndex: number) => currentIndex !== index)
      .map((event: IEvent, currentIndex: number) => ({ ...event, sortOrder: currentIndex }));
    updateEvents(next);
  };

  const duplicateEvent = (index: number): void => {
    const source = events[index];
    const duplicated: IEvent = {
      ...source,
      id: `${source.id}-copy-${Date.now()}`,
      title: `${source.title} (Copy)`,
      sortOrder: index + 1
    };

    const next = [...events.slice(0, index + 1), duplicated, ...events.slice(index + 1)]
      .map((event: IEvent, currentIndex: number) => ({ ...event, sortOrder: currentIndex }));
    updateEvents(next);
  };

  const moveEvent = (index: number, direction: -1 | 1): void => {
    const target = index + direction;
    if (target < 0 || target >= events.length) {
      return;
    }

    const next = [...events];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    updateEvents(next.map((event: IEvent, currentIndex: number) => ({ ...event, sortOrder: currentIndex })));
  };

  return (
    <div>
      <div style={{ marginBottom: '8px', fontWeight: 600 }}>{props.label}</div>
      <button type="button" onClick={addEvent}>+ Add Event</button>
      {events.map((event: IEvent, index: number) => (
        <details key={event.id} style={{ marginTop: '8px', border: '1px solid #ddd', padding: '8px', borderRadius: '4px' }}>
          <summary>{event.title || `Event ${index + 1}`}</summary>
          <div style={{ display: 'grid', gap: '6px', marginTop: '8px' }}>
            <div>
              <label>Title</label>
              <input type="text" value={event.title || ''} onChange={(e) => patchEvent(index, { title: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label>Description</label>
              <textarea value={event.description || ''} onChange={(e) => patchEvent(index, { description: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label>Date</label>
              <input
                type="date"
                value={toInputDate(event.date)}
                onChange={(e) => patchEvent(index, { date: new Date(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label>Time</label>
              <input type="text" value={event.time || ''} onChange={(e) => patchEvent(index, { time: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label>Location</label>
              <input type="text" value={event.location || ''} onChange={(e) => patchEvent(index, { location: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label>Image URL</label>
              <input type="url" value={event.imageUrl || ''} onChange={(e) => patchEvent(index, { imageUrl: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label>Image Alt Text</label>
              <input type="text" value={event.imageAlt || ''} onChange={(e) => patchEvent(index, { imageAlt: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label>Detail Page Link</label>
              <input type="url" value={event.detailPageUrl || ''} onChange={(e) => patchEvent(index, { detailPageUrl: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label>Category</label>
              <select
                value={event.category}
                onChange={(e) => patchEvent(index, {
                  category: e.target.value as EventCategory,
                  badgeText: e.target.value
                })}
                style={{ width: '100%' }}
              >
                {categoryOptions.map((option: EventCategory) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Badge Text</label>
              <input type="text" value={event.badgeText || ''} onChange={(e) => patchEvent(index, { badgeText: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label>Badge Color Scheme</label>
              <select
                value={event.badgeColorScheme}
                onChange={(e) => patchEvent(index, { badgeColorScheme: e.target.value as BadgeColorScheme })}
                style={{ width: '100%' }}
              >
                {badgeOptions.map((option: BadgeColorScheme) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Icon</label>
              <select
                value={event.iconType}
                onChange={(e) => patchEvent(index, { iconType: e.target.value })}
                style={{ width: '100%' }}
              >
                {iconOptions.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {event.imageUrl && (
              <div>
                <img src={event.imageUrl} alt={event.imageAlt || event.title} style={{ width: '100%', maxHeight: '120px', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => moveEvent(index, -1)} disabled={index === 0}>Move Up</button>
              <button type="button" onClick={() => moveEvent(index, 1)} disabled={index === events.length - 1}>Move Down</button>
              <button type="button" onClick={() => duplicateEvent(index)}>Duplicate</button>
              <button type="button" onClick={() => deleteEvent(index)}>Delete</button>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
};

class ManageEventsPropertyPaneBuilder implements IPropertyPaneField<IManageEventsPropertyPaneInternalProps> {
  public type = PropertyPaneFieldType.Custom;
  public targetProperty: string;
  public properties: IManageEventsPropertyPaneInternalProps;

  constructor(targetProperty: string, properties: IManageEventsPropertyPaneProps) {
    this.targetProperty = targetProperty;
    this.properties = {
      ...properties,
      key: properties.key,
      onRender: this.onRender,
      onDispose: this.onDispose
    };
  }

  private onRender = (elem: HTMLElement): void => {
    ReactDom.render(
      React.createElement(ManageEventsEditor, {
        key: this.properties.key,
        label: this.properties.label,
        events: this.properties.events,
        onChange: this.properties.onChange
      }),
      elem
    );
  };

  private onDispose = (elem: HTMLElement): void => {
    ReactDom.unmountComponentAtNode(elem);
  };
}

export const ManageEventsPropertyPane = (
  targetProperty: string,
  properties: IManageEventsPropertyPaneProps
): IPropertyPaneField<IManageEventsPropertyPaneInternalProps> => {
  return new ManageEventsPropertyPaneBuilder(targetProperty, properties);
};
