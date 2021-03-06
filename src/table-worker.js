import { table, getBorderCharacters } from 'table';

const MAX_CORRECTS = 13;

const formatTable = ({
	collapseLast,
	minGroup,
	minU,
	rows,
	uSystem,
	fullHedges,
	halfHedges,
	systemSize,
}) => {
	rows = rows.filter((r) => {
		return r.uCorrects >= minU;
	});

	rows.forEach((outcome) => {
		outcome.correctsAsString =
			outcome.uCorrects +
			';' +
			Object.entries(outcome.corrects)
				.flatMap((x) => x.join(':'))
				.slice(-(MAX_CORRECTS - minGroup + 1))
				.join(';');
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
				const lastIndex = MAX_CORRECTS - minGroup;
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

	const length = MAX_CORRECTS - minGroup + (uSystem ? 2 : 1);

	const fillEmptyString = (arr) => {
		const newArr = [...arr];
		while (newArr.length <= length) {
			newArr.push('');
		}

		return newArr;
	};

	const data = [];

	const nameData = [
		(uSystem ? 'U' : 'R') + fullHedges + '-' + halfHedges + '-' + systemSize,
	];
	let headerData = [];
	if (uSystem) {
		headerData.push('U-tips');
	}
	for (let i = MAX_CORRECTS; i >= minGroup; --i) {
		headerData.push(i);
	}
	headerData.push('Chans');

	data.push(fillEmptyString(nameData));
	data.push(headerData);

	let prevUGroup = null;
	for (const r of sorted) {
		let itemData = [];

		if (uSystem) {
			itemData.push(r.uCorrects);
		}
		for (let i = MAX_CORRECTS; i >= minGroup; --i) {
			if (r.correctedCorrects[i] === 0) {
				itemData.push('-');
			} else {
				if (Array.isArray(r.correctedCorrects[i])) {
					itemData.push(r.correctedCorrects[i].reverse().join('-'));
				} else {
					itemData.push(r.correctedCorrects[i]);
				}
			}
		}
		itemData.push(r.occurrences + '/' + r.totalGroup);
		if (uSystem && prevUGroup !== r.uCorrects && prevUGroup !== null) {
			const dividerColumns = fillEmptyString([]);
			data.push(dividerColumns);
		}

		prevUGroup = r.uCorrects;

		data.push(itemData);
	}

	return table(data, {
		border: { ...getBorderCharacters(`void`), joinBody: `-` },
		columnDefault: {
			paddingLeft: 1,
			paddingRight: 3,
		},
		columns: {
			0: {
				paddingLeft: 0,
			},
			[data[0].length - 1]: {
				alignment: 'right',
				paddingRight: 0,
			},
		},
		drawHorizontalLine: (index) => {
			return index === 2;
		},
	});
};

onmessage = (e) => {
	const [
		minGroup,
		minU,
		collapseLast,
		rows,
		uSystem,
		fullHedges,
		halfHedges,
		systemSize,
	] = e.data;
	const table = formatTable({
		rows,
		collapseLast,
		minGroup,
		minU,
		uSystem,
		fullHedges,
		halfHedges,
		systemSize,
	});
	postMessage(table);
};

onerror = (e) => {
	postMessage(e);
};
