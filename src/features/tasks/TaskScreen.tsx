import { Pressable, View } from "react-native";
import { router } from "expo-router";

// components
import Header from "../../components/Header";
import Today from "../../components/Today";
import SavedTasks from "./SavedTasks";
import FloatingButton from "../../components/FloatingButton";

// Icons
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

// custom hooks
import useGreeter from "../../hooks/useGreeter";
import { useSettings } from "../../context/SettingsContext";
import { triggerHaptic } from "../../utils/haptics";

const TodoScreen = () => {
	const { greeter } = useGreeter();
	const { greeterSize, hapticsEnabled } = useSettings();

	return (
		<View className="bg-background relative flex-1 p-3 px-4">
			{/* <Header title="Taskt"/> */}

			<Pressable onPress={() => router.push("/settings")}>
				<Header title={greeter} customClass={greeterSize ? "text-2xl leading-7" : "text-4xl leading-[44px]"} />
				<Today />
			</Pressable>

			<View className="flex-1">
				<SavedTasks />
				<FloatingButton
					icon={<FontAwesome6 name="add" size={20} color="#FFFFFF" />}
					// onPress={() => setShowCreate(true)}
					onPress={() => {
						triggerHaptic(hapticsEnabled, "impact");
						router.push("/create");
					}}
				/>
			</View>
		</View>
	);
};

export default TodoScreen;
