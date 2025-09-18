import {
	calculateCorrectsForRowInSystem,
	getExpandedRowsFromSingleRow,
	splitToRows,
} from "../utils";

import type { GarantiWorkerMessage, GarantiWorkerResponse } from "../types";

interface MakeGarantiArgs {
       fullHedges: number;
       halfHedges: number;
       expoundedKeys: number[][];
       uSystem: boolean;
}

export const makeGaranti = ({
       fullHedges,
       halfHedges,
       expoundedKeys,
       uSystem,
}: MakeGarantiArgs): Array<{
       row: number[];
       corrects: Record<number, number>;
       uCorrects: number;
}> => {
       const numHedges = fullHedges + halfHedges;
       const correctsStructure: Record<number, number> = {};
       const row: number[] = [];
       const uRow: number[] | null = uSystem ? [] : null;
       for (let i = 0; i < numHedges + 1; ++i) {
	       correctsStructure[numHedges - i] = 0;
	       if (i < numHedges) {
		       if (i < fullHedges) {
			       row.push(7);
		       } else {
			       row.push(4);
		       }
		       if (uSystem && uRow) {
			       uRow.push(1);
		       }
	       }
       }

       const possibleOutcomes = splitToRows(row).map((row) => ({
	       row,
	       corrects: { ...correctsStructure },
	       uCorrects: 0,
       }));

       const rows = getExpandedRowsFromSingleRow(expoundedKeys, row, uRow ?? undefined);

       for (const possibleOutcome of possibleOutcomes) {
	       const corrects = calculateCorrectsForRowInSystem(possibleOutcome, rows);

	       for (const correct of Object.keys(corrects)) {
		       possibleOutcome.corrects[Number(correct)] += corrects[Number(correct)];
	       }
	       if (uSystem && uRow) {
		       const uCorrects = uRow.filter((sign, index) => {
			       return possibleOutcome.row[index] === sign;
		       }).length;
		       possibleOutcome.uCorrects = uCorrects;
	       }
       }

       return possibleOutcomes;
};

self.onmessage = (e: MessageEvent) => {
       const { taskId, fullHedges, halfHedges, uSystem, expoundedKeys } = e.data as GarantiWorkerMessage;
       console.log(`worker: garanti (${taskId})`);
       const garantiRows = makeGaranti({
	       fullHedges,
	       halfHedges,
	       expoundedKeys,
	       uSystem,
       });
       postMessage({ garantiRows, taskId } as GarantiWorkerResponse);
};
