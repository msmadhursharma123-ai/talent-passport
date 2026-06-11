/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PathwayType = 'Communication' | 'Creative Expression' | 'Problem Solving' | 'Team Event';

export interface Submission {
  id?: string;
  created_at?: string;
  student_name: string;
  student_email: string;
  pathway: PathwayType;
  event_name: string;
  video_url: string;
  description: string;
  video_name: string;
  video_size: number; // in bytes
}

export const PATHWAY_EVENTS: Record<PathwayType, string[]> = {
  'Communication': [
    'Speak90',
    'StorySprint',
    'Podcast Hero',
    'News Anchor Challenge',
    'Interview Master'
  ],
  'Creative Expression': [
    'Rhythm90',
    'Melody90',
    'Navras Live',
    'Visual Story Lab',
    'Poetry Performance',
    'Creative Writing'
  ],
  'Problem Solving': [
    'Problem Solving Arena',
    'Design Thinking Challenge',
    'STEM Project',
    'Business Challenge',
    'Hack The School',
    'Social Impact Challenge'
  ],
  'Team Event': [
    'Nirnay',
    'Mission Impossible'
  ]
};

export const PATHWAY_DESCRIPTIONS: Record<PathwayType, string> = {
  'Communication': 'Master of dynamic speaking, storytelling, anchoring, and interviews.',
  'Creative Expression': 'Expressive artistic creations in music, design, words, and performance.',
  'Problem Solving': 'Empirical solution generation, business ideas, hackathons, and STEM research.',
  'Team Event': 'Collaborative multi-member competitive tactical events and strategic plans.'
};
