import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
// import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';

import { useNavigate } from "react-router-dom";
import { EMAILVALIDERROR, EMPTYERROR, NOT_REGISTER_USER_ERROR, CHANGE_PASSWORD_MAIL_CONTENT } from '../../configs/AppConfig';

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

export default function ForgotPassword() {
    const [validMail, setValidMail] = useState(false);
    const [email, setEmail] = useState('');
    const [err, setErr] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showFirst, setShowFirst] = useState(true);
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleEmail = (event: ChangeEvent<HTMLInputElement>) => {
        const regEmail = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!regEmail.test(event.target.value as string) && event.target.value) {
            setValidMail(true);
            setErr(EMAILVALIDERROR);
        } else {
            setValidMail(false);
            setErr('');
        }
        setEmail(event.target.value as string)
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        if (!validMail && email !== '') {
            const params = {
                email: data.get('email')
            };
            const response = await api.auth.sendLinkOfResetPassword(params)
            if (response.data.statusCode === 200) {
                setShowFirst(false); 
                // window.location.href = '/auth/reset';
            } else {
                setValidMail(true);
                setErr(NOT_REGISTER_USER_ERROR);
                // event.currentTarget.helperText = "ssss";
            }
        } else {
            if (email == '') {
                setValidMail(true);
                setErr(EMPTYERROR);
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
                <Typography className="normal font-[400] text-[#1A1A1A]" component="h1" variant="h5"
                    sx={{
                        fontSize: "26px",
                        lineHeight: "39px",
                    }}
                >
                    パスワード再設定
                </Typography>
                {showFirst ? <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <Typography className='text-[16px] pt-10'
                        sx={{
                            fontSize: "16px",
                            lineHeight: "24px",
                        }}
                    >
                        メールアドレス
                    </Typography>

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label=""
                        name="email"
                        autoComplete="email"
                        autoFocus
                        error={validMail}
                        onChange={handleEmail}
                        helperText={validMail ? err : ''}
                        sx={{
                            mt: "0px",
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: '#fff',
                                borderRadius: "8px",
                                height: "48px",
                                margin: "5px 0px",
                                fontSize: "16px",
                                lineHeight: "24px",
                                border: "1px solid #808080",
                                "&.Mui-focused fieldset": {
                                    borderColor: validMail ? "#d32f2f" : "#C0A2E0",
                                }
                            },
                        }}
                        placeholder='admin@gmail.com'
                        value={email}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        className='addBtn'
                        sx={{
                            mt: 1,
                            mb: 5,
                            height: "40px",
                            bgcolor: '#24BFF2',
                        }}
                    >
                        パスワード再設定
                    </Button>

                    <Link href="/auth/login" variant="body2" className="flex items-center justify-center !text-[#808080] font-[400] !text-[12px] !no-underline ">
                        ログインはこちら &gt;
                    </Link>

                </Box> : <Typography className='text-[16px]' >入力いただいたメールアドレス宛にメールを送信しました。<br />メールを確認し、8時間以内にパスワードの再設定をお願いします。
                    8時間を経過した場合パスワードの再設定はできなくなります。<br />もしメールが届かない場合は、入力されたメールアドレスが間違っているか、利用できないか、登録されていません。迷惑メールとして削除されている場合もありますので、メールソフトの設定もあわせてご確認ください。<br />
                    <Link href="/auth/login" variant="body2" className="flex items-center justify-center !mt-5">
                        ログインはこちら &gt;
                    </Link></Typography>}
            </Box>
        </div>
    );
}