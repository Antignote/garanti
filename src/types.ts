export type TaskType = "expoundedKeys" | "garantiRows" | "table";

// System types
export type SystemType = "R" | "U";

export interface System {
	numFullHedges: number;
	numHalfHedges: number;
	rows: number[][];
	systemType: SystemType;
}

export interface Systems {
	[key: string]: System;
}

// Redux state types
export interface GeneralState {
	full: number;
	half: number;
	u: boolean;
	keys: string;
	system: string | number;
	tableMinGroup: number;
	tableMinU: number;
	tableGroupLast: boolean;
	tableChanceFraction: boolean;
	tableChancePercent: boolean;
}

export interface TaskData {
	table?: string;
}

export interface TaskState {
	isWorking: boolean;
	lastTask: TaskType | null;
	lastTaskId: number | null;
	data: TaskData;
}

export interface RootState {
	general: GeneralState;
	systems: Systems;
	task: TaskState;
}

// Action payload types
export interface ChangeSystemPayload {
	name: string;
	system: System;
}

export interface TaskPayload {
	task: TaskType;
	id: number;
}

export interface TaskDonePayload extends TaskPayload {
	data?: TaskData;
}

// Worker message types
export interface ExpoundedKeysWorkerMessage {
	taskId: number;
	keys: number[][];
}

export interface ExpoundedKeysWorkerResponse {
	taskId: number;
	expoundedKeys: number[][];
}

export interface GarantiWorkerMessage {
	taskId: number;
	fullHedges: number;
	halfHedges: number;
	expoundedKeys: number[][];
	uSystem: boolean;
}

export interface GarantiRow {
	row: (string | number)[];
	corrects: Corrects;
}

export interface GarantiWorkerResponse {
	taskId: number;
	garantiRows: GarantiRow[];
}

export interface TableWorkerMessage {
	taskId: number;
	tableMinGroup: number;
	tableMinU: number;
	collapseLast: boolean;
	rows: GarantiRow[];
	uSystem: boolean;
	fullHedges: number;
	halfHedges: number;
	systemSize: number;
	chanceFraction: boolean;
	chancePercent: boolean;
}

export interface TableWorkerResponse {
	taskId: number;
	table: string;
}

// Utility types
export interface Mark {
	position: number;
	marks: number;
}

export interface RowData {
	row: (string | number)[];
}

export interface Corrects {
	[key: number]: number;
}

// Hedge signs mappings
export interface HedgeSigns {
	[key: number]: number[];
}

export interface Num1X2 {
	[key: number]: string;
}

export interface UOutcomes {
	[key: number]: {
		[key: number]: number;
	};
}

export interface HalfHedgeUOutcomes {
	[key: number]: {
		[key: number]: {
			[key: number]: number;
		};
	};
}

export interface IndexMapping {
	[key: number]: string;
}
