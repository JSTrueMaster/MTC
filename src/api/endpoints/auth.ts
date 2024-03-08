const AuthApi = (httpClient: any) => ({
	login(payload: any) {
		return httpClient.post(`user/auth/login`, payload)
	},

	loginWithGoogle(email: string) {
		return httpClient.post(`user/auth/loginWithGoogle`, { email })
	},

	signUp(email: string, password: string) {
		return httpClient.post(`user/auth/signUp`, { email, password });
	},

	signUpWithGoogle(email: string) {
		return httpClient.post(`user/auth/signUpWithGoogle`, { email });
	},

	//----------Auth Management---------------//
	sendLinkOfResetPassword(payload: any) {
		return httpClient.post(`user/auth/sendLinkOfResetPassword`, payload)
	},

	resetPassword(token: string, password: string) {
		return httpClient.post(`user/auth/resetPassword/${token}`, {
			password
		});
	},

	checkLinkOfResetPassword(token: string) {
		return httpClient.fetch(`user/auth/checkLinkOfResetPassword/${token}`);
	},


	changePassword(email: string, password: string, newPassword: string) {
		return httpClient.post(`user/auth/changePassword`, {
			email,
			password,
			newPassword
		})
	},

	sendLinkOfVerifyEmail(email: string, new_email: string) {
		return httpClient.post(`user/auth/sendLinkOfVerifyEmail`, {
			email,
			new_email
		});
	},

	verifyEmail(token: string) {
		return httpClient.post(`user/auth/verifyEmail/${token}`);
	},

	sendLinkOfChangeEmail(email: string, new_email: string) {
		return httpClient.post(`user/auth/sendLinkOfChangeEmail`, {
			email,
			new_email
		});
	},

	changeEmail(token: string) {
		return httpClient.post(`user/auth/changeEmail/${token}`);
	},

	checkDuplicatedEmail(email: string) {
		return httpClient.post(`user/auth/checkDuplicatedEmail/${email}`);
	},
})


export default AuthApi