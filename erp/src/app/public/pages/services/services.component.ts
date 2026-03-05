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
    // Jediná proměnná pro veškerý lokalizovaný obsah
    s: any = null;

    contactFormConfig: FormFieldConfig[] = [];
    private destroy$ = new Subject<void>();

    currentTech: string = 'web-dev';
    technologies: Technology[] = [];

    // Statické konfigurace obrázků (nemění se překladem)
    webTechImages = [
        { name: 'C#', path: 'assets/images/services-img/csharp.png' },
        { name: 'TypeScript', path: 'assets/images/services-img/ts.png' },
        { name: 'PHP', path: 'assets/images/services-img/php.png' },
        { name: 'PostgreSQL', path: 'assets/images/services-img/postgresql.png' },
    ];
    desktopTechImages = [
        { name: 'C#', path: 'assets/images/services-img/csharp.png' },
        { name: 'C++', path: 'assets/images/services-img/cpp.png' },
        { name: 'Python', path: 'assets/images/services-img/py.png' },
        { name: 'SQLite', path: 'assets/images/services-img/sqlite.png' },
    ];
    mobileTechImages = [
        { name: 'C#', path: 'assets/images/services-img/csharp.png' },
        { name: 'TypeScript', path: 'assets/images/services-img/ts.png' },
        { name: 'Kotlin', path: 'assets/images/services-img/kotlin.png' },
        { name: 'SQLite', path: 'assets/images/services-img/sqlite.png' },
    ];
    aiTechImages = [
        { name: 'C++', path: 'assets/images/services-img/cpp.png' },
        { name: 'Python', path: 'assets/images/services-img/py.png' },
        { name: 'Rust', path: 'assets/images/services-img/rust.png' },
    ];

    constructor(
        private publicDataService: PublicDataService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private localizationService: LocalizationService
    ) { }

    ngOnInit(): void {
        this.localizationService.currentTranslations$
            .pipe(takeUntil(this.destroy$))
            .subscribe(translations => {
                if (translations && translations.services) {
                    this.s = translations.services;

                    // Inicializace technologií pro přepínač
                    this.technologies = [
                        { id: 'web-dev', name: this.s.web_dev_header },
                        { id: 'desktop-dev', name: this.s.desktop_dev_header },
                        { id: 'mobile-dev', name: this.s.mobile_dev_header },
                        { id: 'ai-dev', name: this.s.ai_dev_header }
                    ];

                    // Sestavení konfigurace formuláře
                    this.buildFormConfig();

                    this.cdr.detectChanges();
                }
            });

        // Logika pro Query parametry (tech)
        this.route.queryParams.pipe(
            takeUntil(this.destroy$)
        ).subscribe(params => {
            const techIdFromUrl = params['tech'];
            if (techIdFromUrl && this.technologies.some(t => t.id === techIdFromUrl)) {
                this.currentTech = techIdFromUrl;
                this.updateFormThema(techIdFromUrl);
            } else {
                this.currentTech = 'web-dev';
            }
            this.cdr.detectChanges();
        });
    }

    private buildFormConfig(): void {
        if (!this.s) return;
        this.contactFormConfig = [
            {
                label: this.s.contact_form.thema_label,
                name: 'thema',
                type: 'select',
                required: true,
                value: 'Webový vývoj',
                options: [
                    { value: 'Webový vývoj', label: this.s.contact_form.web_development_label },
                    { value: 'Desktopový vývoj', label: this.s.contact_form.desktop_development_label },
                    { value: 'Mobilní vývoj', label: this.s.contact_form.mobile_development_label },
                    { value: 'AI vývoj', label: this.s.contact_form.ai_development_label },
                    { value: 'Jiné', label: this.s.contact_form.other_label }
                ]
            },
            {
                label: this.s.contact_form.email_label,
                name: 'contact_email',
                type: 'email',
                required: true,
                placeholder: this.s.contact_form.email_placeholder,
                pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
            },
            {
                label: this.s.contact_form.phone_label,
                name: 'contact_phone',
                type: 'tel',
                required: false,
                placeholder: this.s.contact_form.phone_placeholder,
                pattern: '^[0-9\\s\\-+\\(\\)]+$'
            },
            {
                label: this.s.contact_form.order_description_label,
                name: 'order_description',
                type: 'textarea',
                required: true,
                rows: 5,
                placeholder: this.s.contact_form.order_description_placeholder
            }
        ];
    }

    private updateFormThema(techId: string): void {
        const themaField = this.contactFormConfig.find(field => field.name === 'thema');
        if (themaField) {
            const formValue = this.mapTechIdToFormValue(techId);
            if (formValue) themaField.value = formValue;
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    handleFormSubmission(formData: any): void {
        this.publicDataService.submitContactForm(formData).subscribe({
            next: () => {},
            error: (error: HttpErrorResponse) => {}
        });
    }

    handleFormReset(): void {}

    private mapTechIdToFormValue(techId: string): string | undefined {
        switch (techId) {
            case 'web-dev': return 'Webový vývoj';
            case 'desktop-dev': return 'Desktopový vývoj';
            case 'mobile-dev': return 'Mobilní vývoj';
            case 'ai-dev': return 'AI vývoj';
            default: return undefined;
        }
    }

    toggleFaq(clickedItem: Item): void {
        clickedItem.isActive = !clickedItem.isActive;
    }

    selectTech(techId: string): void {
        if (this.currentTech !== techId) {
            this.currentTech = techId;
            this.updateFormThema(techId);
            this.cdr.detectChanges();
        }
    }
}