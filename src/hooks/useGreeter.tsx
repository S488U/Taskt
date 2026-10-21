import { useState, useEffect } from "react";
import { AppState } from "react-native";
import { Temporal } from "@js-temporal/polyfill";

const getGreeting = (): string => {
	const hour = Temporal.Now.plainTimeISO().hour;

	if (hour >= 5 && hour < 12) {
		return "Good Morning";
	} else if (hour >= 12 && hour < 18) {
		return "Good Afternoon";
	} else if (hour >= 18 && hour < 22) {
		return "Good Evening";
	}
	return "Good Night";
};

const useGreeter = () => {
	const [greeter, setGreeter] = useState<string>(getGreeting);

	useEffect(() => {
		const refresh = () => {
			const current = getGreeting();
			setGreeter((prev) => (prev === current ? prev : current));
		};

		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") {
				refresh();
			}
		});

		const interval = setInterval(refresh, 60000);

		return () => {
			subscription.remove();
			clearInterval(interval);
		};
	}, []);

	return { greeter };
};

export default useGreeter;
