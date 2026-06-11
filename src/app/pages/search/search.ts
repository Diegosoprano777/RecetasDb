import { Component, OnInit, signal, inject, effect, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { RecipeService, Recipe } from '../../core/services/recipe.service';
import { TranslationService } from '../../core/services/translation.service';
import { forkJoin, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, SlicePipe, FormsModule, RouterModule],
  templateUrl: './search.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './search.css'
})
export class Search implements OnInit {
  private readonly recipeService     = inject(RecipeService);
  private readonly translationService = inject(TranslationService);
  private readonly router            = inject(Router);
  private readonly route             = inject(ActivatedRoute);

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
    // ── Día 5: effect() con debounce 350ms ────────────────────────────────
    effect((onCleanup) => {
      const query = this.searchQuery().trim();

      if (query.length === 0) {
        this.recipes.set([]);
        this.hasSearched.set(false);
        this.errorMessage.set(null);
        return;
      }

      if (query.length < 2) return;

      this.isLoading.set(true);
      this.errorMessage.set(null);

      const timer = setTimeout(() => {
        this.recipeService.searchRecipes(query).pipe(
          // Traducir todas las tarjetas (título + excerpt + categoría + área)
          switchMap(results => {
            if (results.length === 0) return of([]);
            return forkJoin(results.map(r => this.translateCard(r)));
          })
        ).subscribe({
          next: translated => {
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

      onCleanup(() => clearTimeout(timer));
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const q = params['q'];
      this.search(q || 'Chicken');
    });
  }

  // ── Traduce los campos visibles en la tarjeta vía API ────────────────────
  private translateCard(recipe: Recipe) {
    const excerptEN = recipe.strInstructions?.slice(0, 180) ?? '';
    return forkJoin({
      title:    this.translationService.translate(recipe.strMeal),
      excerpt:  this.translationService.translate(excerptEN),
      category: this.translationService.translate(recipe.strCategory),
      area:     this.translationService.translate(recipe.strArea),
    }).pipe(
      map(r => ({
        ...recipe,
        strMeal:         r.title,
        strInstructions: r.excerpt,
        strCategory:     r.category,
        strArea:         r.area,
      }))
    );
  }

  /** Búsqueda manual (chips o Enter) */
  search(query: string = this.searchQuery()): void {
    this.searchQuery.set(query);
  }

  viewDetails(recipeId: string): void {
    this.router.navigate(['/details', recipeId]);
  }
}
