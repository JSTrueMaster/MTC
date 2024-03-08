import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
// import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';

import { useNavigate } from "react-router-dom";
import { PASSWORDVALIDERROR, CONFIRMPASSWORDVALIDERROR } from '../../configs/AppConfig';


import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { Typography, IconButton, OutlinedInput, InputAdornment, FormControl, TextField, Fade } from '@mui/material'

import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ChangeEvent, MouseEvent, useState } from "react";
import api from "src/api";

function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {/* {'Copyright © '} */}
            <Link color="inherit" href="https://mui.com/">
                {/* Your Website */}
            </Link>{' '}
            {/* {new Date().getFullYear()} */}
            {'.'}
        </Typography>
    );
}

const theme = createTheme();

export default function ResetPassword() {
    let navigate = useNavigate();
    const token = new URLSearchParams(location.search).get('token');
    const [validPassword, setValidPassword] = useState(false);
    const [validPwd, setValidPwd] = useState(false);
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [pwd, setPwd] = useState('');
    const [err2, setErr2] = useState('');
    const [showFirst, setShowFirst] = useState(true);
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handlePassword = (event: ChangeEvent<HTMLInputElement>) => {
        const regPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
        if (!regPassword.test(event.target.value as string) && event.target.value) {
            setValidPassword(true);
        } else {
            setValidPassword(false);
        }
        setPassword(event.target.value as string)
    };

    const handleConfirmPassword = (event: ChangeEvent<HTMLInputElement>) => {
        if (!validPassword && password == event.target.value) {
            setValidPwd(true);
        } else {
            if (event.target.value == '') {
                setErr2('');
            } else {
                setErr2(CONFIRMPASSWORDVALIDERROR);
            }
            setValidPwd(false);
        }
        setPwd(event.target.value as string)
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        if (validPwd) {
            const params = {
                password: data.get('password')
            };
            const response = await api.auth.resetPassword(token, data.get('password').toString())
            if (response.data.statusCode === 200) {
                setShowFirst(false)
            } else {
                // console.log(response.data.message)
            }
        } else {
            // console.log("invalid password format for changing password: " + validPwd)
        }
    };

    return (
        <div className='w-full flex items-center justify-center h-screen'>
            {showFirst ? <Box
                className="flex p-10 m-auto border-[#080808] align-middle rounded-[5px] border-[1px] border-solid"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '400px',
                    maxHeight: '600px',
                }}
            >
                {/* <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar> */}
                <Typography className="pb-4" component="h1" variant="h5">
                    パスワード再設定
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <Typography className='font-Noto text-[16px] !font-bold'>
                        パスワード入力
                    </Typography>

                    <TextField
                        label=''
                        variant="outlined"
                        type={showPassword ? "text" : "password"} // <-- This is where the magic happens
                        id="password"
                        name="password"
                        error={validPassword}
                        onChange={handlePassword}
                        helperText={validPassword ? PASSWORDVALIDERROR : ''}
                        fullWidth
                        required
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: '#fff',
                                borderRadius: "8px",
                                height: "48px",
                                fontFamily: 'Noto Sans',
                                "&.Mui-focused fieldset": {
                                    borderColor: !validPassword ? "#d32f2f" : "#C0A2E0",
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
                        placeholder="Eg. Super$ecret123"
                        value={password}
                    />
                    <Typography className='font-Noto text-[16px] !font-bold mt-4'>
                        パスワード確認
                    </Typography>

                    <TextField
                        label=''
                        variant="outlined"
                        type={showPassword ? "text" : "password"} // <-- This is where the magic happens
                        id="password"
                        name="password"
                        error={!validPwd}
                        onChange={handleConfirmPassword}
                        helperText={!validPwd ? err2 : ''}
                        fullWidth
                        required
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: '#fff',
                                borderRadius: "8px",
                                height: "48px",
                                fontFamily: 'Noto Sans',
                                "&.Mui-focused fieldset": {
                                    borderColor: !validPwd ? "#d32f2f" : "#C0A2E0",
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
                        placeholder="Eg. Super$ecret123"
                        value={pwd}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 5, mb: 2 }}
                    >
                        パスワード再設定
                    </Button>

                    <Link href="/auth/login" variant="body2" className="flex items-center justify-center mt-3">
                        ログインはこちら &gt;
                    </Link>

                </Box>
            </Box> : <Box
                className="flex p-10 m-auto border-[#080808] align-middle rounded-[5px] border-[1px] border-solid"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '400px',
                    maxHeight: '600px',
                }}
            >
                <Typography className="pb-4" component="h1" variant="h5">
                    パスワード再登録完了

                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

                    <Typography className='font-Noto text-[16px] !font-bold mt-4'>
                        パスワードの再登録が完了しました。<br />

                        ご登録の新しいパスワードが登録されました。すでに新しいパスワードが有効です。ログイン画面にてログインができます！
                    </Typography>


                    <Link href="/auth/login" variant="body2" className="flex items-center justify-center mt-3">
                        ログインはこちら &gt;
                    </Link>

                </Box>
            </Box>}
        </div>
    );
}
