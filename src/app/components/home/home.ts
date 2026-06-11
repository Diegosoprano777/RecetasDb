import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecipeService, Recipe } from '../../core/services/recipe.service';
import { TranslationService } from '../../core/services/translation.service';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, SlicePipe, RouterLink],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private readonly recipeService      = inject(RecipeService);
  private readonly translationService = inject(TranslationService);

  public readonly recipes            = signal<Recipe[]>([]);
  public readonly featuredRecipe     = signal<Recipe | null>(null);
  public readonly isLoading          = signal(false);
  public readonly isFeaturedLoading  = signal(false);

  // Categorías disponibles en TheMealDB para recomendaciones aleatorias
  private readonly CATEGORIES = [
    'Chicken', 'Beef', 'Seafood', 'Vegetarian', 'Dessert',
    'Pasta', 'Lamb', 'Pork', 'Breakfast', 'Side'
  ];

  ngOnInit(): void {
    this.loadFeaturedRecipe();
    this.loadRecommendedRecipes();
  }

  // ── Traducción COMPLETA (hero: título + instrucciones + ingredientes) ──────
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

  // ── Traducción de TARJETA (título + categoría + área) ─────────────────────
  private translateCard(recipe: Recipe): Observable<Recipe> {
    return forkJoin({
      title:    this.translationService.translate(recipe.strMeal),
      category: this.translationService.translate(recipe.strCategory),
      area:     this.translationService.translate(recipe.strArea),
    }).pipe(
      map(r => ({
        ...recipe,
        strMeal:     r.title,
        strCategory: r.category,
        strArea:     r.area,
      }))
    );
  }

  // ── Receta del Día ─────────────────────────────────────────────────────────
  loadFeaturedRecipe(): void {
    this.isFeaturedLoading.set(true);
    this.recipeService.getRandomRecipe().subscribe({
      next: recipe => {
        if (!recipe) { this.isFeaturedLoading.set(false); return; }
        this.translateRecipe(recipe).subscribe({
          next:  t  => { this.featuredRecipe.set(t);      this.isFeaturedLoading.set(false); },
          error: () => { this.featuredRecipe.set(recipe); this.isFeaturedLoading.set(false); }
        });
      },
      error: () => this.isFeaturedLoading.set(false)
    });
  }

  // ── Recomendaciones del Chef ───────────────────────────────────────────────
  // Usa /filter.php?c= para obtener recetas REALES de una categoría aleatoria
  loadRecommendedRecipes(): void {
    this.isLoading.set(true);
    const cat = this.CATEGORIES[Math.floor(Math.random() * this.CATEGORIES.length)];

    this.recipeService.getRecipesByCategory(cat).pipe(
      switchMap(list => {
        if (list.length === 0) return of([]);
        // Barajar y tomar 3 para variedad
        const picked = list.sort(() => Math.random() - 0.5).slice(0, 3);
        // Obtener detalles completos (instrucciones, área, etc.)
        return forkJoin(picked.map(r => this.recipeService.getRecipeById(r.idMeal)));
      }),
      switchMap(results => {
        const valid = results.filter((r): r is Recipe => r !== null);
        if (valid.length === 0) return of([]);
        return forkJoin(valid.map(r => this.translateCard(r)));
      })
    ).subscribe({
      next:  translated => { this.recipes.set(translated); this.isLoading.set(false); },
      error: ()         => this.isLoading.set(false)
    });
  }
}
