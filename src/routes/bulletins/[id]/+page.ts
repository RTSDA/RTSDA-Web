import { getBulletin } from '../../../lib/services/bulletinService.js';
import type { Bulletin } from '../../../lib/types/bulletin.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  try {
    const bulletin = await getBulletin(params.id);
    return {
      bulletin
    };
  } catch (err) {
    throw error(404, 'Bulletin not found');
  }
} 