import type { Edge } from '../Edge/Edge.ts'

export interface Graph extends Record<number, readonly Edge[]> {}
