
import { SystemForm } from "./system-form.tsx";
import { Table } from "./table.tsx";
import { TableControls } from "./table-controls.tsx";

const App = () => {
	return (
		<div className="container mx-auto">
			<div className="grid grid-cols-1 md:grid-cols-12 gap-0">
				<div className="md:col-span-5 lg:col-span-4 xl:col-span-3 flex-shrink-0">
					<div className="px-4 pt-6">
						<h1 className="text-3xl font-normal mb-4 text-gray-900">
							Garantiräknaren
						</h1>
						<p className="text-base leading-6 mb-8 text-gray-900">
							Ett verktyg för att beräkna och skapa garantitabeller för dina
							system. Mata bara in antal hel- och halvgarderingar samt dina
							nyckelrader och tryck sen på "Beräkna garanti" så börjar
							programmet räkna ut garantin.
						</p>
						<SystemForm />
					</div>
				</div>
				<div className="md:col-span-7 lg:col-span-8 xl:col-span-9 overflow-hidden">
					<div className="px-4 pt-6">
						<TableControls />
					</div>
					<div className="px-4 pt-6">
						<Table />
					</div>
				</div>
			</div>
		</div>
	);
};

export default App;
