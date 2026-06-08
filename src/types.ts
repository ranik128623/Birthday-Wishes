/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LucideIcon } from 'lucide-react';

export interface WishCard {
  id: string;
  title: string;
  description: string;
  category: string;
  iconName: string; // Dynamic icon rendering lookup
  gradient: string;
}

export type MusicSource = 'box' | 'piano';

export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  opacity: number;
}

export interface FloatingBalloon {
  id: number;
  color: string;
  driftX: number;
  duration: number;
  delay: number;
  left: number;
  size: number;
}
