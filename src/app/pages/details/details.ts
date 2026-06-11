import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { RecipeService, Recipe } from '../../core/services/recipe.service';
import { TranslationService } from '../../core/services/translation.service';
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

  public readonly recipe        = signal<Recipe | null>(null);
  public readonly isLoading     = signal(true);
  public readonly isTranslating = signal(false);
  public readonly isFavorite    = signal(false);
  public readonly errorMessage  = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRecipe(id);
    } else {
      this.router.navigate(['/home']);
    }
  }

  // ── Carga y traducción de la receta ───────────────────────────────────────
  loadRecipe(id: string): void {
    this.isLoading.set(true);
    this.recipeService.getRecipeById(id).subscribe({
      next: recipe => {
        if (!recipe) {
          this.errorMessage.set('La receta solicitada no existe.');
          this.isLoading.set(false);
          return;
        }
        this.checkIfFavorite(recipe.idMeal);
        this.recipe.set(recipe);
        this.isLoading.set(false);

        // Traducir en segundo plano
        this.isTranslating.set(true);
        this.translateRecipe(recipe).subscribe({
          next:  translated => { this.recipe.set(translated); this.isTranslating.set(false); },
          error: ()         => { this.isTranslating.set(false); }
        });
      },
      error: () => {
        this.errorMessage.set('Error al conectar con la base de datos de recetas.');
        this.isLoading.set(false);
      }
    });
  }

  translateRecipe(recipe: Recipe): Observable<Recipe> {
    const ingredients$ = recipe.ingredients.length > 0
      ? forkJoin(
          recipe.ingredients.map(ing =>
            this.translationService.translate(ing.name).pipe(
              map(n => ({ name: n, measure: ing.measure }))
            )
          )
        )
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
        strMeal:         r.title,
        strInstructions: r.instructions,
        strCategory:     r.category,
        strArea:         r.area,
        ingredients:     r.ingredients
      }))
    );
  }

  /**
   * Divide las instrucciones en pasos individuales para mostrarlos numerados.
   * Separa por saltos de línea dobles o por punto seguido de mayúscula.
   */
  getSteps(): string[] {
    const instructions = this.recipe()?.strInstructions;
    if (!instructions) return [];
    return instructions
      .split(/\r\n\r\n|\n\n/)           // Párrafos dobles primero
      .flatMap(p => p.split(/\.\s+(?=[A-ZÁÉÍÓÚÑ])/))  // Luego oraciones
      .map(s => s.trim())
      .filter(s => s.length > 10);      // Filtrar pasos vacíos o muy cortos
  }

  // ── Favoritos ─────────────────────────────────────────────────────────────
  checkIfFavorite(idMeal: string): void {
    try {
      const favsStr = localStorage.getItem('recetas_favorites');
      if (favsStr) {
        const favs: Recipe[] = JSON.parse(favsStr);
        this.isFavorite.set(favs.some(r => r.idMeal === idMeal));
      } else {
        this.isFavorite.set(false);
      }
    } catch {
      this.isFavorite.set(false);
    }
  }

  toggleFavorite(): void {
    const currentRecipe = this.recipe();
    if (!currentRecipe) return;
    try {
      const favsStr = localStorage.getItem('recetas_favorites');
      let favs: Recipe[] = favsStr ? JSON.parse(favsStr) : [];
      if (this.isFavorite()) {
        favs = favs.filter(r => r.idMeal !== currentRecipe.idMeal);
        this.isFavorite.set(false);
      } else {
        favs.push(currentRecipe);
        this.isFavorite.set(true);
      }
      localStorage.setItem('recetas_favorites', JSON.stringify(favs));
    } catch (e) {
      console.error('Error al modificar favoritos:', e);
    }
  }

  goBack(): void {
    window.history.back();
  }
}
