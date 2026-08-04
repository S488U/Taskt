import { View, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../../AppText";

const StyledIcon = styled(Ionicons, {
	className: "style",
});

interface SchedulerLayoutProps {
	title: string;
	children: React.ReactNode;
}

const SchedulerLayout = ({ title, children }: SchedulerLayoutProps) => {
	return (
		<View className="flex-1 flex-col justify-between px-6 py-4">
			<StatusBar style="light" animated />

			{/* Header */}
			<View className="mt-5 mb-5 justify-center">
				<View className="w-full flex-row items-center">
					<View className="absolute w-20 items-center">
						<Pressable onPress={() => router.back()}>
							<StyledIcon className="text-secondary" name="close" size={24} color="black" />
						</Pressable>
					</View>

					<View className="flex-1 items-center">
						<AppText className="font-interSBold text-2xl capitalize">Select {title}</AppText>
					</View>
				</View>

				{/* Children Passes */}
				<View>{children}</View>
			</View>

			{/* Pressable confirm Date */}
			<View>
				<Pressable
					onPress={() => router.push("/")}
					className="bg-primary rounded-2xl border border-slate-400 py-1"
				>
					<AppText className="text-surface my-3 text-center text-xl capitalize">Confirm {title}</AppText>
				</Pressable>
			</View>
		</View>
	);
};

export default SchedulerLayout;
