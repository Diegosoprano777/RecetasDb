import { Component, OnInit, signal, inject } from '@angular/core';
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
  private readonly recipeService = inject(RecipeService);
  private readonly translationService = inject(TranslationService);
  private readonly router = inject(Router);

  public readonly searchQuery = signal('');
  public readonly recipes = signal<Recipe[]>([]);
  public readonly isLoading = signal(false);
  public readonly errorMessage = signal<string | null>(null);

  public readonly searchChips = [
    { label: 'Pollo',       value: 'Chicken'    },
    { label: 'Carne',       value: 'Beef'       },
    { label: 'Postres',     value: 'Dessert'    },
    { label: 'Vegetariano', value: 'Vegetarian' },
    { label: 'Mariscos',    value: 'Seafood'    },
    { label: 'Pasta',       value: 'Pasta'      },
  ];

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

  search(query: string = this.searchQuery()): void {
    this.searchQuery.set(query);
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.recipeService.searchRecipes(query).subscribe({
      next: results => {
        const translated = results.map(r => this.translateCardFields(r));
        this.recipes.set(translated);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo establecer conexión con el servidor de recetas.');
        this.isLoading.set(false);
      }
    });
  }

  viewDetails(recipeId: string): void {
    this.router.navigate(['/details', recipeId]);
  }
}
