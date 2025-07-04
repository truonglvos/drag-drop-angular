import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBuilderService } from '../../services/page-builder';
import { PageElement, Section, ElementTemplate } from '../../models/page-element';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './canvas.html',
  styleUrl: './canvas.scss'
})
export class CanvasComponent implements OnInit, OnDestroy {
  page: any = { sections: [] };
  selectedElement: PageElement | null = null;
  selectedSection: Section | null = null;
  private pageSubscription: Subscription;
  private selectedElementSubscription: Subscription;
  private selectedSectionSubscription: Subscription;

  // Custom drag & drop properties
  private isDragging = false;
  private justFinishedDragging = false;
  private draggedElement: PageElement | null = null;
  private dragOffset = { x: 0, y: 0 };
  private dragStartPosition = { x: 0, y: 0 };
  private animationFrameId: number | null = null;

  // Resize properties
  private isResizing = false;
  private resizingElement: PageElement | null = null;
  private resizingSection: Section | null = null;
  private resizeHandle: string = '';
  private resizeStartData = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    aspectRatio: 0,
    mouseX: 0,
    mouseY: 0
  };

  constructor(
    private pageBuilderService: PageBuilderService,
    private cdr: ChangeDetectorRef
  ) {
    this.pageSubscription = new Subscription();
    this.selectedElementSubscription = new Subscription();
    this.selectedSectionSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.pageSubscription = this.pageBuilderService.getPage().subscribe(page => {
      this.page = page;
      this.cdr.detectChanges();
    });

    this.selectedElementSubscription = this.pageBuilderService.getSelectedElement().subscribe(element => {
      this.selectedElement = element;
      this.cdr.detectChanges();
    });

    this.selectedSectionSubscription = this.pageBuilderService.getSelectedSection().subscribe(section => {
      this.selectedSection = section;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.pageSubscription.unsubscribe();
    this.selectedElementSubscription.unsubscribe();
    this.selectedSectionSubscription.unsubscribe();

    // Cleanup animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  // Custom drag & drop methods
  onElementMouseDown(event: MouseEvent, element: PageElement): void {
    event.preventDefault();
    event.stopPropagation();

    // Store initial position to detect if it's a click or drag
    this.dragStartPosition = { x: event.clientX, y: event.clientY };
    this.draggedElement = element;

    // Find the section that contains this element
    const elementElement = document.querySelector(`[data-element-id="${element.id}"]`) as HTMLElement;
    if (!elementElement) return;

    const sectionElement = elementElement.closest('.canvas-section') as HTMLElement;
    if (!sectionElement) return;

    const sectionContentElement = sectionElement.querySelector('.section-content') as HTMLElement;
    if (!sectionContentElement) return;

    const contentRect = sectionContentElement.getBoundingClientRect();

    // Calculate offset from mouse to element position relative to section content
    this.dragOffset = {
      x: event.clientX - (element.position.x + contentRect.left),
      y: event.clientY - (element.position.y + contentRect.top)
    };

    console.log('Mouse down on element:', element);
  }

  // Section click method (no drag needed for relative positioning)
  onSectionMouseDown(event: MouseEvent, section: Section): void {
    event.preventDefault();
    event.stopPropagation();

    // Only handle click selection, no drag logic needed
    console.log('Mouse down on section:', section);
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (this.isResizing && this.resizingElement) {
      // Handle element resize end
      this.pageBuilderService.updateElement(this.resizingElement.id, {
        position: this.resizingElement.position,
        dimensions: this.resizingElement.dimensions
      });

      // Reset resize state
      this.isResizing = false;
      this.resizingElement = null;
      this.resizeHandle = '';

      console.log('Element resize ended');
    } else if (this.isResizing && this.resizingSection) {
      // Handle section resize end
      this.pageBuilderService.updateSection(this.resizingSection.id, {
        position: this.resizingSection.position,
        dimensions: this.resizingSection.dimensions
      });

      // Reset resize state
      this.isResizing = false;
      this.resizingSection = null;
      this.resizeHandle = '';

      console.log('Section resize ended');
    } else if (this.isDragging && this.draggedElement) {
      // Handle element drag end
      // Cancel animation frame
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // Update service with final position
      this.pageBuilderService.updateElement(this.draggedElement.id, {
        position: this.draggedElement.position
      });

      // Remove dragging class
      const elementElement = document.querySelector(`[data-element-id="${this.draggedElement.id}"]`) as HTMLElement;
      if (elementElement) {
        elementElement.classList.remove('dragging');
      }

      // Reset drag state
      this.isDragging = false;
      this.justFinishedDragging = true;
      this.draggedElement = null;
      this.dragOffset = { x: 0, y: 0 };

      // Force change detection to update UI
      this.cdr.detectChanges();

      // Reset the flag after a short delay
      setTimeout(() => {
        this.justFinishedDragging = false;
      }, 100);

      console.log('Element drag ended');
    }
    // Removed section drag end logic - sections are not draggable
  }

  // Handle dropping elements from palette
  onCanvasDrop(event: DragEvent): void {
    event.preventDefault();

    const templateData = event.dataTransfer?.getData('application/json');
    if (templateData) {
      const template: ElementTemplate = JSON.parse(templateData);

      const canvasElement = event.currentTarget as HTMLElement;
      const rect = canvasElement.getBoundingClientRect();
      const scrollTop = canvasElement.scrollTop || 0;
      const scrollLeft = canvasElement.scrollLeft || 0;

      const canvasPosition = {
        x: Math.max(0, event.clientX - rect.left + scrollLeft),
        y: Math.max(0, event.clientY - rect.top + scrollTop)
      };

      // Add element to selected section or find section at position
      if (this.selectedSection) {
        // Calculate position relative to the selected section
        const sectionElement = document.querySelector(`[data-section-id="${this.selectedSection.id}"]`) as HTMLElement;
        if (sectionElement) {
          const sectionRect = sectionElement.getBoundingClientRect();
          const sectionContentElement = sectionElement.querySelector('.section-content') as HTMLElement;

          if (sectionContentElement) {
            const contentRect = sectionContentElement.getBoundingClientRect();

            // Calculate position relative to section content (accounting for padding)
            const relativePosition = {
              x: Math.max(0, event.clientX - contentRect.left),
              y: Math.max(0, event.clientY - contentRect.top)
            };

            console.log('Adding element to selected section:', this.selectedSection.id, 'at relative position:', relativePosition);
            this.pageBuilderService.addElementToSection(this.selectedSection.id, template, relativePosition);
          } else {
            // Fallback: use canvas position
            console.log('Section content not found, using canvas position:', canvasPosition);
            this.pageBuilderService.addElementToSection(this.selectedSection.id, template, canvasPosition);
          }
        } else {
          // Fallback: use canvas position
          console.log('Selected section element not found, using canvas position:', canvasPosition);
          this.pageBuilderService.addElementToSection(this.selectedSection.id, template, canvasPosition);
        }
      } else {
        // Find which section to add the element to
        const sectionId = this.findSectionAtPosition(canvasPosition);
        if (sectionId) {
          // Find the section element to calculate relative position
          const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`) as HTMLElement;
          if (sectionElement) {
            const sectionContentElement = sectionElement.querySelector('.section-content') as HTMLElement;

            if (sectionContentElement) {
              const contentRect = sectionContentElement.getBoundingClientRect();

              // Calculate position relative to section content
              const relativePosition = {
                x: Math.max(0, event.clientX - contentRect.left),
                y: Math.max(0, event.clientY - contentRect.top)
              };

              console.log('Dropping template to section:', sectionId, 'at relative position:', relativePosition);
              this.pageBuilderService.addElementToSection(sectionId, template, relativePosition);
            } else {
              // Fallback: use canvas position
              console.log('Section content not found, using canvas position:', canvasPosition);
              this.pageBuilderService.addElementToSection(sectionId, template, canvasPosition);
            }
          } else {
            // Fallback: use canvas position
            console.log('Section element not found, using canvas position:', canvasPosition);
            this.pageBuilderService.addElementToSection(sectionId, template, canvasPosition);
          }
        } else {
          console.log('No section found at position:', canvasPosition);
        }
      }
    }
  }

  onCanvasDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onElementClick(element: PageElement, event: Event): void {
    event.stopPropagation();
    console.log('Element clicked:', element);
    console.log('isDragging:', this.isDragging, 'justFinishedDragging:', this.justFinishedDragging, 'isResizing:', this.isResizing);

    // Only prevent click if currently dragging or resizing
    if (this.isDragging || this.isResizing) {
      console.log('Click prevented - currently dragging/resizing');
      return;
    }

    console.log('Selecting element:', element.id);
    this.pageBuilderService.selectElement(element.id);
  }

  onSectionClick(section: Section, event: Event): void {
    event.stopPropagation();
    console.log('Section clicked:', section);
    console.log('isDragging:', this.isDragging, 'justFinishedDragging:', this.justFinishedDragging, 'isResizing:', this.isResizing);

    // Only prevent click if currently dragging or resizing
    if (this.isDragging || this.isResizing) {
      console.log('Click prevented - currently dragging/resizing');
      return;
    }

    console.log('Selecting section:', section.id);
    this.pageBuilderService.selectSection(section.id);
  }

  onElementDelete(elementId: string, event: Event): void {
    event.stopPropagation();
    this.pageBuilderService.deleteElement(elementId);
  }

  onSectionDelete(sectionId: string, event: Event): void {
    event.stopPropagation();
    this.pageBuilderService.deleteSection(sectionId);
  }

  getElementStyles(element: PageElement): { [key: string]: string } {
    const baseStyles: { [key: string]: string } = {
      position: 'absolute',
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      width: element.dimensions.width,
      height: element.dimensions.height,
      cursor: 'pointer',
      ...element.styles
    };

    if (element.isSelected) {
      baseStyles['border'] = '2px solid #007bff';
      baseStyles['outline'] = 'none';
    }

    return baseStyles;
  }

  getSectionStyles(section: Section): { [key: string]: string } {
    const isSelected = this.selectedSection?.id === section.id;

    return {
      position: 'relative',
      left: `${section.position.x}px`,
      top: `${section.position.y}px`,
      width: section.dimensions.width,
      height: section.dimensions.height,
      border: isSelected ? '2px solid #007bff' : '1px solid #ddd',
      backgroundColor: isSelected ? 'rgba(0, 123, 255, 0.1)' : '#f8f9fa',
      cursor: 'pointer',
      userSelect: 'none',
      boxSizing: 'border-box'
    };
  }

  getElementAttributes(element: PageElement): { [key: string]: string } {
    return {
      ...element.attributes,
      id: `element-${element.id}`
    };
  }

  getSectionAttributes(section: Section): { [key: string]: string } {
    return {
      id: `section-${section.id}`
    };
  }

  onCanvasClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.pageBuilderService.selectElement('');
      this.pageBuilderService.selectSection('');
    }
  }

  trackByElementId(index: number, element: PageElement): string {
    return element.id;
  }

  trackBySectionId(index: number, section: Section): string {
    return section.id;
  }

  // Resize methods for elements
  onElementResizeStart(event: MouseEvent, element: PageElement, handle: string): void {
    event.preventDefault();
    event.stopPropagation();

    this.isResizing = true;
    this.justFinishedDragging = false;
    this.resizingElement = element;
    this.resizeHandle = handle;

    // Store initial data
    let width = parseInt(element.dimensions.width);
    let height = parseInt(element.dimensions.height);

    // If dimensions are 'auto', get actual dimensions from DOM
    if (isNaN(width) || isNaN(height)) {
      const elementElement = document.querySelector(`[data-element-id="${element.id}"]`) as HTMLElement;
      if (elementElement) {
        const rect = elementElement.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
      } else {
        // Fallback values
        width = 200;
        height = 100;
      }
    }

    this.resizeStartData = {
      x: element.position.x,
      y: element.position.y,
      width: width,
      height: height,
      aspectRatio: width / height,
      mouseX: event.clientX,
      mouseY: event.clientY
    };

    console.log('Element resize started:', handle, element, 'mouseX:', event.clientX, 'mouseY:', event.clientY, 'initialWidth:', width, 'initialHeight:', height);
  }

  // Resize methods for sections
  onSectionResizeStart(event: MouseEvent, section: Section, handle: string): void {
    event.preventDefault();
    event.stopPropagation();

    this.isResizing = true;
    this.justFinishedDragging = false;
    this.resizingSection = section;
    this.resizeHandle = handle;

    // Store initial data
    let width = parseInt(section.dimensions.width);
    let height = parseInt(section.dimensions.height);

    // If dimensions are 'auto', get actual dimensions from DOM
    if (isNaN(width) || isNaN(height)) {
      const sectionElement = document.querySelector(`[data-section-id="${section.id}"]`) as HTMLElement;
      if (sectionElement) {
        const rect = sectionElement.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
      } else {
        // Fallback values
        width = 800;
        height = 300;
      }
    }

    this.resizeStartData = {
      x: section.position.x,
      y: section.position.y,
      width: width,
      height: height,
      aspectRatio: width / height,
      mouseX: event.clientX,
      mouseY: event.clientY
    };

    console.log('Section resize started:', handle, section, 'mouseX:', event.clientX, 'mouseY:', event.clientY, 'initialWidth:', width, 'initialHeight:', height);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isResizing && this.resizingElement) {
      this.handleElementResize(event);
    } else if (this.isResizing && this.resizingSection) {
      this.handleSectionResize(event);
    } else if (this.draggedElement && !this.isDragging) {
      // Check if mouse has moved enough to start dragging
      const deltaX = Math.abs(event.clientX - this.dragStartPosition.x);
      const deltaY = Math.abs(event.clientY - this.dragStartPosition.y);
      const dragThreshold = 5; // pixels

      if (deltaX > dragThreshold || deltaY > dragThreshold) {
        this.isDragging = true;
        this.justFinishedDragging = false;

        // Add dragging class
        const elementElement = document.querySelector(`[data-element-id="${this.draggedElement.id}"]`) as HTMLElement;
        if (elementElement) {
          elementElement.classList.add('dragging');
        }

        console.log('Element drag started:', this.draggedElement);
      }
    } else if (this.isDragging && this.draggedElement) {
      this.handleElementDrag(event);
    }
    // Removed section drag logic - sections are not draggable
  }

  private handleElementResize(event: MouseEvent): void {
    if (!this.resizingElement) return;

    const deltaX = event.clientX - this.resizeStartData.mouseX;
    const deltaY = event.clientY - this.resizeStartData.mouseY;
    const keepAspectRatio = event.ctrlKey || event.metaKey;

    let newWidth = this.resizeStartData.width;
    let newHeight = this.resizeStartData.height;
    let newX = this.resizeStartData.x;
    let newY = this.resizeStartData.y;

    // Calculate new dimensions based on handle
    switch (this.resizeHandle) {
      case 'nw': // Top-left
        newWidth = Math.max(50, this.resizeStartData.width - deltaX);
        newHeight = Math.max(20, this.resizeStartData.height - deltaY);
        if (keepAspectRatio) {
          const aspectRatio = this.resizeStartData.aspectRatio;
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = newHeight * aspectRatio;
          }
        }
        newX = this.resizeStartData.x + (this.resizeStartData.width - newWidth);
        newY = this.resizeStartData.y + (this.resizeStartData.height - newHeight);
        break;

      case 'n': // Top
        newHeight = Math.max(20, this.resizeStartData.height - deltaY);
        newY = this.resizeStartData.y + (this.resizeStartData.height - newHeight);
        break;

      case 'ne': // Top-right
        newWidth = Math.max(50, this.resizeStartData.width + deltaX);
        newHeight = Math.max(20, this.resizeStartData.height - deltaY);
        if (keepAspectRatio) {
          const aspectRatio = this.resizeStartData.aspectRatio;
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = newHeight * aspectRatio;
          }
        }
        newY = this.resizeStartData.y + (this.resizeStartData.height - newHeight);
        break;

      case 'e': // Right
        newWidth = Math.max(50, this.resizeStartData.width + deltaX);
        break;

      case 'se': // Bottom-right
        newWidth = Math.max(50, this.resizeStartData.width + deltaX);
        newHeight = Math.max(20, this.resizeStartData.height + deltaY);
        if (keepAspectRatio) {
          const aspectRatio = this.resizeStartData.aspectRatio;
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = newHeight * aspectRatio;
          }
        }
        break;

      case 's': // Bottom
        newHeight = Math.max(20, this.resizeStartData.height + deltaY);
        break;

      case 'sw': // Bottom-left
        newWidth = Math.max(50, this.resizeStartData.width - deltaX);
        newHeight = Math.max(20, this.resizeStartData.height + deltaY);
        if (keepAspectRatio) {
          const aspectRatio = this.resizeStartData.aspectRatio;
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = newHeight * aspectRatio;
          }
        }
        newX = this.resizeStartData.x + (this.resizeStartData.width - newWidth);
        break;

      case 'w': // Left
        newWidth = Math.max(50, this.resizeStartData.width - deltaX);
        newX = this.resizeStartData.x + (this.resizeStartData.width - newWidth);
        break;
    }

    // Update element
    this.resizingElement.position = { x: newX, y: newY };
    this.resizingElement.dimensions = {
      width: `${newWidth}px`,
      height: `${newHeight}px`
    };

    // Update DOM directly
    const elementElement = document.querySelector(`[data-element-id="${this.resizingElement.id}"]`) as HTMLElement;
    if (elementElement) {
      elementElement.style.left = `${newX}px`;
      elementElement.style.top = `${newY}px`;
      elementElement.style.width = `${newWidth}px`;
      elementElement.style.height = `${newHeight}px`;
    }

    console.log('Element resize:', this.resizeHandle, 'deltaX:', deltaX, 'deltaY:', deltaY, 'newWidth:', newWidth, 'newHeight:', newHeight);
  }

  private handleSectionResize(event: MouseEvent): void {
    if (!this.resizingSection) return;

    const deltaY = event.clientY - this.resizeStartData.mouseY;

    let newHeight = this.resizeStartData.height;

    // For sections, we only allow height resize from bottom
    switch (this.resizeHandle) {
      case 's': // Bottom
        newHeight = Math.max(200, this.resizeStartData.height + deltaY);
        break;
    }

    // Update section - keep width at 100%
    this.resizingSection.dimensions = {
      width: '100%',
      height: `${newHeight}px`
    };

    // Update DOM directly
    const sectionElement = document.querySelector(`[data-section-id="${this.resizingSection.id}"]`) as HTMLElement;
    if (sectionElement) {
      sectionElement.style.width = '100%';
      sectionElement.style.height = `${newHeight}px`;
    }

    console.log('Section resize:', this.resizeHandle, 'deltaY:', deltaY, 'newHeight:', newHeight);
  }

  private handleElementDrag(event: MouseEvent): void {
    // Cancel previous animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Use requestAnimationFrame for smooth movement
    this.animationFrameId = requestAnimationFrame(() => {
      // Find the section that contains this element
      const elementElement = document.querySelector(`[data-element-id="${this.draggedElement!.id}"]`) as HTMLElement;
      if (!elementElement) return;

      const sectionElement = elementElement.closest('.canvas-section') as HTMLElement;
      if (!sectionElement) return;

      const sectionContentElement = sectionElement.querySelector('.section-content') as HTMLElement;
      if (!sectionContentElement) return;

      const contentRect = sectionContentElement.getBoundingClientRect();

      // Calculate position relative to section content
      const newPosition = {
        x: Math.max(0, event.clientX - contentRect.left - this.dragOffset.x),
        y: Math.max(0, event.clientY - contentRect.top - this.dragOffset.y)
      };

      // Update element position directly without change detection
      this.draggedElement!.position = newPosition;

      // Update DOM directly for better performance using left/top
      if (elementElement) {
        elementElement.style.left = `${newPosition.x}px`;
        elementElement.style.top = `${newPosition.y}px`;
      }
    });
  }

  addSection(): void {
    this.pageBuilderService.addSection({ x: 0, y: 0 });
  }

  private findSectionAtPosition(position: { x: number; y: number }): string | null {
    // Since sections are positioned relatively, we need to find them by DOM position
    const sectionElements = document.querySelectorAll('.canvas-section');

    for (const sectionElement of sectionElements) {
      const rect = sectionElement.getBoundingClientRect();

      if (position.x >= rect.left && position.x <= rect.right &&
          position.y >= rect.top && position.y <= rect.bottom) {
        const sectionId = sectionElement.getAttribute('data-section-id');
        return sectionId;
      }
    }

    return null;
  }
}
