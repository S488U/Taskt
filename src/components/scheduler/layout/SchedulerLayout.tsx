import { View, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../../AppText";
import { useSettings } from "../../../context/SettingsContext";
import { triggerHaptic } from "../../../utils/haptics";

interface SchedulerLayoutProps {
	title: string;
	children: React.ReactNode;
	onConfirm?: () => void;
}

const SchedulerLayout = ({ title, children, onConfirm }: SchedulerLayoutProps) => {
	const { hapticsEnabled } = useSettings();

	return (
		<View className="bg-background flex-1 flex-col justify-between px-6 py-4">
			<StatusBar style="dark" animated />
			{/* Header */}
			<View className="mt-5 mb-5 justify-center">
				<View className="w-full flex-row items-center">
					<View className="absolute w-20 items-center">
						<Pressable
							onPress={() => {
								triggerHaptic(hapticsEnabled, "impact");
								router.back();
							}}
						>
							<Ionicons name="close" size={24} color="#64748B" />
						</Pressable>
					</View>

					<View className="flex-1 items-center">
						<AppText className="font-interSBold text-2xl capitalize">Select {title}</AppText>
					</View>
				</View>
			</View>

			{/* Children Passes */}
			<View className="flex-1">{children}</View>

			{/* Pressable confirm Date */}
			<View>
				<Pressable
					onPress={() => {
						triggerHaptic(hapticsEnabled, "impact");
						(onConfirm ?? (() => router.back()))();
					}}
					className="bg-primary rounded-2xl border border-slate-400 py-1"
				>
					<AppText className="text-surface my-3 text-center text-xl capitalize">Confirm {title}</AppText>
				</Pressable>
			</View>
		</View>
	);
};

export default SchedulerLayout;
