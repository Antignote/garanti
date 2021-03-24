import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './theme.js';
import { Provider } from 'react-redux';
import { store } from './store.js';
import { WorkerManager } from './workers/worker-manager.jsx';

ReactDOM.render(
	<React.StrictMode>
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<WorkerManager>
					<App />
				</WorkerManager>
			</ThemeProvider>
		</Provider>
	</React.StrictMode>,
	document.getElementById('root'),
);

if (import.meta.hot) {
	import.meta.hot.accept();
}
