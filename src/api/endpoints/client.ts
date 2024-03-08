const ClientApi = (httpClient: any) => ({

	//----------------------Shop-----------------------------//	
	getShop(payload: any) {
		return httpClient.fetch(`client/getShop`, payload)
	},

	createShop(payload: any) {
		return httpClient.post(`client/createShop`, payload)
	},

	updateShop(id: string, payload: any) {
		return httpClient.put(`client/shop/${id}`, payload)
	},

	deleteShop(id: string) {
		return httpClient.delete(`client/shop/${id}`)
	},

	getShopHistory(id: string) {
		return httpClient.fetch(`client/shop/history/${id}`)
	},

	updateShopHistory(id: string, payload: any) {
		return httpClient.put(`client/shop/history/${id}`, payload)
	},

	//------------------- Saler manage --------------------------//

	getSaler(payload: any) {
		return httpClient.fetch(`client/getSaler`, payload)
	},

	createSaler(payload: any) {
		return httpClient.post(`client/createSaler`, payload)
	},

	updateSaler(id: string, payload: any) {
		return httpClient.put(`client/saler/${id}`, payload)
	},

	deleteSaler(id: string) {
		return httpClient.delete(`client/saler/${id}`)
	},

	getSalerHistory(id: string) {
		return httpClient.fetch(`client/saler/history/${id}`)
	},

	updateSalerHistory(id: string, payload: any) {
		return httpClient.put(`client/saler/history/${id}`, payload)
	},

	// -----------------------Admin---------------------------//
	getAdmin(payload: any) {
		return httpClient.fetch(`client/getAdmin`, payload)
	},

	createAdmin(payload: any) {
		return httpClient.post(`client/createAdmin`, payload)
	},

	updateAdmin(id: string, payload: any) {
		return httpClient.put(`client/admin/${id}`, payload)
	},

	deleteAdmin(id: string) {
		return httpClient.delete(`client/admin/${id}`)
	},

	getAdminHistory(id: string) {
		return httpClient.fetch(`client/admin/history/${id}`)
	},

	updateAdminHistory(id: string, payload: any) {
		return httpClient.put(`client/admin/history/${id}`, payload)
	},

	// -----------------------Employee---------------------------//
	getEmployee(payload: any) {
		return httpClient.fetch(`client/getEmployee`, payload)
	},

	createEmployee(payload: any) {
		return httpClient.post(`client/createEmployee`, payload)
	},

	updateEmployee(id: string, payload: any) {
		return httpClient.put(`client/employee/${id}`, payload)
	},

	deleteEmployee(id: string) {
		return httpClient.delete(`client/employee/${id}`)
	},

	getEmployeeHistory(id: string) {
		return httpClient.fetch(`client/employee/history/${id}`)
	},

	updateEmployeeHistory(id: string, payload: any) {
		return httpClient.put(`client/employee/history/${id}`, payload)
	},

	// -----------------------Board---------------------------//
	getStoreBoard(payload: any) {
		return httpClient.post(`client/getStoreBoard`, payload)
	},

	getBoard(payload: any) {
		return httpClient.fetch(`client/getBoard`, payload)
	},

	createBoard(payload: any) {
		return httpClient.post(`client/createBoard`, payload)
	},

	updateBoard(id: string, payload: any) {
		return httpClient.put(`client/board/${id}`, payload)
	},

	imageUpload(payload: any) {
		return httpClient.post(`client/board/imageUpload`, payload)
	},

	imageRemove(payload: any) {
		return httpClient.post(`client/board/imageRemove`, payload)
	},

	deleteBoard(id: string) {
		return httpClient.delete(`client/board/${id}`)
	},

	getBoardHistory(id: string) {
		return httpClient.fetch(`client/board/history/${id}`)
	},

	updateBoardHistory(id: string, payload: any) {
		return httpClient.put(`client/board/history/${id}`, payload)
	},

	// -----------------------Master---------------------------//
	getMaster(payload: any) {
		return httpClient.post(`client/getMaster`, payload)
	},

	createMaster(payload: any) {
		return httpClient.post(`client/createMaster`, payload)
	},

	updateMaster(id: string, payload: any) {
		return httpClient.put(`client/master/${id}`, payload)
	},

	deleteMaster(id: string) {
		return httpClient.delete(`client/master/${id}`)
	},

	getMasterHistory(id: string) {
		return httpClient.fetch(`client/master/history/${id}`)
	},

	updateMasterHistory(id: string, payload: any) {
		return httpClient.put(`client/master/history/${id}`, payload)
	},

	//------------product manage ---------------//

	getProduct(payload: any) {
		return httpClient.post(`client/getProduct`, payload)
	},

	createProduct(payload: any) {
		return httpClient.post(`client/createProduct`, payload)
	},

	updateProduct(id: string, payload: any) {
		return httpClient.put(`client/product/${id}`, payload)
	},

	deleteProduct(id: string) {
		return httpClient.delete(`client/product/${id}`)
	},
	updateModalProduct(payload: any) {
		return httpClient.post(`client/productModal`, payload)
	},

	//------------ master constants ---------------//

	getMasterContants(payload: any) {
		return httpClient.post(`client/getMasterContants`, payload)
	},


});

export default ClientApi;
