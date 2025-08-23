// src/app/home/home.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicDataService } from '../../services/public-data.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { GenericFormComponent } from '../../components/generic-form/generic-form.component';
import { FormFieldConfig } from '../../../shared/interfaces/form-field-config';
import { takeUntil } from 'rxjs/operators';
import { LocalizationService } from '../../services/localization.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    GenericFormComponent
  ]
})
export class HomeComponent implements OnInit {

  private heroBackgroundImageUrl: string = 'assets/images/backgrounds/home_background.jpg';
  private serviceBackgrounds: { [key: string]: string } = {
    webapp: 'assets/images/backgrounds/service-web.jpg',
    desktopapp: 'assets/images/backgrounds/service-desktop.jpg',
    mobileapp: 'assets/images/backgrounds/service-mobile.jpg',
    aiapp: 'assets/images/backgrounds/service-ai.jpg',
  };
  phone_icon: string = 'assets/images/icons/call.png';
  mail_icon: string = 'assets/images/icons/mail.png';
  send_icon: string = 'assets/images/icons/send.png';

  eshop_default: string = 'assets/images/product_images/admin_panel.png';
  survey_engine: string = 'assets/images/product_images/survey_engine.png';
  survey_solver: string = 'assets/images/product_images/survey_solver.png';
  
  check_mark: string = 'assets/images/icons/check.png';

  py: string = 'assets/images/icons/curses/py.png';
  scratch: string = 'assets/images/icons/curses/scratch.png';
  csharp: string = 'assets/images/icons/curses/csharp.png';
  js: string = 'assets/images/icons/curses/js.png';
  hoverState: { [key: string]: boolean } = {
    webapp: false,
    website: false,
    desktopapp: false,
    graphicdesign: false,
  };

  form_description: string = 'Navázání spolupráce do 24h';
  form_button: string = 'Rezervovat konzultaci';
  form_header : string = 'Máte nápad ? My máme řešení';

  headerMain: string = '';
  headerSubtitle: string = '';

  webDevelopmentHeader: string = '';
  desktopDevelopmentHeader: string = '';
  mobileDevelopmentHeader: string = '';
  aiDevelopmentHeader: string = '';

  ourServicesTitle: string = '';

  learnMore: string = '';

  statsProjectsLabel: string = '';
  statsProjectsCount: string = '';
  statsYearsLabel: string = '';
  statsYearsCount: string = '';
  statsSolutionsLabel: string = '';
  statsSolutionsCount: string = '';

  webDevTitle: string = '';
  webDevBullet1: string = '';
  webDevBullet2: string = '';
  webDevBullet3: string = '';

  desktopDevTitle: string = '';
  desktopDevBullet1: string = '';
  desktopDevBullet2: string = '';
  desktopDevBullet3: string = '';

  mobileDevTitle: string = '';
  mobileDevBullet1: string = '';
  mobileDevBullet2: string = '';
  mobileDevBullet3: string = '';

  aiDevTitle: string = '';
  aiDevBullet1: string = '';
  aiDevBullet2: string = '';
  aiDevBullet3: string = '';

  productsSectionTitle: string = '';

  product1Title: string = '';
  product1Price: string = '';
  product1Description: string = '';

  product2Title: string = '';
  product2Price: string = '';
  product2Description: string = '';

  ourServicesTitleMobile: string = '';



  product3Title: string = '';
  product3Price: string = '';
  product3Description: string = '';

  shopButtonText: string = '';

  academySectionTitle: string = '';
  academyPriceLabel: string = '';
  academyPriceAmount: string = '';
  academyPriceSuffix: string = '';
  academyButtonText: string = '';


  selectUsHeader: string = '';
  selectUsItem1Header: string = '';
  selectUsItem1Bullet1: string = '';
  selectUsItem1Bullet2: string = '';
  selectUsItem1Bullet3: string = '';

  selectUsItem2Header: string = '';
  selectUsItem2Bullet1: string = '';
  selectUsItem2Bullet2: string = '';
  selectUsItem2Bullet3: string = '';

  selectUsItem3Header: string = '';
  selectUsItem3Bullet1: string = '';
  selectUsItem3Bullet2: string = '';
  selectUsItem3Bullet3: string = '';


  contactFormConfig: FormFieldConfig[] = [];

  private destroy$ = new Subject<void>(); // Pro správné odhlášení z odběrů

