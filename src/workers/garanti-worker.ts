import {
	calculateCorrectsForRowInSystem,
	getExpandedRowsFromSingleRow,
	splitToRows,
} from "../utils";

export const makeGaranti = ({
	fullHedges,
	halfHedges,
	expoundedKeys,
	uSystem,
}) => {
	const numHedges = fullHedges + halfHedges;
	const correctsStructure = {};
	const row = [];
	const uRow = uSystem ? [] : null;
	for (let i = 0; i < numHedges + 1; ++i) {
		correctsStructure[numHedges - i] = 0;
		if (i < numHedges) {
			if (i < fullHedges) {
				row.push(7);
			} else {
				row.push(4);
			}
			if (uSystem) {
				uRow.push(1);
			}
		}
	}

	const possibleOutcomes = splitToRows(row).map((row) => ({
		row,
		corrects: { ...correctsStructure },
		uCorrects: 0,
	}));

	const rows = getExpandedRowsFromSingleRow(expoundedKeys, row, uRow);

	for (const possibleOutcome of possibleOutcomes) {
		const corrects = calculateCorrectsForRowInSystem(possibleOutcome, rows);

		for (const correct of Object.keys(corrects)) {
			possibleOutcome.corrects[correct] += corrects[correct];
		}
		if (uSystem) {
			const uCorrects = uRow.filter((sign, index) => {
				return possibleOutcome.row[index] === sign;
			}).length;
			possibleOutcome.uCorrects = uCorrects;
		}
	}

	return possibleOutcomes;
};

onmessage = (e) => {
	const { taskId, fullHedges, halfHedges, uSystem, expoundedKeys } = e.data;
	console.log("worker: garanti (" + taskId + ")");
	const garantiRows = makeGaranti({
		fullHedges,
		halfHedges,
		expoundedKeys,
		uSystem,
	});
	postMessage({ garantiRows, taskId });
};
