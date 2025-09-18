import { getBorderCharacters, table } from "table";

const MAX_CORRECTS = 13;

interface FormatTableArgs {
	tableMinGroup: number;
	tableMinU: number;
	collapseLast: boolean;
	rows: any[];
	uSystem: boolean;
	fullHedges: number;
	halfHedges: number;
	systemSize: number;
	chanceFraction: boolean;
	chancePercent: boolean;
}

const formatTable = ({
	tableMinGroup,
	tableMinU,
	collapseLast,
	rows,
	uSystem,
	fullHedges,
	halfHedges,
	systemSize,
	chanceFraction,
	chancePercent,
}: FormatTableArgs): string => {
	if (uSystem) {
		rows = rows.filter((r) => {
			return r.uCorrects >= tableMinU;
		});
	}

	rows.forEach((outcome: any) => {
		outcome.correctsAsString =
			outcome.uCorrects +
			";" +
			Object.entries(outcome.corrects)
				.flatMap((x) => x.join(":"))
				.slice(-(MAX_CORRECTS - tableMinGroup + 1))
				.join(";");
	});

       const occurrences = new Map<string, number>();
       rows.forEach((outcome: any) => {
	       if (!occurrences.has(outcome.correctsAsString)) {
		       occurrences.set(outcome.correctsAsString, 0);
	       }
	       occurrences.set(
		       outcome.correctsAsString,
		       (occurrences.get(outcome.correctsAsString) ?? 0) + 1,
	       );
       });

       rows.forEach((outcome: any) => {
	       outcome.occurrences = occurrences.get(outcome.correctsAsString);
       });

       const totalUGroups = new Map<number, number>();
       if (uSystem) {
	       rows.forEach((outcome: any) => {
		       if (!totalUGroups.has(outcome.uCorrects)) {
			       totalUGroups.set(outcome.uCorrects, 0);
		       }
		       totalUGroups.set(
			       outcome.uCorrects,
			       (totalUGroups.get(outcome.uCorrects) ?? 0) + 1,
		       );
	       });
       }
       rows.forEach((outcome: any) => {
	       if (uSystem) {
		       outcome.totalGroup = totalUGroups.get(outcome.uCorrects);
	       } else {
		       outcome.totalGroup = rows.length;
	       }
       });

       const corrects = new Set<string>();
       const filtered = rows.filter((outcome: any) => {
	       if (corrects.has(outcome.correctsAsString)) {
		       return false;
	       }
	       corrects.add(outcome.correctsAsString);
	       return true;
       });

       let sorted = filtered.sort((a: any, b: any) => {
	       const size = a.row.length;
	       for (let i = size; i >= 0; --i) {
		       if (a.uCorrects > b.uCorrects) {
			       return -1;
		       } else if (a.uCorrects < b.uCorrects) {
			       return 1;
		       } else {
			       if (a.corrects[i] > b.corrects[i]) {
				       return -1;
			       } else if (a.corrects[i] < b.corrects[i]) {
				       return 1;
			       }
		       }
	       }
	       return 0;
       });

	const offsetFromMax = sorted[0].row.length;
       sorted.forEach((r: any) => {
	       const correctedCorrects: Record<number, any> = {};
	       for (const [key, value] of Object.entries(r.corrects)) {
		       correctedCorrects[MAX_CORRECTS - offsetFromMax + Number(key)] = value;
	       }
	       r.correctedCorrects = correctedCorrects;
       });

       const canCollapse = (a: any, b: any, fromCorrectedCorrectsIndex: number): boolean => {
	       let current = fromCorrectedCorrectsIndex;
	       while (true) {
		       if (current === MAX_CORRECTS + 1) {
			       const aU = a.uCorrects;
			       const bU = b.uCorrects;
			       if (aU !== bU) {
				       return false;
			       } else {
				       break;
			       }
		       }

		       const aC = a.correctedCorrects[current];
		       const bC = b.correctedCorrects[current];
		       if (aC !== bC) {
			       return false;
		       }

		       current += 1;
	       }

	       return true;
       };

       if (collapseLast) {
	       let groupCandidate: any = null;
	       sorted.forEach((outcome: any, index: number) => {
		       // skip outcomes that are grouped
		       if (outcome.toDelete) {
			       return;
		       }

		       if (!groupCandidate) {
			       groupCandidate = outcome;
			       return;
		       }
		       const prev = sorted?.[index - 1] ?? null;
		       if (prev) {
			       const lastIndex = MAX_CORRECTS - tableMinGroup;
			       for (let i = lastIndex; i > lastIndex - 1; i--) {
				       const cIndex = MAX_CORRECTS - i;
				       const corrects = outcome.correctedCorrects[cIndex];
				       const diff = prev.correctedCorrects[cIndex] - corrects;
				       const collapseFromIndex = cIndex + 1;
				       const collapse = canCollapse(prev, outcome, collapseFromIndex);
				       if (diff === 1 && collapse) {
					       outcome.toDelete = true;
					       if (!Array.isArray(groupCandidate.correctedCorrects[cIndex])) {
						       groupCandidate.correctedCorrects[cIndex] = [
							       groupCandidate.correctedCorrects[cIndex],
							       null,
						       ];
					       }
					       groupCandidate.occurrences += outcome.occurrences;
					       groupCandidate.correctedCorrects[cIndex][1] =
						       outcome.correctedCorrects[cIndex];
				       } else {
					       groupCandidate = outcome;
					       return;
				       }
			       }
		       } else {
			       return;
		       }
	       });

	       sorted = sorted.filter((outcome: any) => {
		       return !outcome.toDelete;
	       });
       }

       let length = MAX_CORRECTS - tableMinGroup + (uSystem ? 1 : 0);
       if (chanceFraction) {
	       length += 1;
       }

       if (chancePercent) {
	       length += 1;
       }

       const fillEmptyString = (arr: string[]): string[] => {
	       const newArr = [...arr];
	       while (newArr.length <= length) {
		       newArr.push("");
	       }
	       return newArr;
       };

       const data: string[][] = [];

       const nameData: string[] = [
	       `${uSystem ? "U" : "R"}${fullHedges}-${halfHedges}-${systemSize}`,
       ];
       const headerData: string[] = [];
       if (uSystem) {
	       headerData.push("U-tips");
       }
       for (let i = MAX_CORRECTS; i >= tableMinGroup; --i) {
	       headerData.push(i.toString());
       }

       if (chanceFraction || chancePercent) {
	       headerData.push("Chans");
       }

       data.push(fillEmptyString(nameData));
       data.push(fillEmptyString(headerData));

       let prevUGroup: number | null = null;
       for (const r of sorted) {
	       const itemData: string[] = [];

	       if (uSystem) {
		       itemData.push(r.uCorrects.toString());
	       }
	       for (let i = MAX_CORRECTS; i >= tableMinGroup; --i) {
		       if (r.correctedCorrects[i] === 0) {
			       itemData.push("-");
		       } else {
			       if (Array.isArray(r.correctedCorrects[i])) {
				       itemData.push(r.correctedCorrects[i].reverse().join("-"));
			       } else {
				       itemData.push(r.correctedCorrects[i].toString());
			       }
		       }
	       }
	       if (chanceFraction) {
		       itemData.push(`${r.occurrences}/${r.totalGroup}`);
	       }
	       if (chancePercent) {
		       itemData.push(
			       `${String(+((r.occurrences / r.totalGroup) * 100).toFixed(2)).replace(
				       ".",
				       ",",
			       )}%`,
		       );
	       }
	       if (uSystem && prevUGroup !== r.uCorrects && prevUGroup !== null) {
		       const dividerColumns = fillEmptyString([]);
		       data.push(dividerColumns);
	       }

	       prevUGroup = r.uCorrects;

	       data.push(itemData);
       }

       const columns: Record<number, any> = {
	       0: {
		       paddingLeft: 0,
	       },
       };

       const numColumns = data[0].length;
       columns[numColumns - 1] = {
	       paddingRight: 0,
       };

       if (chanceFraction || chancePercent) {
	       let numChanceCols = chanceFraction && chancePercent ? 2 : 1;
	       while (numChanceCols > 0) {
		       columns[numColumns - numChanceCols] = {
			       ...columns[numColumns - numChanceCols],
			       alignment: "right",
		       };
		       numChanceCols--;
	       }
       }

       return table(data, {
	       border: { ...getBorderCharacters(`void`), joinBody: `-` },
	       columnDefault: {
		       paddingLeft: 1,
		       paddingRight: 3,
	       },
	       columns,
	       drawHorizontalLine: (index: number) => {
		       return index === 2;
	       },
       });
};


self.onmessage = (e: MessageEvent) => {
       const {
	       taskId,
	       tableMinGroup,
	       tableMinU,
	       collapseLast,
	       rows,
	       uSystem,
	       fullHedges,
	       halfHedges,
	       systemSize,
	       chanceFraction,
	       chancePercent,
       } = e.data;
       console.log(`worker: table (${taskId})`);
       const tableStr = formatTable({
	       tableMinGroup,
	       tableMinU,
	       collapseLast,
	       rows,
	       uSystem,
	       fullHedges,
	       halfHedges,
	       systemSize,
	       chanceFraction,
	       chancePercent,
       });
       postMessage({ table: tableStr, taskId });
};

self.onerror = function (event) {
	postMessage(event);
};
