export type AssetState =
  | "AVAILABLE"
  | "ALLOCATED"
  | "RESERVED"
  | "UNDER_MAINTENANCE"
  | "LOST"
  | "RETIRED"
  | "DISPOSED";

const ALLOWED_TRANSITIONS: Record<AssetState, AssetState[]> = {
  AVAILABLE: ["ALLOCATED", "RESERVED", "UNDER_MAINTENANCE"],
  ALLOCATED: ["AVAILABLE", "UNDER_MAINTENANCE", "LOST"],
  RESERVED: ["AVAILABLE"],
  UNDER_MAINTENANCE: ["AVAILABLE", "RETIRED"],
  LOST: [],
  RETIRED: ["DISPOSED"],
  DISPOSED: [],
};

export class AssetStateService {
  static canTransition(from: AssetState, to: AssetState): boolean {
    return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static validateTransition(from: AssetState, to: AssetState): void {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid asset state transition: ${from} -> ${to}`);
    }
  }
}
