import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';

export interface Translation {
  key: string;
  value: string;
  group?: string;
}

export interface Language {
  id: number;
  name: string;
  code: string;
  locale: string;
  flag?: string;
  is_default: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private apiUrl = '/api/v1';
  private currentLanguageSubject = new BehaviorSubject<Language | null>(null);
  private translationsSubject = new BehaviorSubject<Map<string, string>>(new Map());
  private languagesSubject = new BehaviorSubject<Language[]>([]); 

  currentLanguage$ = this.currentLanguageSubject.asObservable();
  translations$ = this.translationsSubject.asObservable();
  languages$ = this.languagesSubject.asObservable(); 

  supportedLanguages: Language[] = [];
  currentLanguage: Language | null = null;
  private translations: Map<string, string> = new Map();

  constructor(private http: HttpClient) {
    this.loadLanguages();
  }

  /**
   * Carica le lingue disponibili dal backend
   */
  loadLanguages(): void {
    console.log('Caricamento lingue...');
    this.http.get<Language[]>(`${this.apiUrl}/languages`).subscribe({
      next: (languages) => {
        console.log('Lingue caricate:', languages);
        this.supportedLanguages = languages;
        this.languagesSubject.next(languages);

        const defaultLang = languages.find((l) => l.is_default) || languages[0];
        if (defaultLang) {
          this.setLanguage(defaultLang.code);
        }
      },
      error: (err) => {
        console.error('Errore caricamento lingue:', err);
        // Fallback: italiano
        const fallbackLangs = [
          { id: 1, name: 'Italiano', code: 'it', locale: 'it_IT', is_default: true, flag: '🇮🇹' },
        ];
        this.supportedLanguages = fallbackLangs;
        this.languagesSubject.next(fallbackLangs);
        this.setLanguage('it');
      },
    });
  }

  /**
   * Imposta la lingua corrente e carica le traduzioni
   */
  setLanguage(langCode: string): void {
    console.log('Setting language to:', langCode);
    const language = this.supportedLanguages.find((l) => l.code === langCode);
    if (!language) {
      console.warn(`Lingua ${langCode} non supportata`);
      return;
    }

    this.currentLanguage = language;
    this.currentLanguageSubject.next(language);
    localStorage.setItem('preferred_language', langCode);

    this.loadTranslations(langCode);
  }

  /**
   * Carica le traduzioni per una lingua specifica
   */
  loadTranslations(langCode: string): void {
    console.log(`Caricamento traduzioni per ${langCode}...`);
    this.http.get<Translation[]>(`${this.apiUrl}/translations?lang=${langCode}`).subscribe({
      next: (translations) => {
        console.log(`Traduzioni caricate per ${langCode}:`, translations.length);
        this.translations.clear();
        translations.forEach((t) => {
          this.translations.set(t.key, t.value);
        });
        this.translationsSubject.next(this.translations);
      },
      error: (err) => {
        console.error('Errore caricamento traduzioni:', err);
      },
    });
  }

  /**
   * Ottiene una traduzione per chiave
   */
  translate(key: string, params?: { [key: string]: string }): string {
    let text = this.translations.get(key) || key;

    if (params) {
      Object.keys(params).forEach((param) => {
        text = text.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
      });
    }

    return text;
  }

  t(key: string, params?: { [key: string]: string }): string {
    return this.translate(key, params);
  }

  getPreferredLanguage(): string {
    return localStorage.getItem('preferred_language') || this.currentLanguage?.code || 'it';
  }
}