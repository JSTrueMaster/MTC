const UserApi = (httpClient: any) => ({
	//-----------Profile----------//
	updateProfile(payload: any) {
		return httpClient.put(`user/update/profile`, payload)
	},

	updateLinkedGmail(payload: any) {
		return httpClient.put(`user/update/linkedGmail`, payload)
	},
	//-----------Collection----------//
	addCollection(payload: any) {
		return httpClient.post(`user/collection/store`, payload);
	},

	updateCollection(coId: any, payload: any) {
		return httpClient.put(`user/collection/update/${coId}`, payload);
	},

	fetchCollections() {
		return httpClient.fetch(`user/collections/all`);
	},

	fetchFavoriteCollections() {
		return httpClient.fetch(`user/collections/favorite`);
	},

	fetchOwnedCollections() {
		return httpClient.fetch(`user/collections/owned`);
	},

	fetchCollectionsByCategory(slug: string) {
		return httpClient.fetch(`user/category/${slug}/collections`);
	},

	detailCollection(id: string) {
		return httpClient.fetch(`user/collections/get/${id}`);
	},

	deleteCollection(id: string) {
		return httpClient.delete(`user/collections/${id}`);
	},

	//-----------Favorite----------//
	setCollectionLike(id: string) {
		return httpClient.post(`user/collections/${id}/like`);
	},

	setCollectionUnLike(id: string) {
		return httpClient.post(`user/collections/${id}/unlike`);
	},

	fetchUser() {
		return httpClient.fetch(`user/me`);
	},
	fetchAccessHistory() {
		return httpClient.fetch(`user/access_history`);
	}
});

export default UserApi;
