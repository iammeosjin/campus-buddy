// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from './routes/_404.tsx';
import * as $_app from './routes/_app.tsx';
import * as $api_joke from './routes/api/joke.ts';
import * as $api_reservations from './routes/api/reservations.ts';
import * as $dashboard from './routes/dashboard.tsx';
import * as $greet_name_ from './routes/greet/[name].tsx';
import * as $index from './routes/index.tsx';
import * as $reservations from './routes/reservations.tsx';
import * as $resources from './routes/resources.tsx';
import * as $users from './routes/users.tsx';
import * as $Calendar from './islands/Calendar.tsx';
import * as $Counter from './islands/Counter.tsx';
import * as $DashboardSummary from './islands/DashboardSummary.tsx';
import * as $Header from './islands/Header.tsx';
import * as $ReservationCalendar from './islands/ReservationCalendar.tsx';
import * as $ResourceList from './islands/ResourceList.tsx';
import * as $UserTable from './islands/UserTable.tsx';
import type { Manifest } from '$fresh/server.ts';

const manifest = {
	routes: {
		'./routes/_404.tsx': $_404,
		'./routes/_app.tsx': $_app,
		'./routes/api/joke.ts': $api_joke,
		'./routes/api/reservations.ts': $api_reservations,
		'./routes/dashboard.tsx': $dashboard,
		'./routes/greet/[name].tsx': $greet_name_,
		'./routes/index.tsx': $index,
		'./routes/reservations.tsx': $reservations,
		'./routes/resources.tsx': $resources,
		'./routes/users.tsx': $users,
	},
	islands: {
		'./islands/Calendar.tsx': $Calendar,
		'./islands/Counter.tsx': $Counter,
		'./islands/DashboardSummary.tsx': $DashboardSummary,
		'./islands/Header.tsx': $Header,
		'./islands/ReservationCalendar.tsx': $ReservationCalendar,
		'./islands/ResourceList.tsx': $ResourceList,
		'./islands/UserTable.tsx': $UserTable,
	},
	baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
