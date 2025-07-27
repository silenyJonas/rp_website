// src/app/home/home.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicDataService } from '../../services/public-data.service';
import { HttpErrorResponse } from '@angular/common/http';

import { GenericFormComponent } from '../../components/generic-form/generic-form.component';
import { FormFieldConfig } from '../../../shared/interfaces/form-field-config';


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

  eshop_default: string = 'assets/images/product_images/eshop_default.png';
  survey_engine: string = 'assets/images/product_images/survey_engine.png';
  survey_solver: string = 'assets/images/product_images/survey_solver.png';
  
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

  contactFormConfig: FormFieldConfig[] = [];

  constructor(private publicDataService: PublicDataService) { }

  ngOnInit(): void {
    this.contactFormConfig = [
      {
        label: 'Téma',
        name: 'thema',
        type: 'select',
        required: true,
        value: 'web-development', // Výchozí hodnota
        options: [
          { value: 'web-development', label: 'Webový vývoj' },
          { value: 'desktop-development', label: 'Desktopový vývoj' },
          { value: 'mobile-development', label: 'Mobilní vývoj' },
          { value: 'ai-development', label: 'AI vývoj' },
          { value: 'other', label: 'Jiné' }
        ]
      },
      {
        label: 'E-mail',
        name: 'contact_email',
        type: 'email',
        required: true,
        placeholder: 'vas.email@priklad.cz',
        // Základní regex pro e-mail: povolí alfanumerické znaky, tečky, podtržítka, pomlčky,
        // pak @, pak alfanumerické znaky, tečky, pomlčky, a nakonec 2-4 znaky pro doménu.
        // Toto je velmi základní a ne pokrývá všechny edge cases, ale pro jednoduchou validaci stačí.
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
      },
      {
        label: 'Telefon (nepovinné)',
        name: 'contact_phone',
        type: 'tel',
        required: false,
        placeholder: 'např. +420 123 456 789',
        // Regex pro telefon: povolí číslice, mezery, pomlčky a znak plus na začátku.
        // Umožňuje různé formáty telefonních čísel.
        pattern: '^[0-9\\s\\-+\\(\\)]+$' // Povoluje číslice, mezery, pomlčky, plus, závorky
      },
      {
        label: 'Stručný popis zadání',
        name: 'order_description',
        type: 'textarea',
        required: true,
        rows: 5,
        placeholder: 'Popište prosím váš projekt nebo dotaz...'
      }
    ];
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