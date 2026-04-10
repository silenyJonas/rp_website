export interface TimelineItem {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  themes: string[]; 
  newThings: string[][]; 
}