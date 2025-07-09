// faq.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Stále potřeba pro *ngFor a [ngClass]

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  isActive: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css',
  // Pole 'animations' zde zcela odstraňte, už ho nepotřebujeme
})
export class FaqComponent implements OnInit {

  ig_icon:string = 'assets/images/icons/ig.png'
  fb_icon:string = 'assets/images/icons/fb.png'

  faqItems: FaqItem[] = [
    { id: 1, question: 'Co všechno umíte vyvinout?', answer: 'Specializujeme se na širokou škálu vývoje, včetně **webových aplikací**, responzivních webových stránek, e-shopů, mobilních aplikací (iOS/Android) a custom softwarových řešení na míru. Ať už potřebujete cokoliv, najdeme efektivní řešení.', isActive: false },
    { id: 2, question: 'Jak dlouho trvá vývoj webové stránky?', answer: 'Délka vývoje závisí na komplexnosti projektu. Jednoduchá prezentační webová stránka může být hotová za **2-4 týdny**, zatímco rozsáhlejší e-shop nebo webová aplikace může trvat **2-4 měsíce** i déle. Vždy vám poskytneme realistický odhad po úvodní konzultaci.', isActive: false },
    { id: 3, question: 'Nabízíte i údržbu a podporu po spuštění?', answer: 'Ano, samozřejmě! Poskytujeme **komplexní poprodejní podporu a údržbu**, která zahrnuje pravidelné aktualizace, bezpečnostní záplaty, monitorování výkonu a technickou podporu. Chceme, aby váš projekt dlouhodobě fungoval bez problémů.', isActive: false },
    { id: 4, question: 'Jak probíhá proces spolupráce?', answer: 'Naše spolupráce začíná **úvodní konzultací**, kde probereme vaše potřeby a vizi. Následuje fáze plánování a návrhu, poté samotný vývoj, testování a nakonec spuštění. Po celou dobu vás budeme aktivně informovat o průběhu a zapojovat do rozhodování.', isActive: false },
    { id: 5, question: 'Jaké technologie používáte?', answer: 'Používáme moderní a ověřené technologie. Pro frontend to jsou například **Angular, React, Vue.js**, pro backend **Node.js, Python (Django/Flask)**, databáze jako **PostgreSQL, MongoDB** a cloudové platformy. Vždy vybíráme ty nejvhodnější nástroje pro váš konkrétní projekt.', isActive: false },
    { id: 6, question: 'Můžete mi pomoci s SEO optimalizací?', answer: 'Ano, SEO optimalizace je nedílnou součástí našich služeb. Už během vývoje dbáme na technické SEO (rychlost načítání, mobilní responzivita, struktura kódu) a po spuštění vám můžeme nabídnout i **obsahovou optimalizaci a strategii budování odkazů**, abyste dosáhli lepších pozic ve vyhledávačích.', isActive: false }
  ];

  constructor() { }
  ngOnInit(): void { }
  toggleFaq(clickedItem: FaqItem): void {
    clickedItem.isActive = !clickedItem.isActive;
  }
}