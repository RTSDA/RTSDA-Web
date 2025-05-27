const POCKETBASE_URL =
	import.meta.env.VITE_POCKETBASE_URL || 'https://pocketbase.rockvilletollandsda.church';

export interface AndroidApp {
	id: string;
	version_name: string;
	version_code: number;
	apkfile: string;
	update_required: boolean;
	update_description: string;
}

interface AndroidAppResponse {
	page: number;
	perPage: number;
	totalItems: number;
	totalPages: number;
	items: AndroidApp[];
}

export const androidAppService = {
	async getLatestApp(): Promise<AndroidApp | null> {
		try {
			const response = await fetch(
				`${POCKETBASE_URL}/api/collections/rtsda_android/records?sort=-version_code&perPage=1`
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = (await response.json()) as AndroidAppResponse;
			return data.items.length > 0 ? data.items[0] : null;
		} catch (error) {
			console.error('Error fetching Android app:', error);
			return null;
		}
	},

	getApkUrl(app: AndroidApp): string {
		return `${POCKETBASE_URL}/api/files/rtsda_android/${app.id}/${app.apkfile}`;
	}
};
