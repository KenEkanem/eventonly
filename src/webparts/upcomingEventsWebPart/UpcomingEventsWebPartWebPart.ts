import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';

import UpcomingEventsWebPart from './components/UpcomingEventsWebPart';
import { IUpcomingEventsWebPartProps } from './components/IUpcomingEventsWebPartProps';
import { IEvent } from './models/IEvent';
import { ICalendarSettings } from './models/ICalendarSettings';
import { defaultEvents } from './services/EventService';
import { ManageEventsPropertyPane } from './controls/ManageEventsPropertyPane';
import { GraphService, ICreateEventPayload, PublishingChannel } from '../../services/GraphService';

export interface IUpcomingEventsWebPartWebPartProps extends IUpcomingEventsWebPartProps {
}

const defaultCalendarSettings: ICalendarSettings = {
  showCalendar: true,
  theme: 'default',
  markerStyle: 'highlight',
  firstDayOfWeek: 0,
  showWeekNumbers: false,
  dateFormat: 'EEE, MMM d'
};

export default class UpcomingEventsWebPartWebPart extends BaseClientSideWebPart<IUpcomingEventsWebPartWebPartProps> {
  private graphClient?: MSGraphClientV3;
  private graphService?: GraphService;

  public render(): void {
    const currentUserEmail = (this.context.pageContext.user.email || '').trim().toLowerCase();
    const allowedEditors = (this.properties.authorizedEditors || '')
      .split(',')
      .map((email: string) => email.trim().toLowerCase())
      .filter((email: string) => !!email);
    const isEditor = !!currentUserEmail && allowedEditors.indexOf(currentUserEmail) > -1;

    if (this.graphClient) {
      this.graphService = new GraphService(
        this.graphClient,
        {
          clientId: this.properties.clientId,
          tenantId: this.properties.tenantId,
          objectId: this.properties.objectId
        }
      );
    }

    const element: React.ReactElement<IUpcomingEventsWebPartProps> = React.createElement(
      UpcomingEventsWebPart,
      {
        ...this.properties,
        currentUserEmail,
        isEditor,
        events: this.normalizeEvents(this.properties.events),
        onEventsChange: this.onEventsChange,
        onCreateEvent: this.onCreateEvent,
        calendarSettings: {
          ...defaultCalendarSettings,
          ...(this.properties.calendarSettings || {})
        }
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    if (!this.properties.bannerTitle) {
      this.properties.bannerTitle = 'Upcoming Events';
    }

    if (!this.properties.bannerDescription) {
      this.properties.bannerDescription = "Don't miss what's coming up next";
    }

    if (!this.properties.calendarPosition) {
      this.properties.calendarPosition = 'left';
    }

    if (this.properties.showEventCount === undefined) {
      this.properties.showEventCount = true;
    }

    if (this.properties.enableNigerianHolidays === undefined) {
      this.properties.enableNigerianHolidays = true;
    }

    this.properties.holidayBadgeText = this.properties.holidayBadgeText || 'Holiday';
    this.properties.holidayBadgeColor = this.properties.holidayBadgeColor || '#f59e0b';
    this.properties.holidayIconType = this.properties.holidayIconType || 'flag';

    if (this.properties.autoRefreshHolidays === undefined) {
      this.properties.autoRefreshHolidays = true;
    }

    this.properties.events = this.normalizeEvents(this.properties.events && this.properties.events.length > 0 ? this.properties.events : defaultEvents);

    this.properties.eventsToShow = this.properties.eventsToShow || 4;
    this.properties.showPastEvents = this.properties.showPastEvents ?? false;
    this.properties.sortOrder = this.properties.sortOrder || 'dateAsc';
    this.properties.cardLayout = this.properties.cardLayout || 'horizontal';
    this.properties.showEventImages = this.properties.showEventImages ?? true;
    this.properties.showDateMetadata = this.properties.showDateMetadata ?? true;
    this.properties.showTimeMetadata = this.properties.showTimeMetadata ?? true;
    this.properties.showLocationMetadata = this.properties.showLocationMetadata ?? true;
    this.properties.clientId = this.properties.clientId || '';
    this.properties.tenantId = this.properties.tenantId || '';
    this.properties.objectId = this.properties.objectId || '';
    this.properties.authorizedEditors = this.properties.authorizedEditors || '';
    this.properties.siteId = this.properties.siteId || '';
    this.properties.listId = this.properties.listId || '';
    this.properties.teamId = this.properties.teamId || '';
    this.properties.channelId = this.properties.channelId || '';
    this.properties.groupId = this.properties.groupId || '';
    this.properties.vivaCommunityId = this.properties.vivaCommunityId || '';
    this.properties.emailRecipients = this.properties.emailRecipients || '';

    this.properties.calendarSettings = {
      ...defaultCalendarSettings,
      ...(this.properties.calendarSettings || {})
    };

    this.graphClient = await this.context.msGraphClientFactory.getClient('3');

    return Promise.resolve();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: 'Configure your upcoming events experience'
          },
          groups: [
            {
              groupName: 'Header Settings',
              groupFields: [
                PropertyPaneTextField('bannerTitle', {
                  label: 'Banner title'
                }),
                PropertyPaneTextField('bannerDescription', {
                  label: 'Banner description',
                  multiline: true
                }),
                PropertyPaneToggle('showEventCount', {
                  label: 'Show event count badge'
                }),
                PropertyPaneDropdown('calendarPosition', {
                  label: 'Calendar position',
                  options: [
                    { key: 'left', text: 'left' },
                    { key: 'right', text: 'right' }
                  ]
                })
              ]
            },
            {
              groupName: 'Nigerian Holidays Settings',
              groupFields: [
                PropertyPaneToggle('enableNigerianHolidays', {
                  label: 'Enable Nigerian holidays'
                }),
                PropertyPaneTextField('holidayBadgeText', {
                  label: 'Holiday badge text'
                }),
                PropertyPaneTextField('holidayBadgeColor', {
                  label: 'Holiday badge color (hex)',
                  description: 'Example: #f59e0b'
                }),
                PropertyPaneDropdown('holidayIconType', {
                  label: 'Holiday icon type',
                  options: [
                    { key: 'flag', text: 'flag' },
                    { key: 'star', text: 'star' },
                    { key: 'calendar-star', text: 'calendar-star' }
                  ]
                }),
                PropertyPaneToggle('autoRefreshHolidays', {
                  label: 'Auto-refresh holidays annually'
                })
              ]
            },
            {
              groupName: 'Azure Configuration',
              groupFields: [
                PropertyPaneTextField('clientId', {
                  label: 'Application (Client) ID',
                  placeholder: 'e.g. a559d1e3-8495-460b-b473-c5cd4685748d',
                  description: 'Azure AD App Registration Client ID'
                }),
                PropertyPaneTextField('tenantId', {
                  label: 'Directory (Tenant) ID',
                  placeholder: 'e.g. df3fe24c-6910-4d06-b0e3-0a4af29be80f',
                  description: 'Azure AD Tenant ID'
                }),
                PropertyPaneTextField('objectId', {
                  label: 'Object ID',
                  placeholder: 'e.g. 9bb985be-aa24-4934-a3e7-ff9763caf560',
                  description: 'Azure AD App Object ID'
                }),
                PropertyPaneTextField('groupId', {
                  label: 'Teams Group ID',
                  description: 'For posting events to Teams calendar'
                }),
                PropertyPaneTextField('listId', {
                  label: 'SharePoint List ID',
                  description: 'For posting events to Intranet'
                }),
                PropertyPaneTextField('emailRecipients', {
                  label: 'Email Recipients (comma-separated)',
                  description: 'Emails to notify when an event is created'
                })
              ]
            },
            {
              groupName: 'Editor Access & Publishing Targets',
              groupFields: [
                PropertyPaneTextField('authorizedEditors', {
                  label: 'Authorized editors (comma-separated emails)',
                  multiline: true,
                  description: 'Only these users can add/edit/delete events.'
                }),
                PropertyPaneTextField('siteId', {
                  label: 'Intranet site ID'
                }),
                PropertyPaneTextField('teamId', {
                  label: 'Teams team ID'
                }),
                PropertyPaneTextField('channelId', {
                  label: 'Teams channel ID'
                }),
                PropertyPaneTextField('vivaCommunityId', {
                  label: 'Viva Engage community ID'
                })
              ]
            },
            {
              groupName: 'Manage Events',
              groupFields: [
                ManageEventsPropertyPane('events', {
                  key: 'manage-events-pane',
                  label: 'Add, edit, duplicate, reorder, or delete events',
                  events: this.normalizeEvents(this.properties.events),
                  onChange: (events: IEvent[]) => {
                    this.properties.events = this.normalizeEvents(events);
                    this.render();
                  }
                })
              ]
            },
            {
              groupName: 'Calendar Settings',
              groupFields: [
                PropertyPaneToggle('calendarSettings.showCalendar', {
                  label: 'Show calendar'
                }),
                PropertyPaneDropdown('calendarSettings.theme', {
                  label: 'Calendar theme',
                  options: [
                    { key: 'default', text: 'default' },
                    { key: 'minimal', text: 'minimal' },
                    { key: 'colorful', text: 'colorful' }
                  ]
                }),
                PropertyPaneDropdown('calendarSettings.markerStyle', {
                  label: 'Event marker style',
                  options: [
                    { key: 'dot', text: 'dot' },
                    { key: 'bold', text: 'bold' },
                    { key: 'highlight', text: 'highlight' }
                  ]
                }),
                PropertyPaneDropdown('calendarSettings.firstDayOfWeek', {
                  label: 'First day of week',
                  options: [
                    { key: 0, text: 'Sunday' },
                    { key: 1, text: 'Monday' }
                  ]
                }),
                PropertyPaneToggle('calendarSettings.showWeekNumbers', {
                  label: 'Show week numbers'
                }),
                PropertyPaneDropdown('calendarSettings.dateFormat', {
                  label: 'Date format',
                  options: [
                    { key: 'EEE, MMM d', text: 'Sun, Feb 15' },
                    { key: 'MMMM d, yyyy', text: 'February 15, 2026' },
                    { key: 'dd/MM/yyyy', text: '15/02/2026' }
                  ]
                })
              ]
            },
            {
              groupName: 'Display Settings',
              groupFields: [
                PropertyPaneSlider('eventsToShow', {
                  label: 'Events to show',
                  min: 1,
                  max: 20,
                  value: this.properties.eventsToShow
                }),
                PropertyPaneToggle('showPastEvents', {
                  label: 'Show past events'
                }),
                PropertyPaneDropdown('sortOrder', {
                  label: 'Default sort order',
                  options: [
                    { key: 'dateAsc', text: 'date ascending' },
                    { key: 'dateDesc', text: 'date descending' },
                    { key: 'custom', text: 'custom' }
                  ]
                }),
                PropertyPaneDropdown('cardLayout', {
                  label: 'Card layout',
                  options: [
                    { key: 'horizontal', text: 'horizontal' },
                    { key: 'vertical', text: 'vertical' }
                  ]
                }),
                PropertyPaneToggle('showEventImages', {
                  label: 'Show event images'
                }),
                PropertyPaneToggle('showDateMetadata', {
                  label: 'Show date metadata'
                }),
                PropertyPaneToggle('showTimeMetadata', {
                  label: 'Show time metadata'
                }),
                PropertyPaneToggle('showLocationMetadata', {
                  label: 'Show location metadata'
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private normalizeEvents(events: IEvent[] = []): IEvent[] {
    return events.map((event: IEvent, index: number) => ({
      ...event,
      date: event.date instanceof Date ? event.date : new Date(event.date),
      sortOrder: event.sortOrder ?? index
    }));
  }

  private readonly onEventsChange = (events: IEvent[]): void => {
    this.properties.events = this.normalizeEvents(events);
    this.render();
  };

  private readonly onCreateEvent = async (payload: ICreateEventPayload, channels: PublishingChannel[]): Promise<void> => {
    if (!this.graphService) {
      return;
    }

    await this.graphService.createEvent(payload, channels, {
      siteId: this.properties.siteId,
      listId: this.properties.listId,
      teamId: this.properties.teamId,
      channelId: this.properties.channelId,
      groupId: this.properties.groupId,
      vivaCommunityId: this.properties.vivaCommunityId,
      currentUserEmail: this.context.pageContext.user.email || '',
      emailRecipients: (this.properties.emailRecipients || '')
        .split(',')
        .map((email: string) => email.trim())
        .filter((email: string) => !!email)
    });
  };
}
