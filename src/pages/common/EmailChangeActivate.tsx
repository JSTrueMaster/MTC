import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Link, Button } from '@mui/material';
import Jwt from "src/services/jwt";
import api from "src/api";

export default function EmailChangeActivate() {
	const navigate = useNavigate();
	const location = useLocation();
	const token = new URLSearchParams(location.search).get('token');
	const [success, setSuccess] = useState(false)
	const [result, setResult] = useState('')
	const activate = async () => {
		const { data } = await api.auth.changeEmail(token);
		if (data.statusCode === 200) {
			Jwt.logout();
			setSuccess(true);
		} else {
			setSuccess(false);
		}
		setResult(data.message);
	}
	useEffect(() => {
		activate();
	}, []);

	return (
		<div className='w-full flex items-center justify-center h-screen'>
			<Box
				className="flex p-10 m-auto border-[#080808] align-middle rounded-[5px] border-[1px] border-solid"
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					maxWidth: '400px',
					maxHeight: '600px',
				}}>

				<Typography className="pb-4" component="h1" variant="h5">
					メールアドレス変更
				</Typography>
				<Typography className="pb-2 mt-3" component="h1" >
					{result}
				</Typography>
				<Link href="/auth/login" variant="body2" className="flex items-center justify-center mt-3">
					ログインはこちら &gt;
				</Link>
			</Box>
		</div>
	);
}
