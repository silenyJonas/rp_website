import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocalizationService } from '../../services/localization.service';

import { GenericFormComponent } from '../../components/generic-form/generic-form.component';
import { FormFieldConfig } from '../../../shared/interfaces/form-field-config';
import { FormsModule } from '@angular/forms';
import { PublicDataService } from '../../services/public-data.service';
import { HttpErrorResponse } from '@angular/common/http';

interface Technology {
    id: string;
    name: string;
}
interface Item {
    id: number;
    question: string;
    answer: string;
    isActive: boolean;
}

@Component({
    selector: 'app-main-content',
    standalone: true,
    imports: [CommonModule, RouterLink, GenericFormComponent, FormsModule],
    templateUrl: './services.component.html',
    styleUrls: ['./services.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesComponent implements OnInit, OnDestroy {

    // Localization keys for form headers and descriptions
    form_description: string = '';
    form_button: string = '';
    form_header: string = '';

    contactFormConfig: FormFieldConfig[] = [];
    private destroy$ = new Subject<void>();

    // Localization keys for main section headers
    header_1_text: string = '';
    web_dev_header: string = '';
    desktop_dev_header: string = '';
    mobile_dev_header: string = '';
    ai_dev_header: string = '';


    colab_procces_header: string = '';
    prices_header: string = '';
    show_projects_header: string = '';
    projects_button_text: string = '';

    info_header_web: string = '';
    info_header_desktop: string = '';
    info_header_mobile: string = '';
    info_header_ai: string = '';

    info_header_1: string = '';
    info_header_2: string = '';
    info_header_3: string = '';

    colab_header_1: string = '';
    colab_text_1: string = '';

    colab_header_2: string = '';
    colab_text_2: string = '';

    colab_header_3: string = '';
    colab_text_3: string = '';

    colab_header_4: string = '';
    colab_text_4: string = '';

    services_preffix: string = '';
    services_currency: string = '';

    service_header_1: string = '';
    service_price_1: string = '';
    service_message_1: string = '';

    service_header_2: string = '';
    service_price_2: string = '';
    service_message_2: string = '';

    service_header_3: string = '';
    service_price_3: string = '';
    service_message_3: string = '';

    service_header_4: string = '';
    service_price_4: string = '';
    service_message_4: string = '';

    service_header_5: string = '';
    service_price_5: string = '';
    service_message_5: string = '';

    service_header_6: string = '';
    service_price_6: string = '';

    service_main_text_1_html: string = '';
    service_main_text_2_html: string = '';
    service_main_text_3_html: string = '';
    service_main_text_4_html: string = '';

    currentTech: string = 'web-dev';
    technologies: Technology[] = []; // Initialized as empty, populated after translations load

    webServices: Item[] = [];
    desktopServices: Item[] = [];
    mobileServices: Item[] = [];
    aiServices: Item[] = [];

    // Technology images paths - these are fixed and not localized
    webTechImages: any[] = [
        { name: 'C#', path: 'assets/images/services-img/csharp.png' },
        { name: 'TypeScript', path: 'assets/images/services-img/ts.png' },
        { name: 'Java', path: 'assets/images/services-img/java.png' },
        { name: 'Python', path: 'assets/images/services-img/py.png' },
        { name: 'PHP', path: 'assets/images/services-img/php.png' },
        { name: 'PostgreSQL', path: 'assets/images/services-img/postgresql.png' },
    ];
    desktopTechImages: any[] = [
        { name: 'C#', path: 'assets/images/services-img/csharp.png' },
        { name: 'C++', path: 'assets/images/services-img/cpp.png' },
        { name: 'Java', path: 'assets/images/services-img/java.png' },
        { name: 'Python', path: 'assets/images/services-img/py.png' },
        { name: 'SQLite', path: 'assets/images/services-img/sqlite.png' },
        { name: 'PostgreSQL', path: 'assets/images/services-img/postgresql.png' },
    ];
    mobileTechImages: any[] = [
        { name: 'C#', path: 'assets/images/services-img/csharp.png' },
        { name: 'TypeScript', path: 'assets/images/services-img/ts.png' },
        { name: 'Swift', path: 'assets/images/services-img/swift.png' },
        { name: 'Kotlin', path: 'assets/images/services-img/kotlin.png' },
        { name: 'SQLite', path: 'assets/images/services-img/sqlite.png' },
        { name: 'PostgreSQL', path: 'assets/images/services-img/postgresql.png' },
    ];
    aiTechImages: any[] = [
        { name: 'C++', path: 'assets/images/services-img/cpp.png' },
        { name: 'Python', path: 'assets/images/services-img/py.png' },
        { name: 'Java', path: 'assets/images/services-img/java.png' },
        { name: 'JavaScript', path: 'assets/images/services-img/js.png' },
        { name: 'Rust', path: 'assets/images/services-img/rust.png' },
        { name: 'Go', path: 'assets/images/services-img/go.png' },
    ];


    constructor(
        private publicDataService: PublicDataService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private localizationService: LocalizationService
    ) { }

    ngOnInit(): void {
        // Subscribe to translations to populate all localized texts
        this.localizationService.currentTranslations$
            .pipe(takeUntil(this.destroy$))
            .subscribe(translations => {
                if (translations) {
                    
                      // NEW: Populate main service texts with HTML
                    this.service_main_text_1_html = this.localizationService.getText('services.service_main_text_1');
                    this.service_main_text_2_html = this.localizationService.getText('services.service_main_text_2');
                    this.service_main_text_3_html = this.localizationService.getText('services.service_main_text_3');
                    this.service_main_text_4_html = this.localizationService.getText('services.service_main_text_4');


                    this.info_header_web= this.localizationService.getText('services.info_header_web');
                    this.info_header_desktop= this.localizationService.getText('services.info_header_desktop');
                    this.info_header_mobile= this.localizationService.getText('services.info_header_mobile');
                    this.info_header_ai= this.localizationService.getText('services.info_header_ai');
                    
                    this.info_header_1 = this.localizationService.getText('services.info_header_1');
                    this.info_header_2 = this.localizationService.getText('services.info_header_2');
                    this.info_header_3 = this.localizationService.getText('services.info_header_3');
                    
                    this.services_preffix = this.localizationService.getText('services.services.text_preffix');
                    this.services_currency = this.localizationService.getText('services.services.currency');
                    
                    this.service_header_1 = this.localizationService.getText('services.services.item_1.header');
                    this.service_price_1 = this.localizationService.getText('services.services.item_1.price');
                    this.service_message_1 = this.localizationService.getText('services.services.item_1.message');

                    this.service_header_2 = this.localizationService.getText('services.services.item_2.header');
                    this.service_price_2 = this.localizationService.getText('services.services.item_2.price');
                    this.service_message_2 = this.localizationService.getText('services.services.item_2.message');

                    this.service_header_3 = this.localizationService.getText('services.services.item_3.header');
                    this.service_price_3 = this.localizationService.getText('services.services.item_3.price');
                    this.service_message_3 = this.localizationService.getText('services.services.item_3.message');

                    this.service_header_4 = this.localizationService.getText('services.services.item_4.header');
                    this.service_price_4 = this.localizationService.getText('services.services.item_4.price');
                    this.service_message_4 = this.localizationService.getText('services.services.item_4.message');

                    this.service_header_5 = this.localizationService.getText('services.services.item_5.header');
                    this.service_price_5 = this.localizationService.getText('services.services.item_5.price');
                    this.service_message_5 = this.localizationService.getText('services.services.item_5.message');

                    this.service_header_6 = this.localizationService.getText('services.services.item_6.header');
                    this.service_price_6 = this.localizationService.getText('services.services.item_6.price');

                    // Update form headers and descriptions
                    this.form_description = this.localizationService.getText('services.form_description');
                    this.form_button = this.localizationService.getText('services.form_button');
                    this.form_header = this.localizationService.getText('services.form_header');

                    // Update main section headers
                    this.header_1_text = this.localizationService.getText('services.header_1_text');
                    this.web_dev_header = this.localizationService.getText('services.web_dev_header');
                    this.desktop_dev_header = this.localizationService.getText('services.desktop_dev_header');
                    this.mobile_dev_header = this.localizationService.getText('services.mobile_dev_header');

                    this.ai_dev_header = this.localizationService.getText('services.ai_dev_header');

                    this.colab_procces_header = this.localizationService.getText('services.colab.colab_procces_header');
                    this.prices_header = this.localizationService.getText('services.services.prices_header');
                    this.show_projects_header = this.localizationService.getText('services.show_projects_header');

                    this.projects_button_text = this.localizationService.getText('services.projects_button_text');

                    this.colab_header_1 = this.localizationService.getText('services.colab.item_1.header')
                    this.colab_text_1 = this.localizationService.getText('services.colab.item_1.text')
                    this.colab_header_2 = this.localizationService.getText('services.colab.item_2.header')
                    this.colab_text_2 = this.localizationService.getText('services.colab.item_2.text')
                    this.colab_header_3 = this.localizationService.getText('services.colab.item_3.header')
                    this.colab_text_3 = this.localizationService.getText('services.colab.item_3.text')
                    this.colab_header_4 = this.localizationService.getText('services.colab.item_4.header')
                    this.colab_text_4 = this.localizationService.getText('services.colab.item_4.text')

                    // Populate technologies array with localized names
                    this.technologies = [
                        { id: 'web-dev', name: this.web_dev_header },
                        { id: 'desktop-dev', name: this.desktop_dev_header },
                        { id: 'mobile-dev', name: this.mobile_dev_header },
                        { id: 'ai-dev', name: this.ai_dev_header }
                    ];

                    // Populate form configuration with localized labels and placeholders
                    this.contactFormConfig = [
                        {
                            label: this.localizationService.getText('services.contact_form.thema_label'),
                            name: 'thema',
                            type: 'select',
                            required: true,
                            value: 'web-development', // Default value
                            options: [
                                { value: 'web-development', label: this.localizationService.getText('services.contact_form.web_development_label') },
                                { value: 'desktop-development', label: this.localizationService.getText('services.contact_form.desktop_development_label') },
                                { value: 'mobile-development', label: this.localizationService.getText('services.contact_form.mobile_development_label') },
                                { value: 'ai-development', label: this.localizationService.getText('services.contact_form.ai_development_label') },
                                { value: 'other', label: this.localizationService.getText('services.contact_form.other_label') }
                            ]
                        },
                        {
                            label: this.localizationService.getText('services.contact_form.email_label'),
                            name: 'contact_email',
                            type: 'email',
                            required: true,
                            placeholder: this.localizationService.getText('services.contact_form.email_placeholder'),
                            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
                        },
                        {
                            label: this.localizationService.getText('services.contact_form.phone_label'),
                            name: 'contact_phone',
                            type: 'tel',
                            required: false,
                            placeholder: this.localizationService.getText('services.contact_form.phone_placeholder'),
                            pattern: '^[0-9\\s\\-+\\(\\)]+$'
                        },
                        {
                            label: this.localizationService.getText('services.contact_form.order_description_label'),
                            name: 'order_description',
                            type: 'textarea',
                            required: true,
                            rows: 5,
                            placeholder: this.localizationService.getText('services.contact_form.order_description_placeholder')
                        }
                    ];

                    // Populate FAQ sections with localized questions and answers
                    this.webServices = [
                        { id: 1, question: this.localizationService.getText('services.webServices.item1.question'), answer: this.localizationService.getText('services.webServices.item1.answer'), isActive: false },
                        { id: 2, question: this.localizationService.getText('services.webServices.item2.question'), answer: this.localizationService.getText('services.webServices.item2.answer'), isActive: false },
                        { id: 3, question: this.localizationService.getText('services.webServices.item3.question'), answer: this.localizationService.getText('services.webServices.item3.answer'), isActive: false },
                        { id: 4, question: this.localizationService.getText('services.webServices.item4.question'), answer: this.localizationService.getText('services.webServices.item4.answer'), isActive: false },
                        { id: 5, question: this.localizationService.getText('services.webServices.item5.question'), answer: this.localizationService.getText('services.webServices.item5.answer'), isActive: false },
                        { id: 6, question: this.localizationService.getText('services.webServices.item6.question'), answer: this.localizationService.getText('services.webServices.item6.answer'), isActive: false },
                        { id: 7, question: this.localizationService.getText('services.webServices.item7.question'), answer: this.localizationService.getText('services.webServices.item7.answer'), isActive: false },
                        { id: 8, question: this.localizationService.getText('services.webServices.item8.question'), answer: this.localizationService.getText('services.webServices.item8.answer'), isActive: false },
                        { id: 9, question: this.localizationService.getText('services.webServices.item9.question'), answer: this.localizationService.getText('services.webServices.item9.answer'), isActive: false }
                    ];

                    this.desktopServices = [
                        { id: 1, question: this.localizationService.getText('services.desktopServices.item1.question'), answer: this.localizationService.getText('services.desktopServices.item1.answer'), isActive: false },
                        { id: 2, question: this.localizationService.getText('services.desktopServices.item2.question'), answer: this.localizationService.getText('services.desktopServices.item2.answer'), isActive: false },
                        { id: 3, question: this.localizationService.getText('services.desktopServices.item3.question'), answer: this.localizationService.getText('services.desktopServices.item3.answer'), isActive: false },
                        { id: 4, question: this.localizationService.getText('services.desktopServices.item4.question'), answer: this.localizationService.getText('services.desktopServices.item4.answer'), isActive: false },
                        { id: 5, question: this.localizationService.getText('services.desktopServices.item5.question'), answer: this.localizationService.getText('services.desktopServices.item5.answer'), isActive: false },
                        { id: 6, question: this.localizationService.getText('services.desktopServices.item6.question'), answer: this.localizationService.getText('services.desktopServices.item6.answer'), isActive: false },
                        { id: 7, question: this.localizationService.getText('services.desktopServices.item7.question'), answer: this.localizationService.getText('services.desktopServices.item7.answer'), isActive: false },
                        { id: 8, question: this.localizationService.getText('services.desktopServices.item8.question'), answer: this.localizationService.getText('services.desktopServices.item8.answer'), isActive: false },
                        { id: 9, question: this.localizationService.getText('services.desktopServices.item9.question'), answer: this.localizationService.getText('services.desktopServices.item9.answer'), isActive: false }
                    ];

                    this.mobileServices = [
                        { id: 1, question: this.localizationService.getText('services.mobileServices.item1.question'), answer: this.localizationService.getText('services.mobileServices.item1.answer'), isActive: false },
                        { id: 2, question: this.localizationService.getText('services.mobileServices.item2.question'), answer: this.localizationService.getText('services.mobileServices.item2.answer'), isActive: false },
                        { id: 3, question: this.localizationService.getText('services.mobileServices.item3.question'), answer: this.localizationService.getText('services.mobileServices.item3.answer'), isActive: false },
                        { id: 4, question: this.localizationService.getText('services.mobileServices.item4.question'), answer: this.localizationService.getText('services.mobileServices.item4.answer'), isActive: false },
                        { id: 5, question: this.localizationService.getText('services.mobileServices.item5.question'), answer: this.localizationService.getText('services.mobileServices.item5.answer'), isActive: false },
                        { id: 6, question: this.localizationService.getText('services.mobileServices.item6.question'), answer: this.localizationService.getText('services.mobileServices.item6.answer'), isActive: false },
                        { id: 7, question: this.localizationService.getText('services.mobileServices.item7.question'), answer: this.localizationService.getText('services.mobileServices.item7.answer'), isActive: false },
                        { id: 8, question: this.localizationService.getText('services.mobileServices.item8.question'), answer: this.localizationService.getText('services.mobileServices.item8.answer'), isActive: false },
                        { id: 9, question: this.localizationService.getText('services.mobileServices.item9.question'), answer: this.localizationService.getText('services.mobileServices.item9.answer'), isActive: false },
                        { id: 10, question: this.localizationService.getText('services.mobileServices.item10.question'), answer: this.localizationService.getText('services.mobileServices.item10.answer'), isActive: false }
                    ];

                    this.aiServices = [
                        { id: 1, question: this.localizationService.getText('services.aiServices.item1.question'), answer: this.localizationService.getText('services.aiServices.item1.answer'), isActive: false },
                        { id: 2, question: this.localizationService.getText('services.aiServices.item2.question'), answer: this.localizationService.getText('services.aiServices.item2.answer'), isActive: false },
                        { id: 3, question: this.localizationService.getText('services.aiServices.item3.question'), answer: this.localizationService.getText('services.aiServices.item3.answer'), isActive: false },
                        { id: 4, question: this.localizationService.getText('services.aiServices.item4.question'), answer: this.localizationService.getText('services.aiServices.item4.answer'), isActive: false },
                        { id: 5, question: this.localizationService.getText('services.aiServices.item5.question'), answer: this.localizationService.getText('services.aiServices.item5.answer'), isActive: false },
                        { id: 6, question: this.localizationService.getText('services.aiServices.item6.question'), answer: this.localizationService.getText('services.aiServices.item6.answer'), isActive: false },
                        { id: 7, question: this.localizationService.getText('services.aiServices.item7.question'), answer: this.localizationService.getText('services.aiServices.item7.answer'), isActive: false },
                        { id: 8, question: this.localizationService.getText('services.aiServices.item8.question'), answer: this.localizationService.getText('services.aiServices.item8.answer'), isActive: false },
                        { id: 9, question: this.localizationService.getText('services.aiServices.item9.question'), answer: this.localizationService.getText('services.aiServices.item9.answer'), isActive: false },
                        { id: 10, question: this.localizationService.getText('services.aiServices.item10.question'), answer: this.localizationService.getText('services.aiServices.item10.answer'), isActive: false }
                    ];

                    // Trigger change detection after all localized texts are set
                    this.cdr.detectChanges();
                }
            });

        // Query params logic depends on `technologies` array, so it should be processed
        // *after* the `technologies` array is populated by the localization subscription.
        // The `queryParams` observable will still emit if URL changes later.
        this.route.queryParams.pipe(
            takeUntil(this.destroy$) // Ensure unsubscription
        ).subscribe(params => {
            const techIdFromUrl = params['tech'];
            // Check if technologies array is populated before checking for existence
            if (techIdFromUrl && this.technologies.length > 0 && this.technologies.some(t => t.id === techIdFromUrl)) {
                this.currentTech = techIdFromUrl;
                const themaField = this.contactFormConfig.find(field => field.name === 'thema');
                if (themaField) {
                    const formValue = this.mapTechIdToFormValue(techIdFromUrl);
                    if (formValue) {
                        themaField.value = formValue;
                    }
                }
            } else {
                this.currentTech = 'web-dev';
            }
            this.cdr.detectChanges(); // Trigger change detection for currentTech updates
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
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

    private mapTechIdToFormValue(techId: string): string | undefined {
        switch (techId) {
            case 'web-dev': return 'web-development';
            case 'desktop-dev': return 'desktop-development';
            case 'mobile-dev': return 'mobile-development';
            case 'ai-dev': return 'ai-development';
            default: return undefined;
        }
    }

    toggleFaq(clickedItem: Item): void {
        clickedItem.isActive = !clickedItem.isActive;
    }

    selectTech(techId: string): void {
        if (this.currentTech !== techId) {
            this.currentTech = techId;
            this.cdr.detectChanges();
        }
    }
}