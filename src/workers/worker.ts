export const expoundedKeysWorker: Worker = new Worker(
       new URL("./expounded-keys-worker.js", import.meta.url),
       {
	       type: "module",
       },
);

export const garantiWorker: Worker = new Worker(
       new URL("./garanti-worker.js", import.meta.url),
       {
	       type: "module",
       },
);

export const tableWorker: Worker = new Worker(
       new URL("./table-worker.js", import.meta.url),
       {
	       type: "module",
       },
);
