
// import { Component, OnInit, HostListener, AfterViewInit, QueryList, ElementRef, ViewChildren, ChangeDetectorRef, NgZone } from '@angular/core';
// import { Router, NavigationEnd, RouterModule } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { filter } from 'rxjs/operators';

// @Component({
//   selector: 'app-public-header',
//   standalone: true,
//   imports: [
//     CommonModule,
//     RouterModule
//   ],
//   templateUrl: './public-header.component.html',
//   styleUrls: ['./public-header.component.css']
// })
// export class PublicHeaderComponent implements OnInit, AfterViewInit {
//   @ViewChildren('homeLink, servicesLink, shopLink, academyLink')
//   navLinks!: QueryList<ElementRef<HTMLAnchorElement>>;

//   indicatorStyle: any = {};
//   scrolled: boolean = false;
//   private resizeObserver: ResizeObserver | undefined;

//   showIndicator: boolean = false; // Řídí opacitu indikátoru
//   isAnimatingTransition: boolean = false; // Pomocná proměnná pro stav animace
//   private animationTimeout: any;

//   private readonly LINK_WIDTH = 130;
//   private readonly GAP_DEFAULT = 15;
//   private readonly GAP_SCROLLED = 8;
  
//   private readonly INDICATOR_ANIMATION_DURATION = 400; // ms (0.4s)
//   // private readonly LINK_TRANSFORM_DELAY = 300; // ms (0.3s) - Tuto konstantu již nepotřebujeme pro highlight-text

//   private currentActiveRoute: string | null = null;

//   constructor(
//     private router: Router,
//     private cdr: ChangeDetectorRef,
//     private ngZone: NgZone
//   ) {}

//   ngOnInit(): void {
//     this.router.events.pipe(
//       filter(event => event instanceof NavigationEnd)
//     ).subscribe((event: NavigationEnd) => {
//       window.scrollTo(0, 0);
//       this.currentActiveRoute = event.urlAfterRedirects;
//       this.handleRouteChange();
//     });

//     this.scheduleUpdate(false); 
//     this.initResizeObserver();
//   }

//   ngAfterViewInit(): void {
//     this.scheduleUpdate(false); 
//   }

//   private handleRouteChange(): void {
//     const allLinks = this.navLinks.map(link => link.nativeElement);
//     const targetLink = allLinks.find(link => {
//         const linkRoute = link.getAttribute('routerLink');
//         return linkRoute && this.currentActiveRoute?.startsWith(linkRoute);
//     });

//     // 1. Odebereme aktivní a zvýrazněné třídy ze všech odkazů
//     this.navLinks.forEach(link => {
//         link.nativeElement.classList.remove('active');
//         link.nativeElement.classList.remove('highlight-text');
//     });

//     // 2. Okamžitě přidáme třídu pro "spuštění dolů" na VŠECHNY odkazy, které se mají animovat dolů
//     this.navLinks.forEach(link => {
//         link.nativeElement.classList.add('is-clicked-animating'); 
//     });

//     // 3. OKAMŽITĚ zvýrazníme text cílového odkazu (žádné zpoždění)
//     if (targetLink) {
//         targetLink.classList.add('highlight-text');
//     }
//     this.cdr.detectChanges(); // Zajistíme aktualizaci DOM

//     // 4. Nastavíme indikátor pro animaci
//     this.showIndicator = true;
//     this.isAnimatingTransition = true;
//     this.scheduleUpdate(true); 

//     // 5. Nastavíme timeout pro konec animace indikátoru a aplikaci finálního aktivního stavu
//     clearTimeout(this.animationTimeout);
//     this.animationTimeout = setTimeout(() => {
//       this.showIndicator = false;
//       this.isAnimatingTransition = false;
      
//       this.navLinks.forEach(link => {
//         // Odebereme třídy pro animaci po dokončení
//         link.nativeElement.classList.remove('is-clicked-animating'); 
//         link.nativeElement.classList.remove('highlight-text'); // Odebereme highlight-text až teď
//       });

//       if (targetLink) {
//           targetLink.classList.add('active'); // Třída active převezme bílou barvu textu
//       }

//       this.cdr.detectChanges(); 
//     }, this.INDICATOR_ANIMATION_DURATION); 
//   }

