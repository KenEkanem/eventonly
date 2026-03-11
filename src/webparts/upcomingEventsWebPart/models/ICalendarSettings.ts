export interface ICalendarSettings {
  showCalendar: boolean;
  theme: 'default' | 'minimal' | 'colorful';
  markerStyle: 'dot' | 'bold' | 'highlight';
  firstDayOfWeek: 0 | 1;
  showWeekNumbers: boolean;
  dateFormat: string;
}
