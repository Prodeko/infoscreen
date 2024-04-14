import { useCallback, useEffect, useState } from "react";

/**
 * Custom hook to get the current time from the browser.
 * Updates once every second.
 * @returns The current time as a Date object.
 */
const useClock = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
};

/**
 * A scraped ilmo event.
 */
type IlmoEvent = {
  name: string;
  description: string;
  eventStartTime: string;
  registrationStartTime: string;
  headerImageFile: string;
};

/**
 * Custom hook to fetch ilmo events from a JSON file and refresh them every `refreshIntervalMS` milliseconds.
 * @param refreshIntervalMS The interval in milliseconds to refresh the ilmo events.
 * @returns An object containing the open and upcoming ilmo events.
 */
const useAutoRefreshingIlmoEvents = (refreshIntervalMS: number = 60 * 1000) => {
  const [openIlmos, setOpenIlmos] = useState<IlmoEvent[]>([]);
  const [upcomingIlmos, setUpcomingIlmos] = useState<IlmoEvent[]>([]);

  /**
   * Fetch the ilmo events from the JSON file and set them to the state.
   */
  const setIlmoEvents = useCallback(async () => {
    try {
      const response = await fetch("/events.json");
      const data = await response.json();
      const { open, upcoming } = data;
      if (open) setOpenIlmos(open);
      if (upcoming) setUpcomingIlmos(upcoming);
    } catch (error) {
      console.error(
        "Failed to get ilmo events. Maybe you forgot to set up the scraper?",
        error
      );
    }
  }, []);

  // Refresh the ilmo events every `refreshIntervalMS` milliseconds.
  useEffect(() => {
    const interval = setInterval(setIlmoEvents, refreshIntervalMS);
    return () => clearInterval(interval);
  }, [refreshIntervalMS, setIlmoEvents]);

  // Fetch the ilmo events on mount.
  useEffect(() => {
    setIlmoEvents();
  }, [setIlmoEvents]);

  return { openIlmos, upcomingIlmos };
};

/**
 * A card component for displaying an ilmo event.
 */
const IlmoEventCard = ({ ilmo }: { ilmo: IlmoEvent }) => {
  const formatToLocaleDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("fi-FI", {
      minute: "2-digit",
      hour: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });

  return (
    <div className="bg-white border border-slate-100 rounded-lg">
      <img
        src={ilmo.headerImageFile}
        alt={ilmo.name}
        className="w-full h-56 object-cover"
      />
      <div className="p-4">
        <h2 className="text-4xl font-medium mt-4">{ilmo.name}</h2>
        <p className="mt-2 text-2xl">
          {ilmo.description.slice(0, 120)}
          {ilmo.description.length > 120 ? "..." : ""}
        </p>
        <div className="flex flex-row gap-2 mt-4 justify-between">
          <div className="flex flex-col">
            <h3 className="text-2xl font-medium">Ilmo aukeaa</h3>
            <p className="text-2xl">
              {formatToLocaleDateTime(ilmo.registrationStartTime)}
            </p>
          </div>
          <div className="flex flex-col">
            <h3 className="text-2xl font-medium">Tapahtuma-aika</h3>
            <p className="text-2xl">
              {formatToLocaleDateTime(ilmo.eventStartTime)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const time = useClock();
  const timeHoursMinutes = time
    .toLocaleTimeString("fi-FI", {
      minute: "2-digit",
      hour: "2-digit",
    })
    .replace(/\./g, ":");

  const { openIlmos, upcomingIlmos } = useAutoRefreshingIlmoEvents(60 * 1000);

  return (
    <div className="grid min-h-screen grid-cols-[2fr_2fr_1fr] grid-rows-[100px_auto_100px] gap-10 bg-gray-50 p-4">
      <h1 className="text-xl font-bold underline bg-blue-100 col-span-2">
        Prodeko
      </h1>
      <h1 className="text-8xl flex flex-col font-semibold bg-green-200 text-center items-center justify-center">
        {timeHoursMinutes}
      </h1>
      <h1 className="text-xl font-bold underline bg-orange-100">Kanttiinit</h1>
      <div className="bg-transparent border border-slate-100 row-span-2 flex flex-row gap-8">
        <div className="flex flex-col basis-1/2 gap-2">
          <h1 className="text-4xl font-bold">Avoimet Ilmot</h1>
          <div className="flex flex-col gap-2">
            {openIlmos.slice(0, 5).map((ilmo) => (
              <IlmoEventCard ilmo={ilmo} key={ilmo.name} />
            ))}
          </div>
        </div>
        <div className="flex flex-col basis-1/2 gap-2">
          <h1 className="text-4xl font-bold">Tulevat Ilmot</h1>
          <div className="flex flex-col gap-2">
            {upcomingIlmos.slice(0, 5).map((ilmo) => (
              <IlmoEventCard ilmo={ilmo} key={ilmo.name} />
            ))}
          </div>
        </div>
      </div>
      <h1 className="text-xl font-bold underline bg-orange-100 row-span-2">
        Viewers
      </h1>
      <h1 className="text-xl font-bold underline bg-orange-100">Sponsors</h1>
    </div>
  );
};

export default App;
