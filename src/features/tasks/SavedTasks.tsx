import { FlatList, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";

// components
import Card from "../../components/Card";
import AppText from "../../components/AppText";
import ProgressCard from "../../components/ProgressCard";

import { loadData } from "../../utils/storageUtils";

import type { StoredTaskFormData } from "./task.types";

const SavedTasks = () => {
	const [todoData, setTodoData] = useState<StoredTaskFormData[]>([]);
	const [viewData, setViewData] = useState(false);
	const [todoExtra, setTodoExtra] = useState({
		length: 0,
		status: 0,
	});

	// clearData();

	useFocusEffect(
		useCallback(() => {
			const fetchData = async () => {
				const load: any = await loadData("todoData", viewData);
				if (!load.success) return;

				setTodoData(load.data || []);
			};

			fetchData();
		}, [viewData])
	);

	useEffect(() => {
		setTodoExtra({
			length: todoData.length,
			status: todoData.filter((item) => item.status).length,
		});
	}, [todoData]);

	const handleToggle = (id: string, nextValue: boolean) => {
		setTodoData((prev) =>
			prev.map((item) =>
				item.id === id
					? {
							...item,
							status: nextValue,
						}
					: item
			)
		);
	};

	const handleDelete = (id: string) => {
		setTodoData((prev) => prev.filter((item) => item?.id !== id));
	};

	// console.log("Todo Data", todoData);

	return (
		// <>

		<>
			<ProgressCard todoExtra={todoExtra} />

			<View className="mb-3 flex-row items-center justify-between px-2">
				<AppText className="font-interBold text-text text-xl capitalize">
					{viewData ? "all tasks" : "daily tasks"}
				</AppText>
				<AppText
					onPress={() => setViewData((prev) => !prev)}
					className="font-interSBold text-primary text-base capitalize"
				>
					{viewData ? "View Today" : "View All"}
				</AppText>
			</View>
			{todoData.length > 0 ? (
				<FlatList
					className="flex-1"
					data={todoData}
					keyExtractor={(item, index) => String(item?.id ?? index)}
					renderItem={({ item }) => <Card item={item} onDelete={handleDelete} onToggle={handleToggle} />}
					contentContainerClassName="flex flex-col gap-2 pb-12 px-0.5"
					showsVerticalScrollIndicator={false}
					removeClippedSubviews={false}
				/>
			) : (
				// </>
				<View className="flex-1 items-center justify-center">
					<AppText className="text-secondary italic">Add Task to list here</AppText>
				</View>
			)}
		</>
	);
};

export default SavedTasks;
