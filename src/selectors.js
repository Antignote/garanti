import { createSelector } from '@reduxjs/toolkit';
import {
	DEFAULT_FULL,
	DEFAULT_HALF,
	DEFAULT_KEYS,
	DEFAULT_SYSTEM,
	DEFAULT_U,
} from './store.js';

export const selectFull = (state) => state.general.full;
export const selectHalf = (state) => state.general.half;
export const selectU = (state) => state.general.u;
export const selectSystem = (state) => state.general.system;
export const selectKeys = (state) => state.general.keys;
export const selectSystems = (state) => state.systems;
export const selectTableMinGroup = (state) => state.general.tableMinGroup;
export const selectTableMinU = (state) => state.general.tableMinU;
export const selectTableGroupLast = (state) => state.general.tableGroupLast;
export const selectTableChanceFraction = (state) =>
	state.general.tableChanceFraction;
export const selectTableChancePercent = (state) =>
	state.general.tableChancePercent;

export const selectCurrentTask = (state) => state.task.lastTask;
export const selectLastTaskId = (state) => state.task.lastTaskId;
export const selectGarantiTable = (state) => state.task.data.table;
export const selectIsWorking = (state) => state.task.isWorking;

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
