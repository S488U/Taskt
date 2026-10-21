import { View, Pressable } from "react-native";
import AppText from "./AppText";

type FloatingButtonProps = {
	icon?: React.ReactElement;
	text?: string;
	onPress: () => void;
};

const FloatingButton = ({ icon, text = "", onPress }: FloatingButtonProps) => {
	return (
		<View className="absolute right-6 bottom-[80px]">
			<Pressable
				className="bg-primary shadow-primary/50 flex-row items-center gap-3 rounded-2xl p-5 shadow-lg active:opacity-90"
				onPress={onPress}
			>
				{icon && <View>{icon}</View>}

				{text ? <AppText className="text-surface font-interSBold text-lg">{text}</AppText> : null}
			</Pressable>
		</View>
	);
};

export default FloatingButton;
