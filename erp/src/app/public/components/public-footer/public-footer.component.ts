import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-public-footer',
  templateUrl: './public-footer.component.html',
  styleUrls: ['./public-footer.component.css'],
    imports: [
    RouterModule
  ],
})
export class PublicFooterComponent implements OnInit {
  currentYear: number;

  in_link: string = 'assets/images/icons/in.png';
  ig_link: string = 'assets/images/icons/ig.png';
  fb_link: string = 'assets/images/icons/fb.png';

  constructor() {
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit(): void {
  }
}