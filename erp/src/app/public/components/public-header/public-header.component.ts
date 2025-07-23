import { Component, OnInit, HostListener, AfterViewInit, QueryList, ElementRef, ViewChildren, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { Output, EventEmitter } from '@angular/core';

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
export class PublicHeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() menuToggled = new EventEmitter<boolean>();
  @ViewChildren('homeLink, servicesLink, shopLink, academyLink')
  navLinks!: QueryList<ElementRef<HTMLAnchorElement>>;

  indicatorStyle: any = {};
  scrolled: boolean = false;
  private resizeObserver: ResizeObserver | undefined;

  cz_flag_link: string = 'assets/images/icons/czech-republic.png';
  sk_flag_link: string = 'assets/images/icons/slovakia.png';
  en_flag_link: string = 'assets/images/icons/united-kingdom.png';
  tel_icon: string = 'assets/images/icons/call.png';
  mail_icon: string = 'assets/images/icons/mail.png';
  logo: string = 'assets/images/logos/logo.png';

  showIndicator: boolean = false;
  isAnimatingTransition: boolean = false;
  private animationTimeout: any;

  private readonly LINK_WIDTH = 130;
  private readonly GAP_DEFAULT = 15;
  private readonly GAP_SCROLLED = 8;

  private readonly INDICATOR_ANIMATION_DURATION = 400; // ms (0.4s)

  private currentActiveRoute: string | null = null;

  currentLanguage: string = 'cz'; // Výchozí aktivní jazyk

  isMobileView: boolean = false;
  isMenuOpen: boolean = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.checkMobileView();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      window.scrollTo(0, 0);
      this.currentActiveRoute = event.urlAfterRedirects;
      this.handleRouteChange();
    });

    this.scheduleUpdate(false);
    this.initResizeObserver();

    const storedLang = localStorage.getItem('selectedLanguage');
    if (storedLang) {
      this.currentLanguage = storedLang;
    }
  }

  ngAfterViewInit(): void {
    this.scheduleUpdate(false);
    // V této části už není potřeba `langSliderTrack`, tak jsem ji odstranil, aby to nehazelo chyby
  }

  // Metoda pro kontrolu velikosti okna
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
      this.checkMobileView();
      if (!this.isMobileView && this.isMenuOpen) {
          this.closeMenu();
      }
  }

  // Klíčová opravená metoda, kterou jste postrádal
  private checkMobileView(): void {
      const newIsMobileView = window.innerWidth <= 768; // Používáme breakpoint z vašeho CSS
      if (this.isMobileView !== newIsMobileView) {
          this.isMobileView = newIsMobileView;
          this.cdr.detectChanges();
          if (!this.isMobileView) {
              this.scheduleUpdate(false);
          }
      }
  }

  // Metoda, která ovládá otevírání/zavírání menu
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.toggleScroll(this.isMenuOpen);
  }

  // Metoda, která zavírá menu a odblokuje scroll
  closeMenu(): void {
    this.isMenuOpen = false;
    this.toggleScroll(false);
  }

  // Metoda, která přidává/odebírá CSS třídu na body
  private toggleScroll(blockScroll: boolean): void {
        const html = document.documentElement; // Cílíme na HTML element
        if (html) {
            if (blockScroll) {
                html.classList.add('no-scroll');
            } else {
                html.classList.remove('no-scroll');
            }
        }
    }

  private handleRouteChange(): void {
      if (this.isMobileView) return;

      const allLinks = this.navLinks.map(link => link.nativeElement);
      const targetLink = allLinks.find(link => {
          const linkRoute = link.getAttribute('routerLink');
          return linkRoute && this.currentActiveRoute?.startsWith(linkRoute);
      });

      this.navLinks.forEach(link => {
          link.nativeElement.classList.remove('active');
          link.nativeElement.classList.remove('highlight-text');
      });

      this.navLinks.forEach(link => {
          link.nativeElement.classList.add('is-clicked-animating');
      });

      if (targetLink) {
          targetLink.classList.add('highlight-text');
      }
      this.cdr.detectChanges();

      this.showIndicator = true;
      this.isAnimatingTransition = true;
      this.scheduleUpdate(true);

      clearTimeout(this.animationTimeout);
      this.animationTimeout = setTimeout(() => {
          this.showIndicator = false;
          this.isAnimatingTransition = false;

          this.navLinks.forEach(link => {
              link.nativeElement.classList.remove('is-clicked-animating');
              link.nativeElement.classList.remove('highlight-text');
          });

          if (targetLink) {
              targetLink.classList.add('active');
          }
          this.cdr.detectChanges();
      }, this.INDICATOR_ANIMATION_DURATION);
  }

  private scheduleUpdate(forceAnimate: boolean = false): void {
      if (this.isMobileView) return;

      this.ngZone.runOutsideAngular(() => {
          requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                  this.ngZone.run(() => {
                      this.updateIndicatorPosition(forceAnimate);
                      this.cdr.detectChanges();
                  });
              });
          });
      });
  }

  private initResizeObserver(): void {
      const headerElement = document.querySelector('header');
      if (headerElement) {
          this.resizeObserver = new ResizeObserver(entries => {
              this.ngZone.run(() => {
                  this.checkMobileView();
                  if (!this.isMobileView) {
                      this.scheduleUpdate(false);
                  }
              });
          });
          this.resizeObserver.observe(headerElement);
      }
  }
  
  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    clearTimeout(this.animationTimeout);
    this.closeMenu();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
      if (this.isMobileView) return;

      const scrollThreshold = 100;
      if (window.scrollY > scrollThreshold) {
          if (!this.scrolled) {
              this.scrolled = true;
              this.scheduleUpdate(true);
          }
      } else {
          if (this.scrolled) {
              this.scrolled = false;
              this.scheduleUpdate(true);
          }
      }
  }

  updateIndicatorPosition(forceAnimate: boolean = false): void {
    if (this.isMobileView) return;

    const allLinks = this.navLinks.map(link => link.nativeElement);
    let targetLinkElement: HTMLAnchorElement | undefined;

    if (this.showIndicator || this.isAnimatingTransition) {
        targetLinkElement = allLinks.find(link => {
            const linkRoute = link.getAttribute('routerLink');
            return linkRoute && this.currentActiveRoute?.startsWith(linkRoute);
        });
    } else {
        targetLinkElement = allLinks.find(link => link.classList.contains('active'));
    }

    if (!targetLinkElement) {
        targetLinkElement = allLinks.find(link => {
            const linkRoute = link.getAttribute('routerLink');
            return linkRoute && this.router.url.startsWith(linkRoute);
        });
    }

    if (targetLinkElement) {
        const currentGap = this.scrolled ? this.GAP_SCROLLED : this.GAP_DEFAULT;
        const targetLinkIndex = allLinks.indexOf(targetLinkElement);

        if (targetLinkIndex !== -1) {
            const translateX_value = (targetLinkIndex * this.LINK_WIDTH) + (targetLinkIndex * currentGap);
            this.indicatorStyle = {
                width: `${this.LINK_WIDTH}px`,
                height: this.scrolled ? '32px' : '48px',
                opacity: this.showIndicator ? 1 : 0,
                transform: `translateX(${translateX_value}px) translateY(-50%)`
            };

            if (!forceAnimate && !this.scrolled && !this.isAnimatingTransition) {
                this.indicatorStyle.transition = 'none';
            } else {
                const duration = `${this.INDICATOR_ANIMATION_DURATION / 1000}s`;
                this.indicatorStyle.transition = `all ${duration} cubic-bezier(0.25, 0.8, 0.25, 1),
                                                    border-radius ${duration} ease-in-out,
                                                    height ${duration} ease-in-out,
                                                    width ${duration} ease-in-out,
                                                    transform ${duration} cubic-bezier(0.25, 0.8, 0.25, 1)`;
            }
        }
    } else {
        this.indicatorStyle = {
            opacity: 0,
            width: '0px',
            height: '0px',
            transform: `translateX(0px) translateY(-50%)`,
            transition: 'none'
        };
        console.warn('No active link found for indicator. Hiding indicator.');
    }
  }

  selectLanguage(language: string): void {
      this.currentLanguage = language;
      localStorage.setItem('selectedLanguage', language);
  }
}