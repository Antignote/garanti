const getMathRows = function (row, currentMark, marks) {
  if (marks.length === currentMark) {
    return [];
  }

  const combinedRows = [];
  for (const mark of marks[currentMark].marks) {
    row[marks[currentMark].position] = mark;

    if (currentMark === marks.length - 1) {
      combinedRows.push(row.slice(0));
    }

    combinedRows.push(...getMathRows(row, currentMark + 1, marks));
  }

  return combinedRows;
};

const OUTCOMES = ['1', 'X', '2'];
const HALF_HEDGE_OUTCOMES = {
  '1X': ['1', 'X'],
  12: ['1', '2'],
  X2: ['X', '2'],
};
const U_OUTCOMES = {
  1: ['1', 'X', '2'],
  X: ['X', '1', '2'],
  2: ['2', '1', 'X'],
};
const HALF_HEDGE_U_OUTCOMES = {
  1: {
    '1X': ['1', 'X'],
    12: ['1', '2'],
  },
  X: {
    '1X': ['X', '1'],
    X2: ['X', '2'],
  },
  2: {
    12: ['2', '1'],
    X2: ['2', 'X'],
  },
};

const getExpandedRowsFromSingleRow = (system, row, uRows) => {
  const fullHedgesIndices = [];
  const halfHedgesIndices = [];
  const singlesIndices = [];
  const expandedRows = [];
  const rowLength = row.length;
  const isUSystem = Boolean(uRows);

  let currentFullIndex = null;
  let currentHalfIndex = null;

  for (let i = 0; i < rowLength; ++i) {
    if (row[i].length === 3) {
      fullHedgesIndices.push(i);
    } else if (row[i].length === 1) {
      singlesIndices.push(i);
    } else {
      halfHedgesIndices.push(i);
    }
  }

  const fullHedgesIndicesLength = fullHedgesIndices.length;
  const halfHedgesIndicesLength = halfHedgesIndices.length;

  for (let i = 0; i < system.length; ++i) {
    currentFullIndex = -1;
    currentHalfIndex = fullHedgesIndicesLength - 1;
    expandedRows.push([]);

    for (let k = 0; k < fullHedgesIndicesLength; ++k) {
      if (isUSystem) {
        expandedRows[expandedRows.length - 1][fullHedgesIndices[k]] =
          U_OUTCOMES[uRows[fullHedgesIndices[k]]][
            system[i][++currentFullIndex]
          ];
      } else {
        expandedRows[expandedRows.length - 1][fullHedgesIndices[k]] =
          OUTCOMES[system[i][++currentFullIndex]];
      }
    }

    for (let k = 0; k < halfHedgesIndicesLength; ++k) {
      if (isUSystem) {
        expandedRows[expandedRows.length - 1][halfHedgesIndices[k]] =
          HALF_HEDGE_U_OUTCOMES[uRows[halfHedgesIndices[k]]][
            row[halfHedgesIndices[k]]
          ][system[i][++currentHalfIndex]];
      } else {
        expandedRows[expandedRows.length - 1][halfHedgesIndices[k]] =
          HALF_HEDGE_OUTCOMES[row[halfHedgesIndices[k]]][
            system[i][++currentHalfIndex]
          ];
      }
    }

    for (let k = 0; k < singlesIndices.length; ++k) {
      expandedRows[expandedRows.length - 1][singlesIndices[k]] =
        row[singlesIndices[k]];
    }
  }

  return expandedRows;
};

export const splitToRows = function (row) {
  const marks = [];
  let rows = [];

  for (let i = 0; i < row.length; ++i) {
    if (row[i].length > 1) {
      marks.push({
        position: i,
        marks: row[i],
      });
    }
  }

  if (marks.length) {
    rows = getMathRows(row.slice(0), 0, marks);
  } else {
    rows = row;
  }

  return rows;
};

export const getExpandedRows = (system, row, uRows) => {
  const marks = [];
  const currentRow = row;
  let rowsToProcess = [];
  const processedRows = [];

  for (let i = 0; i < currentRow.length; i++) {
    if (currentRow[i].indexOf('M') !== -1) {
      marks.push({
        position: i,
        marks: currentRow[i].substr(0, currentRow[i].length - 1),
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

export const calculateCorrectsForRowInSystem = (row, systemRows) => {
  const corrects = {};

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

export const ZERO_TO_ONE_INDEX = {
  0: '1',
  1: '2',
  2: '3',
};

export const ONE_TO_ZERO_INDEX = {
  1: '0',
  2: '1',
  3: '2',
};
