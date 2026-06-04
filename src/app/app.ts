import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { RecipeService, Recipe } from './core/services/recipe.service';
import { TranslationService } from './core/services/translation.service';
import { forkJoin, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [FormsModule, SlicePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly translationService = inject(TranslationService);

  // Signals para reactividad moderna
  public readonly searchQuery = signal('');
  public readonly recipes = signal<Recipe[]>([]);
  public readonly featuredRecipe = signal<Recipe | null>(null);
  public readonly selectedRecipe = signal<Recipe | null>(null);
  public readonly isLoading = signal(false);
  public readonly isFeaturedLoading = signal(false);
  public readonly isTranslating = signal(false);
  public readonly errorMessage = signal<string | null>(null);

  // Accesos rápidos (chips) con traducción manual al español para la UI caribeña
  public readonly searchChips = [
    { label: 'Pollo', value: 'Chicken' },
    { label: 'Carne', value: 'Beef' },
    { label: 'Postres', value: 'Dessert' },
    { label: 'Vegetariano', value: 'Vegetarian' },
    { label: 'Mariscos', value: 'Seafood' },
    { label: 'Pasta', value: 'Pasta' }
  ];

  ngOnInit(): void {
    this.loadFeaturedRecipe();
    this.search('Chicken'); // Búsqueda inicial por defecto
  }

  /**
   * Traduce una receta completa al español (título, instrucciones, categoría, origen e ingredientes).
   */
  translateRecipe(recipe: Recipe): Observable<Recipe> {
    const ingredientTranslations$ = recipe.ingredients.map(ing => 
      this.translationService.translate(ing.name).pipe(
        map(translatedName => ({
          name: translatedName,
          measure: ing.measure
        }))
      )
    );

    const ingredients$ = ingredientTranslations$.length > 0 
      ? forkJoin(ingredientTranslations$) 
      : of([]);

    return forkJoin({
      translatedTitle: this.translationService.translate(recipe.strMeal),
      translatedInstructions: this.translationService.translate(recipe.strInstructions),
      translatedCategory: this.translationService.translate(recipe.strCategory),
      translatedArea: this.translationService.translate(recipe.strArea),
      translatedIngredients: ingredients$
    }).pipe(
      map(({ translatedTitle, translatedInstructions, translatedCategory, translatedArea, translatedIngredients }) => ({
        ...recipe,
        strMeal: translatedTitle,
        strInstructions: translatedInstructions,
        strCategory: translatedCategory,
        strArea: translatedArea,
        ingredients: translatedIngredients
      }))
    );
  }

  loadFeaturedRecipe(): void {
    this.isFeaturedLoading.set(true);
    this.recipeService.getRandomRecipe().subscribe({
      next: (recipe) => {
        if (recipe) {
          this.translateRecipe(recipe).subscribe({
            next: (translated) => {
              this.featuredRecipe.set(translated);
              this.isFeaturedLoading.set(false);
            },
            error: (err) => {
              console.error('Error al traducir receta destacada:', err);
              this.featuredRecipe.set(recipe); // Fallback original
              this.isFeaturedLoading.set(false);
            }
          });
        } else {
          this.isFeaturedLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Error al cargar receta destacada:', err);
        this.isFeaturedLoading.set(false);
      }
    });
  }

  search(query: string = this.searchQuery()): void {
    this.searchQuery.set(query);
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.recipeService.searchRecipes(query).subscribe({
      next: (results) => {
        this.recipes.set(results);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al buscar recetas:', err);
        this.errorMessage.set('No se pudo establecer conexión con el servidor de recetas.');
        this.isLoading.set(false);
      }
    });
  }

  selectRecipe(recipe: Recipe): void {
    // Abrimos el modal inmediatamente con el contenido en inglés
    this.selectedRecipe.set(recipe);
    this.isTranslating.set(true);

    // Traducimos en segundo plano para una UX fluida
    this.translateRecipe(recipe).subscribe({
      next: (translated) => {
        this.selectedRecipe.set(translated);
        this.isTranslating.set(false);
      },
      error: (err) => {
        console.error('Error al traducir receta seleccionada:', err);
        this.isTranslating.set(false);
      }
    });
  }

  closeModal(): void {
    this.selectedRecipe.set(null);
    this.isTranslating.set(false);
  }
}
