import { useDispatch, useSelector } from "react-redux";
import {
	addTask,
	changeSystem,
	clearSystem,
	enterKeys,
	setFull,
	setHalf,
	toggleU,
} from "./actions.ts";
import {
	selectDisabledSubmit,
	selectFull,
	selectHalf,
	selectKeys,
	selectSystem,
	selectSystems,
	selectU,
} from "./selectors.ts";

const hedges = [...Array(14).keys()];

// Copy icon as SVG component
const FileCopyIcon = () => (
	<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-label="Copy keys">
		<title>Copy keys</title>
		<path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
		<path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
	</svg>
);

export const SystemForm = () => {
	const dispatch = useDispatch();

	const full = useSelector(selectFull);
	const half = useSelector(selectHalf);
	const u = useSelector(selectU);
	const keys = useSelector(selectKeys);
	const system = useSelector(selectSystem);

	const handleChangeU = () => {
		dispatch(toggleU());
	};

	const handleChangeFull = (event) => {
		dispatch(setFull(Number(event.target.value)));
	};

	const handleChangeHalf = (event) => {
		dispatch(setHalf(Number(event.target.value)));
	};

	const handleChangeKeys = (event) => {
		dispatch(enterKeys(event.target.value));
	};

	const handleCalculate = (e) => {
		e.preventDefault();
		dispatch(
			addTask({
				task: "expoundedKeys",
				id: performance.now(),
			}),
		);
	};

	const handleResetForm = () => {
		dispatch(clearSystem());
	};

	const systems = useSelector(selectSystems);

	const handleChangeRUSystem = (event) => {
		const name = event.target.value;
		dispatch(
			changeSystem({
				name,
				system: systems[name],
			}),
		);
	};

	const handleCopyKeys = async () => {
		navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
			if (result.state === "granted" || result.state === "prompt") {
				navigator.clipboard.writeText(keys).then(
					() => {},
					() => {
						alert("Kopieringen misslyckades");
					},
				);
			}
		});
	};

	const disableSubmit = keys.trim().length === 0;
	const disableReset = useSelector(selectDisabledSubmit);

	return (
		<form onSubmit={handleCalculate} onReset={handleResetForm}>
			<div className="mb-4">
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Helgarderingar
				</label>
				<select
					className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
					value={full}
					onChange={handleChangeFull}
				>
					{hedges.map((value) => (
						<option key={value} value={value}>
							{value === 0
								? "Inga"
								: `${value} helgardering${value > 1 ? "ar" : ""}`}
						</option>
					))}
				</select>
			</div>
			<div className="mb-4">
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Halvgarderingar
				</label>
				<select
					className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
					value={half}
					onChange={handleChangeHalf}
				>
					{hedges.map((value) => (
						<option key={value} value={value}>
							{value === 0
								? "Inga"
								: `${value} halvgardering${value > 1 ? "ar" : ""}`}
						</option>
					))}
				</select>
			</div>
			<div className="flex items-center justify-between mb-4">
				<label className="flex items-center">
					<input
						type="checkbox"
						checked={u}
						onChange={handleChangeU}
						className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
					/>
					<span className="ml-2 text-sm font-medium text-gray-700">
						U-system
					</span>
				</label>
				{keys && (
					<button
						type="button"
						onClick={handleCopyKeys}
						className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
					>
						<FileCopyIcon />
						<span className="ml-1">Kopiera</span>
					</button>
				)}
			</div>
			<div className="mb-4">
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Nyckelrader
				</label>
				<textarea
					rows={5}
					className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
					onChange={handleChangeKeys}
					value={keys}
				/>
			</div>
			<div className="mb-4">
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Fördefinerade R- och U-system
				</label>
				<select
					className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
					value={system}
					onChange={handleChangeRUSystem}
				>
					<option value={0}>Ej valt</option>
					{Object.keys(systems).map((value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</select>
			</div>
			<div className="flex justify-between">
				<button
					disabled={disableSubmit}
					type="submit"
					className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Beräkna garanti
				</button>
				<button
					type="reset"
					disabled={disableReset}
					className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Rensa
				</button>
			</div>
		</form>
	);
};
