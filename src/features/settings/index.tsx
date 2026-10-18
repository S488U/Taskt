import AppText from "../../components/AppText";
import { View, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ToggleSwitch from "../../components/ToggleSwitch";
import Header from "../../components/Header";
import { useSettings } from "../../context/SettingsContext";
import { requestBatteryOptimizationExemption } from "../../utils/notificationService";

const SettingsPage = () => {
	const { greeterSize, setGreeterSize } = useSettings();
	return (
		<View className="bg-background flex-1">
			<View className="border-border bg-surface m-2 flex-1 rounded-2xl border px-3 py-3 pb-2">
				<Header title="Settings" />

				<View className="mt-3 gap-2">
					<View className="bg-background flex-row items-center justify-between rounded px-3 py-6">
						<AppText className="font-interMedium text-xl">Greeter size needs to small?</AppText>
						<View className="mr-3">
							<ToggleSwitch value={greeterSize} onValueChange={(value) => setGreeterSize(value)} />
						</View>
					</View>

					<Pressable
						onPress={requestBatteryOptimizationExemption}
						className="bg-background flex-row items-center justify-between rounded px-3 py-5"
					>
						<View className="flex-1 pr-3">
							<AppText className="font-interMedium text-xl">Background Reminders</AppText>
							<AppText className="text-secondary text-xs mt-1">
								Tap to allow running in background so reminders ring when the app is closed or locked
							</AppText>
						</View>
						<MaterialIcons name="chevron-right" size={24} color="#64748B" />
					</Pressable>
				</View>
			</View>
		</View>
	);
};

export default SettingsPage;
