import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, Language } from '../../services/translation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-selector.html',
  styleUrls: ['./language-selector.scss']
})
export class LanguageSelector implements OnInit, OnDestroy {
  supportedLanguages: Language[] = [];
  currentLanguage: Language | null = null;
  
  // Lista delle lingue abilitate (solo italiano e inglese per ora)
  private enabledLanguages: string[] = ['it', 'en'];
  
  private subscriptions: Subscription[] = [];

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    // Sottoscrive ai cambiamenti della lingua corrente
    const langSub = this.translationService.currentLanguage$.subscribe(lang => {
      console.log('🌐 Lingua corrente cambiata:', lang);
      this.currentLanguage = lang;
    });
    this.subscriptions.push(langSub);

    // Sottoscrive ai cambiamenti delle lingue supportate
    const langsSub = this.translationService.languages$.subscribe(langs => {
      console.log('🌐 Lingue supportate caricate:', langs);
      this.supportedLanguages = langs;
    });
    this.subscriptions.push(langsSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Verifica se una lingua è abilitata (cliccabile)
   * @param langCode - Codice della lingua (es. 'it', 'en', 'fr')
   * @returns true se la lingua è abilitata, false altrimenti
   */
  isLanguageEnabled(langCode: string): boolean {
    return this.enabledLanguages.includes(langCode);
  }

  /**
   * Cambia la lingua (solo se abilitata)
   * @param langCode - Codice della lingua da impostare
   */
  changeLanguage(langCode: string): void {
    // Controllo aggiuntivo per sicurezza
    if (!this.isLanguageEnabled(langCode)) {
      console.warn(`Tentativo di cambiare a lingua non abilitata: ${langCode}`);
      return;
    }
    
    console.log('Richiesta cambio lingua a:', langCode);
    this.translationService.setLanguage(langCode);
  }
}