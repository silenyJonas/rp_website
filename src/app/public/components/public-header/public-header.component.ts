import { Component, OnInit, HostListener, AfterViewInit, QueryList, ElementRef, ViewChildren, ChangeDetectorRef, NgZone, ViewChild } from '@angular/core';
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

  cz_flag_link: string = 'assets/images/icons/czech-republic.png';
  sk_flag_link: string = 'assets/images/icons/slovakia.png';
  en_flag_link: string = 'assets/images/icons/united-kingdom.png';

  showIndicator: boolean = false;
  isAnimatingTransition: boolean = false;
  private animationTimeout: any;

  private readonly LINK_WIDTH = 130;
  private readonly GAP_DEFAULT = 15;
  private readonly GAP_SCROLLED = 8;

  private readonly INDICATOR_ANIMATION_DURATION = 400; // ms (0.4s)

  private currentActiveRoute: string | null = null;

  @ViewChild('langSliderTrack') langSliderTrack!: ElementRef;
  // @ViewChild('langSlider') langSlider!: ElementRef; // Odstraněno: Referencujeme slider, který už neexistuje

  currentLanguage: string = 'cz'; // Výchozí aktivní jazyk

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      window.scrollTo(0, 0);
      this.currentActiveRoute = event.urlAfterRedirects;
      this.handleRouteChange();
    });

    this.scheduleUpdate(false);
    this.initResizeObserver();

    // Načtení preferovaného jazyka z localStorage nebo nastavení výchozího
    const storedLang = localStorage.getItem('selectedLanguage');
    if (storedLang) {
      this.currentLanguage = storedLang;
    }
  }

  ngAfterViewInit(): void {
    this.scheduleUpdate(false);
    // Aktualizace aktivního jazyka po vykreslení, slider už neaktualizujeme
    this.ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => {
            if (this.langSliderTrack) { // Zkontrolovat jen track, slider už není potřeba
                this.ngZone.run(() => {
                    this.updateLanguageSelectionStyle(); // Nová metoda jen pro stylování
                    this.cdr.detectChanges();
                });
            } else {
                console.error('ngAfterViewInit: Element `#langSliderTrack` nebyl nalezen. Zkontrolujte HTML.');
            }
        });
    });
  }

  private handleRouteChange(): void {
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
        this.scheduleUpdate(false);
      });
      this.resizeObserver.observe(headerElement);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    clearTimeout(this.animationTimeout);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
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
    console.log(`Jazyk změněn na: ${language}`);

    if (this.currentLanguage !== language) {
      this.currentLanguage = language;
      localStorage.setItem('selectedLanguage', language);
      this.updateLanguageSelectionStyle(); // Voláme jen pro aplikaci CSS tříd
    }
  }

  // Přejmenovaná metoda, která již neaktualizuje slider, ale jen aplikuje CSS třídy
  private updateLanguageSelectionStyle(): void {
    console.log('updateLanguageSelectionStyle: Spuštěna, aktuální jazyk:', this.currentLanguage);
    if (!this.langSliderTrack) {
      console.error('updateLanguageSelectionStyle: Element `#langSliderTrack` nebyl nalezen. Zkontrolujte HTML.');
      return;
    }

    const sliderTrackElement = this.langSliderTrack.nativeElement;

    // Najdeme všechny labely a aplikujeme/odebereme třídu 'active'
    sliderTrackElement.querySelectorAll('.lang-label').forEach((label: HTMLElement) => {
      if (label.dataset['lang'] === this.currentLanguage) {
        label.classList.add('active');
      } else {
        label.classList.remove('active');
      }
    });
  }
}