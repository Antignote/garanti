import React from 'react';
import { Grid, Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SystemForm } from './system-form.jsx';
import { TableControls } from './table-controls.jsx';
import { Table } from './table.jsx';
import { WorkerManager } from './workers/worker-manager.jsx';

const useStyles = makeStyles((theme) => ({
	spaceBelow: {
		marginBottom: theme.spacing(2),
	},
	moreSpaceBelow: {
		marginBottom: theme.spacing(4),
	},
	resetBtn: {
		float: 'right',
	},
	copyKeysBtn: {
		float: 'right',
	},
}));

const App = () => {
	const classes = useStyles();

	return (
		<>
			<Grid container>
				<Grid item xs={12} md={5} lg={4} xl={3} style={{ flexShrink: 0 }}>
					<Box px={2} pt={3}>
						<Typography variant="h4" component="h1" gutterBottom>
							Garantiräknaren
						</Typography>
						<Typography
							className={classes.moreSpaceBelow}
							variant="body1"
							gutterBottom
						>
							Ett verktyg för att beräkna och skapa garantitabeller för dina
							system. Mata bara in antal hel- och halvgarderingar samt dina
							nyckelrader och tryck sen på &quot;Beräkna garanti&quot; så börjar
							programmet räkna ut garantin.
						</Typography>
						<SystemForm />
					</Box>
				</Grid>
				<Grid item xs={12} md={7} lg={8} xl={9} style={{ overflow: 'hidden' }}>
					<Box px={2} pt={3}>
						<TableControls />
					</Box>
					<Box px={2} pt={3}>
						<Table />
					</Box>
				</Grid>
			</Grid>
		</>
	);
};

export default App;
