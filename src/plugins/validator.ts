export const isValidPassword = (password: string): boolean => {
	const regPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
	if (regPassword.test(password) ||  password =='') {
		return true;
	} else {
		return false;
	}
}

export const isValidEmail = (email: string): boolean => {
	const regEmail = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (!regEmail.test(email as string) && email) {
		return true;
	} else {
		return false;
	}
}

