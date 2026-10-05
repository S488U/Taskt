import { View, Pressable } from "react-native";
import AppText from "./AppText";

const Button = () => {
	return (
		<View>
			<Pressable className={styles.pressable} onPress={() => alert("clicked")}>
				<AppText className={styles.pressText}>This is a text From button</AppText>
			</Pressable>
		</View>
	);
};

const styles = {
	pressable: `py-3 px-4 bg-black border-none rounded-lg`,
	pressText: `text-white text-lg font-medium`,
};

export default Button;
