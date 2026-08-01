import { Pressable, View } from "react-native";
import { router } from "expo-router";

// components
import Header from "../../components/Header";
import Today from "../../components/Today";
import SavedTasks from "./SavedTasks";
import FloatingButton from "../../components/FloatingButton";

// Icons
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { styled } from "nativewind";

// custom hooks
import useGreeter from "../../hooks/useGreeter";

styled(FontAwesome6, {
	className: "style",
});

const TodoScreen = () => {
	const { greeter } = useGreeter();

	return (
		<View className="bg-background relative flex-1 p-3 px-4">
			{/* <Header title="Taskt"/> */}
			<Pressable onPress={() => router.push("/datepicker")}>
				<Header title={greeter} />
				<Today />
			</Pressable>

			<View className="flex-1">
				<SavedTasks />
				<FloatingButton
					icon={<FontAwesome6 name="add" size={20} className="text-background" />}
					// onPress={() => setShowCreate(true)}
					onPress={() => router.push("/create")}
				/>
			</View>
		</View>
	);
};

export default TodoScreen;
