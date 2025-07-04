import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBuilderService } from '../../services/page-builder';
import { CodeGeneratorService } from '../../services/code-generator';
import { Page } from '../../models/page-element';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-code-generator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-generator.html',
  styleUrl: './code-generator.scss'
})
export class CodeGeneratorComponent implements OnInit, OnDestroy {
  page: Page = { id: '', name: '', sections: [] };
  generatedCode: { html: string; css: string; js: string } | null = null;
  activeTab: 'html' | 'css' | 'js' = 'html';
  private pageSubscription: Subscription;

  constructor(
    private pageBuilderService: PageBuilderService,
    private codeGeneratorService: CodeGeneratorService
  ) {
    this.pageSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.pageSubscription = this.pageBuilderService.getPage().subscribe(page => {
      this.page = page;
      this.generateCode();
    });
  }

  ngOnDestroy(): void {
    this.pageSubscription.unsubscribe();
  }

  generateCode(): void {
    if (this.page.sections.length > 0) {
      this.generatedCode = this.codeGeneratorService.generateCompleteCode(this.page);
    } else {
      this.generatedCode = null;
    }
  }

  setActiveTab(tab: 'html' | 'css' | 'js'): void {
    this.activeTab = tab;
  }

  downloadCode(): void {
    if (this.generatedCode) {
      this.codeGeneratorService.downloadCode(
        this.generatedCode.html,
        this.generatedCode.css,
        this.generatedCode.js,
        'landing-page'
      );
    }
  }

  copyToClipboard(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      // Có thể thêm toast notification ở đây
      console.log('Code copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy code: ', err);
    });
  }

  getActiveCode(): string {
    if (!this.generatedCode) return '';

    switch (this.activeTab) {
      case 'html':
        return this.generatedCode.html;
      case 'css':
        return this.generatedCode.css;
      case 'js':
        return this.generatedCode.js;
      default:
        return '';
    }
  }

  getCodeLanguage(): string {
    switch (this.activeTab) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'js':
        return 'javascript';
      default:
        return 'text';
    }
  }
}
