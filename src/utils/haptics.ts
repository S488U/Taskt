import { Vibration, Platform } from "react-native";

export const triggerHaptic = (enabled = true) => {
	if (!enabled) return;
	if (Platform.OS === "android") {
		Vibration.vibrate(12);
	}
};
