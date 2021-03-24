import { createReducer } from '@reduxjs/toolkit';
import { addTask, taskDone } from './actions';
import { taskType } from './task-type';

const initialData = {
	expoundedKeys: [],
	rows: [],
	table: '',
};

export const taskReducer = createReducer(
	{
		lastTask: null,
		isWorking: false,
		// lastTaskId: Number.NEGATIVE_INFINITY,
		data: { ...initialData },
	},
	(builder) => {
		builder
			.addCase(addTask, (state, action) => {
				const { id, task } = action.payload;
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

				if (task === taskType.TASK_TYPE_EXPOUNDED_KEYS) {
					nextTask = taskType.TASK_TYPE_GARANTI_ROWS;
				} else if (task === taskType.TASK_TYPE_GARANTI_ROWS) {
					nextTask = taskType.TASK_TYPE_TABLE;
				} else if (task === taskType.TASK_TYPE_TABLE) {
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
