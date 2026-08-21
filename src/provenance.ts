export type VerificationStatus =
  | 'VERIFIED_LIVE_SHEET'
  | 'VERIFIED_EXTERNAL'
  | 'MODELED'
  | 'CONDITIONAL'
  | 'PENDING'
  | 'WIP_UNRELEASED';

export interface SourceReference {
  kind: 'GOOGLE_SHEET' | 'DPR_CALC' | 'GUIDE' | 'RAW_DATABASE' | 'OFFICIAL' | 'OTHER';
  label: string;
  locator: string;
  checkedAt: string;
}

export interface Provenance<T> {
  value: T;
  status: VerificationStatus;
  sources: SourceReference[];
  notes?: string[];
}

export function isUsableVerified<T>(item: Provenance<T>): boolean {
  return item.status === 'VERIFIED_LIVE_SHEET' || item.status === 'VERIFIED_EXTERNAL';
}
