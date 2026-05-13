import { View } from "react-native";
import AppText from "./AppText";
import { useState, useEffect } from "react";

// To fetch today
import { today } from "../utils/dateTime";

const Today = () => {
	const [day, setDay] = useState(() => today());

	useEffect(() => {
		const interval = setInterval(() => {
			setDay(today());
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	return (
		<View className="mb-1">
			<AppText className="px-1 font-interMedium text-secondary ">{day}</AppText>
		</View>
	);
};

export default Today;
