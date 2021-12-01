import React, { useEffect, useState } from 'react'
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';

import CoinChart from './components/CoinChart'

function App() {

  const [coinList, setCoinList] = useState([])
  const [selected, setCurrency] = useState({})
  const [data, setData] = useState({})

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [errors, setErrors] = useState([])

  const today = new Date()
  /* const checkDateRange = () => {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays
  } */

  const getCurrencyInfo = async (type) => {
    if (startDate && endDate && selected) {
      try {
        fetch(`/.netlify/functions/node-fetch?id=${type.id}&start=${startDate.getTime()/1000}&end=${endDate.getTime()/1000}`, { headers: { accept: "Accept: application/json" } })
          .then(res => res.json())
          .then(data => setData(data.data))
      } catch (error) {
        console.error(error)
      }
    } else {
      //show error
    }
  }

  const handleStart = (newValue) => {
    setStartDate(newValue);
  };

  const handleEnd = (newValue) => {
    setEndDate(newValue);
  };

  const handleList = (event, newValue) => {
    setCurrency(newValue)
    const newErrors = [...errors]
    newErrors.splice(newErrors.indexOf('noCoin'),1)
    setErrors(newErrors)
  }

  const updateInfo = () => {
    
    //getCurrencyInfo(selected)
    if (Object.keys(selected).length && startDate<endDate ){
      getCurrencyInfo(selected)
      setErrors([])
    } else {
      if (startDate>endDate) setErrors([...errors, 'rangeError'])
      if (!Object.keys(selected).length && errors.indexOf('noCoin') < 0) setErrors([...errors, 'noCoin'])
    }
  }

  useEffect(() => {
    try {
      fetch('/.netlify/functions/node-fetch', { headers: { accept: "Accept: application/json" } })
        .then(res => res.json())
        .then(data => {
          data.data.map(d => {
            d.label = d.name
            return d
          })
          setCoinList(data.data)
        })
    } catch (error) {
      console.error(error)
    }
  }, [setCoinList])

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Crypto Gecko Search
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={3}>
            <Autocomplete
              disableClearable
              disablePortal
              freeSolo
              id="combo-box-demo"
              options={coinList}
              /* options={coinList.map(option => option.name)} */
              onChange={handleList}
              renderInput={(params) =>
                <TextField
                  error={errors.indexOf('noCoin') >= 0}
                  helperText={errors.indexOf('noCoin') >= 0 && 'This field cannot be empty'}
                  {...params}
                  label="Select currency"
                />
              }
            />
            <DesktopDatePicker
              label="Start Date"
              maxDate={today}
              inputFormat="dd/MM/yyyy"
              value={startDate}
              onChange={handleStart}
              renderInput={(params) =>
                <TextField
                  error={errors.indexOf('rangeError') >= 0}
                  helperText={errors.indexOf('rangeError') >= 0 && 'Start date must be before the last date'}
                  {...params}
                />
              }
            />
            <DesktopDatePicker
              maxDate={today}
              label="End Date"
              inputFormat="dd/MM/yyyy"
              value={endDate}
              onChange={handleEnd}
              renderInput={(params) =>
                <TextField
                  error={errors.indexOf('rangeError') >= 0}
                  helperText={errors.indexOf('rangeError') >= 0 && 'Start date must be before the last date'}
                  {...params}
                />
              }
            />
            <Button
              onClick={updateInfo}
              variant="contained">
              Get Info
            </Button>
          </Stack>
        </LocalizationProvider>
        {/* Render returned currency values in a chart */}
        {Object.keys(data).length !== 0 && <CoinChart data={data} selected={selected} />}

      </Box>

    </Container>
  );
}

export default App;



