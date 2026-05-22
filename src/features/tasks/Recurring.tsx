import { View, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { styled } from "nativewind";

import SubTitle from "../../components/SubTitle";
import AppText from "../../components/AppText";

import { DAY_LABELS, formatTime, getPresetDays, hasFutureOccurrence, toTime24 } from "../../utils/scheduleUtils";

styled(FontAwesome6, {
    className: "style",
});

const clockIcon = "clock";

const Recurring = ({ data, setData, onErrorChange }) => {
    const [hasInteracted, setHasInteracted] = useState(false);
    const NOW = new Date();

    const isPast =
        hasInteracted && data.days.length > 0
            ? !hasFutureOccurrence(
                    {
                        days: data.days,
                        time: toTime24(data.time),
                    },
                    NOW
                )
            : false;

    useEffect(() => {
        onErrorChange?.(isPast);
    }, [isPast, onErrorChange]);

    const toggleDay = (day) => {
        setHasInteracted(true);
        const days = data.days.includes(day) ? data.days.filter((d) => d !== day) : [...data.days, day];
        setData((prev) => ({
            ...prev,
            recurring: {
                ...prev.recurring,
                type: "custom",
                days: days,
            },
        }));
    };

    const openTimePicker = () => {
        DateTimePickerAndroid.open({
            value: data.time,
            onChange: (event, selectedTime) => {
                if (event.type === "set" && selectedTime) {
                    setHasInteracted(true);
                    setData((prev) => ({
                        ...prev,
                        recurring: {
                            ...prev.recurring,
                            time: selectedTime,
                        },
                    }));
                }
            },
            mode: "time",
            is24Hour: false,
        });
    };

    useEffect(() => {
        if (data.type === "custom") return;
        const presetDays = getPresetDays(data.type);
        if (presetDays.length) {
            setData((prev) => ({
                ...prev,
                recurring: {
                    ...prev.recurring,
                    days: presetDays,
                },
            }));
        }
    }, [data.type]);

    return (
        <>
            <View className="flex-row gap-2">
                {["today", "tomorrow", "everyday"].map((item) => (
                    <Pressable
                        key={item}
                        className={`flex-1 ${data.type === item ? "bg-primary" : "bg-surface"} rounded-xl border border-border`}
                        onPress={() => {
                            setHasInteracted(true);
                            setData((prev) => ({
                                ...prev,
                                recurring: {
                                    ...prev.recurring,
                                    type: item,
                                },
                            }));
                        }}
                    >
                        <AppText
                            numberOfLines={1}
                            className={`${data.type === item ? "text-surface" : "text-secondary"} px-3 py-2 text-center text-sm font-interMedium capitalize`}
                        >
                            {item}
                        </AppText>
                    </Pressable>
                ))}
            </View>
            <View>
                <SubTitle title="Custom days" />
                <View className="flex-row gap-2">
                    {DAY_LABELS.map((item) => (
                        <Pressable
                            key={item}
                            onPress={() => toggleDay(item)}
                            className={`flex-1 ${data.days.includes(item) ? "bg-primary" : "bg-surface"} rounded-xl border border-border`}
                        >
                            <AppText
                                className={`${data.days.includes(item) ? "text-surface" : "text-secondary"} px-3 py-3 text-center text-sm font-interMedium capitalize`}
                            >
                                {item}
                            </AppText>
                        </Pressable>
                    ))}
                </View>
            </View>
            <View>
                <SubTitle title="Time" />
                <Pressable
                    onPress={openTimePicker}
                    className={`flex-row items-center justify-center gap-2 border ${isPast ? "border-danger" : "border-border"} rounded-xl bg-surface px-4 py-3`}
                >
                    <FontAwesome6
                        name={clockIcon}
                        size={16}
                        className={`${isPast ? "text-danger" : "text-secondary"}`}
                    />
                    <AppText
                        className={`${isPast ? "text-danger" : "text-secondary"} text-center text-base font-interMedium uppercase`}
                    >
                        {formatTime(data.time)}
                    </AppText>
                </Pressable>
                {isPast && (
                    <AppText className="ml-1 mt-1 text-xs text-danger">
                        Selected recurring time has no future occurrence. Choose another time or days.
                    </AppText>
                )}
            </View>
        </>
    );
};

export default Recurring;
