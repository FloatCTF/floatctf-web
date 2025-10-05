import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export function DatetimeToShow(datetime: string | undefined | null) {
	if (!datetime) {
		return dayjs().utc().format("YYYY-MM-DDTHH:mm:ss");
	}
	return dayjs.utc(datetime).local().format("YYYY-MM-DD HH:mm:ss");
}
