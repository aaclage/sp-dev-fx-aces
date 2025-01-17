import endOfDay from 'date-fns/endOfDay';
import parseISO from 'date-fns/parseISO';

import { Event } from '@microsoft/microsoft-graph-types';
import { BaseComponentContext } from '@microsoft/sp-component-base';

export class Services {
  private _context: BaseComponentContext = undefined;
  private _msGraphClient = undefined;
  constructor(context: BaseComponentContext) {
    this._context = context;
  }
  public init = async  () => {
    this._msGraphClient = await this._context.msGraphClientFactory.getClient();
  }

  public getTimeZone = async ():Promise<string> => {
    try {
      if (!this._msGraphClient) return;
      const results = await this._msGraphClient.api(`/me/mailboxSettings/timezone`).get();
      return results.value;
    } catch (error) {
      throw error;
    }
  }

  public getEvents = async (eventsDate:string):Promise<Event[]> => {
    try {
      if (!this._msGraphClient) return;
      const startDate = eventsDate  || new Date().toISOString();
      const endDate =   endOfDay( parseISO(eventsDate) ?? new Date()  ).toISOString();
      const timeZone = await this.getTimeZone();
      const eventsResults  = await this._msGraphClient.api(`me/events`,{Headers: {'prefer': `outlook.timezone="${timeZone}"`}})
      .select("subject,body,bodyPreview,organizer,attendees,start,end,location, id")
      .filter(`start/dateTime ge '${startDate}' and start/dateTime le '${endDate}'`)
      .orderby("start/dateTime")
      .get();
      return  eventsResults.value;
    } catch (error) {
      throw error;
    }
  }
}
