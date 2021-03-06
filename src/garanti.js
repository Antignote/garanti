import { ONE_TO_ZERO_INDEX } from './utils.js';
import { makeGarantiTable } from './make-garanti-table.js';

onmessage = (e) => {
  const [fullHedges, halfHedges, uSystem, system] = e.data;
  const correctedSystem = system.split('\n').map((row) =>
    row
      .trim()
      .split('')
      .map((sign) => ONE_TO_ZERO_INDEX[sign]),
  );
  const rows = makeGarantiTable({
    fullHedges,
    halfHedges,
    system: correctedSystem,
    uSystem,
  });
  postMessage(rows);
};

onerror = (e) => {
  postMessage(e);
};
