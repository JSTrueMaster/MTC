import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
// import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';

import { useNavigate } from "react-router-dom";
import { EMAILVALIDERROR, PASSWORDVALIDERROR, LOGIN_FAILED_ERROR, EMPTYERROR } from '../../configs/AppConfig';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { Typography, IconButton, OutlinedInput, InputAdornment, FormControl, TextField, Fade } from '@mui/material'

import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ChangeEvent, MouseEvent, useState } from "react";
import api from "src/api";
import Jwt from 'src/services/jwt';

const theme = createTheme();

export default function SignIn() {
    let navigate = useNavigate();
    const [validMail, setValidMail] = useState(false);
    const [validPassword, setValidPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [err1, setErr1] = useState('');
    const [err2, setErr2] = useState('');
    const myForm = document.getElementById("notify");
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleEmail = (event: ChangeEvent<HTMLInputElement>) => {
        if (myForm) myForm.innerHTML = ''
        const regEmail = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!regEmail.test(event.target.value as string) && event.target.value) {
            setValidMail(true)
            setErr1(EMAILVALIDERROR)
        } else {
            setValidMail(false);
            setErr1('');
        }
        setEmail(event.target.value as string)
    };

    const handlePassword = (event: ChangeEvent<HTMLInputElement>) => {
        if (myForm) myForm.innerHTML = ''
        const regPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
        if (!regPassword.test(event.target.value as string) && event.target.value) {
            setValidPassword(true)
            setErr2(PASSWORDVALIDERROR)
        } else {
            setValidPassword(false);
            setErr2('')
        }
        setPassword(event.target.value as string)
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        if (!validMail && !validPassword && email != '' && password != '') {
            const params = {
                email: data.get('email'),
                password: data.get('password'),
            };
            const response = await api.auth.login(params);
            if (response.data.statusCode === 200) {

                Jwt.setToken(response.data.token);

                localStorage.setItem('userName', response.data.user.personalInfo.firstName + response.data.user.personalInfo.lastName)
                localStorage.setItem('storeName', response.data.user.personalInfo.storeName)
                localStorage.setItem('permission', response.data.permission)
                
                window.location.href = "/dashboard";
                
            } else {
                myForm.innerHTML = LOGIN_FAILED_ERROR;
            }
        } else {
            if (email == '') {
                setValidMail(true);
                setErr1(EMPTYERROR);
            } else if (password == '') {
                setValidPassword(true);
                setErr2(EMPTYERROR);
            }
        }
    };

    return (
        <div className='w-full flex items-center justify-center h-screen'>
            <Box
                className="flex p-30 m-auto align-middle rounded-[20px] border-[1px] border-solid border-[#808080]"
                sx={{
                    flexDirection: 'column',
                    padding: "30px",
                    maxWidth: '420px',
                }}
            >
                {/* <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar> */}
                <Typography className="pb-4 normal font-[400] text-[#1A1A1A]" component="h1" variant="h5"
                    sx={{
                        fontSize: "26px",
                        lineHeight: "39px",
                    }}
                >
                    ユーザーログイン
                </Typography>
                <Typography id="notify" className='meiryo text-[16px] !text-[#d32f2f]'>

                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <Typography className='text-[16px] pt-5'
                        sx={{
                            fontSize: "16px",
                            lineHeight: "24px",
                        }}
                    >
                        メールアドレス
                    </Typography>

                    <TextField
                        required
                        fullWidth
                        id="email"
                        label=""
                        name="email"
                        autoComplete="email"
                        autoFocus
                        error={validMail}
                        onChange={handleEmail}
                        helperText={validMail ? err1 : ''}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: '#fff',
                                borderRadius: "8px",
                                height: "48px",
                                fontSize: "16px",
                                mt: "5px",
                                mb: "7px",
                                lineHeight: "24px",
                                border: "1px solid #808080",
                                "&.Mui-focused fieldset": {
                                    borderColor: validMail ? "#d32f2f" : "#C0A2E0",
                                }
                            },
                        }}
                        placeholder='メールアドレス'
                        value={email}
                    />
                    <Typography className='text-[16px] pt-5'
                        sx={{
                            fontSize: "16px",
                            lineHeight: "24px",
                        }}
                    >
                        パスワード
                    </Typography>

                    <TextField
                        label=''
                        // variant="outlined"
                        type={showPassword ? "text" : "password"} // <-- This is where the magic happens
                        id="password"
                        name="password"
                        error={validPassword}
                        onChange={handlePassword}
                        helperText={validPassword ? err2 : ''}
                        fullWidth
                        required
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: '#fff',
                                borderRadius: "8px",
                                height: "48px",
                                mt: "5px",
                                mb: "7px",
                                fontSize: "16px",
                                lineHeight: "24px",
                                borderColor: "1px solid #808080",
                                "&.Mui-focused fieldset": {
                                    borderColor: validMail ? "#d32f2f" : "#C0A2E0",
                                }
                            }
                        }}
                        InputProps={{ // <-- This is where the toggle button is added.
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                    >
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        placeholder="パスワード入力"
                        value={password}
                    />

                    <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label="次回から自動的にログイン"
                        className="my-1"
                    />
                    <Grid container >
                        <Grid item className="float-left" xs>
                            <Link href="/auth/forgot-password" variant="body2" className="float-right !text-[12px] text-[#0066FF] pl-2">
                                こちら
                            </Link>
                            <Typography className='!text-[12px] text-[#808080] font-bold float-right'>
                                パスワードを忘れ た方は
                            </Typography>
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        className='addBtn'
                        sx={{
                            mt: 3, mb: 2,
                            height: "40px",
                            bgcolor: '#24BFF2',
                        }}
                    >
                        ログイン
                    </Button>

                </Box>
            </Box>
        </div>
    );
}