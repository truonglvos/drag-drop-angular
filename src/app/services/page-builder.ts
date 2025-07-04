import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PageElement, ElementTemplate, Section, Page } from '../models/page-element';

@Injectable({
  providedIn: 'root'
})
export class PageBuilderService {
  private pageSubject = new BehaviorSubject<Page>({
    id: 'page_1',
    name: 'Landing Page',
    sections: []
  });
  private selectedElementSubject = new BehaviorSubject<PageElement | null>(null);
  private selectedSectionSubject = new BehaviorSubject<Section | null>(null);

  private elementTemplates: ElementTemplate[] = [
    {
      type: 'heading',
      name: 'Heading',
      icon: '📝',
      defaultContent: 'Heading Text',
      defaultAttributes: {},
      defaultStyles: {
        'font-size': '2rem',
        'font-weight': 'bold',
        'margin': '1rem 0'
      },
      category: 'Text'
    },
    {
      type: 'paragraph',
      name: 'Paragraph',
      icon: '📄',
      defaultContent: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      defaultAttributes: {},
      defaultStyles: {
        'font-size': '1rem',
        'line-height': '1.6',
        'margin': '1rem 0'
      },
      category: 'Text'
    },
    {
      type: 'button',
      name: 'Button',
      icon: '🔘',
      defaultContent: 'Click me',
      defaultAttributes: {
        'type': 'button'
      },
      defaultStyles: {
        'padding': '10px 20px',
        'background-color': '#007bff',
        'color': 'white',
        'border': 'none',
        'border-radius': '5px',
        'cursor': 'pointer'
      },
      category: 'Interactive'
    },
    {
      type: 'image',
      name: 'Image',
      icon: '🖼️',
      defaultContent: '',
      defaultAttributes: {
        'src': 'https://via.placeholder.com/300x200',
        'alt': 'Placeholder image'
      },
      defaultStyles: {
        'max-width': '100%',
        'height': 'auto'
      },
      category: 'Media'
    },
    {
      type: 'container',
      name: 'Container',
      icon: '📦',
      defaultContent: '',
      defaultAttributes: {},
      defaultStyles: {
        'padding': '20px',
        'border': '1px solid #ddd',
        'border-radius': '5px',
        'min-height': '100px'
      },
      category: 'Layout'
    }
  ];

  constructor() {}

  getPage(): Observable<Page> {
    return this.pageSubject.asObservable();
  }

  getSelectedElement(): Observable<PageElement | null> {
    return this.selectedElementSubject.asObservable();
  }

  getSelectedSection(): Observable<Section | null> {
    return this.selectedSectionSubject.asObservable();
  }

  getSelectedSectionValue(): Section | null {
    return this.selectedSectionSubject.value;
  }

  getPageValue(): Page {
    return this.pageSubject.value;
  }

  getElementTemplates(): ElementTemplate[] {
    return this.elementTemplates;
  }

  addSection(position: { x: number; y: number }): void {
    const newSection: Section = {
      id: this.generateId(),
      name: 'Section ' + (this.pageSubject.value.sections.length + 1),
      elements: [],
      position: { x: 0, y: 0 }, // Always 0 for relative positioning
      dimensions: {
        width: '100%',
        height: '300px'
      },
      styles: {
        'position': 'relative',
        'background-color': '#f8f9fa',
        'padding': '40px 20px',
        'border': '1px solid #e9ecef',
        'border-radius': '8px',
        'margin-bottom': '20px'
      },
      isSelected: false
    };

    const currentPage = this.pageSubject.value;
    currentPage.sections.push(newSection);
    this.pageSubject.next({ ...currentPage });
  }

