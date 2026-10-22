import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

//~ Episode air dates come from the TMDB api formatted as 'MM-DD-YYYY'.
//~ Stored in SQLite as Unix epoch seconds (local midnight).
export const airDateToEpoch = (airDate: string | undefined | null) => {
  if (!airDate) return null;
  const parsed = dayjs(airDate, 'MM-DD-YYYY', true);
  return parsed.isValid() ? parsed.unix() : null;
};

export const epochToAirDate = (epoch: number | undefined | null) =>
  epoch ? dayjs.unix(epoch).format('MM-DD-YYYY') : undefined;

export const nowEpoch = () => Math.floor(Date.now() / 1000);