//   private scheduleUpdate(forceAnimate: boolean = false): void {
//     this.ngZone.runOutsideAngular(() => {
//       requestAnimationFrame(() => {
//         requestAnimationFrame(() => {
//           this.ngZone.run(() => {
//             this.updateIndicatorPosition(forceAnimate);
//             this.cdr.detectChanges();
//           });
//         });
//       });
//     });
//   }

//   private initResizeObserver(): void {
//     const headerElement = document.querySelector('header');
//     if (headerElement) {
//       this.resizeObserver = new ResizeObserver(entries => {
//         this.scheduleUpdate(false);
//       });
//       this.resizeObserver.observe(headerElement);
//     }
//   }

//   ngOnDestroy(): void {
//     if (this.resizeObserver) {
//       this.resizeObserver.disconnect();
//     }
//     clearTimeout(this.animationTimeout);
//   }

//   @HostListener('window:scroll', [])
//   onWindowScroll() {
//     const scrollThreshold = 100;

//     if (window.scrollY > scrollThreshold) {
//       if (!this.scrolled) {
//         this.scrolled = true;
//         this.scheduleUpdate(this.showIndicator || this.isAnimatingTransition);
//       }
//     } else {
//       if (this.scrolled) {
//         this.scrolled = false;
//         this.scheduleUpdate(this.showIndicator || this.isAnimatingTransition);
//       }
//     }
//   }

//   updateIndicatorPosition(forceAnimate: boolean = false): void {
//     const allLinks = this.navLinks.map(link => link.nativeElement);
    
//     let targetLinkElement: HTMLAnchorElement | undefined;

//     if (this.showIndicator || this.isAnimatingTransition) {
//         targetLinkElement = allLinks.find(link => {
//             const linkRoute = link.getAttribute('routerLink');
//             return linkRoute && this.currentActiveRoute?.startsWith(linkRoute);
//         });
//     } else {
//         targetLinkElement = allLinks.find(link => link.classList.contains('active'));
//     }

//     if (!targetLinkElement) {
//       targetLinkElement = allLinks.find(link => {
//         const linkRoute = link.getAttribute('routerLink');
//         return linkRoute && this.router.url.startsWith(linkRoute);
//       });
//     }

//     if (targetLinkElement) {
//       const currentGap = this.scrolled ? this.GAP_SCROLLED : this.GAP_DEFAULT;
//       const targetLinkIndex = allLinks.indexOf(targetLinkElement);

//       if (targetLinkIndex !== -1) {
//         const translateX_value = (targetLinkIndex * this.LINK_WIDTH) + (targetLinkIndex * currentGap);
        
//         this.indicatorStyle = {
//           width: `${this.LINK_WIDTH}px`,
//           height: this.scrolled ? '32px' : '48px', // Výška indikátoru sleduje scrolled stav
//           opacity: this.showIndicator ? 1 : 0,
//           transform: `translateX(${translateX_value}px) translateY(-50%)`
//         };

