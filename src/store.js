import {
	combineReducers,
	configureStore,
	createReducer,
	createSelector,
	getDefaultMiddleware,
} from '@reduxjs/toolkit';
import {
	setFull,
	setHalf,
	changeSystem,
	changeTableMinGroup,
	changeTableMinU,
	clearSystem,
	enterKeys,
	toggleTableGroupLast,
	toggleU,
} from './actions';
import { systemsReducer } from './system-reducer';
import { taskReducer } from './task-reducer';
import { ZERO_TO_ONE_INDEX } from './utils';

export const DEFAULT_U = true;
export const DEFAULT_FULL = 0;
export const DEFAULT_HALF = 0;
export const DEFAULT_SYSTEM = 0;
export const DEFAULT_KEYS = '';
const DEFAULT_TABLE_MIN_GROUP = 10;
const DEFAULT_TABLE_MIN_U = 0;
const DEFAULT_TABLE_COLLAPSE_LAST = true;

const reducer = createReducer(
	{
		full: DEFAULT_FULL,
		half: DEFAULT_HALF,
		u: DEFAULT_U,
		keys: DEFAULT_KEYS,
		system: DEFAULT_SYSTEM,
		tableMinGroup: DEFAULT_TABLE_MIN_GROUP,
		tableMinU: DEFAULT_TABLE_MIN_U,
		tableGroupLast: DEFAULT_TABLE_COLLAPSE_LAST,
	},
	(builder) => {
		builder
			.addCase(setFull, (state, action) => {
				state.full = action.payload;
				state.system = DEFAULT_SYSTEM;
			})
			.addCase(setHalf, (state, action) => {
				state.half = action.payload;
				state.system = DEFAULT_SYSTEM;
			})
			.addCase(toggleU, (state) => {
				state.u = !state.u;
				state.system = DEFAULT_SYSTEM;
			})
			.addCase(enterKeys, (state, action) => {
				state.keys = action.payload;
			})
			.addCase(changeTableMinGroup, (state, action) => {
				state.tableMinGroup = action.payload;
			})
			.addCase(changeTableMinU, (state, action) => {
				state.tableMinU = action.payload;
			})
			.addCase(toggleTableGroupLast, (state) => {
				state.tableGroupLast = !state.tableGroupLast;
			})
			.addCase(changeSystem, (state, action) => {
				const { name, system } = action.payload;
				state.system = name;
				state.full = system.numFullHedges;
				state.half = system.numHalfHedges;
				state.u = system.systemType === 'U';
				state.keys = system.rows
					.map((row) => {
						return row
							.map((sign) => {
								return ZERO_TO_ONE_INDEX[sign];
							})
							.join('');
					})
					.join('\n');
			})
			.addCase(clearSystem, (state) => {
				state.system = DEFAULT_SYSTEM;
				state.full = DEFAULT_FULL;
				state.half = DEFAULT_HALF;
				state.u = DEFAULT_U;
				state.keys = DEFAULT_KEYS;
			});
	},
);

const rootReducer = combineReducers({
	general: reducer,
	systems: systemsReducer,
	task: taskReducer,
});

export const store = configureStore({
	reducer: rootReducer,
	middleware: getDefaultMiddleware({
		immutableCheck: false,
		serializableCheck: false,
	}),
});
