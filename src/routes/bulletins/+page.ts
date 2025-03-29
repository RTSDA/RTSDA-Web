import { getBulletins } from '../../lib/services/bulletinService.js';
import type { Bulletin } from '../../lib/types/bulletin.js';
import { error } from '@sveltejs/kit';

export async function load() {
  try {
    const bulletins = await getBulletins();
    return {
      bulletins
    };
  } catch (err) {
    console.error('Error loading bulletins:', err);
    throw error(500, err instanceof Error ? err.message : 'Failed to load bulletins');
  }
} 