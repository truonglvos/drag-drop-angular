import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBuilderComponent } from './components/page-builder/page-builder';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PageBuilderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'page-builder-app';
}
