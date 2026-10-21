import React, { useState } from "react";
import { View, Pressable, ScrollView, Modal, Share, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import AppText from "../../components/AppText";
import Header from "../../components/Header";
import ToggleSwitch from "../../components/ToggleSwitch";
import { useSettings } from "../../context/SettingsContext";
import { requestBatteryOptimizationExemption, cancelAllReminders } from "../../utils/notificationService";
import { taskService } from "../../db/taskService";
import { triggerHaptic } from "../../utils/haptics";

const SettingsPage = () => {
	const {
		greeterSize,
		setGreeterSize,
		showProgressCard,
		setShowProgressCard,
		hapticsEnabled,
		setHapticsEnabled,
	} = useSettings();

	const [showClearModal, setShowClearModal] = useState(false);
	const [showPrivacyModal, setShowPrivacyModal] = useState(false);
	const [showTermsModal, setShowTermsModal] = useState(false);
	const [isClearing, setIsClearing] = useState(false);

	const handleExportTasks = async () => {
		try {
			triggerHaptic(hapticsEnabled);
			const tasks = await taskService.getAllTask();
			if (!tasks || tasks.length === 0) {
				Alert.alert("No Tasks", "There are no tasks to export yet.");
				return;
			}
			const jsonString = JSON.stringify(tasks, null, 2);
			await Share.share({
				title: "Taskt-Tasks-Export.json",
				message: jsonString,
			});
		} catch (error) {
			console.error("Error exporting tasks:", error);
		}
	};

	const handleClearAll = async () => {
		try {
			setIsClearing(true);
			triggerHaptic(hapticsEnabled);
			await cancelAllReminders();
			await taskService.clearAllTasks();
			setShowClearModal(false);
			Alert.alert("Cleared", "All tasks and active reminders have been removed.");
		} catch (error) {
			console.error("Error clearing tasks:", error);
		} finally {
			setIsClearing(false);
		}
	};

	return (
		<View className="bg-background flex-1">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 20 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Top Header */}
				<View className="pt-2 pb-1">
					<Header title="Settings" />
				</View>

				{/* 1. APPEARANCE */}
				<View className="gap-2">
					<AppText className="font-interSBold text-secondary px-1 text-xs tracking-wider uppercase">
						Appearance
					</AppText>
					<View className="border-border bg-surface overflow-hidden rounded-2xl border">
						{/* Compact Greeter */}
						<View className="border-border flex-row items-center justify-between border-b p-4">
							<View className="flex-1 pr-3">
								<AppText className="font-interMedium text-text text-base">
									Compact Header
								</AppText>
								<AppText className="text-secondary font-inter text-xs">
									Make the greeting title smaller on the home screen
								</AppText>
							</View>
							<ToggleSwitch
								value={greeterSize}
								onValueChange={(val) => {
									triggerHaptic(hapticsEnabled);
									setGreeterSize(val);
								}}
							/>
						</View>

						{/* Show Progress Card */}
						<View className="flex-row items-center justify-between p-4">
							<View className="flex-1 pr-3">
								<AppText className="font-interMedium text-text text-base">
									Show Progress Card
								</AppText>
								<AppText className="text-secondary font-inter text-xs">
									Display daily completion percentage on the home screen
								</AppText>
							</View>
							<ToggleSwitch
								value={showProgressCard}
								onValueChange={(val) => {
									triggerHaptic(hapticsEnabled);
									setShowProgressCard(val);
								}}
							/>
						</View>
					</View>
				</View>

				{/* 2. INTERACTION & SYSTEM */}
				<View className="gap-2">
					<AppText className="font-interSBold text-secondary px-1 text-xs tracking-wider uppercase">
						Interaction & System
					</AppText>
					<View className="border-border bg-surface overflow-hidden rounded-2xl border">
						{/* Haptic Feedback */}
						<View className="border-border flex-row items-center justify-between border-b p-4">
							<View className="flex-1 pr-3">
								<AppText className="font-interMedium text-text text-base">
									Haptic Feedback
								</AppText>
								<AppText className="text-secondary font-inter text-xs">
									Vibrate on button taps, swipes, and task completion
								</AppText>
							</View>
							<ToggleSwitch
								value={hapticsEnabled}
								onValueChange={(val) => {
									triggerHaptic(val);
									setHapticsEnabled(val);
								}}
							/>
						</View>

						{/* Background Reminders */}
						<Pressable
							onPress={() => {
								triggerHaptic(hapticsEnabled);
								requestBatteryOptimizationExemption();
							}}
							className="flex-row items-center justify-between p-4 active:bg-slate-50"
						>
							<View className="flex-1 pr-3">
								<AppText className="font-interMedium text-text text-base">
									Background Reminders
								</AppText>
								<AppText className="text-secondary font-inter text-xs">
									Ensure alarms fire reliably when the phone is locked or closed
								</AppText>
							</View>
							<MaterialIcons name="chevron-right" size={24} color="#64748B" />
						</Pressable>
					</View>
				</View>

				{/* 3. DATA MANAGEMENT */}
				<View className="gap-2">
					<AppText className="font-interSBold text-secondary px-1 text-xs tracking-wider uppercase">
						Data Management
					</AppText>
					<View className="border-border bg-surface overflow-hidden rounded-2xl border">
						{/* Export Tasks */}
						<Pressable
							onPress={handleExportTasks}
							className="border-border flex-row items-center justify-between border-b p-4 active:bg-slate-50"
						>
							<View className="flex-row items-center gap-3">
								<View className="h-9 w-9 items-center justify-center rounded-full bg-indigo-50">
									<Ionicons name="share-outline" size={20} color="#4F46E5" />
								</View>
								<View>
									<AppText className="font-interMedium text-text text-base">
										Export Tasks
									</AppText>
									<AppText className="text-secondary font-inter text-xs">
										Backup or share tasks as a JSON file
									</AppText>
								</View>
							</View>
							<MaterialIcons name="chevron-right" size={24} color="#64748B" />
						</Pressable>

						{/* Clear All Tasks */}
						<Pressable
							onPress={() => {
								triggerHaptic(hapticsEnabled);
								setShowClearModal(true);
							}}
							className="flex-row items-center justify-between p-4 active:bg-red-50"
						>
							<View className="flex-row items-center gap-3">
								<View className="h-9 w-9 items-center justify-center rounded-full bg-red-50">
									<Ionicons name="trash-outline" size={20} color="#EF4444" />
								</View>
								<View>
									<AppText className="font-interMedium text-danger text-base">
										Clear All Tasks
									</AppText>
									<AppText className="text-secondary font-inter text-xs">
										Permanently remove all tasks and active alarms
									</AppText>
								</View>
							</View>
							<MaterialIcons name="chevron-right" size={24} color="#64748B" />
						</Pressable>
					</View>
				</View>

				{/* 4. ABOUT & LEGAL */}
				<View className="gap-2">
					<AppText className="font-interSBold text-secondary px-1 text-xs tracking-wider uppercase">
						About & Legal
					</AppText>
					<View className="border-border bg-surface overflow-hidden rounded-2xl border">
						{/* About Taskt */}
						<Pressable
							onPress={() => {
								triggerHaptic(hapticsEnabled);
								router.push("/about");
							}}
							className="border-border flex-row items-center justify-between border-b p-4 active:bg-slate-50"
						>
							<View>
								<AppText className="font-interMedium text-text text-base">
									About Taskt
								</AppText>
								<AppText className="text-secondary font-inter text-xs">
									Version, offline philosophy, and credits
								</AppText>
							</View>
							<MaterialIcons name="chevron-right" size={24} color="#64748B" />
						</Pressable>

						{/* Privacy Policy */}
						<Pressable
							onPress={() => {
								triggerHaptic(hapticsEnabled);
								setShowPrivacyModal(true);
							}}
							className="border-border flex-row items-center justify-between border-b p-4 active:bg-slate-50"
						>
							<View>
								<AppText className="font-interMedium text-text text-base">
									Privacy Policy
								</AppText>
								<AppText className="text-secondary font-inter text-xs">
									Zero-tracking, local-first data policy
								</AppText>
							</View>
							<MaterialIcons name="chevron-right" size={24} color="#64748B" />
						</Pressable>

						{/* Terms and Conditions */}
						<Pressable
							onPress={() => {
								triggerHaptic(hapticsEnabled);
								setShowTermsModal(true);
							}}
							className="flex-row items-center justify-between p-4 active:bg-slate-50"
						>
							<View>
								<AppText className="font-interMedium text-text text-base">
									Terms & Conditions
								</AppText>
								<AppText className="text-secondary font-inter text-xs">
									Usage terms and system reminder guidance
								</AppText>
							</View>
							<MaterialIcons name="chevron-right" size={24} color="#64748B" />
						</Pressable>
					</View>
				</View>
			</ScrollView>

			{/* ================= MODAL: CLEAR ALL TASKS ================= */}
			<Modal
				visible={showClearModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowClearModal(false)}
			>
				<View className="flex-1 items-center justify-center bg-black/50 p-6">
					<View className="border-border bg-surface w-full max-w-sm rounded-3xl border p-6 shadow-xl">
						<View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-red-100">
							<Ionicons name="trash-outline" size={24} color="#EF4444" />
						</View>

						<AppText className="font-interBold text-text text-xl">Clear All Tasks?</AppText>
						<AppText className="text-secondary font-inter mt-2 text-sm leading-5">
							This will permanently delete all your tasks and cancel any scheduled reminders.
							This action cannot be undone.
						</AppText>

						<View className="mt-6 flex-row justify-end gap-3">
							<Pressable
								onPress={() => setShowClearModal(false)}
								className="rounded-xl px-4 py-2.5 active:bg-slate-100"
							>
								<AppText className="font-interMedium text-secondary text-sm">Cancel</AppText>
							</Pressable>
							<Pressable
								onPress={handleClearAll}
								disabled={isClearing}
								className="rounded-xl bg-red-500 px-5 py-2.5 active:bg-red-600"
							>
								<AppText className="font-interBold text-sm text-white">
									{isClearing ? "Clearing..." : "Clear All"}
								</AppText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>

			{/* ================= MODAL: PRIVACY POLICY ================= */}
			<Modal
				visible={showPrivacyModal}
				transparent
				animationType="slide"
				onRequestClose={() => setShowPrivacyModal(false)}
			>
				<View className="flex-1 justify-end bg-black/50">
					<View className="border-border bg-surface max-h-[80%] rounded-t-3xl border-t p-6 shadow-2xl">
						<View className="flex-row items-center justify-between pb-3 border-b border-border">
							<AppText className="font-interBold text-text text-xl">Privacy Policy</AppText>
							<Pressable onPress={() => setShowPrivacyModal(false)} className="p-1">
								<Ionicons name="close" size={24} color="#64748B" />
							</Pressable>
						</View>

						<ScrollView className="mt-4 gap-3" showsVerticalScrollIndicator={false}>
							<AppText className="font-interBold text-text text-sm">1. Local-First Storage</AppText>
							<AppText className="text-secondary text-xs leading-5">
								Taskt stores all your tasks, schedules, and custom settings locally on your
								device via SQLite. We do not transmit or store your personal tasks on any
								remote servers.
							</AppText>

							<AppText className="font-interBold text-text text-sm mt-2">2. Zero Tracking</AppText>
							<AppText className="text-secondary text-xs leading-5">
								We do not collect personal identifiers, usage telemetry, advertising IDs, or
								analytics.
							</AppText>

							<AppText className="font-interBold text-text text-sm mt-2">3. Device Permissions</AppText>
							<AppText className="text-secondary text-xs leading-5">
								Notifications and exact alarm permissions are used solely to alert you of
								tasks you explicitly scheduled.
							</AppText>

							<AppText className="font-interBold text-text text-sm mt-2">4. Contact</AppText>
							<AppText className="text-secondary text-xs leading-5 pb-6">
								For any privacy questions or data requests, contact us at:{"\n"}
								<AppText className="font-interSBold text-primary">shahabasahx@gmail.com</AppText>
							</AppText>
						</ScrollView>
					</View>
				</View>
			</Modal>

			{/* ================= MODAL: TERMS & CONDITIONS ================= */}
			<Modal
				visible={showTermsModal}
				transparent
				animationType="slide"
				onRequestClose={() => setShowTermsModal(false)}
			>
				<View className="flex-1 justify-end bg-black/50">
					<View className="border-border bg-surface max-h-[80%] rounded-t-3xl border-t p-6 shadow-2xl">
						<View className="flex-row items-center justify-between pb-3 border-b border-border">
							<AppText className="font-interBold text-text text-xl">Terms & Conditions</AppText>
							<Pressable onPress={() => setShowTermsModal(false)} className="p-1">
								<Ionicons name="close" size={24} color="#64748B" />
							</Pressable>
						</View>

						<ScrollView className="mt-4 gap-3" showsVerticalScrollIndicator={false}>
							<AppText className="font-interBold text-text text-sm">1. Acceptance of Terms</AppText>
							<AppText className="text-secondary text-xs leading-5">
								By using Taskt, you agree to these terms. Taskt is provided as a personal
								offline task management utility.
							</AppText>

							<AppText className="font-interBold text-text text-sm mt-2">2. Reliability of Reminders</AppText>
							<AppText className="text-secondary text-xs leading-5">
								Taskt schedules reminders through Android's alarm system. Manufacturers
								and battery-saver mechanisms may occasionally delay or suppress notifications
								if battery optimization is enabled.
							</AppText>

							<AppText className="font-interBold text-text text-sm mt-2">3. Disclaimer of Warranties</AppText>
							<AppText className="text-secondary text-xs leading-5">
								The app is provided "as is" without warranty of any kind. You are responsible
								for backing up your critical tasks via the export feature.
							</AppText>

							<AppText className="font-interBold text-text text-sm mt-2">4. Support & Feedback</AppText>
							<AppText className="text-secondary text-xs leading-5 pb-6">
								For support or feedback, reach out to:{"\n"}
								<AppText className="font-interSBold text-primary">shahabasahx@gmail.com</AppText>
							</AppText>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</View>
	);
};

export default SettingsPage;
