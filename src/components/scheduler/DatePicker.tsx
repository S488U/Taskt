import { View } from "react-native";
import AppText from "../AppText";

const DatePicker = () => {
	return (
		<View className="flex-1">
			<View className="relative mt-8 flex-row items-center justify-center">
				<AppText className="font-interSBold text-2xl absolute left-40">x</AppText>
				<AppText className="font-interSBold text-2xl">Select Date</AppText>
			</View>
			<View></View>
		</View>
	);
};

export default DatePicker;
