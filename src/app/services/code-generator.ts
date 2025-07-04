import { Injectable } from '@angular/core';
import { PageElement, Section, Page } from '../models/page-element';

@Injectable({
  providedIn: 'root'
})
export class CodeGeneratorService {

  constructor() { }

  generateHTML(page: Page): string {
    const htmlSections = page.sections.map(section => this.generateHTMLSection(section)).join('\n');
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.name}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="page-container">
${htmlSections}
    </div>
    <script src="script.js"></script>
</body>
</html>`;
  }

  generateCSS(page: Page): string {
    const sectionCSS = page.sections.map(section => this.generateCSSSection(section)).join('\n\n');
    const elementCSS = page.sections.flatMap(section =>
      section.elements.map(element => this.generateCSSElement(element))
    ).join('\n\n');

    return `/* Generated CSS */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8f9fa;
}

.page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* Section Styles */
${sectionCSS}

/* Element Styles */
${elementCSS}

/* Responsive Design */
@media (max-width: 768px) {
    .page-container {
        padding: 10px;
    }

    .section {
        margin-bottom: 15px;
        padding: 15px;
    }
}`;
  }

  generateJavaScript(page: Page): string {
    const interactiveElements = page.sections.flatMap(section =>
      section.elements.filter(element =>
        element.type === 'button' || element.attributes['onclick']
      )
    );

    if (interactiveElements.length === 0) {
      return `// Generated JavaScript
console.log('Page loaded successfully!');`;
    }

    const jsCode = interactiveElements.map(element => this.generateJSElement(element)).join('\n\n');
    return `// Generated JavaScript
document.addEventListener('DOMContentLoaded', function() {
${jsCode}
});`;
  }

    private generateHTMLSection(section: Section): string {
    const sectionId = `section-${section.id}`;
    const htmlElements = section.elements.map(element => this.generateHTMLElement(element)).join('\n');

    return `        <section id="${sectionId}" class="section">
            <div class="section-content">
${htmlElements}
            </div>
        </section>`;
  }

  private generateHTMLElement(element: PageElement): string {
    const attributes = Object.entries(element.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    const elementId = `element-${element.id}`;
    const classAttr = attributes ? ` ${attributes}` : '';

    if (element.tag === 'img') {
      return `                <${element.tag} id="${elementId}"${classAttr} />`;
    } else {
      const content = element.content || '';
      return `                <${element.tag} id="${elementId}"${classAttr}>${content}</${element.tag}>`;
    }
  }

  private generateCSSSection(section: Section): string {
    const sectionId = `section-${section.id}`;
    const sectionStyles = Object.entries(section.styles)
      .map(([key, value]) => `    ${this.camelToKebab(key)}: ${value};`)
      .join('\n');

    return `#${sectionId} {
    position: relative;
    width: ${section.dimensions.width};
    min-height: ${section.dimensions.height};
    margin-bottom: 20px;
${sectionStyles}
}

#${sectionId} .section-content {
    position: relative;
    width: 100%;
    height: 100%;
}`;
  }

  private generateCSSElement(element: PageElement): string {
    const elementId = `element-${element.id}`;
    const elementStyles = Object.entries(element.styles)
      .map(([key, value]) => `    ${this.camelToKebab(key)}: ${value};`)
      .join('\n');

    const positionStyles = `    position: absolute;
    left: ${element.position.x}px;
    top: ${element.position.y}px;
    width: ${element.dimensions.width};
    height: ${element.dimensions.height};`;

    return `#${elementId} {
${positionStyles}
${elementStyles}
}`;
  }

  private generateJSElement(element: PageElement): string {
    const elementId = `element-${element.id}`;

    if (element.type === 'button') {
      return `    // Button functionality for ${elementId}
    const ${elementId.replace(/[^a-zA-Z0-9]/g, '_')} = document.getElementById('${elementId}');
    if (${elementId.replace(/[^a-zA-Z0-9]/g, '_')}) {
        ${elementId.replace(/[^a-zA-Z0-9]/g, '_')}.addEventListener('click', function() {
            alert('Button clicked!');
            // Add your custom functionality here
        });
    }`;
    }

    return '';
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  generateCompleteCode(page: Page): { html: string; css: string; js: string } {
    return {
      html: this.generateHTML(page),
      css: this.generateCSS(page),
      js: this.generateJavaScript(page)
    };
  }

  downloadCode(html: string, css: string, js: string, filename: string = 'landing-page'): void {
    // Create HTML file
    const htmlBlob = new Blob([html], { type: 'text/html' });
    const htmlUrl = URL.createObjectURL(htmlBlob);
    const htmlLink = document.createElement('a');
    htmlLink.href = htmlUrl;
    htmlLink.download = `${filename}.html`;
    htmlLink.click();

    // Create CSS file
    const cssBlob = new Blob([css], { type: 'text/css' });
    const cssUrl = URL.createObjectURL(cssBlob);
    const cssLink = document.createElement('a');
    cssLink.href = cssUrl;
    cssLink.download = `${filename}.css`;
    cssLink.click();

    // Create JS file
    const jsBlob = new Blob([js], { type: 'text/javascript' });
    const jsUrl = URL.createObjectURL(jsBlob);
    const jsLink = document.createElement('a');
    jsLink.href = jsUrl;
    jsLink.download = `${filename}.js`;
    jsLink.click();

    // Clean up
    URL.revokeObjectURL(htmlUrl);
    URL.revokeObjectURL(cssUrl);
    URL.revokeObjectURL(jsUrl);
  }
}
