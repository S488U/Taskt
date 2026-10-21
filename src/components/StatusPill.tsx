import { View } from "react-native";
import AppText from "./AppText";

const StatusPill = ({ status }: { status: string }) => {
	const containerColor = status ? "bg-success" : "bg-secondary";
	const label = status ? "Completed" : "Pending";

	return (
		<View className={`${containerColor} self-start rounded-2xl px-3 py-1`}>
			<AppText className="font-interMedium text-background text-xs">{label}</AppText>
		</View>
	);
};

export default StatusPill;
