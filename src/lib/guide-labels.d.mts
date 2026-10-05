export type GuideLabelGroup =
  | 'status' | 'language' | 'level' | 'region' | 'tourType' | 'tripLength' | 'fileKind' | 'gender'

export function guideLabel(group: GuideLabelGroup | (string & {}), value: string): string

export function guideValues(group: GuideLabelGroup): string[]

export function monthName(n: number): string
