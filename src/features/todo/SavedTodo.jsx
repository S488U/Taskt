import { FlatList, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";

// components
import Card from "../../components/Card";
import AppText from "../../components/AppText";
import ProgressCard from "../../components/ProgressCard";

import { loadData, clearData } from "../../utils/storageUtils";

const SavedTodo = () => {
	const [todoData, setTodoData] = useState([]);
	const [viewData, setViewData] = useState(false);
	const [todoExtra, setTodoExtra] = useState({
		length: 0,
		status: 0,
	});

	// clearData();

	useFocusEffect(
		useCallback(() => {
			const fetchData = async () => {
				const load = await loadData("todoData", viewData);

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

	const handleToggle = (id, nextValue) => {
		setTodoData((prev) =>
			prev.map((item) => (item.id === id ? { ...item, status: nextValue } : item))
		);
	};

	const handleDelete = (id) => {
		setTodoData((prev) => prev.filter((item) => item.id !== id));
	};

	console.log("Todo Data", todoData);

	return (
		<>
			{todoData.length > 0 ? (
				<>
					<ProgressCard todoExtra={todoExtra} />

					<View className="mb-3 flex-row items-center justify-between px-2">
						<AppText className="font-interBold text-xl capitalize text-text">
							{viewData ? "all tasks" : "daily tasks"}
						</AppText>
						<AppText
							onPress={() => setViewData((prev) => !prev)}
							className="font-interSBold text-base capitalize text-primary"
						>
							{viewData ? "View Today" : "View All"}
						</AppText>
					</View>

					<FlatList
						className="flex-1"
						data={todoData}
						keyExtractor={(item, index) => String(item?.id ?? index)}
						renderItem={({ item }) => <Card item={item} onDelete={handleDelete} onToggle={handleToggle} />}
						contentContainerClassName="flex flex-col gap-2 pb-12 px-0.5"
						showsVerticalScrollIndicator={false}
						removeClippedSubviews={false}
					/>
				</>
			) : (
				<View className="flex-1 items-center justify-center">
					<AppText className="italic text-secondary">Add Task to list here</AppText>
				</View>
			)}
		</>
	);
};

export default SavedTodo;
