import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElementPaletteComponent } from '../element-palette/element-palette';
import { CanvasComponent } from '../canvas/canvas';
import { PropertiesPanelComponent } from '../properties-panel/properties-panel';
import { CodeGeneratorComponent } from '../code-generator/code-generator';
import { PageBuilderService } from '../../services/page-builder';

@Component({
  selector: 'app-page-builder',
  standalone: true,
  imports: [
    CommonModule,
    ElementPaletteComponent,
    CanvasComponent,
    PropertiesPanelComponent,
    CodeGeneratorComponent
  ],
  templateUrl: './page-builder.html',
  styleUrl: './page-builder.scss'
})
export class PageBuilderComponent {
  showCodeGenerator = false;

  constructor(private pageBuilderService: PageBuilderService) {}

  toggleCodeGenerator(): void {
    this.showCodeGenerator = !this.showCodeGenerator;
  }

  clearCanvas(): void {
    this.pageBuilderService.clearCanvas();
  }

  getElementsCount(): number {
    const page = this.pageBuilderService.getPageValue();
    return page.sections.reduce((total, section) => total + section.elements.length, 0);
  }
}
