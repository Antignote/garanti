import { table, getBorderCharacters } from "table";

const MAX_CORRECTS = 13;

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
}) => {
	if (uSystem) {
		rows = rows.filter((r) => {
			return r.uCorrects >= tableMinU;
		});
	}

	rows.forEach((outcome) => {
		outcome.correctsAsString =
			outcome.uCorrects +
			";" +
			Object.entries(outcome.corrects)
				.flatMap((x) => x.join(":"))
				.slice(-(MAX_CORRECTS - tableMinGroup + 1))
				.join(";");
	});

	const occurrences = new Map();
	rows.forEach((outcome) => {
		if (!occurrences.has(outcome.correctsAsString)) {
			occurrences.set(outcome.correctsAsString, 0);
		}

		occurrences.set(
			outcome.correctsAsString,
			occurrences.get(outcome.correctsAsString) + 1,
		);
	});

	rows.forEach((outcome) => {
		outcome.occurrences = occurrences.get(outcome.correctsAsString);
	});

	const totalUGroups = new Map();
	if (uSystem) {
		rows.forEach((outcome) => {
			if (!totalUGroups.has(outcome.uCorrects)) {
				totalUGroups.set(outcome.uCorrects, 0);
			}

			totalUGroups.set(
				outcome.uCorrects,
				totalUGroups.get(outcome.uCorrects) + 1,
			);
		});
	}
	rows.forEach((outcome) => {
		if (uSystem) {
			outcome.totalGroup = totalUGroups.get(outcome.uCorrects);
		} else {
			outcome.totalGroup = rows.length;
		}
	});

	const corrects = new Set();
	const filtered = rows.filter((outcome) => {
		if (corrects.has(outcome.correctsAsString)) {
			return false;
		}

		corrects.add(outcome.correctsAsString);
		return true;
	});

	let sorted = filtered.sort((a, b) => {
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
				} else {
					continue;
				}
			}
		}
	});

	const offsetFromMax = sorted[0].row.length;
	sorted.forEach((r) => {
		const correctedCorrects = {};
		for (const [key, value] of Object.entries(r.corrects)) {
			correctedCorrects[MAX_CORRECTS - offsetFromMax + Number(key)] = value;
		}
		r.correctedCorrects = correctedCorrects;
	});

	const canCollapse = (a, b, fromCorrectedCorrectsIndex) => {
		let current = fromCorrectedCorrectsIndex;
		// eslint-disable-next-line no-constant-condition
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
		let groupCandidate = null;
		sorted.forEach((outcome, index) => {
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
					let cIndex = MAX_CORRECTS - i;
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

		sorted = sorted.filter((outcome) => {
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

	const fillEmptyString = (arr) => {
		const newArr = [...arr];
		while (newArr.length <= length) {
			newArr.push("");
		}

		return newArr;
	};

	const data = [];

	const nameData = [
		(uSystem ? "U" : "R") + fullHedges + "-" + halfHedges + "-" + systemSize,
	];
	let headerData = [];
	if (uSystem) {
		headerData.push("U-tips");
	}
	for (let i = MAX_CORRECTS; i >= tableMinGroup; --i) {
		headerData.push(i);
	}

	if (chanceFraction || chancePercent) {
		headerData.push("Chans");
	}

	data.push(fillEmptyString(nameData));
	data.push(fillEmptyString(headerData));

	let prevUGroup = null;
	for (const r of sorted) {
		let itemData = [];

		if (uSystem) {
			itemData.push(r.uCorrects);
		}
		for (let i = MAX_CORRECTS; i >= tableMinGroup; --i) {
			if (r.correctedCorrects[i] === 0) {
				itemData.push("-");
			} else {
				if (Array.isArray(r.correctedCorrects[i])) {
					itemData.push(r.correctedCorrects[i].reverse().join("-"));
				} else {
					itemData.push(r.correctedCorrects[i]);
				}
			}
		}
		if (chanceFraction) {
			itemData.push(r.occurrences + "/" + r.totalGroup);
		}
		if (chancePercent) {
			itemData.push(
				String(+((r.occurrences / r.totalGroup) * 100).toFixed(2)).replace(
					".",
					",",
				) + "%",
			);
		}
		if (uSystem && prevUGroup !== r.uCorrects && prevUGroup !== null) {
			const dividerColumns = fillEmptyString([]);
			data.push(dividerColumns);
		}

		prevUGroup = r.uCorrects;

		data.push(itemData);
	}

	const columns = {
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
		drawHorizontalLine: (index) => {
			return index === 2;
		},
	});
};

onmessage = (e) => {
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
	console.log("worker: table (" + taskId + ")");
	const table = formatTable({
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
	postMessage({ table, taskId });
};

onerror = (e) => {
	postMessage(e);
};
