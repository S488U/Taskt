import { Vibration, Platform } from "react-native";

export type HapticType = "selection" | "impact" | "success" | "warning";

export const triggerHaptic = (enabled = true, type: HapticType = "selection") => {
	if (!enabled || Platform.OS !== "android") return;

	switch (type) {
		case "selection":
			Vibration.vibrate(8);
			break;
		case "impact":
			Vibration.vibrate(14);
			break;
		case "success":
			// Two-beat celebratory pulse for task completion
			Vibration.vibrate([0, 10, 35, 14]);
			break;
		case "warning":
			// Firm vibration for deletion / destructive actions
			Vibration.vibrate(26);
			break;
		default:
			Vibration.vibrate(10);
			break;
	}
};
