import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { loadSettings, storeSettings } from "../utils/storageUtils";

interface SettingsContextType {
	greeterSize: boolean;
	setGreeterSize: (val: boolean) => void;
	showProgressCard: boolean;
	setShowProgressCard: (val: boolean) => void;
	hapticsEnabled: boolean;
	setHapticsEnabled: (val: boolean) => void;
	hideCompletedTasks: boolean;
	setHideCompletedTasks: (val: boolean) => void;
}

const SETTING_GREETER_SIZE = "greeter_size";
const SETTING_SHOW_PROGRESS_CARD = "show_progress_card";
const SETTING_HAPTICS = "haptics_enabled";
const SETTING_HIDE_COMPLETED_TASKS = "hide_completed_tasks";

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
	const [greeterSize, setGreeterSizeState] = useState<boolean>(false);
	const [showProgressCard, setShowProgressCardState] = useState<boolean>(true);
	const [hapticsEnabled, setHapticsEnabledState] = useState<boolean>(true);
	const [hideCompletedTasks, setHideCompletedTasksState] = useState<boolean>(false);

	useEffect(() => {
		const initSettings = async () => {
			const savedGreeter = await loadSettings(SETTING_GREETER_SIZE);
			if (typeof savedGreeter === "boolean") {
				setGreeterSizeState(savedGreeter);
			}

			const savedProgress = await loadSettings(SETTING_SHOW_PROGRESS_CARD);
			if (typeof savedProgress === "boolean") {
				setShowProgressCardState(savedProgress);
			}

			const savedHaptics = await loadSettings(SETTING_HAPTICS);
			if (typeof savedHaptics === "boolean") {
				setHapticsEnabledState(savedHaptics);
			}

			const savedHideCompleted = await loadSettings(SETTING_HIDE_COMPLETED_TASKS);
			if (typeof savedHideCompleted === "boolean") {
				setHideCompletedTasksState(savedHideCompleted);
			}
		};

		initSettings();
	}, []);

	const setGreeterSize = useCallback(async (val: boolean) => {
		setGreeterSizeState(val);
		await storeSettings(SETTING_GREETER_SIZE, val);
	}, []);

	const setShowProgressCard = useCallback(async (val: boolean) => {
		setShowProgressCardState(val);
		await storeSettings(SETTING_SHOW_PROGRESS_CARD, val);
	}, []);

	const setHapticsEnabled = useCallback(async (val: boolean) => {
		setHapticsEnabledState(val);
		await storeSettings(SETTING_HAPTICS, val);
	}, []);

	const setHideCompletedTasks = useCallback(async (val: boolean) => {
		setHideCompletedTasksState(val);
		await storeSettings(SETTING_HIDE_COMPLETED_TASKS, val);
	}, []);

	const contextValue = useMemo(
		() => ({
			greeterSize,
			setGreeterSize,
			showProgressCard,
			setShowProgressCard,
			hapticsEnabled,
			setHapticsEnabled,
			hideCompletedTasks,
			setHideCompletedTasks,
		}),
		[
			greeterSize,
			setGreeterSize,
			showProgressCard,
			setShowProgressCard,
			hapticsEnabled,
			setHapticsEnabled,
			hideCompletedTasks,
			setHideCompletedTasks,
		]
	);

	return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
	const context = useContext(SettingsContext);
	if (!context) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return context;
};