//         if (!forceAnimate) {
//              this.indicatorStyle.transition = 'none';
//         } else {
//              const duration = `${this.INDICATOR_ANIMATION_DURATION / 1000}s`;
//              this.indicatorStyle.transition = `all ${duration} cubic-bezier(0.25, 0.8, 0.25, 1), 
//                                                 border-radius ${duration} ease-in-out, 
//                                                 height ${duration} ease-in-out, 
//                                                 width ${duration} ease-in-out, 
//                                                 transform ${duration} cubic-bezier(0.25, 0.8, 0.25, 1)`;
//         }
//       }
//     } else {
//       this.indicatorStyle = {
//         opacity: 0,
//         width: '0px',
//         height: '0px', 
//         transform: `translateX(0px) translateY(-50%)`,
//         transition: 'none'
//       };
//       console.warn('No active link found for indicator. Hiding indicator.');
//     }
//   }
// }
import { Component, OnInit, HostListener, AfterViewInit, QueryList, ElementRef, ViewChildren, ChangeDetectorRef, NgZone } from '@angular/core';
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

  showIndicator: boolean = false; // Řídí opacitu indikátoru
  isAnimatingTransition: boolean = false; // Pomocná proměnná pro stav animace
  private animationTimeout: any;

  private readonly LINK_WIDTH = 130;
  private readonly GAP_DEFAULT = 15;
  private readonly GAP_SCROLLED = 8;
  
  private readonly INDICATOR_ANIMATION_DURATION = 400; // ms (0.4s)

  private currentActiveRoute: string | null = null;

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
  }

  ngAfterViewInit(): void {
    this.scheduleUpdate(false); 
  }

  private handleRouteChange(): void {
    const allLinks = this.navLinks.map(link => link.nativeElement);
    const targetLink = allLinks.find(link => {
        const linkRoute = link.getAttribute('routerLink');
        return linkRoute && this.currentActiveRoute?.startsWith(linkRoute);
    });

    // 1. Odebereme aktivní a zvýrazněné třídy ze všech odkazů
    this.navLinks.forEach(link => {
        link.nativeElement.classList.remove('active');
        link.nativeElement.classList.remove('highlight-text');
    });

    // 2. Okamžitě přidáme třídu pro "spuštění dolů" na VŠECHNY odkazy, které se mají animovat dolů
    this.navLinks.forEach(link => {
        link.nativeElement.classList.add('is-clicked-animating'); 
    });

    // 3. OKAMŽITĚ zvýrazníme text cílového odkazu (žádné zpoždění)
    if (targetLink) {
        targetLink.classList.add('highlight-text');
    }
    this.cdr.detectChanges(); // Zajistíme aktualizaci DOM

    // 4. Nastavíme indikátor pro animaci
    this.showIndicator = true;
    this.isAnimatingTransition = true;
    this.scheduleUpdate(true); // PONECHÁME forceAnimate na true pro tuto navigaci

    // 5. Nastavíme timeout pro konec animace indikátoru a aplikaci finálního aktivního stavu
    clearTimeout(this.animationTimeout);
    this.animationTimeout = setTimeout(() => {
      this.showIndicator = false;
      this.isAnimatingTransition = false;
      
      this.navLinks.forEach(link => {
        // Odebereme třídy pro animaci po dokončení
        link.nativeElement.classList.remove('is-clicked-animating'); 
        link.nativeElement.classList.remove('highlight-text'); // Odebereme highlight-text až teď
      });

      if (targetLink) {
          targetLink.classList.add('active'); // Třída active převezme bílou barvu textu
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
        this.scheduleUpdate(false); // Při změně velikosti headeru (např. při scrollu) neforceAnimujeme, ale necháme CSS transition
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
        this.scheduleUpdate(true); // VŽDY animujeme indikátor při změně scrolled stavu
      }
    } else {
      if (this.scrolled) {
        this.scrolled = false;
        this.scheduleUpdate(true); // VŽDY animujeme indikátor při změně scrolled stavu
      }
    }
  }

  updateIndicatorPosition(forceAnimate: boolean = false): void {
    const allLinks = this.navLinks.map(link => link.nativeElement);
    
    let targetLinkElement: HTMLAnchorElement | undefined;

    // Pokud probíhá animace nebo je indikátor viditelný, najdeme link podle aktivní routy
    if (this.showIndicator || this.isAnimatingTransition) {
        targetLinkElement = allLinks.find(link => {
            const linkRoute = link.getAttribute('routerLink');
            return linkRoute && this.currentActiveRoute?.startsWith(linkRoute);
        });
    } else {
        // Jinak najdeme link s třídou 'active'
        targetLinkElement = allLinks.find(link => link.classList.contains('active'));
    }

    // Pokud stále není nalezen cílový link (např. při prvním načtení stránky), pokusíme se ho najít podle router.url
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
          height: this.scrolled ? '32px' : '48px', // Výška indikátoru sleduje scrolled stav
          opacity: this.showIndicator ? 1 : 0, // Opacitu ovládá showIndicator
          transform: `translateX(${translateX_value}px) translateY(-50%)`
        };

        // Zde je klíčová změna: Pokud forceAnimate není true, ale indikátor by se měl hýbat (např. při scrollu),
        // pak zachováme transition. Jinak ji vypneme.
        if (!forceAnimate && !this.scrolled && !this.isAnimatingTransition) { // Pouze pokud není animace a není scrollováno
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
}