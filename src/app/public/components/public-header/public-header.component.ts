import { Component, OnInit, HostListener, AfterViewInit, QueryList, ElementRef, ViewChildren } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './public-header.component.html',
  styleUrls: ['./public-header.component.css']
})
export class PublicHeaderComponent implements OnInit, AfterViewInit {
  @ViewChildren('homeLink, servicesLink, shopLink, academyLink')
  navLinks!: QueryList<ElementRef<HTMLAnchorElement>>;

  indicatorStyle: any = {};
  scrolled: boolean = false;
  private resizeObserver: ResizeObserver | undefined;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      setTimeout(() => this.updateIndicatorPosition(), 100);
      // NOVÉ: Scroll na začátek stránky po navigaci
      window.scrollTo(0, 0); 
    });

    setTimeout(() => this.updateIndicatorPosition(), 100);

    this.initResizeObserver();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateIndicatorPosition(), 100);
  }

  private initResizeObserver(): void {
    const headerElement = document.querySelector('header');
    if (headerElement) {
      this.resizeObserver = new ResizeObserver(entries => {
        setTimeout(() => this.updateIndicatorPosition(), 50);
      });
      this.resizeObserver.observe(headerElement);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollThreshold = 100;

    if (window.scrollY > scrollThreshold) {
      if (!this.scrolled) {
        this.scrolled = true;
        setTimeout(() => this.updateIndicatorPosition(), 50);
      }
    } else {
      if (this.scrolled) {
        this.scrolled = false;
        setTimeout(() => this.updateIndicatorPosition(), 50);
      }
    }
  }

  updateIndicatorPosition(): void {
    const activeLinkElement = this.navLinks.find(link =>
      link.nativeElement.classList.contains('active')
    );

    if (activeLinkElement) {
      const linkRect = activeLinkElement.nativeElement.getBoundingClientRect();
      const ulElement = activeLinkElement.nativeElement.closest('ul');
      const ulRect = ulElement ? ulElement.getBoundingClientRect() : null;

      if (ulRect) {
        this.indicatorStyle = {
          width: `${linkRect.width}px`,
          left: `${linkRect.left - ulRect.left}px`, // Nyní by to mělo být spolehlivější s Gridem
          top: `50%`,
          transform: `translateY(-50%)`,
          opacity: 1
        };
      }
    } else {
      this.indicatorStyle = {
        opacity: 0,
        width: '0px',
        left: '0px'
      };
    }
  }
}