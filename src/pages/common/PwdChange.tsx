import React from "react";
import { useState, useEffect, ChangeEvent, MouseEvent } from "react";
import { IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Container, CssBaseline, TextField, Typography, InputAdornment, Link, Box, Grid, Checkbox, Avatar, Button, createTheme, ThemeProvider } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import Api from "src/api";
import { ToastContainer, toast } from 'react-toastify';
import changeElementValue from "src/utils/elementvalue";
import { isValidPassword } from 'src/plugins/validator';
import { EMAILVALIDERROR, PASSWORDVALIDERROR, CONFIRMPASSWORDVALIDERROR, LOGIN_FAILED_ERROR, EMPTYERROR } from '../../configs/AppConfig';

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

const PwdChange = () => {
  changeElementValue("subTitle", "パスワード変更");


  const [user, setUser] = useState({})
  const [email, setEmail] = useState('')

  const [curPwd, setCurPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

  const [showCurPwd, setShowCurPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  const [validCurPwd, setValidCurPwd] = useState(true)
  const [validNewPwd, setValidNewPwd] = useState(true)
  const [validConfirmPwd, setValidConfirmPwd] = useState(true)

  const [err1, setErr1] = useState(PASSWORDVALIDERROR)
  const [err2, setErr2] = useState(PASSWORDVALIDERROR)
  const [err3, setErr3] = useState(PASSWORDVALIDERROR)

  const fetchUser = async () => {
    await Api.user.fetchUser().then((response: any) => {
      setEmail(response.data.email);
    })
  }
  useEffect(() => {
    fetchUser();
  }, []);

  const handleClickCurPassword = () => setShowCurPwd((s) => !s);
  const handleClickNewPassword = () => setShowNewPwd((a) => !a);
  const handleClickConfirmPassword = () => setShowConfirmPwd((b) => !b);

  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  const notify = document.getElementById("notify");

  const handleCurPwd = (event: ChangeEvent<HTMLInputElement>) => {
    setCurPwd(event.target.value as string)
    setValidCurPwd(isValidPassword(event.target.value));
  }

  const handleNewPwd = (event: ChangeEvent<HTMLInputElement>) => {
    setNewPwd(event.target.value as string)
    setValidNewPwd(isValidPassword(event.target.value));
  }

  const handleConfirmPwd = (event: ChangeEvent<HTMLInputElement>) => {
    setConfirmPwd(event.target.value as string)
    setValidConfirmPwd(isValidPassword(event.target.value));    
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (curPwd !== '' && confirmPwd !== '' && newPwd !== '' && validCurPwd && validNewPwd && validConfirmPwd) {
      if (newPwd == confirmPwd) {
        const { data } = await Api.auth.changePassword(email, curPwd, newPwd);
        if (data.statusCode === 200) {
          // notify.innerHTML = data.message
          toast.success(data.message)
        } else {
          // notify.innerHTML = (data.message || 'エラーか発生しました。');
          toast.error(data.message || 'エラーか発生しました。')
        }
      }else{
        setValidConfirmPwd(false);
        setErr3(CONFIRMPASSWORDVALIDERROR);
      }

    } else {
      if (validNewPwd !== validConfirmPwd) {
        setValidConfirmPwd(false);
        setErr3(CONFIRMPASSWORDVALIDERROR);
      }
      if (curPwd == '') setValidCurPwd(false);
      if (confirmPwd == '') setValidConfirmPwd(false);
      if (newPwd == '') setValidNewPwd(false);
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
      <ThemeProvider theme={defaultTheme} >
        <Container component="main" className="!max-w-[600px] bg-transparent ">
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

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 7 }}>
              <Grid container spacing={4} className="meiryo font-Noto">
                <Grid item xs={12} sm={4} className="p-0 mt-3 mb-5">
                  <Typography className='middleFont text-[#000000]'>
                    現在のパスワード
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8} className="p-0">
                  <TextField
                    label=''
                    variant="outlined"
                    type={showCurPwd ? "text" : "password"} // <-- This is where the magic happens
                    id="curPwd"
                    name="curPwd"
                    error={!validCurPwd}
                    onChange={handleCurPwd}
                    helperText={!validCurPwd ? err1 : ''}
                    fullWidth
                    required
                    sx={{
                      '& fieldset': {
                        borderRadius: '8px',
                      },
                      "& .MuiOutlinedInput-root": {
                        background: "#FFFFFF",
                        height: "44px",
                        fontFamily: 'Noto Sans',
                        "&.Mui-focused fieldset": {
                          borderColor: !validCurPwd ? "#d32f2f" : "#C0A2E0",
                        }
                      }
                    }}
                    InputProps={{ // <-- This is where the toggle button is added.
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickCurPassword}
                            onMouseDown={handleMouseDownPassword}>
                            {showCurPwd ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    placeholder="現在のパスワード入力"
                    value={curPwd}
                  />
                </Grid>
                <Grid item xs={12} sm={4} className="p-0 mt-3 mb-5">
                  <Typography className='font-Noto middleFont text-[#000000]'>
                    パスワード
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8} className="p-0">
                  <TextField
                    label=''
                    variant="outlined"
                    type={showNewPwd ? "text" : "password"} // <-- This is where the magic happens
                    id="newPwd"
                    name="newPwd"
                    error={!validNewPwd}
                    onChange={handleNewPwd}
                    helperText={!validNewPwd ? err2 : ''}
                    fullWidth
                    required
                    sx={{
                      '& fieldset': {
                        borderRadius: '8px',
                      },
                      "& .MuiOutlinedInput-root": {
                        background: "#FFFFFF",
                        height: "44px",
                        fontFamily: 'Noto Sans',
                        "&.Mui-focused fieldset": {
                          borderColor: !validNewPwd ? "#d32f2f" : "#C0A2E0",
                        }
                      }
                    }}
                    InputProps={{ // <-- This is where the toggle button is added.
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickNewPassword}
                            onMouseDown={handleMouseDownPassword}>
                            {showNewPwd ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    placeholder="パスワード入力"
                    value={newPwd}
                  />
                </Grid>
                <Grid item xs={12} sm={4} className="p-0 mt-3 mb-5">
                  <Typography className='font-Noto middleFont text-[#000000]'>
                    パスワード確認
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8} className="p-0">
                  <TextField
                    label=''
                    variant="outlined"
                    type={showConfirmPwd ? "text" : "password"} // <-- This is where the magic happens
                    id="confirmPwd"
                    name="confirmPwd"
                    error={!validConfirmPwd}
                    onChange={handleConfirmPwd}
                    helperText={!validConfirmPwd ? err3 : ''}
                    fullWidth
                    required
                    sx={{
                      '& fieldset': {
                        borderRadius: '8px',
                      },
                      "& .MuiOutlinedInput-root": {
                        background: "#FFFFFF",
                        height: "44px",
                        fontFamily: 'Noto Sans',
                        "&.Mui-focused fieldset": {
                          borderColor: !validNewPwd ? "#d32f2f" : "#C0A2E0",
                        }
                      }
                    }}
                    InputProps={{ // <-- This is where the toggle button is added.
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickConfirmPassword}
                            onMouseDown={handleMouseDownPassword}>
                            {showConfirmPwd ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    placeholder="パスワード確認"
                    value={confirmPwd}
                  />
                </Grid>
                <Grid item xs={12} sm={4} className="m-auto pr-0, pl-0, pt-20">
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 5, mb: 2, bgcolor: '#0066FF', }}>
                    パスワード再設定
                  </Button>
                  {/* <Link href="/auth/login" variant="body2" className="flex items-center justify-center mt-3">
                    ログインはこちら &gt;
                  </Link> */}
                </Grid>

              </Grid>
            </Box>
            <Typography id="notify" className='m-auto pt-4 meiryo font-Noto text-[16px] !text-[#d32f2f]'></Typography>
          </Box>
        </Container>
      </ThemeProvider>
    </div >
  );
};

export default PwdChange;