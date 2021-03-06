export const garantiWorker = new Worker(
  new URL('./garanti.js', import.meta.url),
  {
    type: import.meta.env.MODE === 'development' ? 'module' : 'classic',
  },
);

export const tableWorker = new Worker(
  new URL('./table-worker.js', import.meta.url),
  {
    type: import.meta.env.MODE === 'development' ? 'module' : 'classic',
  },
);