  constructor(private publicDataService: PublicDataService,private localizationService: LocalizationService) { }

ngOnInit(): void {
  this.localizationService.currentTranslations$
    .pipe(takeUntil(this.destroy$))
    .subscribe(translations => {
      if (translations) {

        this.selectUsHeader = this.localizationService.getText('home.select_us_header');
        
        this.selectUsItem1Header = this.localizationService.getText('home.select_us.item_1.header');
        this.selectUsItem1Bullet1 = this.localizationService.getText('home.select_us.item_1.bullet_1');
        this.selectUsItem1Bullet2 = this.localizationService.getText('home.select_us.item_1.bullet_2');
        this.selectUsItem1Bullet3 = this.localizationService.getText('home.select_us.item_1.bullet_3');
        
        this.selectUsItem2Header = this.localizationService.getText('home.select_us.item_2.header');
        this.selectUsItem2Bullet1 = this.localizationService.getText('home.select_us.item_2.bullet_1');
        this.selectUsItem2Bullet2 = this.localizationService.getText('home.select_us.item_2.bullet_2');
        this.selectUsItem2Bullet3 = this.localizationService.getText('home.select_us.item_2.bullet_3');
        
        this.selectUsItem3Header = this.localizationService.getText('home.select_us.item_3.header');
        this.selectUsItem3Bullet1 = this.localizationService.getText('home.select_us.item_3.bullet_1');
        this.selectUsItem3Bullet2 = this.localizationService.getText('home.select_us.item_3.bullet_2');
        this.selectUsItem3Bullet3 = this.localizationService.getText('home.select_us.item_3.bullet_3');


        this.form_header = this.localizationService.getText('home.consultation_form.header');
        this.form_description = this.localizationService.getText('home.consultation_form.description');
        this.form_button = this.localizationService.getText('home.consultation_form.button');

        this.ourServicesTitleMobile = this.localizationService.getText('home.our_services_m');
        this.headerMain = this.localizationService.getText('home.header_1');
        this.learnMore = this.localizationService.getText('home.links.learn_more');
        this.headerSubtitle = this.localizationService.getText('home.header_2');

        this.webDevelopmentHeader = this.localizationService.getText('home.web_header');
        this.desktopDevelopmentHeader = this.localizationService.getText('home.desktop_header');
        this.mobileDevelopmentHeader = this.localizationService.getText('home.mobile_header');
        this.aiDevelopmentHeader = this.localizationService.getText('home.ai_header');

        this.ourServicesTitle = this.localizationService.getText('home.our_services');

        this.statsProjectsLabel = this.localizationService.getText('home.stats_projects_text');
        this.statsProjectsCount = this.localizationService.getText('home.stats_projects_count');
        this.statsYearsLabel = this.localizationService.getText('home.stats_years_text');
        this.statsYearsCount = this.localizationService.getText('home.stats_years_count');
        this.statsSolutionsLabel = this.localizationService.getText('home.stats_solutions_text');
        this.statsSolutionsCount = this.localizationService.getText('home.stats_solutions_count');

        this.webDevTitle = this.localizationService.getText('home.links.link_1.header');
        this.webDevBullet1 = this.localizationService.getText('home.links.link_1.bullet_1');
        this.webDevBullet2 = this.localizationService.getText('home.links.link_1.bullet_2');
        this.webDevBullet3 = this.localizationService.getText('home.links.link_1.bullet_3');

        this.desktopDevTitle = this.localizationService.getText('home.links.link_2.header');
        this.desktopDevBullet1 = this.localizationService.getText('home.links.link_2.bullet_1');
        this.desktopDevBullet2 = this.localizationService.getText('home.links.link_2.bullet_2');
        this.desktopDevBullet3 = this.localizationService.getText('home.links.link_2.bullet_3');

        this.mobileDevTitle = this.localizationService.getText('home.links.link_3.header');
        this.mobileDevBullet1 = this.localizationService.getText('home.links.link_3.bullet_1');
        this.mobileDevBullet2 = this.localizationService.getText('home.links.link_3.bullet_2');
        this.mobileDevBullet3 = this.localizationService.getText('home.links.link_3.bullet_3');

        this.aiDevTitle = this.localizationService.getText('home.links.link_4.header');
        this.aiDevBullet1 = this.localizationService.getText('home.links.link_4.bullet_1');
        this.aiDevBullet2 = this.localizationService.getText('home.links.link_4.bullet_2');
        this.aiDevBullet3 = this.localizationService.getText('home.links.link_4.bullet_3');

        this.productsSectionTitle = this.localizationService.getText('home.products_header');

        this.product1Title = this.localizationService.getText('home.products.prod_1.header');
        this.product1Price = this.localizationService.getText('home.products.prod_1.price');
        this.product1Description = this.localizationService.getText('home.products.prod_1.description');

        this.product2Title = this.localizationService.getText('home.products.prod_2.header');
        this.product2Price = this.localizationService.getText('home.products.prod_2.price');
        this.product2Description = this.localizationService.getText('home.products.prod_2.description');

        this.product3Title = this.localizationService.getText('home.products.prod_3.header');
        this.product3Price = this.localizationService.getText('home.products.prod_3.price');
        this.product3Description = this.localizationService.getText('home.products.prod_3.description');

        this.shopButtonText = this.localizationService.getText('home.products.button_shop_text');

        this.academySectionTitle = this.localizationService.getText('home.academy_header');
        this.academyPriceLabel = this.localizationService.getText('home.price_start');
        this.academyPriceAmount = this.localizationService.getText('home.price_number');
        this.academyPriceSuffix = this.localizationService.getText('home.price_end');
        this.academyButtonText = this.localizationService.getText('home.button_academy_text');

        // 🧩 Formulář: dynamické načtení překladů
        this.contactFormConfig = [
          {
            label: this.localizationService.getText('home.form_topic_label'),
            name: 'thema',
            type: 'select',
            required: true,
            value: 'web-development',
            options: [
              { value: 'web-development', label: this.localizationService.getText('home.form_topic_option_web') },
              { value: 'desktop-development', label: this.localizationService.getText('home.form_topic_option_desktop') },
              { value: 'mobile-development', label: this.localizationService.getText('home.form_topic_option_mobile') },
              { value: 'ai-development', label: this.localizationService.getText('home.form_topic_option_ai') },
              { value: 'other', label: this.localizationService.getText('home.form_topic_option_other') }
            ]
          },
          {
            label: this.localizationService.getText('home.form_email_label'),
            name: 'contact_email',
            type: 'email',
            required: true,
            placeholder: this.localizationService.getText('home.form_email_placeholder'),
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
          },
          {
            label: this.localizationService.getText('home.form_phone_label'),
            name: 'contact_phone',
            type: 'tel',
            required: false,
            placeholder: this.localizationService.getText('home.form_phone_placeholder'),
            pattern: '^[0-9\\s\\-+\\(\\)]+$'
          },
          {
            label: this.localizationService.getText('home.form_description_label'),
            name: 'order_description',
            type: 'textarea',
            required: true,
            rows: 5,
            placeholder: this.localizationService.getText('home.form_description_placeholder')
          }
        ];
      }
    });
}


