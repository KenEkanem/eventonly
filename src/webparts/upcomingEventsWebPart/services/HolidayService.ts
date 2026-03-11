import axios from 'axios';
import { IEvent } from '../models/IEvent';
import { INigerianHoliday } from '../models/INigerianHoliday';

const STORAGE_PREFIX = 'upcoming-events-ng-holidays-';

interface IStoredHolidayPayload {
  fetchedAt: string;
  data: INigerianHoliday[];
}

export class HolidayService {
  private static cachedHolidays: Map<number, INigerianHoliday[]> = new Map<number, INigerianHoliday[]>();

  public static async getNigerianHolidays(year: number, autoRefresh: boolean = true): Promise<INigerianHoliday[]> {
    if (this.cachedHolidays.has(year)) {
      return this.cachedHolidays.get(year) || [];
    }

    const storageKey = `${STORAGE_PREFIX}${year}`;
    const fromStorage = this.getFromStorage(storageKey, autoRefresh);
    if (fromStorage.length > 0) {
      this.cachedHolidays.set(year, fromStorage);
      return fromStorage;
    }

    try {
      const response = await axios.get<INigerianHoliday[]>(`https://date.nager.at/api/v3/PublicHolidays/${year}/NG`, {
        timeout: 10000
      });

      const holidays = response.data || [];
      this.cachedHolidays.set(year, holidays);
      this.saveToStorage(storageKey, holidays);
      return holidays;
    } catch {
      return [];
    }
  }

  public static convertHolidaysToEvents(
    holidays: INigerianHoliday[],
    badgeText: string,
    _badgeColor: string,
    iconType: string
  ): IEvent[] {
    return holidays.map((holiday: INigerianHoliday, index: number) => ({
      id: `holiday-${holiday.date}-${index}`,
      title: holiday.localName || holiday.name,
      description: 'Nigerian Public Holiday',
      date: new Date(holiday.date),
      time: 'All Day',
      location: 'Nigeria',
      category: 'holiday',
      badgeText,
      badgeColorScheme: 'accent',
      iconType,
      isHoliday: true,
      sortOrder: 9999 + index
    }));
  }

  private static getFromStorage(key: string, autoRefresh: boolean): INigerianHoliday[] {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as IStoredHolidayPayload;
      const fetchedAt = new Date(parsed.fetchedAt);
      const now = new Date();

      if (autoRefresh && fetchedAt.getFullYear() < now.getFullYear()) {
        return [];
      }

      return parsed.data || [];
    } catch {
      return [];
    }
  }

  private static saveToStorage(key: string, data: INigerianHoliday[]): void {
    try {
      const payload: IStoredHolidayPayload = {
        fetchedAt: new Date().toISOString(),
        data
      };
      window.localStorage.setItem(key, JSON.stringify(payload));
    } catch {
      // Ignore storage errors.
    }
  }
}
