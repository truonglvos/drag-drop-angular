import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBuilderService } from '../../services/page-builder';
import { ElementTemplate } from '../../models/page-element';

@Component({
  selector: 'app-element-palette',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './element-palette.html',
  styleUrl: './element-palette.scss'
})
export class ElementPaletteComponent implements OnInit {
  elementTemplates: ElementTemplate[] = [];
  categories: string[] = [];

  constructor(private pageBuilderService: PageBuilderService) {}

  ngOnInit(): void {
    this.elementTemplates = this.pageBuilderService.getElementTemplates();
    this.categories = [...new Set(this.elementTemplates.map(template => template.category))];
  }

  onElementDragStart(event: DragEvent, template: ElementTemplate): void {
    console.log('Drag started with template:', template);

    // Set drag data
    event.dataTransfer?.setData('application/json', JSON.stringify(template));
    event.dataTransfer!.effectAllowed = 'copy';

    // Set drag image
    const dragImage = event.target as HTMLElement;
    event.dataTransfer?.setDragImage(dragImage, 25, 25);
  }

  onElementClick(event: Event, template: ElementTemplate): void {
    console.log('Element clicked:', template);

    // Get canvas element to calculate center position
    const canvasElement = document.querySelector('.canvas-area') as HTMLElement;
    let centerPosition = { x: 100, y: 100 }; // Default fallback

    if (canvasElement) {
      const rect = canvasElement.getBoundingClientRect();
      const scrollTop = canvasElement.scrollTop || 0;
      const scrollLeft = canvasElement.scrollLeft || 0;

      // Calculate center position of canvas
      centerPosition = {
        x: Math.max(0, (rect.width / 2) + scrollLeft - 50), // Subtract half element width
        y: Math.max(0, (rect.height / 2) + scrollTop - 25)  // Subtract half element height
      };
    }

    // Add element to selected section or create new section if none selected
    const selectedSection = this.pageBuilderService.getSelectedSectionValue();
    if (selectedSection) {
      this.pageBuilderService.addElementToSection(selectedSection.id, template, centerPosition);
    } else {
      // Create a new section and add element to it
      this.pageBuilderService.addSection(centerPosition);
      // Wait a bit for section to be created, then add element
      setTimeout(() => {
        const page = this.pageBuilderService.getPageValue();
        if (page && page.sections.length > 0) {
          const lastSection = page.sections[page.sections.length - 1];
          this.pageBuilderService.addElementToSection(lastSection.id, template, centerPosition);
        }
      }, 100);
    }
  }

  getTemplatesByCategory(category: string): ElementTemplate[] {
    return this.elementTemplates.filter(template => template.category === category);
  }
}
