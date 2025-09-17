import { createAction } from "@reduxjs/toolkit";
import type {
	ChangeSystemPayload,
	TaskDonePayload,
	TaskPayload,
} from "./types.js";

export const setFull = createAction<number>("garanti/setFull");
export const setHalf = createAction<number>("garanti/setHalf");
export const toggleU = createAction("garanti/toggleU");
export const enterKeys = createAction<string>("garanti/enterKeys");
export const changeSystem = createAction<ChangeSystemPayload>(
	"garanti/changeSystem",
);
export const clearSystem = createAction("garanti/clearSystem");
export const changeTableMinGroup = createAction<number>(
	"garanti/changeTableMinGroup",
);
export const changeTableMinU = createAction<number>("garanti/changeTableMinU");
export const toggleTableGroupLast = createAction(
	"garanti/toggleTableGroupLast",
);
export const toggleTableChanceFraction = createAction(
	"garanti/toggleTableChanceFraction",
);
export const toggleTableChancePercent = createAction(
	"garanti/toggleTableChancePercent",
);
export const addTask = createAction<TaskPayload>("garanti/addTask");
export const taskDone = createAction<TaskDonePayload>("garanti/taskDone");
