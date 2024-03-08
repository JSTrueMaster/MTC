import React from "react";
import { useState, useEffect, ChangeEvent, MouseEvent } from "react";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/Person';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Api from "src/api";
import { ToastContainer, toast } from 'react-toastify';
import changeElementValue from "src/utils/elementvalue";

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

const EmailChange = () => {
  const fetchUser = async () => {
    await Api.user.fetchUser().then((response: any) => {
      setFirstName(response.data.personalInfo.firstName)
      setLastName(response.data.personalInfo.lastName)
      setOrigin(response.data.email)
      setEmail(response.data.email)
    })
  }
  useEffect(() => {
    fetchUser();
  }, []);

  changeElementValue("subTitle", "メールアドレス変更");
  const [email, setEmail] = useState('')
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [origin, setOrigin] = useState('')
  const [validEmail, setValidEmail] = useState(true)
  const [err_Email, setErr_Email] = useState('Empty Name');

  const [loading, setLoading] = useState(false)
  const notify = document.getElementById("notify");

  const handle_email = (event: ChangeEvent<HTMLInputElement>) => {
    if (notify) notify.innerHTML = ''
    const regEmail = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!regEmail.test(event.target.value as string)) {
      setValidEmail(false)
      setErr_Email("正確なメールアドレス形式ではありません。")
    } else {
      setValidEmail(true);
      setErr_Email("")
    }
    setEmail(event.target.value as string)
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (firstName !== '' && lastName !== '' && validEmail) {

      setLoading(true)

      const { data } = await Api.auth.sendLinkOfChangeEmail(origin, email);
      if (data.statusCode === 200) {
        // notify.innerHTML = data.message
        toast.success(data.message)
      } else {
        // notify.innerHTML = ( data.message || 'エラーか発生しました。');
        toast.error(data.message || 'エラーか発生しました。')
      }

      setLoading(false)

    } else {
      if (email == '') setValidEmail(false);
    }
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
      {loading && <div className="loading" />}
      <ThemeProvider theme={defaultTheme} >
        <Container component="main" className="!max-w-[600px] bg-transparent ">
          <CssBaseline />
          <Box
            sx={{
              marginTop: '30vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* <Avatar sx={{ width: "100px", height: "100px", bgcolor: '#24BFF2', marginBottom: '30px' }}>
              <PersonIcon className="!w-[90px] !h-[90px]" sx={{ color: "#fff" }} />
            </Avatar> */}

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={4} className="meiryo font-Noto">
                <Grid item xs={12} sm={3} >
                  <Typography className="middleFont text-[#1A1A1A]">ユーザー名</Typography>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Typography className="middleFont text-[#1A1A1A]">{firstName} {lastName}</Typography>
                </Grid>

                <Grid item xs={12} sm={3} className="p-0 mt-4 mb-5">
                  <Typography className="text-[#1A1A1A]">メールアドレス</Typography>
                </Grid>
                <Grid item xs={12} sm={9} className="p-0 my-3">
                  <TextField
                    autoComplete="email"
                    name="email"
                    id="email"
                    value={email}
                    error={!validEmail}
                    onChange={handle_email}
                    helperText={!validEmail ? err_Email : ''}
                    required
                    fullWidth
                    label=""
                    autoFocus
                    className="middleFont text-[#1A1A1A]"
                    size="small"
                    sx={{
                      '& fieldset': {
                        borderRadius: '8px',
                      },
                      '& .MuiOutlinedInput-root': {
                        background: "#FFFFFF",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4} className="p-0 mx-auto">
                  <Button style={{ margin: "20px" }} type="submit" variant="contained"
                    sx={{
                      mt: 1,
                      height: "34px",
                      padding: "14px 20px",
                      background: "#0066FF",
                    }}
                  >メールアドレス変更</Button>
                </Grid>
              </Grid>
              <Typography id="notify" className='meiryo font-Noto text-[16px] !text-[#d32f2f]'>

              </Typography>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </div >
  );
};

export default EmailChange;