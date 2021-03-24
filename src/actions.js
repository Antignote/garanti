import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

export const setFull = createAction('garanti/setFull');
export const setHalf = createAction('garanti/setHalf');
export const toggleU = createAction('garanti/toggleU');
export const enterKeys = createAction('garanti/enterKeys');
export const changeSystem = createAction('garanti/changeSystem');
export const clearSystem = createAction('garanti/clearSystem');
export const changeTableMinGroup = createAction('garanti/changeTableMinGroup');
export const changeTableMinU = createAction('garanti/changeTableMinU');
export const toggleTableGroupLast = createAction(
	'garanti/toggleTableGroupLast',
);
export const toggleTableChanceFraction = createAction(
	'garanti/toggleTableChanceFraction',
);
export const toggleTableChancePercent = createAction(
	'garanti/toggleTableChancePercent',
);
export const addTask = createAction('garanti/addTask');
export const taskDone = createAction('garanti/taskDone');
