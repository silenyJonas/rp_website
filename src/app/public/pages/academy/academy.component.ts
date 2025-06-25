import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-academy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-content">
      <h1>Our Academy</h1>
      <p>Unlock your potential with our comprehensive educational programs and courses.</p>
      <div style="height:1000px" class="course-list">
        <div class="course-item">Course 101: Basics</div>
        <div class="course-item">Course 201: Advanced Topics</div>
      </div>
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
    p { color: #666; line-height: 1.6; margin-bottom: 30px;}
    .course-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
      margin-top: 30px;
    }
    .course-item {
      background-color: #e0f7fa;
      border: 1px solid #b2ebf2;
      padding: 15px 25px;
      border-radius: 25px;
      font-weight: bold;
      color: #00796b;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
  `]
})
export class AcademyComponent { }