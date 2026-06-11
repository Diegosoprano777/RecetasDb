import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { RecipeService, Recipe } from '../../core/services/recipe.service';
import { TranslationService } from '../../core/services/translation.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { forkJoin, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './details.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './details.css'
})
export class Details implements OnInit {
  private readonly route              = inject(ActivatedRoute);
  private readonly router             = inject(Router);
  private readonly recipeService      = inject(RecipeService);
  private readonly translationService = inject(TranslationService);
  public  readonly favService         = inject(FavoritesService);

  public readonly recipe        = signal<Recipe | null>(null);
  public readonly isLoading     = signal(true);
  public readonly isTranslating = signal(false);
  public readonly errorMessage  = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadRecipe(id);
    else     this.router.navigate(['/home']);
  }

  // ── Carga y traducción ────────────────────────────────────────────────────
  loadRecipe(id: string): void {
    this.isLoading.set(true);
    this.recipeService.getRecipeById(id).subscribe({
      next: recipe => {
        if (!recipe) {
          this.errorMessage.set('La receta solicitada no existe.');
          this.isLoading.set(false);
          return;
        }
        this.recipe.set(recipe);
        this.isLoading.set(false);

        // Traducir en segundo plano
        this.isTranslating.set(true);
        this.translateRecipe(recipe).subscribe({
          next:  t  => { this.recipe.set(t);      this.isTranslating.set(false); },
          error: () => { this.isTranslating.set(false); }
        });
      },
      error: () => {
        this.errorMessage.set('Error al conectar con la base de datos de recetas. Verifica tu conexión.');
        this.isLoading.set(false);
      }
    });
  }

  translateRecipe(recipe: Recipe): Observable<Recipe> {
    const ingredients$ = recipe.ingredients.length > 0
      ? forkJoin(recipe.ingredients.map(ing =>
          this.translationService.translate(ing.name).pipe(
            map(n => ({ name: n, measure: ing.measure }))
          )
        ))
      : of([]);

    return forkJoin({
      title:        this.translationService.translate(recipe.strMeal),
      instructions: this.translationService.translate(recipe.strInstructions),
      category:     this.translationService.translate(recipe.strCategory),
      area:         this.translationService.translate(recipe.strArea),
      ingredients:  ingredients$
    }).pipe(
      map(r => ({
        ...recipe,
        strMeal: r.title, strInstructions: r.instructions,
        strCategory: r.category, strArea: r.area, ingredients: r.ingredients
      }))
    );
  }

  /**
   * Divide instrucciones en pasos numerados para renderizar.
   */
  getSteps(): string[] {
    const instructions = this.recipe()?.strInstructions;
    if (!instructions) return [];
    return instructions
      .split(/\r\n\r\n|\n\n/)
      .flatMap(p => p.split(/\.\s+(?=[A-ZÁÉÍÓÚÑ])/))
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }

  // ── Favoritos (delegado al servicio) ──────────────────────────────────────
  toggleFavorite(): void {
    const r = this.recipe();
    if (r) this.favService.toggle(r);
  }

  isFavorite(): boolean {
    return this.favService.isFavorite(this.recipe()?.idMeal ?? '');
  }

  goBack(): void { window.history.back(); }
}
