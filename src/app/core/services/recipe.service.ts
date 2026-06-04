import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strMealThumb: string;
  strInstructions: string;
  strTags?: string;
  strYoutube?: string;
  [key: string]: any;
}

export interface Recipe extends Meal {
  ingredients: { name: string; measure: string }[];
}

export interface MealResponse {
  meals: Meal[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly http = inject(HttpClient);

  // Helper para parsear los ingredientes dinámicos (strIngredient1..20 y strMeasure1..20)
  private parseIngredients(meal: Meal): Recipe {
    const ingredients: { name: string; measure: string }[] = [];
    for (let i = 1; i <= 20; i++) {
      const name = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (name && name.trim() !== '') {
        ingredients.push({
          name: name.trim(),
          measure: measure ? measure.trim() : ''
        });
      }
    }
    return {
      ...meal,
      ingredients
    };
  }

  /**
   * Busca recetas por palabra clave.
   */
  searchRecipes(query: string = ''): Observable<Recipe[]> {
    return this.http.get<MealResponse>(`/search.php?s=${query}`).pipe(
      map(response => {
        if (!response.meals) return [];
        return response.meals.map(meal => this.parseIngredients(meal));
      })
    );
  }

  /**
   * Obtiene una receta aleatoria (Receta del Día).
   */
  getRandomRecipe(): Observable<Recipe | null> {
    return this.http.get<MealResponse>('/random.php').pipe(
      map(response => {
        if (!response.meals || response.meals.length === 0) return null;
        return this.parseIngredients(response.meals[0]);
      })
    );
  }
}
