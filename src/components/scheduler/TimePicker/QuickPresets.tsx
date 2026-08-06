import { Pressable, View } from "react-native";
import SubTitle from "../../SubTitle";
import AppText from "../../AppText";

type Meridian = "AM" | "PM";

type Preset = {
	label: string;
	hour: number;
	minute: number;
	meridian: Meridian;
};

const PRESETS: Preset[] = [
	{ label: "09:00 AM", hour: 9, minute: 0, meridian: "AM" },
	{ label: "01:00 PM", hour: 1, minute: 0, meridian: "PM" },
	{ label: "06:00 PM", hour: 6, minute: 0, meridian: "PM" },
	{ label: "09:00 PM", hour: 9, minute: 0, meridian: "PM" },
];

interface QuickPresetsProps {
	onSelectPreset: (hour: number, minute: number, meridian: Meridian) => void;
}

const QuickPresets = ({ onSelectPreset }: QuickPresetsProps) => {
	return (
		<View className="mb-5">
			<SubTitle customClass="!px-0 pb-2 text-secondary" title="Quick Presets" />
			<View className="flex-row items-center justify-between gap-1">
				{PRESETS.map((preset) => (
					<Pressable
						key={preset.label}
						onPress={() => onSelectPreset(preset.hour, preset.minute, preset.meridian)}
						className="bg-background flex-1 items-center justify-center rounded-xl border border-gray-200 py-3"
					>
						<AppText className="font-interMedium text-sm">{preset.label}</AppText>
					</Pressable>
				))}
			</View>
		</View>
	);
};

export default QuickPresets;
