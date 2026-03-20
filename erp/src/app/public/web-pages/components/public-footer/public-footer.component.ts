import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LocalizationService } from '../../../../shared/services/localization.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface FooterNavLink {
  route: string;
  text: string;
}

@Component({
  selector: 'app-public-footer',
  standalone: true,
  templateUrl: './public-footer.component.html',
  styleUrls: ['./public-footer.component.css'],
  imports: [RouterModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicFooterComponent implements OnInit, OnDestroy {
  // Jeden objekt pro všechny překlady
  t: any = null;
  
  currentYear: number;
  footerNavLinks: FooterNavLink[] = [];
  footerLegalLinks: FooterNavLink[] = [];

  tt_link: string = 'assets/images/icons/tik-tok.png';
  ig_link: string = 'assets/images/icons/ig.png';
  fb_link: string = 'assets/images/icons/fb.png';
  x_link: string = 'assets/images/icons/x.png';

  private destroy$ = new Subject<void>();

  constructor(
    private localizationService: LocalizationService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit(): void {
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(translations => {
        if (translations) {
          // Namapujeme hlavní sekci footeru
          this.t = translations.footer;
          
          // Pokud existuje copyright_text, nahradíme v něm placeholder pro rok
          if (this.t?.copyright_text) {
            this.t.copyright_text = this.t.copyright_text.replace('{year}', this.currentYear.toString());
          }

          // Načteme dynamické linky (používají klíče i z jiných sekcí jako navigation)
          this.loadFooterNavLinks();
          this.loadFooterLegalLinks();

          this.cdr.markForCheck();
        }
      });
  }

  private loadFooterNavLinks(): void {
    const navLinkKeys = [
      { route: '/home', key: 'navigation.home' },
      { route: '/services', key: 'navigation.services' },
      { route: '/shop', key: 'navigation.shop' },
      { route: '/academy', key: 'navigation.academy' },
      { route: '/references', key: 'navigation.references_full' },
      { route: '/faq', key: 'navigation.faq_full' },
      { route: '/about-us', key: 'navigation.about-us' },
      { route: '/jobs', key: 'navigation.jobs' },
      { route: '/auth/login', key: 'navigation.login_btn' },
    ];

    this.footerNavLinks = navLinkKeys.map(link => ({
      route: link.route,
      text: this.localizationService.getText(link.key)
    }));
  }

  private loadFooterLegalLinks(): void {
    const legalLinkKeys = [
      { route: '/privacy-policy', key: 'legal.privacy_policy' },
      { route: '/tos', key: 'legal.terms_of_service' }
    ];

    this.footerLegalLinks = legalLinkKeys.map(link => ({
      route: link.route,
      text: this.localizationService.getText(link.key)
    }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}