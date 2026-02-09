import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
})
export class NotFoundComponent implements OnInit {
  attemptedUrl: string = '';
  constructor(private router: Router) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    
    if (navigation && navigation.previousNavigation) {
      this.attemptedUrl = navigation.previousNavigation.finalUrl?.toString() || '';
    } else {
      this.attemptedUrl = this.router.url;
    }
  }
}