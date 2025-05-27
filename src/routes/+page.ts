import type { PageLoad } from './$types';
import { androidAppService } from '$lib/services/androidAppService';

export const load: PageLoad = async () => {
	const androidApp = await androidAppService.getLatestApp();

	return {
		androidApp
	};
};
