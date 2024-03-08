import React from "react";
import { useState, useEffect, ChangeEvent, MouseEvent } from "react";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import { Radio, RadioGroup } from '@mui/material';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/Person';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Api from "src/api";
import { EMPTYERROR } from '../../configs/AppConfig';
import { ToastContainer, toast } from 'react-toastify';
import changeElementValue from "src/utils/elementvalue";

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

const PersoninfoChange = () => {
  const fetchUser = async () => {
    await Api.user.fetchUser().then((response: any) => {
      setFirstName(response.data.personalInfo.firstName)
      setLastName(response.data.personalInfo.lastName)
      setFirstNameFuri(response.data.personalInfo.firstNameFuri)
      setLastNameFuri(response.data.personalInfo.lastNameFuri)
      setGender(response.data.personalInfo.gender)
      setPhoneNum(response.data.personalInfo.phoneNum)
      setAddress(response.data.personalInfo.address)
    })
  }
  useEffect(() => {
    fetchUser();
  }, []);

  changeElementValue("subTitle", "個人（社員）情報変更");

  const notify = document.getElementById("notify");

  const [user, setUser] = useState({})
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [firstNameFuri, setFirstNameFuri] = useState('')
  const [lastNameFuri, setLastNameFuri] = useState('')
  const [gender, setGender] = useState('男性')
  const [phoneNum, setPhoneNum] = useState('')
  const [address, setAddress] = useState('')

  const [validFirstName, setValidFirstName] = useState(true)
  const [validLastName, setValidLastName] = useState(true)
  const [validFirstNameFuri, setValidFirstNameFuri] = useState(true)
  const [validLastNameFuri, setValidLastNameFuri] = useState(true)
  const [validAddress, setValidLAddress] = useState(true)
  const [validphoneNum, setValidphoneNum] = useState(true)

  const [err_FirstName, setErr_FirstName] = useState(EMPTYERROR);
  const [err_LastName, setErr_LastName] = useState(EMPTYERROR);
  const [err_FirstNameFuri, setErr_FirstNameFuri] = useState(EMPTYERROR);
  const [err_LastNameFuri, setErr_LastNameFuri] = useState(EMPTYERROR);
  const [err_Address, setErr_Address] = useState(EMPTYERROR);
  const [err_PhoneNum, setErr_PhoneNum] = useState(EMPTYERROR);

  const handle_firstname = (event: ChangeEvent<HTMLInputElement>) => {
    setFirstName(event.target.value as string)
    if (notify) notify.innerHTML = ''
    if (event.target.value == '') {
      setValidFirstName(false);
    } else {
      setValidFirstName(true);
    }
  }
  const handle_lastname = (event: ChangeEvent<HTMLInputElement>) => {
    setLastName(event.target.value as string)
    if (notify) notify.innerHTML = ''
    if (event.target.value == '') {
      setValidLastName(false);
    } else {
      setValidLastName(true);
    }
  }
  const handle_firstnamefuri = (event: ChangeEvent<HTMLInputElement>) => {
    setFirstNameFuri(event.target.value as string)
    if (notify) notify.innerHTML = ''
    if (event.target.value == '') {
      setValidFirstNameFuri(false);
    } else {
      setValidFirstNameFuri(true);
    }
  }
  const handle_lastnamefuri = (event: ChangeEvent<HTMLInputElement>) => {
    setLastNameFuri(event.target.value as string)
    if (notify) notify.innerHTML = ''
    if (event.target.value == '') {
      setValidLastNameFuri(false);
    } else {
      setValidLastNameFuri(true);
    }
  }
  const handle_gender = (event: ChangeEvent<HTMLInputElement>) => {
    if (notify) notify.innerHTML = ''
    setGender(event.target.value as string)
  }
  const handle_address = (event: ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value as string)
    if (notify) notify.innerHTML = ''
    if (event.target.value == '') {
      setValidLAddress(false);
    } else {
      setValidLAddress(true);
    }
  }
  const handle_phonenum = (event: ChangeEvent<HTMLInputElement>) => {
    setPhoneNum(event.target.value as string)
    if (notify) notify.innerHTML = ''
    if (event.target.value == '') {
      setValidphoneNum(false);
    } else {
      setValidphoneNum(true);
    }
  }
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (firstName !== '' && lastName !== '' && firstNameFuri !== '' && lastNameFuri !== '' && phoneNum !== '' && address !== '' && validFirstName && validLastName && validFirstNameFuri && validLastNameFuri && validAddress && validphoneNum) {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const req = {
        personalInfo: {
          firstName: data.get('firstName'),
          lastName: data.get('lastName'),
          firstNameFuri: data.get('firstNameFuri'),
          lastNameFuri: data.get('lastNameFuri'),
          gender: data.get('gender'),
          phoneNum: data.get('phoneNum'),
          address: data.get('address'),
        }
      }
      const res = await Api.user.updateProfile(req);
      if (res.data.statusCode == 200) {
        // notify.innerHTML = '更新しました!';
        const userinfo = res.data.user
        toast.success('更新しました!')
      } else {
        // notify.innerHTML = '変更に失敗しました!';
        toast.error('変更に失敗しました!')
      }
    } else {
      if (firstName == '') setValidFirstName(false);
      if (lastName == '') setValidLastName(false);
      if (firstNameFuri == '') setValidFirstNameFuri(false);
      if (lastNameFuri == '') setValidLastNameFuri(false);
      // if (gender == '') setValidGender(false);
      if (phoneNum == '') setValidphoneNum(false);
      if (address == '') setValidLAddress(false);
    }
  };
  const handleCancelEvent = async (event: MouseEvent<HTMLButtonElement>) => {
    fetchUser();
  };

  return (
    <div className="w-full largeFont">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <ThemeProvider theme={defaultTheme} >
        <Container component="main" className="!max-w-[600px] bg-transparent">
          <CssBaseline />
          <Box
            sx={{
              marginTop: '20vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* <Avatar sx={{ width: "100px", height: "100px", bgcolor: '#24BFF2', marginBottom: '30px' }}>
              <PersonIcon className="!w-[90px] !h-[90px]" sx={{ color: "#fff" }} />
            </Avatar> */}

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 7 }}>
              <Grid container spacing={4} className="text-center meiryo font-Noto">

                <Grid item xs={12} sm={2} className="p-0 mt-3 mb-5">
                  <Typography className="middleFont text-[#1A1A1A]">姓</Typography>
                </Grid>
                <Grid item xs={12} sm={4} className="p-0">
                  <TextField
                    autoComplete="firstName"
                    name="firstName"
                    id="firstName"
                    value={firstName}
                    error={!validFirstName}
                    onChange={handle_firstname}
                    helperText={!validFirstName ? err_FirstName : ''}
                    required
                    fullWidth
                    label=""
                    autoFocus
                    className="middleFont"
                    size="small"
                    sx={{
                      '& fieldset': {
                        borderRadius: '8px',
                      },
                      '& .MuiOutlinedInput-root': {
                        background: "#FFFFFF",
                        height: "44px",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={2} className="p-0 mt-3 mb-5">
                  <Typography className=" text-[#1A1A1A]">名</Typography>
                </Grid>
                <Grid item xs={12} sm={4} className="p-0">
                  <TextField
                    autoComplete="lastName"
                    name="lastName"
                    id="lastName"
                    value={lastName}
                    error={!validLastName}
                    onChange={handle_lastname}
                    helperText={!validLastName ? err_LastName : ''}
                    required
                    fullWidth
                    label=""
                    autoFocus
                    className="middleFont"
                    size="small"
                    sx={{
                      '& fieldset': {
                        borderRadius: '8px',
                      },
                      '& .MuiOutlinedInput-root': {
                        background: "#FFFFFF",
                        height: "44px",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={2} className="p-0 mt-1 mb-5">
                  <Typography className="middleFont text-[#1A1A1A]">姓<br />（フリガナ）</Typography>
                </Grid>
                <Grid item xs={12} sm={4} className="p-0">
                  <TextField
                    autoComplete="firstNameFuri"
                    name="firstNameFuri"
                    id="firstNameFuri"
                    value={firstNameFuri}
                    error={!validFirstNameFuri}
                    onChange={handle_firstnamefuri}
                    helperText={!validFirstNameFuri ? err_FirstNameFuri : ''}
                    required
                    fullWidth
                    label=""
                    autoFocus
                    className="middleFont"
                    size="small"
                    sx={{
                      '& fieldset': {
                        borderRadius: '8px',
                      },
                      '& .MuiOutlinedInput-root': {
                        background: "#FFFFFF",
                        height: "44px",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={2} className="p-0 mt-1 mb-5">
                  <Typography className="text-[#1A1A1A] p-0" >名<br />（フリガナ）</Typography>
                </Grid>
                <Grid item xs={12} sm={4} className="p-0">
                  <TextField
                    autoComplete="lastNameFuri"
                    name="lastNameFuri"
                    id="lastNameFuri"
                    value={lastNameFuri}
                    error={!validLastNameFuri}
                    onChange={handle_lastnamefuri}
                    helperText={!validLastNameFuri ? err_LastNameFuri : ''}
                    required
                    fullWidth
                    label=""
                    autoFocus
                    className="middleFont"
                    size="small"
                    sx={{
                      '& fieldset': {
                        borderRadius: '8px',
                      },
                      '& .MuiOutlinedInput-root': {
                        background: "#FFFFFF",
                        height: "44px",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3} className="pt-0 pr-0 mt-2 mb-5 pl-2">
                  <Typography className='meiryo font-Noto text-[16px] middleFont text-left text-[#1A1A1A]'>性別</Typography>
                </Grid>
                <Grid item xs={12} sm={9} className="p-0">
                  <RadioGroup
                    id="gender"
                    name="gender"
                    defaultValue="男性"
                    className="middleFont"
                    aria-labelledby="demo-radio-buttons-group-label"
                    row
                    value={gender}
                    onChange={handle_gender}
                  >
                    <FormControlLabel value="男性" control={<Radio />} label="男性" />
                    <FormControlLabel value="女性" control={<Radio />} label="女性" className="!ml-5" />
                  </RadioGroup>
                </Grid>

                <Grid item xs={12} sm={3} className="text-left pt-0 pr-0 mt-2 mb-5 pl-2">
                  <Typography className="text-[#1A1A1A]" >電話番号</Typography>
                </Grid>
                <Grid item xs={12} sm={9} className="p-0">
                  <TextField
                    autoComplete="phoneNum"
                    name="phoneNum"
                    id="phoneNum"
                    value={phoneNum}
                    error={!validphoneNum}
                    onChange={handle_phonenum}
                    helperText={!validphoneNum ? err_PhoneNum : ''}
                    required
                    fullWidth
                    label=""
                    autoFocus
                    className="middleFont"
                    size="small"
                    sx={{
                      '& fieldset': {
                        borderRadius: '8px',
                      },
                      '& .MuiOutlinedInput-root': {
                        background: "#FFFFFF",
                        height: "44px",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3} className="text-left pt-0 pr-0 mt-2 mb-5 pl-2">
                  <Typography className="text-[#1A1A1A]">住所</Typography>
                </Grid>
                <Grid item xs={12} sm={9} className="p-0">
                  <TextField
                    autoComplete="address"
                    name="address"
                    id="address"
                    value={address}
                    error={!validAddress}
                    onChange={handle_address}
                    helperText={!validAddress ? err_Address : ''}
                    required
                    fullWidth
                    label=""
                    autoFocus
                    className="middleFont"
                    size="small"
                    sx={{
                      '& fieldset': {
                        borderRadius: '8px',
                      },
                      '& .MuiOutlinedInput-root': {
                        background: "#FFFFFF",
                        height: "44px",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} className="p-0 my-2">
                  <Button style={{ margin: "20px" }} variant="contained" onClick={handleCancelEvent}
                    sx={{
                      height: "34px",
                      padding: "14px 20px",
                      background: "#808080",
                    }}
                  >キャンセル</Button>
                  <Button style={{ margin: "20px" }} type="submit" variant="contained"
                    sx={{
                      height: "34px",
                      padding: "14px 20px",
                      background: "#0066FF",
                    }}
                  >変 更</Button>
                </Grid>
                <Typography id="notify" className='m-auto meiryo font-Noto text-[16px] !text-[#d32f2f]'></Typography>
              </Grid>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </div>
  );
};

export default PersoninfoChange;