const useGreeter = (date = new Date()) => {
	const hour: number = date.getHours(); // 0–23

	let greeter: string = "Good Night";

	if (hour >= 5 && hour < 12) {
		greeter = "Good Morning";
	} else if (hour >= 12 && hour < 18) {
		greeter = "Good Afternoon";
	} else if (hour >= 18 && hour < 22) {
		greeter = "Good Evening";
	}

	return { greeter };
};

export default useGreeter;
