export interface PageElement {
  id: string;
  type: string;
  tag: string;
  content?: string;
  attributes: { [key: string]: string };
  styles: { [key: string]: string };
  position: {
    x: number;
    y: number;
  };
  dimensions: {
    width: string;
    height: string;
  };
  isSelected: boolean;
}

export interface Section {
  id: string;
  name: string;
  elements: PageElement[];
  position: {
    x: number;
    y: number;
  };
  dimensions: {
    width: string;
    height: string;
  };
  styles: { [key: string]: string };
  isSelected: boolean;
}

export interface Page {
  id: string;
  name: string;
  sections: Section[];
}

export interface ElementTemplate {
  type: string;
  name: string;
  icon: string;
  defaultContent: string;
  defaultAttributes: { [key: string]: string };
  defaultStyles: { [key: string]: string };
  category: string;
}
