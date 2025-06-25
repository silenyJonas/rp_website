import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-content">
      <h1 style="height:1000px">Our Services</h1>
      <p>Discover the range of services we proudly offer to meet your needs.</p>
      <ul>
        <li>Consulting</li>
        <li>Development</li>
        <li>Support</li>
        <li>Training</li>
      </ul>
    </div>
  `,
  styles: [`
    .page-content {
      padding: 40px;
      text-align: center;
      max-width: 800px;
      margin: 50px auto;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    h1 { color: #333; margin-bottom: 20px; }
    p { color: #666; line-height: 1.6; margin-bottom: 15px;}
    ul { list-style: none; padding: 0; margin-top: 20px;}
    li { background-color: #e2e2e2; margin-bottom: 10px; padding: 10px; border-radius: 5px; color: #444; }
  `]
})
export class ServicesComponent { }