// Copy icon as SVG component
const FileCopyIcon = () => (
	<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-label="Copy table">
		<title>Copy table</title>
		<path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
		<path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
	</svg>
);


import { useSelector } from "react-redux";
import type { RootState, TaskType } from "./types";
import {
	selectCurrentTask,
	selectGarantiTable,
	selectIsWorking,
} from "./selectors";

const loadingTexts: Record<TaskType, string> = {
	expoundedKeys: "Vecklar ut nyckelrader",
	garantiRows: "Beräknar garanti",
	table: "Bygger tabell",
};

export const Table = () => {
       const table = useSelector((state: RootState) => selectGarantiTable(state));

       const handleCopy = (): void => {
	       if (!table) return;
	       navigator.permissions.query({ name: "clipboard-write" as PermissionName }).then((result) => {
		       if (result.state === "granted" || result.state === "prompt") {
			       navigator.clipboard.writeText(table).then(
				       () => {},
				       () => {
					       alert("Kopieringen misslyckades");
				       },
			       );
		       }
	       });
       };

       const isLoading = useSelector((state: RootState) => selectIsWorking(state));
       const task = useSelector((state: RootState) => selectCurrentTask(state));

       return isLoading ? (
	       <>
		       <p className="text-base mb-2 text-gray-900">{task ? loadingTexts[task] : ""}</p>
		       <div className="w-full bg-gray-200 rounded-full h-1">
			       <div
				       className="bg-primary-600 h-1 rounded-full animate-pulse"
				       style={{ width: "100%" }}
			       ></div>
		       </div>
	       </>
       ) : table ? (
	       <>
		       <button
			       onClick={handleCopy}
			       type="button"
			       className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mb-4"
		       >
			       <FileCopyIcon />
			       <span className="ml-1">Kopiera</span>
		       </button>
		       <div className="text-base overflow-x-auto">
			       <pre className="whitespace-pre-wrap">{table}</pre>
		       </div>
	       </>
       ) : null;
};
