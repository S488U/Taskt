import { View } from "react-native";
import AppText from "./AppText";

//Utility
import { parseDateTime } from "../utils/dateTime";

interface DataTimePillProps {
	datetime: string;
	date: boolean;
	time: boolean;
}

const DateTimePill = ({ data }: { data: DataTimePillProps }) => {
	if (!data) return null;
	const { date, time } = parseDateTime(data.datetime, data.date, data.time);

	return (
		<View className="self-start rounded-md bg-border px-3 py-1">
			<AppText className="font-interMedium text-xs text-secondary">
				{date} | {time}
			</AppText>
		</View>
	);
};

export default DateTimePill;
