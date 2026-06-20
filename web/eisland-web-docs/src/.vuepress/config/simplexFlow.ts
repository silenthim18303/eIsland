/** RGB color triplet */
export type RgbColor = readonly [number, number, number]

/** Simplex noise skew factor */
export const SIMPLEX_SKEW = 0.3660254037844386

/** Simplex noise unskew factor */
export const SIMPLEX_UNSKEW = 0.21132486540518713

/** Field scale for noise sampling */
export const FIELD_SCALE = 0.0019

/** Sample ratio for canvas rendering */
export const SAMPLE_RATIO = 0.1

/** Pointer influence radius */
export const POINTER_RADIUS = 340

/** Gradient vectors for simplex noise */
export const GRADIENTS: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

/** Color palette for flow visualization */
export const PALETTE: readonly RgbColor[] = [
  [4, 10, 28],
  [7, 22, 54],
  [10, 44, 96],
  [18, 82, 156],
]
