import { createReducer } from "@reduxjs/toolkit";
import { addTask, taskDone } from "./actions.js";
import type { TaskData, TaskState } from "./types.js";

const initialData: TaskData = {
	table: "",
};

export const taskReducer = createReducer<TaskState>(
	{
		lastTask: null,
		isWorking: false,
		lastTaskId: null,
		data: { ...initialData },
	},
	(builder) => {
		builder
			.addCase(addTask, (state, action) => {
				const {  task } = action.payload;
				state.lastTask = task;
				// state.lastTaskId = id;
				state.data = initialData;
				state.isWorking = true;
			})
			.addCase(taskDone, (state, action) => {
				const { id, task, data } = action.payload;
				// if (state.lastTaskId > id) {
				// 	return;
				// }

				let nextTask = state.lastTask;
				let nextIsWorking = state.isWorking;

				if (task === "expoundedKeys") {
					nextTask = "garantiRows";
				} else if (task === "garantiRows") {
					nextTask = "table";
				} else if (task === "table") {
					nextTask = null;
					nextIsWorking = false;
				}

				return {
					...state,
					lastTask: nextTask,
					isWorking: nextIsWorking,
					data: {
						...state.data,
						...data,
					},
				};
			});
	},
);
