import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecipeService, Recipe } from '../../core/services/recipe.service';
import { TranslationService } from '../../core/services/translation.service';
import { forkJoin, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, SlicePipe, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly translationService = inject(TranslationService);

  public readonly recipes          = signal<Recipe[]>([]);
  public readonly featuredRecipe   = signal<Recipe | null>(null);
  public readonly isLoading        = signal(false);
  public readonly isFeaturedLoading = signal(false);

  ngOnInit(): void {
    this.loadFeaturedRecipe();
    this.loadRecommendedRecipes();
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

  private translateCardFields(recipe: Recipe): Recipe {
    return {
      ...recipe,
      strMeal:     this.translationService.translateInstant(recipe.strMeal),
      strCategory: this.translationService.translateInstant(recipe.strCategory),
      strArea:     this.translationService.translateInstant(recipe.strArea),
    };
  }

  loadFeaturedRecipe(): void {
    this.isFeaturedLoading.set(true);
    this.recipeService.getRandomRecipe().subscribe({
      next: recipe => {
        if (!recipe) { this.isFeaturedLoading.set(false); return; }
        this.translateRecipe(recipe).subscribe({
          next:  t   => { this.featuredRecipe.set(t);      this.isFeaturedLoading.set(false); },
          error: ()  => { this.featuredRecipe.set(recipe); this.isFeaturedLoading.set(false); }
        });
      },
      error: () => this.isFeaturedLoading.set(false)
    });
  }

  loadRecommendedRecipes(): void {
    this.isLoading.set(true);
    // Cargamos 3 recetas aleatorias en paralelo
    forkJoin([
      this.recipeService.getRandomRecipe(),
      this.recipeService.getRandomRecipe(),
      this.recipeService.getRandomRecipe(),
    ]).subscribe({
      next: results => {
        const validRecipes = results
          .filter((r): r is Recipe => r !== null)
          .map(r => this.translateCardFields(r));
        this.recipes.set(validRecipes);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}


