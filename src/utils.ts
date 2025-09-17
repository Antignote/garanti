import type {
	Corrects,
	HalfHedgeUOutcomes,
	HedgeSigns,
	IndexMapping,
	Mark,
	Num1X2,
	RowData,
	UOutcomes,
} from "./types.js";

const NUM_TO_HEDGE_SIGNS: HedgeSigns = {
	7: [1, 2, 3],
	6: [2, 3],
	5: [1, 3],
	4: [1, 2],
};

const NUM_TO_1X2: Num1X2 = {
	1: "1",
	2: "X",
	3: "2",
	4: "1X",
	5: "12",
	6: "X2",
	7: "1X2",
};

const getMathRows = (
	row: number[],
	currentMark: number,
	marks: Mark[],
): number[][] => {
	if (marks.length === currentMark) {
		return [];
	}

	const combinedRows = [];
	for (const mark of NUM_TO_HEDGE_SIGNS[marks[currentMark].marks]) {
		row[marks[currentMark].position] = mark;

		if (currentMark === marks.length - 1) {
			combinedRows.push(row.slice(0));
		}

		combinedRows.push(...getMathRows(row, currentMark + 1, marks));
	}

	return combinedRows;
};

export const splitToRows = (row: number[]): number[][] => {
	const marks: Mark[] = [];
	let rows: number[][] = [];

	for (let i = 0; i < row.length; ++i) {
		if (row[i] > 3) {
			marks.push({
				position: i,
				marks: row[i],
			});
		}
	}

	if (marks.length) {
		rows = getMathRows(row.slice(0), 0, marks);
	} else {
		rows = [row];
	}

	return rows;
};

const U_OUTCOMES: UOutcomes = {
	1: { 1: 1, 2: 2, 3: 3 },
	2: { 1: 2, 2: 1, 3: 3 },
	3: { 1: 3, 2: 1, 3: 2 },
};
const HALF_HEDGE_U_OUTCOMES: HalfHedgeUOutcomes = {
	1: {
		4: { 1: 1, 2: 2 },
		5: { 1: 1, 3: 3 },
	},
	2: {
		4: { 1: 2, 2: 1 },
		6: { 1: 2, 2: 3 },
	},
	3: {
		5: { 1: 3, 2: 1 },
		6: { 1: 3, 2: 2 },
	},
};

export const getExpandedRowsFromSingleRow = (
	system: number[][],
	row: number[],
	uRows?: number[],
): (string | number)[][] => {
	const fullIndices = [];
	const halfIndices = [];
	const singlesIndices = [];
	const isUSystem = Boolean(uRows);

	for (let i = 0; i < row.length; ++i) {
		if (row[i] <= 3) {
			singlesIndices.push(i);
		} else if (row[i] <= 6) {
			halfIndices.push(i);
		} else {
			fullIndices.push(i);
		}
	}

	const expandedRows = [];
	for (const key of system) {
		const eRow = [];

		let currentFullIndex = -1;
		for (const fullIndex of fullIndices) {
			const keyIndex = ++currentFullIndex;
			if (isUSystem) {
				const uSign = uRows![fullIndex];
				eRow.push(U_OUTCOMES[uSign][key[keyIndex]]);
			} else {
				eRow.push(key[keyIndex]);
			}
		}

		let currentHalfIndex = fullIndices.length - 1;
		for (const halfIndex of halfIndices) {
			const keyIndex = ++currentHalfIndex;
			if (isUSystem) {
				const uSign = uRows![halfIndex];
				eRow.push(HALF_HEDGE_U_OUTCOMES[uSign][row[halfIndex]][key[keyIndex]]);
			} else {
				eRow.push(key[keyIndex]);
			}
		}

		for (const singleIndex of singlesIndices) {
			eRow[singleIndex] = NUM_TO_1X2[row[singleIndex]];
		}
		expandedRows.push(eRow);
	}

	return expandedRows;
};

export const getExpandedRows = (
	system: number[][],
	row: number[],
	uRows?: number[],
): (string | number)[][] => {
	const marks: Mark[] = [];
	const currentRow = row;
	let rowsToProcess: number[][] = [];
	const processedRows: (string | number)[][] = [];

	for (let i = 0; i < currentRow.length; i++) {
		if (currentRow[i] > 3) {
			marks.push({
				position: i,
				marks: currentRow[i],
			});
		}
	}

	if (marks.length) {
		rowsToProcess = getMathRows(currentRow, 0, marks);
	} else {
		rowsToProcess.push(currentRow);
	}

	for (const row of rowsToProcess) {
		processedRows.push(...getExpandedRowsFromSingleRow(system, row, uRows));
	}

	return processedRows;
};

export const calculateCorrectsForRowInSystem = (
	row: RowData,
	systemRows: (string | number)[][],
): Corrects => {
	const corrects: Corrects = {};

	for (const reducedRow of systemRows) {
		let correctForReducedRow = 0;
		row.row.forEach((m, index) => {
			if (reducedRow[index] === m) {
				correctForReducedRow++;
			}
		});
		corrects[correctForReducedRow] = corrects[correctForReducedRow] || 0;
		corrects[correctForReducedRow]++;
	}

	return corrects;
};

export const ZERO_TO_ONE_INDEX: IndexMapping = {
	0: "1",
	1: "2",
	2: "3",
	3: "4",
	4: "5",
	5: "6",
	6: "7",
};

export const ONE_TO_ZERO_INDEX: IndexMapping = {
	1: "0",
	2: "1",
	3: "2",
	4: "3",
	5: "4",
	6: "5",
	7: "6",
};
