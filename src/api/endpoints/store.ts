const StoreApi = (httpClient: any) => ({

	//-----------Sales----------//	
	getSales(payload: any) {
		return httpClient.fetch(`store/sales`, payload)
	},

	getSummarySales(payload: any) {
		return httpClient.post(`store/summarysales`, payload)
	},

	getPointerSales(payload: any) {
		return httpClient.post(`store/pointerSales`, payload)
	},

	createSale(payload: any) {
		return httpClient.post(`store/sale`, payload)
	},

	deleteSale(id: string) {
		return httpClient.delete(`store/sale/${id}`)
	},

	updateSale(id: string, payload: any) {
		return httpClient.put(`store/sale/${id}`, payload)
	},

	updateModalSale(payload: any) {
		return httpClient.post(`store/saleModal`, payload)
	},

	updateSaleHistory(id: string, payload: any) {
		return httpClient.put(`store/sale/history/${id}`, payload)
	},

	getSaleHistory(id: string) {
		return httpClient.fetch(`store/sale/history/${id}`)
	},

	imageUpload(payload: any) {
		return httpClient.post(`store/sale/imageUpload`, payload)
	},

	imageRemove(payload: any) {
		return httpClient.post(`store/sale/imageRemove`, payload)
	},

	csvUploadSales(payload: any) {
		return httpClient.post(`store/sale/csvUpload`, payload)
	},

	setTempImage(payload: any) {
		return httpClient.post(`store/sale/setTempImage`, payload)
	},
	//-----------Report(PL)----------//	
	createReport(payload: any) {
		return httpClient.post(`store/report`, payload)
	},
	getReport(payload: any) {
		return httpClient.post(`store/pointerReport`, payload)
	},

	//-----------Expenses----------//	
	getExpenses(payload: any) {
		return httpClient.fetch(`store/expenses`, payload)
	},

	getPointerExpenses(payload: any) {
		return httpClient.post(`store/pointerExpenses`, payload)
	},

	createExpense(payload: any) {
		return httpClient.post(`store/expense`, payload)
	},

	deleteExpense(id: string) {
		return httpClient.delete(`store/expense/${id}`)
	},

	updateExpense(id: string, payload: any) {
		return httpClient.put(`store/expense/${id}`, payload)
	},

	updateExpenseHistory(id: string, payload: any) {
		return httpClient.put(`store/expense/history/${id}`, payload)
	},

	getExpenseHistory(id: string) {
		return httpClient.fetch(`store/expense/history/${id}`)
	},

	fileUpload(payload: any) {
		return httpClient.post(`store/expense/fileUpload`, payload)
	},

	fileRemove(payload: any) {
		return httpClient.post(`store/expense/fileRemove`, payload)
	},
	csvUploadExpense(payload: any) {
		return httpClient.post(`store/expense/csvUpload`, payload)
	},
	setTempFile(payload: any) {
		return httpClient.post(`store/expense/setTempFile`, payload)
	},

	//-----------Cfs----------//	
	getCfs(payload: any) {
		return httpClient.fetch(`store/cfs`, payload)
	},

	getPointerCfs(payload: any) {
		return httpClient.post(`store/pointerCfs`, payload)
	},

	createCf(payload: any) {
		return httpClient.post(`store/cf`, payload)
	},

	deleteCf(id: string) {
		return httpClient.delete(`store/cf/${id}`)
	},

	updateCf(id: string, payload: any) {
		return httpClient.put(`store/cf/${id}`, payload)
	},

	updateCfHistory(id: string, payload: any) {
		return httpClient.put(`store/cf/history/${id}`, payload)
	},

	getCfHistory(id: string) {
		return httpClient.fetch(`store/cf/history/${id}`)
	},

	csvUploadCf(payload: any) {
		return httpClient.post(`store/cf/csvUpload`, payload)
	},

	//-----------Diff----------//	
	getDiff(payload: any) {
		return httpClient.post(`store/diff`, payload)
	},

	//-----------Deposit----------//	
	getDeposit(payload: any) {
		return httpClient.post(`store/deposit`, payload)
	},

	//DailyCheck Data
	getDailyCheckData(payload: any) {
		return httpClient.post('store/dailyCheck', payload)
	},

	//ReportMail Data
	getLReportMailData(currDate: string, payload: any) {
		return httpClient.post(`store/reportMail/${currDate}`, payload)
	},
	sendLReportMail(payload: any) {
		return httpClient.post(`store/sendReportMail/`, payload)
	},

	//safety1
	getSafety1(payload: any) {
		return httpClient.post(`store/safety1/`, payload)
	},
	createSafety1(payload: any) {
		return httpClient.post(`store/createSafety1`, payload)
	},
	getSafety2(payload: any) {
		return httpClient.post(`store/safety2`, payload)
	},
	createSafety2(payload: any) {
		return httpClient.post(`store/createSafety2`, payload)
	},

	//safety_mail
	getSafetyMailData(currDate: string, payload: any) {
		return httpClient.post(`store/safetyMail/${currDate}`, payload)
	},
	sendSafetyMail(payload: any) {
		return httpClient.post(`store/sendSafetyMail/`, payload)
	},

	//enters
	createEnters(payload: any) {
		return httpClient.post(`store/enter`, payload)
	},
	//managment fee
	createManagementFee(payload: any) {
		return httpClient.post(`store/managementFee`, payload)
	},

	// Dashboard
	getSalesOfDashboard(payload: any) {
		return httpClient.post(`store/getSalesOfDashboard`, payload)
	},
	SalesElementTableOfDashboard(payload: any) {
		return httpClient.post(`store/SalesElementTableOfDashboard`, payload)
	},
});

export default StoreApi;
