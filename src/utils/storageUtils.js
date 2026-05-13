import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTodaysDay } from "./scheduleUtils.ts";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

export const clearData = () => {
	AsyncStorage.clear();
};

export const storeData = async (name, value) => {
	if (typeof name !== "string" || name.trim() === "" || value === null || typeof value !== "object") return null;

	const id = uuidv4();
	const newValue = { ...value, id };

	try {
		const getData = await AsyncStorage.getItem(name);
		const parseData = getData ? JSON.parse(getData) : [];
		const updatedData = Array.isArray(parseData) ? [...parseData, newValue] : [newValue];

		await AsyncStorage.setItem(name, JSON.stringify(updatedData));
		return { success: true };
	} catch (error) {
		console.log("Error[storeData]: " + error);
		return { success: false, error: error };
	}
};

export const loadData = async (name, viewFullData) => {
	if (typeof name !== "string" || name.trim() === "") return null;

	try {
		const getData = await AsyncStorage.getItem(name);

		let data;
		if (viewFullData) {
			const parsed = getData ? JSON.parse(getData) : [];
			data = Array.isArray(parsed) ? parsed : [];
		} else {
			const parseData = getData ? JSON.parse(getData) : [];
			const filtered = getDate(parseData);
			data = Array.isArray(filtered) ? filtered : [];
		}

		const length = data.length;
		const completed = data.filter((todo) => todo.status === true).length;

		return { success: true, data, length, status: completed };
	} catch (error) {
		console.log("Error[loadData]: ", error);
		return { success: false, error: error };
	}
};

export const removeItem = async (name, id) => {
	if (typeof name !== "string" || name.trim() === "") return null;
	if (!id) return { success: false, error: "No Id Present" };

	try {
		const getData = await AsyncStorage.getItem(name);
		const parseData = getData ? JSON.parse(getData) : [];
		const updatedData = parseData.filter((item) => item.id !== id);

		await AsyncStorage.setItem(name, JSON.stringify(updatedData));
		return { success: true, data: updatedData };
	} catch (error) {
		console.log("Error[removeItem]: " + error);
		return { success: false, error: error };
	}
};

export const updateItemStatus = async (name, id, status) => {
	if (typeof name !== "string" || name.trim() === "") return null;
	if (!id) return { success: false, error: "No Id Present" };

	try {
		const getData = await AsyncStorage.getItem(name);
		const parseData = getData ? JSON.parse(getData) : [];
		const updatedData = parseData.map((item) =>
			item.id === id ? { ...item, status, updatedAt: new Date() } : item
		);

		await AsyncStorage.setItem(name, JSON.stringify(updatedData));
		return { success: true, data: updatedData };
	} catch (error) {
		console.log("Error[updateItemStatus]: " + error);
		return { success: false, error };
	}
};

const getDate = (data = []) => {
	const now = new Date();
	const todayDay = getTodaysDay();

	return data.filter((todo) => {
		if (todo.pattern === "one-time") {
			if (!todo.oneTime?.date) return false;

			const todoDate = new Date(todo.oneTime.date);

			return (
				todoDate.getFullYear() === now.getFullYear() &&
				todoDate.getMonth() === now.getMonth() &&
				todoDate.getDate() === now.getDate()
			);
		}

		if (todo.pattern === "repeat") {
			return Array.isArray(todo.repeat?.days) && todo.repeat.days.includes(todayDay);
		}

		return false;
	});
};
