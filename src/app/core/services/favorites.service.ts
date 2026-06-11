import { Injectable, signal, computed, effect } from '@angular/core';
import { Recipe } from './recipe.service';

const STORAGE_KEY = 'recetas_favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {

  // ── Signal raíz: lista de favoritos ────────────────────────────────────────
  private readonly _favorites = signal<Recipe[]>(this.loadFromStorage());

  // ── Computed públicos ──────────────────────────────────────────────────────
  public readonly favorites = this._favorites.asReadonly();
  public readonly count     = computed(() => this._favorites().length);

  constructor() {
    // Persistencia automática: cada vez que cambia _favorites, guarda en LS
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._favorites()));
      } catch (e) {
        console.warn('No se pudo guardar en localStorage:', e);
      }
    });
  }

  // ── API pública ────────────────────────────────────────────────────────────

  isFavorite(idMeal: string): boolean {
    return this._favorites().some(r => r.idMeal === idMeal);
  }

  toggle(recipe: Recipe): void {
    if (this.isFavorite(recipe.idMeal)) {
      this._favorites.update(list => list.filter(r => r.idMeal !== recipe.idMeal));
    } else {
      this._favorites.update(list => [...list, recipe]);
    }
  }

  remove(idMeal: string): void {
    this._favorites.update(list => list.filter(r => r.idMeal !== idMeal));
  }

  clear(): void {
    this._favorites.set([]);
  }

  // ── Carga inicial desde localStorage ──────────────────────────────────────
  private loadFromStorage(): Recipe[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Recipe[]) : [];
    } catch {
      return [];
    }
  }
}
