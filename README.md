# eventonly

SPFx React web part (`UpcomingEventsWebPart`) that shows upcoming events with an interactive calendar and optional Nigerian public holidays feed.

## Tech stack

- SharePoint Framework `1.20.0`
- React `17`
- TypeScript
- Fluent UI
- `react-day-picker` for calendar UI
- `date-fns` for date utilities
- `axios` for holiday API requests

## What the web part does

- Displays an events banner with title, description, and optional event count.
- Shows events in horizontal or vertical card layout.
- Supports event filtering by selected calendar date.
- Supports sorting (`dateAsc`, `dateDesc`, `custom`) and max items displayed.
- Can hide or show past events.
- Supports optional event metadata visibility toggles (date/time/location/image).
- Includes a property pane event manager to add/edit/duplicate/reorder/delete events.
- Optionally merges Nigerian public holidays from:
  - `https://date.nager.at/api/v3/PublicHolidays/{year}/NG`
- Caches holiday responses in browser `localStorage` and can auto-refresh yearly.

## Prerequisites

- Node.js `>=18.17.1 <19.0.0`
- npm
- Microsoft 365 tenant with SharePoint App Catalog access (for deployment)

## Quick start

```bash
npm install
gulp serve
```

Open the SharePoint workbench page and add **UpcomingEventsWebPart**.

## Build commands

```bash
# Development bundle
gulp bundle

# Production assets and package
gulp clean
gulp bundle --ship
gulp package-solution --ship
```

## Deployment

1. Build production package:
   - `gulp clean`
   - `gulp bundle --ship`
   - `gulp package-solution --ship`
2. Upload package:
   - `sharepoint/solution/eventonly.sppkg`
3. In SharePoint Admin Center, deploy the package from the App Catalog.
4. Add the web part to a SharePoint page (or supported Teams host).

## Web part configuration

Available through the property pane:

- Header: title, description, event count badge, calendar position
- Nigerian holidays: enable/disable, badge text, icon type, auto-refresh
- Events manager: add/edit/duplicate/reorder/delete events
- Calendar: show/hide, theme, marker style, first day of week, week numbers, date format
- Display: max events, show past events, sort order, card layout, metadata toggles

## Project structure

- `src/webparts/upcomingEventsWebPart/UpcomingEventsWebPartWebPart.ts`: web part entry + property pane config
- `src/webparts/upcomingEventsWebPart/components/`: React UI components (calendar, list, card)
- `src/webparts/upcomingEventsWebPart/controls/ManageEventsPropertyPane.tsx`: custom events editor in property pane
- `src/webparts/upcomingEventsWebPart/services/HolidayService.ts`: Nigerian holidays API + local cache
- `src/webparts/upcomingEventsWebPart/utils/`: date and event filtering/sorting utilities
- `config/package-solution.json`: SPFx package/deployment settings

## Notes

- Solution package uses `includeClientSideAssets: true`.
- `skipFeatureDeployment` is enabled in package config.
- Web part manifest supports SharePoint and Teams hosts.
- Holidays are requested from Nager API and cached in `localStorage` per year.
- `holidayBadgeColor` exists in properties but is currently not applied in holiday event mapping.

## Troubleshooting

- If `gulp` is not recognized, run with `npx gulp serve`.
- If package deployment succeeds but web part does not render, confirm tenant app deployment and site app installation.
- If holidays do not appear, verify internet access to `date.nager.at` and check browser storage/network errors.
