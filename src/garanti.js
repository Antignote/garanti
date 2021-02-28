import {
  splitToRows,
  getExpandedRows,
  calculateCorrectsForRowInSystem,
  ONE_TO_ZERO_INDEX,
} from './utils.js';
import { table, getBorderCharacters } from 'table';

onmessage = (e) => {
  const [fullHedges, halfHedges, uSystem, system] = e.data;
  const correctedSystem = system
    .split('\n')
    .map((row) => row.split('').map((sign) => ONE_TO_ZERO_INDEX[sign]));
  const table = getGuaranteeTable({
    fullHedges,
    halfHedges,
    system: correctedSystem,
    uSystem,
  });
  postMessage(table);
};

onerror = (e) => {
  postMessage(e);
};

const getGuaranteeTable = ({ fullHedges, halfHedges, system, uSystem }) => {
  const numHedges = fullHedges + halfHedges;
  const correctsStructure = {};
  const row = [];
  const uRow = uSystem ? [] : null;
  for (let i = 0; i < numHedges + 1; ++i) {
    correctsStructure[numHedges - i] = 0;
    if (i < numHedges) {
      if (i < fullHedges) {
        row.push('1X2');
      } else {
        row.push('1X');
      }
      if (uSystem) {
        uRow.push('X');
      }
    }
  }

  const possibleOutcomes = splitToRows(row).map((row) => ({
    row,
    corrects: { ...correctsStructure },
    uCorrects: 0,
  }));
  const rows = getExpandedRows(system, row, uRow);

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

  possibleOutcomes.forEach((outcome) => {
    outcome.correctsAsString =
      outcome.uCorrects +
      ';' +
      Object.entries(outcome.corrects)
        .flatMap((x) => x.join(':'))
        .slice(-4)
        .join(';');
  });

  const occurrences = new Map();
  possibleOutcomes.forEach((outcome) => {
    if (!occurrences.has(outcome.correctsAsString)) {
      occurrences.set(outcome.correctsAsString, 0);
    }

    occurrences.set(
      outcome.correctsAsString,
      occurrences.get(outcome.correctsAsString) + 1,
    );
  });

  possibleOutcomes.forEach((outcome) => {
    outcome.occurrences = occurrences.get(outcome.correctsAsString);
  });

  const totalUGroups = new Map();
  if (uSystem) {
    possibleOutcomes.forEach((outcome) => {
      if (!totalUGroups.has(outcome.uCorrects)) {
        totalUGroups.set(outcome.uCorrects, 0);
      }

      totalUGroups.set(
        outcome.uCorrects,
        totalUGroups.get(outcome.uCorrects) + 1,
      );
    });
  }
  possibleOutcomes.forEach((outcome) => {
    if (uSystem) {
      outcome.totalGroup = totalUGroups.get(outcome.uCorrects);
    } else {
      outcome.totalGroup = possibleOutcomes.length;
    }
  });

  const corrects = new Set();
  const filtered = possibleOutcomes.filter((outcome) => {
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

  sorted.forEach((r) => {
    const correctedCorrects = {};
    for (const [key, value] of Object.entries(r.corrects)) {
      correctedCorrects[13 - numHedges + Number(key)] = value;
    }
    r.correctedCorrects = correctedCorrects;
  });

  const canCollapse = (a, b, fromCorrectedCorrectsIndex) => {
    let current = fromCorrectedCorrectsIndex;
    while (true) {
      if (current === 14) {
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

  // handle grouping
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
    let group = false;
    const prev = sorted?.[index - 1] ?? null;
    if (prev) {
      for (let i = 3; i > 2; i--) {
        let cIndex = 13 - i;
        const corrects = outcome.correctedCorrects[cIndex];
        const diff = prev.correctedCorrects[cIndex] - corrects;
        const collapseFromIndex = cIndex + 1;
        const collapse = canCollapse(prev, outcome, collapseFromIndex);
        if (diff === 1 && collapse) {
          group = true;
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

  console.log(sorted);
  sorted = sorted.filter((outcome) => {
    return !outcome.toDelete;
  });

  let tableRows = [];

  tableRows.push(
    (uSystem ? 'U' : 'R') + fullHedges + '-' + halfHedges + '-' + system.length,
  );
  const header = (uSystem ? 'U-tips ' : '') + '13  12  11  10      CHANS';
  tableRows.push(header);
  const divider = ''.padStart(header.length, '-');
  tableRows.push(divider);
  const data = [];

  const nameData = [
    (uSystem ? 'U' : 'R') + fullHedges + '-' + halfHedges + '-' + system.length,
    '',
    '',
    '',
    '',
  ];
  let headerData = [];
  if (uSystem) {
    headerData.push('U-tips');
    nameData.push('');
  }
  headerData.push('13', '12', '11', '10', 'Chans');

  data.push(nameData);
  data.push(headerData);

  let prevUGroup = null;
  const horizontalBorderIndicies = [];
  let i = 0;
  for (const r of sorted) {
    let itemData = [];

    let printRow = [];
    if (uSystem) {
      itemData.push(r.uCorrects);
      printRow.push(String(r.uCorrects).padEnd(4));
    }
    for (let i = 13; i >= 10; --i) {
      if (r.correctedCorrects[i] === 0) {
        itemData.push('-');
        printRow.push('-'.padEnd(3, ' '));
      } else {
        if (Array.isArray(r.correctedCorrects[i])) {
          itemData.push(r.correctedCorrects[i].reverse().join('-'));
          printRow.push(r.correctedCorrects[i].reverse().join('-'));
        } else {
          itemData.push(r.correctedCorrects[i]);
          printRow.push((r.correctedCorrects[i] + '').padEnd(3, ' '));
        }
      }
    }
    itemData.push(r.occurrences + '/' + r.totalGroup);
    printRow.push((r.occurrences + '/' + r.totalGroup).padStart(9));
    if (uSystem && prevUGroup !== r.uCorrects && prevUGroup !== null) {
      tableRows.push(divider);
      horizontalBorderIndicies.push(i + 2);

      const dividerColumns = ['', '', '', '', ''];
      if (uSystem) {
        dividerColumns.push('');
      }
      data.push(dividerColumns);
    }

    tableRows.push(printRow.join(' '));

    prevUGroup = r.uCorrects;

    data.push(itemData);
    i++;
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
    drawHorizontalLine: (index, size) => {
      return index === 2;
      // return horizontalBorderIndicies.includes(index);
    },
  });
  return tableRows.join('\n');
};
