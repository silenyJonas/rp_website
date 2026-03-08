import * as Web from '../../../shared/imports/web-providers';

@Web.Component({
  selector: 'app-tos',
  standalone: true,
  imports: [Web.CommonModule, Web.RouterModule],
  templateUrl: './tos.component.html',
  styleUrl: './tos.component.css'
})
export class TosComponent implements Web.OnInit, Web.OnDestroy {
  t: any = null;
  private destroy$ = new Web.Subject<void>();

  constructor(
    private localizationService: Web.LocalizationService,
    private cdr: Web.ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    this.localizationService.currentTranslations$
      .pipe(Web.takeUntil(this.destroy$))
      .subscribe(translations => {
        if (translations && Object.keys(translations).length > 0) {
          // Načteme celou sekci 'tos' do jedné proměnné pro snazší přístup
          this.t = translations.tos;
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}