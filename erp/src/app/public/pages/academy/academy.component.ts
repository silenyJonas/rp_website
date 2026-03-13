import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Web from '../../../shared/imports/web-providers';
import { GenericFormComponent } from '../../components/generic-form/generic-form.component';
import { TimelineItemKeys } from '../../../shared/interfaces/timeline-item-keys';
import { TimelineItem } from '../../../shared/interfaces/timeline-item';

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
export class AcademyComponent implements Web.OnInit, Web.OnDestroy {
  t: any = null;

  private initialContactFormConfig: Web.FormFieldConfig[] = [
    {
      label: 'academy.consultation_form.fields.theme_label',
      isLocalizedLabel: true,
      name: 'theme',
      type: 'select',
      required: true,
      value: 'desktop-development',
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
      value: 'begginer',
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

  contactFormConfig: Web.FormFieldConfig[] = [];

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

  webTimelineItems: TimelineItem[] = [];
  desktopTimelineItems: TimelineItem[] = [];

  private destroy$ = new Web.Subject<void>();

  constructor(
    private publicDataService: Web.PublicDataService,
    private cdr: ChangeDetectorRef,
    public localizationService: Web.LocalizationService
  ) {}

  ngOnInit(): void {
    this.localizationService.currentTranslations$
      .pipe(Web.takeUntil(this.destroy$))
      .subscribe(translations => {
        if (translations && Object.keys(translations).length > 0) {
          this.t = translations.academy;
          this.loadTranslatedData();
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTranslatedData(): void {
    this.contactFormConfig = this.initialContactFormConfig.map(field => {
      const translatedField: Web.FormFieldConfig = { ...field };

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

    this.webTimelineItems = this.initialWebTimelineItems.map(item => this.translateTimelineItem(item));
    this.desktopTimelineItems = this.initialDesktopTimelineItems.map(item => this.translateTimelineItem(item));
  }

  private translateTimelineItem(itemKeys: TimelineItemKeys): TimelineItem {
    return {
      id: itemKeys.id,
      isActive: itemKeys.isActive,
      title: this.localizationService.getText(itemKeys.titleKey),
      content: this.localizationService.getText(itemKeys.contentKey),
      themes: itemKeys.themesKeys.map(key => this.localizationService.getText(key)),
      newThings: itemKeys.newThingsKeys.map(nt => [this.localizationService.getText(nt.textKey), nt.icon])
    };
  }

  handleFormSubmission(formData: any): void {
    this.publicDataService.submitContactForm(formData).subscribe({
      next: () => {},
      error: (error: Web.HttpErrorResponse) => {}
    });
  }

  handleFormReset(): void {}

  toggleWebItem(clickedItem: TimelineItem): void {
    clickedItem.isActive = !clickedItem.isActive;
    this.cdr.detectChanges();
  }

  toggleDesktopItem(clickedItem: TimelineItem): void {
    clickedItem.isActive = !clickedItem.isActive;
    this.cdr.detectChanges();
  }
}