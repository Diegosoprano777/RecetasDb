import { Component, OnInit, signal, inject, effect, computed } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecipeService, Recipe } from '../../core/services/recipe.service';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, SlicePipe, FormsModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  private readonly recipeService    = inject(RecipeService);
  private readonly translationService = inject(TranslationService);
  private readonly router           = inject(Router);

  // ── Signals de estado ─────────────────────────────────────────────────────
  public readonly searchQuery  = signal('');
  public readonly recipes      = signal<Recipe[]>([]);
  public readonly isLoading    = signal(false);
  public readonly hasSearched  = signal(false);
  public readonly errorMessage = signal<string | null>(null);

  // Signal derivada: ¿búsqueda sin resultados?
  public readonly isEmpty = computed(
    () => this.hasSearched() && !this.isLoading() && this.recipes().length === 0 && !this.errorMessage()
  );

  public readonly searchChips = [
    { label: 'Pollo',       value: 'Chicken'    },
    { label: 'Carne',       value: 'Beef'       },
    { label: 'Postres',     value: 'Dessert'    },
    { label: 'Vegetariano', value: 'Vegetarian' },
    { label: 'Mariscos',    value: 'Seafood'    },
    { label: 'Pasta',       value: 'Pasta'      },
  ];

  constructor() {
    // ── Día 5: effect() con debounce de 350ms ─────────────────────────────
    // Reacciona automáticamente cada vez que searchQuery cambia
    effect((onCleanup) => {
      const query = this.searchQuery().trim();

      // Si el campo está vacío, limpiamos sin buscar
      if (query.length === 0) {
        this.recipes.set([]);
        this.hasSearched.set(false);
        this.errorMessage.set(null);
        return;
      }

      // Si tiene menos de 2 caracteres, esperamos
      if (query.length < 2) return;

      this.isLoading.set(true);
      this.errorMessage.set(null);

      // Debounce: esperamos 350ms antes de disparar la petición
      const timer = setTimeout(() => {
        this.recipeService.searchRecipes(query).subscribe({
          next: results => {
            const translated = results.map(r => this.translateCardFields(r));
            this.recipes.set(translated);
            this.isLoading.set(false);
            this.hasSearched.set(true);
          },
          error: () => {
            this.errorMessage.set('No se pudo establecer conexión con el servidor de recetas.');
            this.isLoading.set(false);
            this.hasSearched.set(true);
          }
        });
      }, 350);

      // Limpieza: cancela el timer si el usuario sigue escribiendo
      onCleanup(() => clearTimeout(timer));
    });
  }

  ngOnInit(): void {
    this.search('Chicken'); // Búsqueda inicial por defecto
  }

  private translateCardFields(recipe: Recipe): Recipe {
    return {
      ...recipe,
      strMeal:     this.translationService.translateInstant(recipe.strMeal),
      strCategory: this.translationService.translateInstant(recipe.strCategory),
      strArea:     this.translationService.translateInstant(recipe.strArea),
    };
  }

  /** Búsqueda manual (chips o Enter) */
  search(query: string = this.searchQuery()): void {
    this.searchQuery.set(query);
  }

  viewDetails(recipeId: string): void {
    this.router.navigate(['/details', recipeId]);
  }
}
