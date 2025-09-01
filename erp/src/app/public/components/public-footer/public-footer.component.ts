// src/app/public/components/public-footer/public-footer.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LocalizationService } from '../../services/localization.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Rozhraní pro přeložený navigační odkaz
interface FooterNavLink {
  route: string;
  text: string; // Text je již přeložený
}

@Component({
  selector: 'app-public-footer',
  standalone: true,
  templateUrl: './public-footer.component.html',
  styleUrls: ['./public-footer.component.css'],
  imports: [
    RouterModule,
    CommonModule
  ],
})
export class PublicFooterComponent implements OnInit, OnDestroy {
  currentYear: number;

  tt_link: string = 'assets/images/icons/tik-tok.png';
  ig_link: string = 'assets/images/icons/ig.png';
  fb_link: string = 'assets/images/icons/fb.png';
  x_link: string = 'assets/images/icons/x.png';

  // --- Proměnné pro všechny přeložené texty ---
  company_name_text: string = '';
  address_label_text: string = '';
  address_value_text: string = '';
  ico_label_text: string = '';
  ico_value_text: string = '';
  dic_label_text: string = '';
  dic_value_text: string = '';

  quick_links_header_text: string = '';
  // Pole s již přeloženými navigačními odkazy
  footerNavLinks: FooterNavLink[] = [];

  contact_header_text: string = '';
  email_label_text: string = '';
  email_value_text: string = '';
  phone_label_text: string = '';
  phone_value_text: string = '';

  legal_info_header_text: string = '';
  // Pole s již přeloženými právními odkazy
  footerLegalLinks: FooterNavLink[] = [];

  copyright_text: string = '';

  private destroy$ = new Subject<void>();

  constructor(private localizationService: LocalizationService) {
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit(): void {
    // Přihlásíme se k odběru změn překladů
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(translations => {
        if (translations) {
          // Naplnění proměnných s přeloženými texty
          this.company_name_text = this.localizationService.getText('footer.company_name');
          this.address_label_text = this.localizationService.getText('footer.address_label');
          this.address_value_text = this.localizationService.getText('footer.address_value');
          this.ico_label_text = this.localizationService.getText('footer.ico_label');
          this.ico_value_text = this.localizationService.getText('footer.ico_value');
          this.dic_label_text = this.localizationService.getText('footer.dic_label');
          this.dic_value_text = this.localizationService.getText('footer.dic_value');

          this.quick_links_header_text = this.localizationService.getText('footer.quick_links_header');
          this.loadFooterNavLinks(); // Volání pro naplnění navigačních odkazů

          this.contact_header_text = this.localizationService.getText('footer.contact_header');
          this.email_label_text = this.localizationService.getText('footer.email_label');
          this.email_value_text = this.localizationService.getText('footer.email_value');
          this.phone_label_text = this.localizationService.getText('footer.phone_label');
          this.phone_value_text = this.localizationService.getText('footer.phone_value');

          this.legal_info_header_text = this.localizationService.getText('footer.legal_info_header');
          this.loadFooterLegalLinks(); // Volání pro naplnění právních odkazů
          
          this.copyright_text = this.localizationService.getText('footer.copyright_text')
                                  .replace('{year}', this.currentYear.toString());
        }
      });
  }

  // Pomocná metoda pro načtení přeložených navigačních odkazů
  private loadFooterNavLinks(): void {
    // Definice klíčů a cest
    const navLinkKeys = [
      { route: '/home', key: 'navigation.home' },
      { route: '/services', key: 'navigation.services' },
      { route: '/shop', key: 'navigation.shop' },
      { route: '/academy', key: 'navigation.academy' },
      { route: '/references', key: 'navigation.references_full' },
      { route: '/faq', key: 'navigation.faq_full' },
      { route: '/about-us', key: 'navigation.about-us' },
      // { route: '/auth/login', key: 'navigation.login' },
    ];

    this.footerNavLinks = navLinkKeys.map(link => ({
      route: link.route,
      text: this.localizationService.getText(link.key) // Přeložený text
    }));
  }

  // Pomocná metoda pro načtení přeložených právních odkazů
  private loadFooterLegalLinks(): void {
    // Definice klíčů a cest
    const legalLinkKeys = [
      { route: '/privacy-policy', key: 'legal.privacy_policy' },
      { route: '/tos', key: 'legal.terms_of_service' }
    ];

    this.footerLegalLinks = legalLinkKeys.map(link => ({
      route: link.route,
      text: this.localizationService.getText(link.key) // Přeložený text
    }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}