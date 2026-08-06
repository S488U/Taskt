import { View } from "react-native";
import AppText from "../../AppText";

interface ErrorLayoutProps {
	error: string;
	customClass?: string;
}

const ErrorLayout = ({ error, customClass }: ErrorLayoutProps) => {
	return (
		<View className={`${customClass} bg-danger/10 rounded-lg px-3 py-2 shadow-2xl`}>
			<AppText className="font-interMedium text-red-500">{error}</AppText>
		</View>
	);
};

export default ErrorLayout;
