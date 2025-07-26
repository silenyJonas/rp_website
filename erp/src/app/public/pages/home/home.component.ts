import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicDataService } from '../../services/public-data.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ]
})
export class HomeComponent {

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

  py:string = 'assets/images/icons/curses/py.png'
  scratch:string = 'assets/images/icons/curses/scratch.png'
  csharp:string = 'assets/images/icons/curses/csharp.png'
  js:string = 'assets/images/icons/curses/js.png'

  hoverState: { [key: string]: boolean } = {
    webapp: false,
    website: false,
    desktopapp: false,
    graphicdesign: false,
  };

  formData = {
    thema: 'web-development', // Nastavení výchozí hodnoty pro select
    contact_email: '',
    contact_phone: '', // Změna na 'phone' - váš HTML input má name="contact_email" ale label="Telefon"
    order_description: ''
  };

  constructor(private publicDataService: PublicDataService) { }

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
      color: isHovered ? '#00bcd4' : '#e0e0e0', // Plná šedá nebo zvýrazněná barva
      textShadow: isHovered ? '0 0 15px rgba(0, 188, 212, 0.7)' : 'none',
      transition: 'color 0.4s ease, text-shadow 0.4s ease'
    };
  }

  getArrowStyles(serviceName: string) {
    const isHovered = this.hoverState[serviceName];
    return {
      color: isHovered ? '#00bcd4' : '#e0e0e0', // Plná šedá nebo zvýrazněná barva
      opacity: '1', // Vždy plně neprůhledná
      transform: isHovered ? 'translateX(20px)' : 'translateX(0px)',
      transition: 'color 0.4s ease, transform 0.4s ease' // Odebrán transition pro opacity
    };
  }

  setHoverState(serviceName: string, isHovering: boolean) {
    this.hoverState[serviceName] = isHovering;
  }
onSubmit(): void {
    // Ověření, zda data existují (volitelné, ale dobrá praxe)
    if (!this.formData.contact_email || !this.formData.order_description) {
      console.error('Prosím vyplňte všechna povinná pole.');
      // Zde můžete zobrazit chybovou zprávu uživateli
      return;
    }

    console.log(this.formData)

    this.publicDataService.submitContactForm(this.formData).subscribe({
      next: (response) => {
        console.log('Formulář odeslán úspěšně!', response);
        // Zde můžete přidat logiku pro zobrazení zprávy uživateli
        alert('Váš požadavek byl úspěšně odeslán! Budeme vás kontaktovat do 24 hodin.');
        // Volitelně resetujte formulář po úspěšném odeslání
        this.resetForm();
      },
      error: (error) => {
        console.error('Chyba při odesílání formuláře:', error);
        // Zde můžete přidat logiku pro zobrazení chybové zprávy uživateli
        alert('Při odesílání formuláře nastala chyba. Zkuste to prosím znovu.');
      }
    });
  }

  // Pomocná metoda pro resetování formuláře
  resetForm(): void {
    this.formData = {
      thema: 'web-development',
      contact_email: '',
      contact_phone: '',
      order_description: ''
    };
  }
  
}