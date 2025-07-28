// src/app/main-content/services/services.component.ts

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router'; // Přidáno ActivatedRoute

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
export class ServicesComponent implements OnInit {

    form_description: string = 'Navázání spolupráce do 24h';
    form_button: string = 'Rezervovat konzultaci';
    form_header: string = 'Máte nápad ? My máme řešení';

    contactFormConfig: FormFieldConfig[] = [];

    // Přidáme ActivatedRoute do konstruktoru
    constructor(
        private publicDataService: PublicDataService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute // Zde je ActivatedRoute
    ) { }

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
                pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
            },
            {
                label: 'Telefon (nepovinné)',
                name: 'contact_phone',
                type: 'tel',
                required: false,
                placeholder: 'např. +420 123 456 789',
                pattern: '^[0-9\\s\\-+\\(\\)]+$'
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

        // *** NOVÁ LOGIKA PRO ZPRACOVÁNÍ QUERY PARAMETRŮ ***
        this.route.queryParams.subscribe(params => {
            const techIdFromUrl = params['tech'];
            if (techIdFromUrl && this.technologies.some(t => t.id === techIdFromUrl)) {
                this.currentTech = techIdFromUrl;
                // Volitelně můžete aktualizovat i výchozí hodnotu formuláře
                const themaField = this.contactFormConfig.find(field => field.name === 'thema');
                if (themaField) {
                    // Najdeme odpovídající value pro formulář z ID technologie
                    const formValue = this.mapTechIdToFormValue(techIdFromUrl);
                    if (formValue) {
                        themaField.value = formValue;
                    }
                }
            } else {
                // Pokud není platný parametr, zůstane výchozí 'web-dev'
                this.currentTech = 'web-dev';
            }
            this.cdr.detectChanges(); // Vynutí detekci změn po nastavení currentTech
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

    currentTech: string = 'web-dev'; // ID aktuálně vybrané technologie
    technologies: Technology[] = [
        { id: 'web-dev', name: 'Webový vývoj' },
        { id: 'desktop-dev', name: 'Desktopový vývoj' },
        { id: 'mobile-dev', name: 'Mobilní vývoj' },
        { id: 'ai-dev', name: 'AI vývoj' }
    ];

    // Pomocná metoda pro mapování ID technologie na hodnotu pro formulář
    private mapTechIdToFormValue(techId: string): string | undefined {
        switch (techId) {
            case 'web-dev': return 'web-development';
            case 'desktop-dev': return 'desktop-development';
            case 'mobile-dev': return 'mobile-development';
            case 'ai-dev': return 'ai-development';
            default: return undefined;
        }
    }

    webServices: Item[] = [
        { id: 1, question: 'Vývoj na míru', answer: 'Tvoříme jedinečná webová řešení přesně podle vašich potřeb a cílů, od začátku do konce.', isActive: false },
        { id: 2, question: 'Responzivní design', answer: 'Zaručujeme perfektní zobrazení a funkčnost na všech zařízeních – desktop, tablet i mobil.', isActive: false },
        { id: 3, question: 'Optimalizace pro vyhledávače (SEO)', answer: 'Implementujeme nejlepší praktiky SEO přímo do kódu pro lepší viditelnost ve vyhledávačích.', isActive: false },
        { id: 4, question: 'Integrace API a externích služeb', answer: 'Bezproblémové propojení s platebními bránami, CRM systémy, sociálními sítěmi a dalšími nástroji.', isActive: false },
        { id: 5, question: 'Intuitivní Redakční systémy (CMS)', answer: 'Umožníme vám snadnou správu obsahu webu bez technických znalostí.', isActive: false },
        { id: 6, question: 'Vysoká bezpečnost', answer: 'Chráníme vaše data a uživatele pomocí moderních bezpečnostních protokolů a postupů.', isActive: false },
        { id: 7, question: 'Škálovatelnost a výkon', answer: 'Navrhujeme systémy, které zvládnou růst vaší návštěvnosti a budoucí rozšíření funkcí.', isActive: false },
        { id: 8, question: 'Interaktivní uživatelské rozhraní (UI/UX)', answer: 'Zaměřujeme se na plynulé a příjemné používání pro vaše klienty.', isActive: false },
        { id: 9, question: 'Pravidelná údržba a podpora', answer: 'Zajišťujeme dlouhodobou funkčnost a aktualizaci vašeho webového řešení.', isActive: false }
    ];
    webTechImages: any[] = [
        { name: 'C#', path: 'assets/images/services-img/csharp.png' },
        { name: 'TypeScript', path: 'assets/images/services-img/ts.png' },
        { name: 'Java', path: 'assets/images/services-img/java.png' },
        { name: 'Python', path: 'assets/images/services-img/py.png' },
        { name: 'PHP', path: 'assets/images/services-img/php.png' },
        { name: 'PostgreSQL', path: 'assets/images/services-img/postgresql.png' },
    ]
    desktopServices: Item[] = [
        { id: 1, question: 'Aplikace na míru', answer: 'Vyvíjíme desktopové aplikace přesně podle vašich specifických požadavků a firemních procesů.', isActive: false },
        { id: 2, question: 'Vysoký výkon a stabilita', answer: 'Zaměřujeme se na optimalizaci a robustní architekturu pro bezproblémový chod.', isActive: false },
        { id: 3, question: 'Intuitivní uživatelské rozhraní (UI/UX)', answer: 'Navrhujeme aplikace, které jsou snadno použitelné a maximalizují efektivitu práce.', isActive: false },
        { id: 4, question: 'Integrace s hardwarem a systémy', answer: 'Možnost propojení s periferiemi, databázemi a jinými firemními systémy.', isActive: false },
        { id: 5, question: 'Offline funkcionalita', answer: 'Aplikace mohou fungovat i bez stálého připojení k internetu, což zvyšuje flexibilitu.', isActive: false },
        { id: 6, question: 'Vylepšená bezpečnost dat', answer: 'Implementujeme silné šifrování a bezpečnostní protokoly pro ochranu citlivých informací.', isActive: false },
        { id: 7, question: 'Pravidelné aktualizace a podpora', answer: 'Zajišťujeme dlouhodobou údržbu, aktualizace a technickou podporu.', isActive: false },
        { id: 8, question: 'Multiplatformní řešení', answer: 'Možnost vývoje pro Windows, macOS nebo Linux podle vašich potřeb.', isActive: false },
        { id: 9, question: 'Správa licencí a distribuce', answer: 'Pomoc s nastavením distribuce a licenčního modelu pro vaši aplikaci.', isActive: false }
    ];
    desktopTechImages: any[] = [
        { name: 'C#', path: 'assets/images/services-img/csharp.png' },
        { name: 'C++', path: 'assets/images/services-img/cpp.png' },
        { name: 'Java', path: 'assets/images/services-img/java.png' },
        { name: 'Python', path: 'assets/images/services-img/py.png' },
        { name: 'SQLite', path: 'assets/images/services-img/sqlite.png' },
        { name: 'PostgreSQL', path: 'assets/images/services-img/postgresql.png' },
    ]
    mobileServices: Item[] = [
        { id: 1, question: 'Aplikace pro veřejnost i interní potřeby', answer: 'Vývoj komerčních aplikací pro App Store/Google Play i specializovaných firemních řešení (např. mobilní CRM, správu procesů).', isActive: false },
        { id: 2, question: 'Nativní vývoj', answer: 'Využíváme plný potenciál iOS a Android platforem pro maximální výkon a uživatelský zážitek.', isActive: false },
        { id: 3, question: 'Cross-platform vývoj', answer: 'Efektivní řešení s jedním kódem pro iOS i Android, které šetří čas a náklady.', isActive: false },
        { id: 4, question: 'Intuitivní UI/UX design', answer: 'Zaměřujeme se na jednoduché a poutavé rozhraní, které uživatelé milují.', isActive: false },
        { id: 5, question: 'Integrace s cloudovými službami a API', answer: 'Bezproblémové propojení s externími daty, službami a backendem.', isActive: false },
        { id: 6, question: 'Push notifikace', answer: 'Implementace pro efektivní komunikaci s uživateli a udržení jejich angažovanosti.', isActive: false },
        { id: 7, question: 'Offline režim', answer: 'Funkčnost aplikace i bez připojení k internetu pro lepší dostupnost v terénu.', isActive: false },
        { id: 8, question: 'Optimalizace výkonu a spotřeby baterie', answer: 'Zajišťujeme, že vaše aplikace běží hladce a šetří energii zařízení.', isActive: false },
        { id: 9, question: 'Bezpečnost dat a uživatelů', answer: 'Prioritizujeme ochranu citlivých informací a soukromí, důležité pro veřejné i firemní aplikace.', isActive: false },
        { id: 10, question: 'Nasazení a distribuce', answer: 'Pomoc s celým procesem od přípravy až po schválení a vydání (veřejné obchody) nebo interní distribuci v rámci firmy.', isActive: false }
    ];
    mobileTechImages: any[] = [
        { name: 'C#', path: 'assets/images/services-img/csharp.png' },
        { name: 'TypeScript', path: 'assets/images/services-img/ts.png' },
        { name: 'Swift', path: 'assets/images/services-img/swift.png' },
        { name: 'Kotlin', path: 'assets/images/services-img/kotlin.png' },
        { name: 'SQLite', path: 'assets/images/services-img/sqlite.png' },
        { name: 'PostgreSQL', path: 'assets/images/services-img/postgresql.png' },
    ]
    aiServices: Item[] = [
        { id: 1, question: 'Integrace AI API', answer: 'Propojíme vaše systémy s předními AI službami (např. rozpoznávání řeči, analýza obrazu, NLP, generování textu).', isActive: false },
        { id: 2, question: 'Inteligentní automatizace', answer: 'Zefektivnění opakujících se úkolů a rozhodovacích procesů pomocí chytrých algoritmů.', isActive: false },
        { id: 3, question: 'Chatboti a asistenti', answer: 'Implementace inteligentních chatbotů pro vylepšení zákaznické podpory a interní komunikace.', isActive: false },
        { id: 4, question: 'Personalizace a doporučení', answer: 'Využití AI pro dynamické přizpůsobení obsahu a služeb uživatelům, zvyšující angažovanost.', isActive: false },
        { id: 5, question: 'Prediktivní analýza', answer: 'Přesné předpovídání budoucích trendů a chování zákazníků pro optimalizaci strategií.', isActive: false },
        { id: 6, question: 'Zlepšení efektivity', answer: 'Identifikace úzkých hrdel a optimalizace pracovních postupů pro snížení nákladů.', isActive: false },
        { id: 7, question: 'Optimalizace vyhledávání', answer: 'Chytré vyhledávací funkce a automatické kategorizování obsahu pro lepší dostupnost informací.', isActive: false },
        { id: 8, question: 'Analýza dat s AI', answer: 'Transformace komplexních dat na srozumitelné vhledy pro strategické rozhodování.', isActive: false },
        { id: 9, question: 'Bezpečnost a etika AI', answer: 'Důraz na zodpovědné a bezpečné nasazení AI řešení s ohledem na ochranu dat.', isActive: false },
        { id: 10, question: 'Školení a podpora', answer: 'Poskytujeme školení a nepřetržitou podporu pro hladký chod AI řešení.', isActive: false }
    ];
    aiTechImages: any[] = [
        { name: 'C++', path: 'assets/images/services-img/cpp.png' },
        { name: 'Python', path: 'assets/images/services-img/py.png' },
        { name: 'Java', path: 'assets/images/services-img/java.png' },
        { name: 'JavaScript', path: 'assets/images/services-img/js.png' },
        { name: 'Rust', path: 'assets/images/services-img/rust.png' },
        { name: 'Go', path: 'assets/images/services-img/go.png' },
    ]

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