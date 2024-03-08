import * as React from 'react';
import 'dayjs/locale/ja';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export const DatePickerValue = (props: any) => {

  const [value, setValue] = React.useState<Dayjs | null>(null);
  
  React.useEffect(() => {
    if (props.date) {
      const date = new Date(props.date)
      const str_date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
      setValue(dayjs(str_date))
    } else setValue(null)
  }, [props])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ja'>
      <DatePicker  
        value={value}
        // format='YYYY/MM/DD'
        disabled = {props.disabled}
        onChange={props.onChange}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: 40,
            fontSize: 'inherit',
          },
          "fieldset":{
            border:'none',
          },
        }}
      />
    </LocalizationProvider>
  );
}