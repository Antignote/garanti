// @ts-expect-error This import is ok
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { store } from "./store.ts";
import { WorkerManager } from "./workers/worker-manager.tsx";

const root = createRoot(document.getElementById("root")!);
root.render(
	<StrictMode>
		<Provider store={store}>
			<WorkerManager>
				<App />
			</WorkerManager>
		</Provider>
	</StrictMode>,
);
