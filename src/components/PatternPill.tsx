import { View } from "react-native";
import AppText from "./AppText";

interface PatternPillProps {
	pattern: string;
	checked: boolean;
}

const PatternPill = ({ pattern = "one-time", checked }: PatternPillProps) => {
	const strikePill = checked ? "bg-secondary/10" : "bg-primary/10";
	const strikePillText = checked ? "text-secondary/50" : "text-primary";
	return (
		<View className={`flex w-[75px] items-center rounded-full border-none ${strikePill}`}>
			<AppText className={`font-interSBold p-0.5 px-2 text-[10px] uppercase ${strikePillText}`}>
				{pattern}
			</AppText>
		</View>
	);
};

export default PatternPill;
