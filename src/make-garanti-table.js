import {
  calculateCorrectsForRowInSystem,
  getExpandedRows,
  splitToRows,
} from './utils';

export const makeGarantiTable = ({
  fullHedges,
  halfHedges,
  system,
  uSystem,
  mHalf,
  mFull,
  eHalf,
  eFull,
}) => {
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
        uRow.push('1');
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

  return possibleOutcomes;
};
