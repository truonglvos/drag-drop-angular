import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageBuilderService } from '../../services/page-builder';
import { PageElement, Section } from '../../models/page-element';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './properties-panel.html',
  styleUrl: './properties-panel.scss'
})
export class PropertiesPanelComponent implements OnInit, OnDestroy {
  selectedElement: PageElement | null = null;
  selectedSection: Section | null = null;
  private selectedElementSubscription: Subscription;
  private selectedSectionSubscription: Subscription;

  constructor(private pageBuilderService: PageBuilderService) {
    this.selectedElementSubscription = new Subscription();
    this.selectedSectionSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.selectedElementSubscription = this.pageBuilderService.getSelectedElement().subscribe(element => {
      this.selectedElement = element;
      this.selectedSection = null; // Clear section when element is selected
    });

    this.selectedSectionSubscription = this.pageBuilderService.getSelectedSection().subscribe(section => {
      this.selectedSection = section;
      this.selectedElement = null; // Clear element when section is selected
    });
  }

  ngOnDestroy(): void {
    this.selectedElementSubscription.unsubscribe();
    this.selectedSectionSubscription.unsubscribe();
  }

  // Element methods
  updateContent(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (this.selectedElement && target) {
      this.pageBuilderService.updateElement(this.selectedElement.id, { content: target.value });
    }
  }

  updateElementStyle(property: string, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    if (this.selectedElement && target) {
      const updatedStyles = { ...this.selectedElement.styles };
      updatedStyles[property] = target.value;
      this.pageBuilderService.updateElement(this.selectedElement.id, { styles: updatedStyles });
    }
  }

  updateElementAttribute(key: string, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    if (this.selectedElement && target) {
      const updatedAttributes = { ...this.selectedElement.attributes };
      if (target.value) {
        updatedAttributes[key] = target.value;
      } else {
        delete updatedAttributes[key];
      }
      this.pageBuilderService.updateElement(this.selectedElement.id, { attributes: updatedAttributes });
    }
  }

  updateElementDimension(dimension: 'width' | 'height', event: Event): void {
    const target = event.target as HTMLInputElement;
    if (this.selectedElement && target) {
      const updatedDimensions = { ...this.selectedElement.dimensions };
      updatedDimensions[dimension] = target.value;
      this.pageBuilderService.updateElement(this.selectedElement.id, { dimensions: updatedDimensions });
    }
  }

  // Section methods
  updateSectionName(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (this.selectedSection && target) {
      this.pageBuilderService.updateSection(this.selectedSection.id, { name: target.value });
    }
  }

  updateSectionStyle(property: string, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    if (this.selectedSection && target) {
      const updatedStyles = { ...this.selectedSection.styles };
      updatedStyles[property] = target.value;
      this.pageBuilderService.updateSection(this.selectedSection.id, { styles: updatedStyles });
    }
  }

  updateSectionDimension(dimension: 'width' | 'height', event: Event): void {
    const target = event.target as HTMLInputElement;
    if (this.selectedSection && target) {
      const updatedDimensions = { ...this.selectedSection.dimensions };
      updatedDimensions[dimension] = target.value;
      this.pageBuilderService.updateSection(this.selectedSection.id, { dimensions: updatedDimensions });
    }
  }

  // Helper methods
  getElementStyleValue(property: string): string {
    return this.selectedElement?.styles[property] || '';
  }

  getElementAttributeValue(key: string): string {
    return this.selectedElement?.attributes[key] || '';
  }

  getSectionStyleValue(property: string): string {
    return this.selectedSection?.styles[property] || '';
  }

  getCommonElementStyles(): { label: string; property: string; type: string }[] {
    return [
      { label: 'Font Size', property: 'font-size', type: 'text' },
      { label: 'Font Weight', property: 'font-weight', type: 'select' },
      { label: 'Color', property: 'color', type: 'color' },
      { label: 'Background Color', property: 'background-color', type: 'color' },
      { label: 'Padding', property: 'padding', type: 'text' },
      { label: 'Margin', property: 'margin', type: 'text' },
      { label: 'Border', property: 'border', type: 'text' },
      { label: 'Border Radius', property: 'border-radius', type: 'text' },
      { label: 'Text Align', property: 'text-align', type: 'select' }
    ];
  }

  getCommonSectionStyles(): { label: string; property: string; type: string }[] {
    return [
      { label: 'Background Color', property: 'background-color', type: 'color' },
      { label: 'Padding', property: 'padding', type: 'text' },
      { label: 'Margin', property: 'margin', type: 'text' },
      { label: 'Border', property: 'border', type: 'text' },
      { label: 'Border Radius', property: 'border-radius', type: 'text' },
      { label: 'Box Shadow', property: 'box-shadow', type: 'text' }
    ];
  }

  getFontWeightOptions(): string[] {
    return ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
  }

  getTextAlignOptions(): string[] {
    return ['left', 'center', 'right', 'justify'];
  }

  trackByOption(index: number, option: string): string {
    return option;
  }
}
