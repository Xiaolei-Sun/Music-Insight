/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MusicInfo {
  songName: string;
  artistName: string;
  album?: string;
  releaseYear?: string;
  artistOverviewCN: string;
  artistOverviewEN: string;
  trackBackgroundCN: string;
  trackBackgroundEN: string;
  styleDescriptionCN: string;
  styleDescriptionEN: string;
  summaryCN: string;
  summaryEN: string;
}

export type AppState = 'idle' | 'searching' | 'result' | 'error';
