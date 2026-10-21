import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { Platform } from "react-native";
import * as IntentLauncher from "expo-intent-launcher";
import Constants from "expo-constants";
import { Temporal } from "@js-temporal/polyfill";
import type { TaskEntity, Weekday } from "../features/tasks/task.types";

export const REMINDERS_CHANNEL_ID = "task-reminders";

// Maps app Weekday format to expo-notifications weekly trigger format (1 = Sunday, 7 = Saturday)
const WEEKDAY_MAP: Record<Weekday, number> = {
	Su: 1,
	M: 2,
	T: 3,
	W: 4,
	Th: 5,
	F: 6,
	S: 7,
};

// In-memory cache to avoid repeated asynchronous bridge calls
let isChannelInitialized = false;
let isPermissionGranted: boolean | null = null;

/**
 * Configure foreground notification presentation behavior.
 */
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

/**
 * Sets up the Android notification channel with MAX priority and sound.
 * Cached so it only runs once per app process.
 */
export async function setupNotificationChannel(): Promise<void> {
	if (isChannelInitialized || Platform.OS !== "android") {
		return;
	}

	try {
		await Notifications.setNotificationChannelAsync(REMINDERS_CHANNEL_ID, {
			name: "Task Reminders",
			importance: AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#6366F1",
			enableVibrate: true,
		});
		isChannelInitialized = true;
	} catch (error) {
		console.warn("Failed to set up notification channel:", error);
	}
}

/**
 * Requests notification permissions if not already granted.
 * Caches result to prevent redundant bridge overhead.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
	if (isPermissionGranted === true) {
		return true;
	}

	try {
		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		if (existingStatus === "granted") {
			isPermissionGranted = true;
			return true;
		}

		const { status } = await Notifications.requestPermissionsAsync();
		isPermissionGranted = status === "granted";
		return isPermissionGranted;
	} catch (error) {
		console.warn("Error requesting notification permissions:", error);
		return false;
	}
}

/**
 * Schedules a notification for a task and returns a JSON-serialized array of notification IDs.
 */
export async function scheduleTaskReminder(task: TaskEntity): Promise<string | null> {
	if (task.status === "done") {
		return null;
	}

	if (!isChannelInitialized) {
		await setupNotificationChannel();
	}

	const hasPermission = await requestNotificationPermissions();
	if (!hasPermission) {
		return null;
	}

	try {
		if (task.kind === "one_time") {
			if (!task.dueDate || !task.dueTime) return null;

			const plainDate = Temporal.PlainDate.from(task.dueDate);
			const plainTime = Temporal.PlainTime.from(task.dueTime);
			const timeZone = task.timezone || Temporal.Now.timeZoneId();
			const zonedDateTime = plainDate.toPlainDateTime(plainTime).toZonedDateTime(timeZone);

			const epochMs = zonedDateTime.epochMilliseconds;
			const nowEpochMs = Temporal.Now.instant().epochMilliseconds;

			// Don't schedule if already in the past
			if (epochMs <= nowEpochMs) {
				return null;
			}

			const notificationId = await Notifications.scheduleNotificationAsync({
				content: {
					title: task.title,
					body: task.description || "Task reminder",
					data: { taskId: task.id },
				},
				trigger: {
					type: Notifications.SchedulableTriggerInputTypes.DATE,
					date: new Date(epochMs),
					channelId: REMINDERS_CHANNEL_ID,
				},
			});

			return JSON.stringify([notificationId]);
		} else if (task.kind === "recurring") {
			if (!task.dueTime || !task.recurringDays || task.recurringDays.length === 0) {
				return null;
			}

			const plainTime = Temporal.PlainTime.from(task.dueTime);
			const hour = plainTime.hour;
			const minute = plainTime.minute;

			const scheduledIds: string[] = [];

			for (const day of task.recurringDays) {
				const weekdayNumber = WEEKDAY_MAP[day];
				if (!weekdayNumber) continue;

				const notificationId = await Notifications.scheduleNotificationAsync({
					content: {
						title: task.title,
						body: task.description || "Recurring task reminder",
						data: { taskId: task.id },
					},
					trigger: {
						type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
						weekday: weekdayNumber,
						hour,
						minute,
						channelId: REMINDERS_CHANNEL_ID,
					},
				});

				scheduledIds.push(notificationId);
			}

			return scheduledIds.length > 0 ? JSON.stringify(scheduledIds) : null;
		}
	} catch (error) {
		console.error("Error scheduling task reminder:", error);
	}

	return null;
}

/**
 * Cancels all scheduled notifications associated with a task's notificationId string.
 */
export async function cancelTaskReminders(notificationIdStr: string | null | undefined): Promise<void> {
	if (!notificationIdStr) return;

	let ids: string[] = [];
	try {
		if (notificationIdStr.startsWith("[")) {
			ids = JSON.parse(notificationIdStr);
		} else {
			ids = [notificationIdStr];
		}
	} catch {
		ids = [notificationIdStr];
	}

	for (const id of ids) {
		try {
			await Notifications.cancelScheduledNotificationAsync(id);
		} catch (error) {
			console.warn(`Failed to cancel notification with id ${id}:`, error);
		}
	}
}

/**
 * Prompts the Android system dialog to exempt Taskt from battery optimization / app killing.
 * This ensures notifications trigger even when the screen is locked or the app is cleared from Recents.
 */
export async function requestBatteryOptimizationExemption(): Promise<void> {
	if (Platform.OS !== "android") return;

	try {
		const pkg = Constants.expoConfig?.android?.package || "com.s488u.taskt";
		await IntentLauncher.startActivityAsync(
			IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
			{
				data: `package:${pkg}`,
			}
		);
	} catch (error) {
		console.warn("Could not request battery optimization exemption:", error);
	}
}

export async function cancelAllReminders(): Promise<void> {
	try {
		await Notifications.cancelAllScheduledNotificationsAsync();
	} catch (error) {
		console.error("Error cancelling all notifications:", error);
	}
}
