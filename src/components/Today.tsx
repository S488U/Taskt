import React, { useState, useEffect } from "react";
import { View, AppState } from "react-native";
import AppText from "./AppText";
import { today } from "../utils/dateTime";

const Today = () => {
	const [day, setDay] = useState(() => today());

	useEffect(() => {
		const refresh = () => {
			const current = today();
			setDay((prev) => (prev === current ? prev : current));
		};

		// Refresh when returning from background / waking phone
		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") {
				refresh();
			}
		});

		// Low-frequency background check once per minute instead of every 5 seconds
		const interval = setInterval(refresh, 60000);

		return () => {
			subscription.remove();
			clearInterval(interval);
		};
	}, []);

	return (
		<View className="mb-1">
			<AppText className="font-interMedium text-secondary px-1">{day}</AppText>
		</View>
	);
};

export default React.memo(Today);
