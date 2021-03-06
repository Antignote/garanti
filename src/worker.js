export const garantiWorker = new Worker(
	new URL('./garanti.js', import.meta.url),
	{
		type: 'module',
	},
);

export const tableWorker = new Worker(
	new URL('./table-worker.js', import.meta.url),
	{
		type: 'module',
	},
);
