// Finland's yearly flag days, as listed by the Ministry of the Interior
// (intermin.fi/liputus/liputuspaivat): the seven official ones from the
// decree on flying the flag, and the established ones. Several are the
// birthdays of national figures. Election days and the days a president
// takes office are official flag days too, but have no fixed date, so they
// are not here. Computed from the rules, so nothing has to be fetched.

type FlagDay = { month: number; day: number; name: string }

/** The `nth` (1-based) `weekday` (0 = Sunday) of `month` (1-based) in `year`. */
const nthWeekday = (
	year: number,
	month: number,
	weekday: number,
	nth: number,
) => {
	const first = new Date(year, month - 1, 1).getDay()
	return 1 + ((weekday - first + 7) % 7) + (nth - 1) * 7
}

/** The last `weekday` (0 = Sunday) of `month` (1-based) in `year`. */
const lastWeekday = (year: number, month: number, weekday: number) => {
	const lastDay = new Date(year, month, 0)
	return lastDay.getDate() - ((lastDay.getDay() - weekday + 7) % 7)
}

const SUNDAY = 0
const SATURDAY = 6

const flagDays = (year: number): FlagDay[] => [
	{ month: 2, day: 5, name: 'J. L. Runebergin päivä' },
	{ month: 2, day: 28, name: 'Kalevalan päivä, suomalaisen kulttuurin päivä' },
	{ month: 3, day: 19, name: 'Minna Canthin päivä, tasa-arvon päivä' },
	{
		month: 4,
		day: 9,
		name: 'Mikael Agricolan päivä, suomen kielen päivä',
	},
	{ month: 4, day: 27, name: 'Kansallinen veteraanipäivä' },
	{ month: 5, day: 1, name: 'Vappu, suomalaisen työn päivä' },
	{ month: 5, day: 9, name: 'Eurooppa-päivä' },
	{ month: 5, day: nthWeekday(year, 5, SUNDAY, 2), name: 'Äitienpäivä' },
	{ month: 5, day: 12, name: 'J. V. Snellmanin päivä, suomalaisuuden päivä' },
	{
		month: 5,
		day: nthWeekday(year, 5, SUNDAY, 3),
		name: 'Kaatuneitten muistopäivä',
	},
	{
		month: 6,
		day: 4,
		name: 'Puolustusvoimain lippujuhlan päivä',
	},
	// The Saturday between 20 and 26 June
	{
		month: 6,
		day: 20 + ((SATURDAY - new Date(year, 5, 20).getDay() + 7) % 7),
		name: 'Juhannuspäivä, Suomen lipun päivä',
	},
	{ month: 7, day: 6, name: 'Eino Leinon päivä, runon ja suven päivä' },
	{
		month: 8,
		day: lastWeekday(year, 8, SATURDAY),
		name: 'Suomen luonnon päivä',
	},
	{
		month: 10,
		day: 1,
		name: 'Miina Sillanpään ja kansalaisvaikuttamisen päivä',
	},
	{
		month: 10,
		day: 10,
		name: 'Aleksis Kiven päivä, suomalaisen kirjallisuuden päivä',
	},
	{ month: 10, day: 24, name: 'YK:n päivä' },
	{ month: 11, day: 6, name: 'Ruotsalaisuuden päivä' },
	{ month: 11, day: nthWeekday(year, 11, SUNDAY, 2), name: 'Isänpäivä' },
	{ month: 11, day: 20, name: 'Lapsen oikeuksien päivä' },
	{ month: 12, day: 6, name: 'Itsenäisyyspäivä' },
	{
		month: 12,
		day: 8,
		name: 'Jean Sibeliuksen päivä, suomalaisen musiikin päivä',
	},
]

/** The names of the flag days on `date`: usually none, and two when a moving one lands on a fixed one. */
export const getFlagDays = (date: Date) =>
	flagDays(date.getFullYear())
		.filter(
			(flagDay) =>
				flagDay.month === date.getMonth() + 1 && flagDay.day === date.getDate(),
		)
		.map((flagDay) => flagDay.name)