  handleFormSubmission(formData: any): void {
    console.log('Data přijata z generického formuláře k odeslání do PublicDataService:', formData);

    this.publicDataService.submitContactForm(formData).subscribe({
      next: (response) => {
        console.log('Formulář odeslán úspěšně přes PublicDataService!', response);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Chyba při odesílání formuláře přes PublicDataService:', error);
      }
    });
  }

  handleFormReset(): void {
    console.log('Generický formulář byl resetován.');
  }

  getHeroBackground(): string {
    return `url('${this.heroBackgroundImageUrl}')`;
  }

  getServiceBackground(serviceName: string): string {
    return `url('${this.serviceBackgrounds[serviceName]}')`;
  }

  getServiceOverlayStyles(serviceName: string) {
    const isHovered = this.hoverState[serviceName];
    return {
      filter: isHovered ? 'grayscale(0%) brightness(1)' : 'grayscale(100%) brightness(0.7)',
      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    };
  }

  getTextStyles(serviceName: string) {
    const isHovered = this.hoverState[serviceName];
    return {
      color: isHovered ? '#00bcd4' : '#e0e0e0',
      textShadow: isHovered ? '0 0 15px rgba(0, 188, 212, 0.7)' : 'none',
      transition: 'color 0.4s ease, text-shadow 0.4s ease'
    };
  }

  getArrowStyles(serviceName: string) {
    const isHovered = this.hoverState[serviceName];
    return {
      color: isHovered ? '#00bcd4' : '#e0e0e0',
      opacity: '1',
      transform: isHovered ? 'translateX(20px)' : 'translateX(0px)',
      transition: 'color 0.4s ease, transform 0.4s ease'
    };
  }

  setHoverState(serviceName: string, isHovering: boolean) {
    this.hoverState[serviceName] = isHovering;
  }
}