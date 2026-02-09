import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-introductions',
  standalone: true, 
  imports: [RouterLink], 
  templateUrl: './introductions.component.html',
  styleUrl: './introductions.component.css',
})
export class IntroductionsComponent {
}