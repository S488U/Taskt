
/**
 * Returns the month name from a month index.
 *
 * @param {number} monthNumber - Month index (0 = January, 11 = December)
 * @param {"short" | "long"} [format="short"] - Output format (only "short" or "long")
 * @returns {string}
 */
export const getMonthName = (monthNumber, format = "short") => {

    const allowedFormats = new Set(["short", "long"]);

    if (!allowedFormats.has(format)) {
        format = "short"
    }

    const date = new Date();
    date.setMonth(monthNumber);
    return date.toLocaleString('en-US', { month: format });
}

export const parseDate = (date) => {
    const array = date.substring(0, 10).split("-");
    const monthName = getMonthName(Number(array[1]) - 1);
    const newDate = `${array[2]} ${monthName} ${array[0]}`;
    return newDate;
}

export const parseTime = (time, seconds = false) => {
    time = time.trim();

    let newTime = time;
    if (time.length > 8) {
        newTime = time.substring(0, 8);
    }

    newTime = newTime.split(":");

    const hour = Number(newTime[0]);
    const minute = newTime[1];
    const second = newTime[2];

    const standardMerdian = hour > 12 ? "PM" : "AM";
    const standardHour = hour > 12 ? hour - 12 : hour;

    if (seconds) {
        return `${standardHour}:${minute}:${second} ${standardMerdian}`;
    }

    return `${standardHour}:${minute} ${standardMerdian}`;
}

/**
 * 
 * @param {string} datetime 
 * @returns 
 */
export const parseDateTime = (datetime, date = false, time = false) => {
    let newDateTime = datetime.split("T");

    if (date) {
        return { date: parseDate(newDateTime[0]) };
    }

    if (time) {
        return { time: parseTime(newDateTime[1]) };
    }

    return {
        date: parseDate(newDateTime[0]),
        time: parseTime(newDateTime[1])
    };
}

export const today = () => {
	const date = new Date();

	const formattedDate = date.toLocaleDateString("en-GB", {
		weekday: "long",
		day: "numeric",
		month: "short",
	});

	return formattedDate;
};

// console.log(parseDateTime("2026-02-10T20:45:02Z"));