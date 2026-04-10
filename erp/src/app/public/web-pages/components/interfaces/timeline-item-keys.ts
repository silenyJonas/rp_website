export interface TimelineItemKeys {
  id: number;
  titleKey: string;
  contentKey: string;
  themesKeys: string[];
  newThingsKeys: { textKey: string; icon: string; }[];
  isActive: boolean;
}