  addElementToSection(sectionId: string, template: ElementTemplate, position: { x: number; y: number }): void {
    const newElement: PageElement = {
      id: this.generateId(),
      type: template.type,
      tag: this.getTagFromType(template.type),
      content: template.defaultContent,
      attributes: { ...template.defaultAttributes },
      styles: { ...template.defaultStyles },
      position,
      dimensions: {
        width: 'auto',
        height: 'auto'
      },
      isSelected: false
    };

    const currentPage = this.pageSubject.value;
    const sectionIndex = currentPage.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex !== -1) {
      currentPage.sections[sectionIndex].elements.push(newElement);
      this.pageSubject.next({ ...currentPage });
    }
  }

  selectElement(elementId: string): void {
    const currentPage = this.pageSubject.value;
    let foundElement: PageElement | null = null;

    // Clear all selections
    currentPage.sections.forEach(section => {
      section.isSelected = false;
      section.elements.forEach(element => {
        element.isSelected = false;
      });
    });

    // Find and select the element
    for (const section of currentPage.sections) {
      const element = section.elements.find(e => e.id === elementId);
      if (element) {
        element.isSelected = true;
        foundElement = element;
        break;
      }
    }

    this.pageSubject.next({ ...currentPage });
    this.selectedElementSubject.next(foundElement);
    this.selectedSectionSubject.next(null);
  }

  selectSection(sectionId: string): void {
    const currentPage = this.pageSubject.value;

    // Clear all selections
    currentPage.sections.forEach(section => {
      section.isSelected = false;
      section.elements.forEach(element => {
        element.isSelected = false;
      });
    });

    // Find and select the section
    const section = currentPage.sections.find(s => s.id === sectionId);
    if (section) {
      section.isSelected = true;
      this.pageSubject.next({ ...currentPage });
      this.selectedSectionSubject.next(section);
      this.selectedElementSubject.next(null);
    }
  }

  updateElement(elementId: string, updates: Partial<PageElement>): void {
    const currentPage = this.pageSubject.value;

    for (const section of currentPage.sections) {
      const elementIndex = section.elements.findIndex(e => e.id === elementId);
      if (elementIndex !== -1) {
        section.elements[elementIndex] = { ...section.elements[elementIndex], ...updates };
        this.pageSubject.next({ ...currentPage });

        const selectedElement = this.selectedElementSubject.value;
        if (selectedElement && selectedElement.id === elementId) {
          this.selectedElementSubject.next({ ...selectedElement, ...updates });
        }
        break;
      }
    }
  }

  updateSection(sectionId: string, updates: Partial<Section>): void {
    const currentPage = this.pageSubject.value;
    const sectionIndex = currentPage.sections.findIndex(s => s.id === sectionId);

    if (sectionIndex !== -1) {
      currentPage.sections[sectionIndex] = { ...currentPage.sections[sectionIndex], ...updates };
      this.pageSubject.next({ ...currentPage });

      const selectedSection = this.selectedSectionSubject.value;
      if (selectedSection && selectedSection.id === sectionId) {
        this.selectedSectionSubject.next({ ...selectedSection, ...updates });
      }
    }
  }

  deleteElement(elementId: string): void {
    const currentPage = this.pageSubject.value;

    for (const section of currentPage.sections) {
      const elementIndex = section.elements.findIndex(e => e.id === elementId);
      if (elementIndex !== -1) {
        section.elements.splice(elementIndex, 1);
        this.pageSubject.next({ ...currentPage });

        const selectedElement = this.selectedElementSubject.value;
        if (selectedElement && selectedElement.id === elementId) {
          this.selectedElementSubject.next(null);
        }
        break;
      }
    }
  }

  deleteSection(sectionId: string): void {
    const currentPage = this.pageSubject.value;
    const sectionIndex = currentPage.sections.findIndex(s => s.id === sectionId);

    if (sectionIndex !== -1) {
      currentPage.sections.splice(sectionIndex, 1);
      this.pageSubject.next({ ...currentPage });

      const selectedSection = this.selectedSectionSubject.value;
      if (selectedSection && selectedSection.id === sectionId) {
        this.selectedSectionSubject.next(null);
      }
    }
  }

  clearCanvas(): void {
    this.pageSubject.next({
      id: 'page_1',
      name: 'Landing Page',
      sections: []
    });
    this.selectedElementSubject.next(null);
    this.selectedSectionSubject.next(null);
  }

  private generateId(): string {
    return 'element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getTagFromType(type: string): string {
    const tagMap: { [key: string]: string } = {
      'heading': 'h1',
      'paragraph': 'p',
      'button': 'button',
      'image': 'img',
      'container': 'div'
    };
    return tagMap[type] || 'div';
  }
}
