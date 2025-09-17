import { createSelector } from "@reduxjs/toolkit";
import {
	DEFAULT_FULL,
	DEFAULT_HALF,
	DEFAULT_KEYS,
	DEFAULT_SYSTEM,
	DEFAULT_U,
} from "./store.js";
import type { RootState } from "./types.js";

export const selectFull = (state: RootState) => state.general.full;
export const selectHalf = (state: RootState) => state.general.half;
export const selectU = (state: RootState) => state.general.u;
export const selectSystem = (state: RootState) => state.general.system;
export const selectKeys = (state: RootState) => state.general.keys;
export const selectSystems = (state: RootState) => state.systems;
export const selectTableMinGroup = (state: RootState) =>
	state.general.tableMinGroup;
export const selectTableMinU = (state: RootState) => state.general.tableMinU;
export const selectTableGroupLast = (state: RootState) =>
	state.general.tableGroupLast;
export const selectTableChanceFraction = (state: RootState) =>
	state.general.tableChanceFraction;
export const selectTableChancePercent = (state: RootState) =>
	state.general.tableChancePercent;

export const selectCurrentTask = (state: RootState) => state.task.lastTask;
export const selectLastTaskId = (state: RootState) => state.task.lastTaskId;
export const selectGarantiTable = (state: RootState) => state.task.data.table;
export const selectIsWorking = (state: RootState) => state.task.isWorking;

export const selectDisabledSubmit = createSelector(
	selectFull,
	selectHalf,
	selectU,
	selectSystem,
	selectKeys,
	(full, half, u, system, keys) => {
		return (
			half === DEFAULT_HALF &&
			full === DEFAULT_FULL &&
			keys === DEFAULT_KEYS &&
			system === DEFAULT_SYSTEM &&
			u === DEFAULT_U
		);
	},
);
