import { makeGarantiTable } from './src/make-garanti-table';

const table = makeGarantiTable({
  fullHedges: 5,
  halfHedges: 5,
  mHalf: 3,
  mFull: 0,
  eHalf: 2,
  eFull: 0,
  system: [
    [3, 3, 0, 0],
    [0, 0, 2, 2],
    [5, 0, 0, 5],
    [5, 0, 5, 0],
    [0, 5, 0, 5],
    [0, 5, 5, 0],
    [5, 0, 5, 0],
    [3, 3, 3, 3],
    [3, 3, 3, 3],
    [3, 3, 3, 3],
  ],
  uSystem: true,
});
