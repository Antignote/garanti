import React, { useState, useEffect } from 'react';
import {
  TextField,
  Container,
  FormControlLabel,
  Checkbox,
  Grid,
  MenuItem,
  Box,
  Typography,
  Button,
  LinearProgress,
  Icon,
  TextareaAutosize,
  Snackbar,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import garanti from './worker.js';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { systems } from './systems.js';
import { ZERO_TO_ONE_INDEX } from './utils.js';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const hedges = [...Array(14).keys()];

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

const DEFAULT_U = true;
const DEFAULT_FULL = 0;
const DEFAULT_HALF = 0;
const DEFAULT_RU_SYSTEM = 0;
const DEFAULT_KEYS = '';

const App = () => {
  const classes = useStyles();
  const [full, setFull] = useState(DEFAULT_FULL);
  const [half, setHalf] = useState(DEFAULT_HALF);
  const [u, setU] = useState(DEFAULT_U);
  const [keys, setKeys] = useState(DEFAULT_KEYS);
  const [table, setTable] = useState('');
  const [loading, setLoading] = useState(false);
  const [ruSystem, setRUSystem] = useState(DEFAULT_RU_SYSTEM);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.data instanceof ErrorEvent) {
        alert(event.message);
      } else {
        setTable(event.data);
      }
      setLoading(false);
    };

    garanti.addEventListener('message', onMessage);
    return () => {
      garanti.removeEventListener('message', onMessage);
    };
  }, []);

  const handleChangeU = () => {
    setU((u) => !u);
    setRUSystem(0);
  };

  const handleChangeFull = (event) => {
    setFull(event.target.value);
    setRUSystem(0);
  };

  const handleChangeHalf = (event) => {
    setHalf(event.target.value);
    setRUSystem(0);
  };

  const handleChangeKeys = (event) => {
    setKeys(event.target.value);
    setRUSystem(0);
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    setLoading(true);
    garanti.postMessage([Number(full), Number(half), u, keys]);
  };

  const handleResetForm = () => {
    setKeys(DEFAULT_KEYS);
    setFull(DEFAULT_FULL);
    setHalf(DEFAULT_HALF);
    setRUSystem(DEFAULT_RU_SYSTEM);
    setU(DEFAULT_U);
  };

  const handleChangeRUSystem = (event) => {
    setRUSystem(event.target.value);
    if (event.target.value) {
      const { numFullHedges, numHalfHedges, rows } = systems[
        event.target.value
      ];
      setHalf(numHalfHedges);
      setFull(numFullHedges);
      setKeys(
        rows
          .map((row) => {
            return row
              .map((sign) => {
                return ZERO_TO_ONE_INDEX[sign];
              })
              .join('');
          })
          .join('\n'),
      );
      setU(event.target.value.toLowerCase()[0] === 'u');
    }
  };

  const handleCopy = () => {
    navigator.permissions.query({ name: 'clipboard-write' }).then((result) => {
      if (result.state == 'granted' || result.state == 'prompt') {
        navigator.clipboard.writeText(table).then(
          () => {
            setCopied(true);
          },
          () => {
            alert('Kopieringen misslyckades');
          },
        );
      }
    });
  };

  const handleCopyKeys = () => {
    navigator.permissions.query({ name: 'clipboard-write' }).then((result) => {
      if (result.state == 'granted' || result.state == 'prompt') {
        navigator.clipboard.writeText(keys).then(
          () => {
            setCopied(true);
          },
          () => {
            alert('Kopieringen misslyckades');
          },
        );
      }
    });
  };

  const handleCloseCopySnackbar = () => {
    setCopied(false);
  };

  const disableSubmit = keys.trim().length === 0;
  const disableReset =
    half === DEFAULT_HALF &&
    full === DEFAULT_FULL &&
    keys === DEFAULT_KEYS &&
    ruSystem === DEFAULT_RU_SYSTEM &&
    u === DEFAULT_U;

  return (
    <>
      <Snackbar
        open={copied}
        autoHideDuration={1000}
        onClose={handleCloseCopySnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseCopySnackbar} severity="success">
          Kopierat!
        </Alert>
      </Snackbar>
      <Grid container>
        <Grid item xs={12} md={5} lg={4} xl={3}>
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
              nyckelrader och tryck sen på "Beräkna garanti" så börjar
              programmet räkna ut garantin.
            </Typography>
            <form onSubmit={handleCalculate} onReset={handleResetForm}>
              <TextField
                className={classes.spaceBelow}
                label="Helgarderingar"
                select
                fullWidth
                SelectProps={{
                  native: true,
                }}
                value={full}
                onChange={handleChangeFull}
              >
                {hedges.map((value) => (
                  <option key={value} value={value}>
                    {value === 0
                      ? 'Inga'
                      : value + ' helgardering' + (value > 1 ? 'ar' : '')}
                  </option>
                ))}
              </TextField>
              <TextField
                className={classes.spaceBelow}
                select
                label="Halvgarderingar"
                fullWidth
                SelectProps={{
                  native: true,
                }}
                value={half}
                onChange={handleChangeHalf}
              >
                {hedges.map((value) => (
                  <option key={value} value={value}>
                    {value === 0
                      ? 'Inga'
                      : value + ' halvgardering' + (value > 1 ? 'ar' : '')}
                  </option>
                ))}
              </TextField>
              <Box display="flex" className={classes.spaceBelow}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={u}
                      onChange={handleChangeU}
                      name="checkedB"
                      color="primary"
                    />
                  }
                  label="U-system"
                />
                {keys && (
                  <Box alignSelf="flex-end" flexGrow="1">
                    <Button
                      variant="contained"
                      color="default"
                      size="small"
                      className={classes.copyKeysBtn}
                      onClick={handleCopyKeys}
                      disabled={copied}
                      startIcon={<FileCopyIcon />}
                    >
                      Kopiera
                    </Button>
                  </Box>
                )}
              </Box>
              <TextField
                className={classes.spaceBelow}
                multiline
                label="Nyckelrader"
                rows={5}
                rowsMax={12}
                fullWidth
                onChange={handleChangeKeys}
                value={keys}
              />
              <TextField
                className={classes.spaceBelow}
                select
                label="Fördefinerade R- och U-system"
                SelectProps={{
                  native: true,
                }}
                fullWidth
                value={ruSystem}
                onChange={handleChangeRUSystem}
              >
                <option value={0}>Ej valt</option>
                {Object.keys(systems).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </TextField>
              <Box>
                <Button
                  disabled={disableSubmit}
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                >
                  Beräkna garanti
                </Button>
                <Button
                  variant="contained"
                  color="default"
                  type="reset"
                  size="small"
                  disabled={disableReset}
                  className={classes.resetBtn}
                >
                  Rensa
                </Button>
              </Box>
            </form>
          </Box>
        </Grid>
        <Grid item xs={12} md={7} lg={8} xl={9}>
          <Box px={2} pt={3}>
            {loading ? (
              <LinearProgress />
            ) : (
              table && (
                <>
                  <Button
                    variant="contained"
                    color="default"
                    className={classes.button}
                    onClick={handleCopy}
                    disabled={copied}
                    startIcon={<FileCopyIcon />}
                  >
                    Kopiera
                  </Button>
                  <Box fontSize={16}>
                    <pre>{table}</pre>
                  </Box>
                </>
              )
            )}
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default App;
