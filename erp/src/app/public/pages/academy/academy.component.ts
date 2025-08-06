// src/app/academy/academy.component.ts

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicDataService } from '../../services/public-data.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LocalizationService } from '../../services/localization.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GenericFormComponent } from '../../components/generic-form/generic-form.component';
import { FormFieldConfig } from '../../../shared/interfaces/form-field-config';

// Rozhraní pro položku timeline před překladem (s klíči)
interface TimelineItemKeys {
  id: number;
  titleKey: string;
  contentKey: string;
  themesKeys: string[];
  newThingsKeys: { textKey: string; icon: string; }[];
  isActive: boolean;
}

// Rozhraní pro přeloženou položku timeline
interface TimelineItem {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  themes: string[]; // Již přeložené texty
  newThings: string[][]; // [přeložený text, cesta k ikoně]
}

@Component({
  selector: 'app-academy',
  standalone: true,
  imports: [
    CommonModule,
    GenericFormComponent,
  ],
  templateUrl: './academy.component.html',
  styleUrls: ['./academy.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcademyComponent implements OnInit, OnDestroy {

  // --- Proměnné pro texty formuláře (budou naplněny z lokalizace) ---
  form_header: string = '';
  form_description: string = '';
  form_button: string = '';

  form_closed_title: string = '';
  form_closed_message: string = '';
  
  second_header: string = '';

  

  // --- Obecné texty pro sekci kroužků (budou naplněny z lokalizace) ---
  academyHeader: string = '';
  introText: string = '';
  timeHeader: string = '';
  onlineHeader: string = '';
  whatHeader: string = '';
  commonDurationHeader: string = '';
  commonThemesHeader: string = '';
  commonNewThingsHeader: string = '';
  priceHeader: string = '';
  monthlyPaymentHeader: string = '';
  monthlyPaymentAmount: string = '';
  monthlyPaymentNote: string = '';
  quarterlyPaymentHeader: string = '';
  quarterlyPaymentAmount: string = '';
  quarterlyPaymentNote: string = '';
  yearlyPaymentHeader: string = '';
  yearlyPaymentAmount: string = '';
  yearlyPaymentNote: string = '';

  // Konfigurace formuláře pro GenericFormComponent s klíči pro lokalizaci
  private initialContactFormConfig: FormFieldConfig[] = [
    {
      label: 'academy.consultation_form.fields.theme_label',
      isLocalizedLabel: true,
      name: 'theme',
      type: 'select',
      required: true,
      value: 'desktop-development', // Výchozí hodnota
      options: [
        { value: 'desktop-development', label: 'academy.consultation_form.fields.theme_option_desktop', isLocalizedLabel: true },
        { value: 'web-development', label: 'academy.consultation_form.fields.theme_option_web', isLocalizedLabel: true }
      ]
    },
    {
      label: 'academy.consultation_form.fields.diff_label',
      isLocalizedLabel: true,
      name: 'diff',
      type: 'select',
      required: true,
      value: 'begginer', // Výchozí hodnota
      options: [
        { value: 'begginer', label: 'academy.consultation_form.fields.diff_option_begginer', isLocalizedLabel: true },
        { value: 'advanced', label: 'academy.consultation_form.fields.diff_option_advanced', isLocalizedLabel: true },
        { value: 'expert', label: 'academy.consultation_form.fields.diff_option_expert', isLocalizedLabel: true }
      ]
    },
    {
      label: 'academy.consultation_form.fields.email_label',
      isLocalizedLabel: true,
      name: 'email',
      type: 'email',
      required: true,
      placeholder: 'academy.consultation_form.fields.email_placeholder',
      isLocalizedPlaceholder: true,
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
    },
    {
      label: 'academy.consultation_form.fields.phone_label',
      isLocalizedLabel: true,
      name: 'phone',
      type: 'tel',
      required: false,
      placeholder: 'academy.consultation_form.fields.phone_placeholder',
      isLocalizedPlaceholder: true,
      pattern: '^[0-9\\s\\-+\\(\\)]+$'
    }
  ];

  contactFormConfig: FormFieldConfig[] = [];

  // Statické cesty k ikonám
  timeIcon: string = 'assets/images/icons/curses/time.png';
  calendarIcon: string = 'assets/images/icons/curses/calendar.png';
  onlineIcon: string = 'assets/images/icons/curses/online.png';
  discordIcon: string = 'assets/images/icons/curses/discord.png';
  clientIcon: string = 'assets/images/icons/curses/client.png';
  wwwIcon: string = 'assets/images/icons/curses/www.png';
  databaseIcon: string = 'assets/images/icons/curses/database.png';
  pcIcon: string = 'assets/images/icons/curses/pc.png';
  cmdIcon: string = 'assets/images/icons/curses/cmd.png';
  guiIcon: string = 'assets/images/icons/curses/gui.png';

  // --- Interní proměnné pro timeline před překladem (s klíči) ---
  private initialWebTimelineItems: TimelineItemKeys[] = [
    {
      id: 1,
      titleKey: 'academy.web_development.timeline.1.title',
      contentKey: 'academy.web_development.timeline.1.content',
      themesKeys: [
        'academy.web_development.timeline.1.theme.1',
        'academy.web_development.timeline.1.theme.2',
        'academy.web_development.timeline.1.theme.3',
        'academy.web_development.timeline.1.theme.4',
        'academy.web_development.timeline.1.theme.5',
        'academy.web_development.timeline.1.theme.6'
      ],
      newThingsKeys: [
        { textKey: 'academy.web_development.timeline.1.new_thing.1', icon: 'assets/images/icons/curses/html.png' },
        { textKey: 'academy.web_development.timeline.1.new_thing.2', icon: 'assets/images/icons/curses/css.png' }
      ],
      isActive: false,
    },
    {
      id: 2,
      titleKey: 'academy.web_development.timeline.2.title',
      contentKey: 'academy.web_development.timeline.2.content',
      themesKeys: [
        'academy.web_development.timeline.2.theme.1',
        'academy.web_development.timeline.2.theme.2',
        'academy.web_development.timeline.2.theme.3',
        'academy.web_development.timeline.2.theme.4',
        'academy.web_development.timeline.2.theme.5',
        'academy.web_development.timeline.2.theme.6',
        'academy.web_development.timeline.2.theme.7'
      ],
      newThingsKeys: [
        { textKey: 'academy.web_development.timeline.2.new_thing.1', icon: 'assets/images/icons/curses/js.png' },
        { textKey: 'academy.web_development.timeline.2.new_thing.2', icon: 'assets/images/icons/curses/ts.png' }
      ],
      isActive: false,
    },
    {
      id: 3,
      titleKey: 'academy.web_development.timeline.3.title',
      contentKey: 'academy.web_development.timeline.3.content',
      themesKeys: [
        'academy.web_development.timeline.3.theme.1',
        'academy.web_development.timeline.3.theme.2',
        'academy.web_development.timeline.3.theme.3',
        'academy.web_development.timeline.3.theme.4',
        'academy.web_development.timeline.3.theme.5',
        'academy.web_development.timeline.3.theme.6'
      ],
      newThingsKeys: [
        { textKey: 'academy.web_development.timeline.3.new_thing.1', icon: 'assets/images/icons/curses/php.png' },
        { textKey: 'academy.web_development.timeline.3.new_thing.2', icon: 'assets/images/icons/curses/mysql.png' }
      ],
      isActive: false,
    },
  ];

  private initialDesktopTimelineItems: TimelineItemKeys[] = [
    {
      id: 1,
      titleKey: 'academy.desktop_development.timeline.1.title',
      contentKey: 'academy.desktop_development.timeline.1.content',
      themesKeys: [
        'academy.desktop_development.timeline.1.theme.1',
        'academy.desktop_development.timeline.1.theme.2',
        'academy.desktop_development.timeline.1.theme.3',
        'academy.desktop_development.timeline.1.theme.4',
        'academy.desktop_development.timeline.1.theme.5'
      ],
      newThingsKeys: [
        { textKey: 'academy.desktop_development.timeline.1.new_thing.1', icon: 'assets/images/icons/curses/scratch.png' },
        { textKey: 'academy.desktop_development.timeline.1.new_thing.2', icon: 'assets/images/icons/curses/py.png' }
      ],
      isActive: false,
    },
    {
      id: 2,
      titleKey: 'academy.desktop_development.timeline.2.title',
      contentKey: 'academy.desktop_development.timeline.2.content',
      themesKeys: [
        'academy.desktop_development.timeline.2.theme.1',
        'academy.desktop_development.timeline.2.theme.2',
        'academy.desktop_development.timeline.2.theme.3',
        'academy.desktop_development.timeline.2.theme.4',
        'academy.desktop_development.timeline.2.theme.5'
      ],
      newThingsKeys: [
        { textKey: 'academy.desktop_development.timeline.2.new_thing.1', icon: 'assets/images/icons/curses/csharp.png' },
        { textKey: 'academy.desktop_development.timeline.2.new_thing.2', icon: 'assets/images/icons/curses/mssql.png' }
      ],
      isActive: false,
    },
    {
      id: 3,
      titleKey: 'academy.desktop_development.timeline.3.title',
      contentKey: 'academy.desktop_development.timeline.3.content',
      themesKeys: [
        'academy.desktop_development.timeline.3.theme.1',
        'academy.desktop_development.timeline.3.theme.2',
        'academy.desktop_development.timeline.3.theme.3',
        'academy.desktop_development.timeline.3.theme.4',
        'academy.desktop_development.timeline.3.theme.5',
        'academy.desktop_development.timeline.3.theme.6'
      ],
      newThingsKeys: [
        { textKey: 'academy.desktop_development.timeline.3.new_thing.1', icon: 'assets/images/icons/curses/cpp.png' },
        { textKey: 'academy.desktop_development.timeline.3.new_thing.2', icon: 'assets/images/icons/curses/sqlite.png' }
      ],
      isActive: false,
    },
  ];

  // --- Přeložené proměnné pro timeline (pro HTML) ---
  webTimelineItems: TimelineItem[] = [];
  desktopTimelineItems: TimelineItem[] = [];

  // --- Texty hlaviček sekcí ---
  webDevSectionTitle: string = '';
  desktopDevSectionTitle: string = '';
  webDevSectionDescription: string = '';
  desktopDevSectionDescription: string = '';


  private destroy$ = new Subject<void>();

  constructor(
    private publicDataService: PublicDataService,
    private cdr: ChangeDetectorRef,
    public localizationService: LocalizationService
  ) { }

  ngOnInit(): void {
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadLocalizedContent();
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLocalizedContent(): void {
    // Načtení obecných textů
    this.academyHeader = this.localizationService.getText('academy.header');
    this.second_header = this.localizationService.getText('academy.second_header');

    this.form_closed_title = this.localizationService.getText('academy.form_closed_title');
    this.form_closed_message = this.localizationService.getText('academy.form_closed_message');
    this.introText = this.localizationService.getText('academy.intro_text');
    this.timeHeader = this.localizationService.getText('academy.icons.time');
    this.onlineHeader = this.localizationService.getText('academy.icons.online');
    this.whatHeader = this.localizationService.getText('academy.icons.what'); // Nový klíč
    this.commonDurationHeader = this.localizationService.getText('academy.common.duration_header');
    this.commonThemesHeader = this.localizationService.getText('academy.common.themes_header');
    this.commonNewThingsHeader = this.localizationService.getText('academy.common.new_things_header');

    // Načtení textů pro formulář
    this.form_header = this.localizationService.getText('academy.consultation_form.header');
    this.form_description = this.localizationService.getText('academy.consultation_form.description');
    this.form_button = this.localizationService.getText('academy.consultation_form.button');

    // Načtení textů pro hlavičky sekcí
    this.webDevSectionTitle = this.localizationService.getText('academy.web_development.title');
    this.webDevSectionDescription = this.localizationService.getText('academy.web_development.description');
    this.desktopDevSectionTitle = this.localizationService.getText('academy.desktop_development.title');
    this.desktopDevSectionDescription = this.localizationService.getText('academy.desktop_development.description');

    // Načtení textů pro ceny
    this.priceHeader = this.localizationService.getText('academy.prices.header');
    this.monthlyPaymentHeader = this.localizationService.getText('academy.prices.monthly.header');
    this.monthlyPaymentAmount = this.localizationService.getText('academy.prices.monthly.amount');
    this.monthlyPaymentNote = this.localizationService.getText('academy.prices.monthly.note');
    this.quarterlyPaymentHeader = this.localizationService.getText('academy.prices.quarterly.header');
    this.quarterlyPaymentAmount = this.localizationService.getText('academy.prices.quarterly.amount');
    this.quarterlyPaymentNote = this.localizationService.getText('academy.prices.quarterly.note');
    this.yearlyPaymentHeader = this.localizationService.getText('academy.prices.yearly.header');
    this.yearlyPaymentAmount = this.localizationService.getText('academy.prices.yearly.amount');
    this.yearlyPaymentNote = this.localizationService.getText('academy.prices.yearly.note');


    // Překlad a nastavení contactFormConfig pro GenericFormComponent
    this.contactFormConfig = this.initialContactFormConfig.map(field => {
      const translatedField: FormFieldConfig = { ...field };

      if (field.isLocalizedLabel) {
        translatedField.label = this.localizationService.getText(field.label);
      }
      if (field.isLocalizedPlaceholder && field.placeholder) {
        translatedField.placeholder = this.localizationService.getText(field.placeholder);
      }
      if (field.options && field.options.length > 0) {
        translatedField.options = field.options.map(option => {
          const translatedOption = { ...option };
          if (option.isLocalizedLabel) {
            if (option.label.includes('{age_range}')) {
              let ageRange: string = '';
              switch (option.value) {
                case 'begginer':
                  ageRange = this.localizationService.getText('academy.consultation_form.fields.age_range_begginer');
                  break;
                case 'advanced':
                  ageRange = this.localizationService.getText('academy.consultation_form.fields.age_range_advanced');
                  break;
                case 'expert':
                  ageRange = this.localizationService.getText('academy.consultation_form.fields.age_range_expert');
                  break;
                default:
                  ageRange = '';
              }
              translatedOption.label = this.localizationService.getText(option.label).replace('{age_range}', ageRange);
            } else {
              translatedOption.label = this.localizationService.getText(option.label);
            }
          }
          return translatedOption;
        });
      }
      return translatedField;
    });

    // Překlad a nastavení timeline items
    this.webTimelineItems = this.initialWebTimelineItems.map(item => this.translateTimelineItem(item));
    this.desktopTimelineItems = this.initialDesktopTimelineItems.map(item => this.translateTimelineItem(item));
  }

  private translateTimelineItem(itemKeys: TimelineItemKeys): TimelineItem {
    const translatedItem: TimelineItem = {
      id: itemKeys.id,
      isActive: itemKeys.isActive,
      title: this.localizationService.getText(itemKeys.titleKey),
      content: this.localizationService.getText(itemKeys.contentKey),
      themes: itemKeys.themesKeys.map(key => this.localizationService.getText(key)),
      newThings: itemKeys.newThingsKeys.map(nt => [this.localizationService.getText(nt.textKey), nt.icon])
    };
    return translatedItem;
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

  toggleWebItem(clickedItem: TimelineItem): void {
    clickedItem.isActive = !clickedItem.isActive;
    this.cdr.detectChanges();
  }

  toggleDesktopItem(clickedItem: TimelineItem): void {
    clickedItem.isActive = !clickedItem.isActive;
    this.cdr.detectChanges();
  }
}