import { MSGraphClientV3 } from '@microsoft/sp-http';

export type PublishingChannel = 'intranet' | 'teams' | 'vivaEngage' | 'email';
export type EventType = 'townhall' | 'celebration' | 'holiday' | 'quarterly' | 'training' | 'social' | 'custom';
export type EventRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface IWebpartConfig {
  siteId?: string;
  listId?: string;
  teamId?: string;
  channelId?: string;
  groupId?: string;
  vivaCommunityId?: string;
  currentUserEmail?: string;
}

export interface ICreateEventPayload {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  type: EventType;
  recurrence: EventRecurrence;
  imageUrl?: string;
}

interface IGraphCalendarEventPayload {
  subject: string;
  body: {
    contentType: 'HTML';
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: 'UTC';
  };
  end: {
    dateTime: string;
    timeZone: 'UTC';
  };
  location: {
    displayName: string;
  };
  extensions: Array<{
    extensionName: 'com.company.eventType';
    eventType: EventType;
  }>;
}

export class GraphService {
  constructor(private readonly client: MSGraphClientV3) {}

  public async createEvent(payload: ICreateEventPayload, channels: PublishingChannel[], config: IWebpartConfig): Promise<void[]> {
    const graphPayload = this.toGraphEventPayload(payload);
    const tasks: Array<Promise<void>> = [];

    if (channels.indexOf('intranet') > -1) {
      tasks.push(this.postToSharePointList(graphPayload, config.siteId, config.listId));
    }

    if (channels.indexOf('teams') > -1) {
      tasks.push(this.postToTeamsMessage(graphPayload, config.teamId, config.channelId));
      tasks.push(this.postToTeamsCalendar(graphPayload, config.groupId));
    }

    if (channels.indexOf('vivaEngage') > -1) {
      tasks.push(this.postToVivaEngage(graphPayload, config.vivaCommunityId));
    }

    if (channels.indexOf('email') > -1) {
      tasks.push(this.sendEmailInvite(graphPayload, config.currentUserEmail));
    }

    return Promise.all(tasks);
  }

  private toGraphEventPayload(payload: ICreateEventPayload): IGraphCalendarEventPayload {
    return {
      subject: payload.title,
      body: {
        contentType: 'HTML',
        content: payload.description
      },
      start: {
        dateTime: payload.startDateTime,
        timeZone: 'UTC'
      },
      end: {
        dateTime: payload.endDateTime,
        timeZone: 'UTC'
      },
      location: {
        displayName: payload.location
      },
      extensions: [
        {
          extensionName: 'com.company.eventType',
          eventType: payload.type
        }
      ]
    };
  }

  private async postToSharePointList(payload: IGraphCalendarEventPayload, siteId?: string, listId?: string): Promise<void> {
    if (!siteId || !listId) {
      return;
    }

    await this.client.api(`/sites/${siteId}/lists/${listId}/items`).post({
      fields: {
        Title: payload.subject,
        Description: payload.body.content,
        Location: payload.location.displayName,
        StartDateTime: payload.start.dateTime,
        EndDateTime: payload.end.dateTime,
        EventType: payload.extensions[0].eventType
      }
    });
  }

  private async postToTeamsMessage(payload: IGraphCalendarEventPayload, teamId?: string, channelId?: string): Promise<void> {
    if (!teamId || !channelId) {
      return;
    }

    await this.client.api(`/teams/${teamId}/channels/${channelId}/messages`).post({
      body: {
        contentType: 'html',
        content: `<strong>${payload.subject}</strong><br/>${payload.body.content}<br/><em>${payload.location.displayName}</em>`
      }
    });
  }

  private async postToTeamsCalendar(payload: IGraphCalendarEventPayload, groupId?: string): Promise<void> {
    if (!groupId) {
      return;
    }

    await this.client.api(`/groups/${groupId}/calendar/events`).post(payload);
  }

  private async postToVivaEngage(payload: IGraphCalendarEventPayload, communityId?: string): Promise<void> {
    if (!communityId) {
      return;
    }

    await this.client.api(`/employeeExperience/communities/${communityId}/messages`).version('beta').post({
      body: {
        contentType: 'html',
        content: `<strong>${payload.subject}</strong><br/>${payload.body.content}`
      }
    });
  }

  private async sendEmailInvite(payload: IGraphCalendarEventPayload, currentUserEmail?: string): Promise<void> {
    if (!currentUserEmail) {
      return;
    }

    await this.client.api('/me/sendMail').post({
      message: {
        subject: `Event: ${payload.subject}`,
        body: {
          contentType: 'HTML',
          content: `<h3>${payload.subject}</h3>${payload.body.content}<p><strong>Location:</strong> ${payload.location.displayName}</p><p><strong>Start:</strong> ${payload.start.dateTime} UTC</p><p><strong>End:</strong> ${payload.end.dateTime} UTC</p>`
        },
        toRecipients: [
          {
            emailAddress: {
              address: currentUserEmail
            }
          }
        ]
      },
      saveToSentItems: true
    });
  }
}
