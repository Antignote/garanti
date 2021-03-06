import { makeGarantiTable } from './make-garanti-table.js';

onmessage = (e) => {
	const [fullHedges, halfHedges, uSystem, system] = e.data;
	const rows = makeGarantiTable({
		fullHedges,
		halfHedges,
		system,
		uSystem,
	});
	postMessage(rows);
};

onerror = (e) => {
	postMessage(e);
};
