import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { loadSettings, storeSettings } from "../utils/storageUtils";

interface SettingsContextType {
	greeterSize: boolean;
	setGreeterSize: (val: boolean) => void;
}

const SETTING_GREETER_SIZE = "greeter_size";

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
	const [greeterSize, setGreeterSizeState] = useState<boolean>(false);

	useEffect(() => {
		const initSettings = async () => {
			const saved = await loadSettings(SETTING_GREETER_SIZE);
			if (typeof saved === "boolean") {
				setGreeterSizeState(saved);
			}
		};

		initSettings();
	}, []);

	const setGreeterSize = useCallback(async (val: boolean) => {
		setGreeterSizeState(val);
		await storeSettings(SETTING_GREETER_SIZE, val);
	}, []);

	const contextValue = useMemo(() => ({ greeterSize, setGreeterSize }), [greeterSize, setGreeterSize]);

	return (
		<SettingsContext.Provider value={contextValue}>
			{children}
		</SettingsContext.Provider>
	);
};

export const useSettings = () => {
	const context = useContext(SettingsContext);
	if (!context) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return context;
};
