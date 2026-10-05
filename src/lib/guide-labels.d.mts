export type GuideLabelGroup =
  | 'status' | 'language' | 'level' | 'region' | 'tourType' | 'tripLength' | 'fileKind' | 'gender'

export function guideLabel(group: GuideLabelGroup | (string & {}), value: string): string
