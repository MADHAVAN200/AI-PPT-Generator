export interface Slide {
  id: string;
  type: 'title' | 'content' | 'agenda' | 'conclusion' | 'section' | 'two-column' | 'stat' | 'quote' | 'timeline';
  title: string;
  subtitle?: string;
  bullets: string[];
  image?: string;
  svg?: string;
  align?: 'left' | 'center' | 'right';
  layoutStyle?: 'default' | 'card' | 'split' | 'minimal';
  cardColor?: string;
  imageCount?: number;
  images?: string[];
}

export interface Presentation {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  extraData?: string;
  numSlides: number;
  slideData: Slide[];
  theme: string;
  colors: {
    bg: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    heading: string;
    muted: string;
  };
  fontTitle: string;
  fontBody: string;
  status: string;
  hideFooter?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  category: string;
  name: string;
  colors: {
    bg: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    heading: string;
    muted: string;
  };
  fontTitle: string;
  fontBody: string;
}
