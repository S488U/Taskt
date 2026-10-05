// import { Pressable } from "react-native-gesture-handler";
import AppText from "../../components/AppText";
import { View } from "react-native";
// import { router } from "expo-router";
import ToggleSwitch from "../../components/ToggleSwitch";
import Header from "../../components/Header";
import { useSettings } from "../../context/SettingsContext";

const SettingsPage = () => {
	const { greeterSize, setGreeterSize } = useSettings();
	return (
		<View className="bg-background flex-1">
			<View className="border-border bg-surface m-2 flex-1 rounded-2xl border px-3 py-3 pb-2">
				<Header title="Settings" />

				<View className="mt-3 gap-2">
					<View className="bg-background flex-row items-center justify-between rounded px-1 py-6">
						<AppText className="font-interMedium text-xl">Greeter size needs to small?</AppText>
						<View className="mr-3">
							<ToggleSwitch value={greeterSize} onValueChange={(value) => setGreeterSize(value)} />
						</View>
					</View>

					{/*    UPCOMING SETTINGS    */}

					{/*<View className="bg-background flex-row items-center justify-between rounded px-1 py-6">
						<AppText className="font-interMedium text-xl">Greeter size needs to small?</AppText>
						<View className="mr-3">
							<ToggleSwitch onValueChange={(value) => console.log(value)} />
						</View>
					</View>*/}
				</View>
			</View>
		</View>
	);
};

export default SettingsPage;
