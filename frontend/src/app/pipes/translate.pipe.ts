import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // per aggiornarsi quando cambia lingua
})
export class TranslatePipe implements PipeTransform {
  
  constructor(private translationService: TranslationService) {}
  
  transform(key: string, params?: { [key: string]: string }): string {
    return this.translationService.translate(key, params);
  }
}