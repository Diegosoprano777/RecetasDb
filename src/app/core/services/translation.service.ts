import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, forkJoin, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, string>();

  private readonly MAX_CHUNK = 480; // Margen por debajo del límite de 500 chars

  /**
   * Divide un texto en fragmentos de hasta MAX_CHUNK caracteres,
   * cortando únicamente en espacios para no partir palabras.
   */
  private splitIntoChunks(text: string): string[] {
    const chunks: string[] = [];
    let remaining = text.trim();

    while (remaining.length > 0) {
      if (remaining.length <= this.MAX_CHUNK) {
        chunks.push(remaining);
        break;
      }

      // Buscar el último espacio dentro del límite
      let cutIndex = remaining.lastIndexOf(' ', this.MAX_CHUNK);
      if (cutIndex <= 0) {
        // No hay espacio — cortar en el límite exacto (caso raro)
        cutIndex = this.MAX_CHUNK;
      }

      chunks.push(remaining.slice(0, cutIndex).trim());
      remaining = remaining.slice(cutIndex).trim();
    }

    return chunks;
  }

  /**
   * Traduce un único fragmento de texto (garantizado < 500 chars).
   */
  private translateChunk(chunk: string): Observable<string> {
    if (!chunk || chunk.trim() === '') {
      return of('');
    }

    const trimmed = chunk.trim();

    if (this.cache.has(trimmed)) {
      return of(this.cache.get(trimmed)!);
    }

    const encoded = encodeURIComponent(trimmed);
    return this.http
      .get<any>(`https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|es`)
      .pipe(
        map(response => {
          const translated: string = response.responseData?.translatedText ?? trimmed;
          // Si la cuota está agotada o la traducción falló, devolver el original
          const quotaExhausted = response.responseStatus === 429 ||
            (typeof translated === 'string' && translated.includes('MYMEMORY WARNING'));
          const limitError = typeof translated === 'string' && translated.includes('QUERY LENGTH LIMIT');
          if (quotaExhausted || limitError) {
            return trimmed;
          }
          this.cache.set(trimmed, translated);
          return translated;
        }),
        catchError(() => of(trimmed)) // Fallback al texto original si falla
      );
  }

  /**
   * Traduce un texto de cualquier longitud al español.
   * Divide automáticamente en fragmentos seguros y los une en el orden original.
   */
  translate(text: string): Observable<string> {
    if (!text || text.trim() === '') {
      return of('');
    }

    const trimmed = text.trim();

    // Cache hit directo
    if (this.cache.has(trimmed)) {
      return of(this.cache.get(trimmed)!);
    }

    // Si es corto, traducir directo
    if (trimmed.length <= this.MAX_CHUNK) {
      return this.translateChunk(trimmed);
    }

    // Dividir en fragmentos seguros y traducir en paralelo
    const chunks = this.splitIntoChunks(trimmed);
    return forkJoin(chunks.map(chunk => this.translateChunk(chunk))).pipe(
      map(translatedChunks => translatedChunks.join(' '))
    );
  }
}
