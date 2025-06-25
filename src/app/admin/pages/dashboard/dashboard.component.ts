import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Přidejte CommonModule

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule], // Zde ho přidáme
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent { }