export type RedactionMode = "pixelate" | "blur" | "blackout" | "whiteout";

export interface RedactionRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  mode: RedactionMode;
  strength: number; // e.g. pixel block size (8-40) or blur radius (5-30)
}

export interface RedactionToolState {
  currentMode: RedactionMode;
  strength: number;
  rectangles: RedactionRect[];
  history: RedactionRect[][];
  historyIndex: number;
}
