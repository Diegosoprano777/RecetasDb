import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Recipe } from '../../core/services/recipe.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, SlicePipe, RouterModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit {
  private readonly router = inject(Router);
  public readonly favorites = signal<Recipe[]>([]);

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    try {
      const data = localStorage.getItem('recetas_favorites');
      if (data) {
        this.favorites.set(JSON.parse(data));
      } else {
        this.favorites.set([]);
      }
    } catch (e) {
      console.error('Error al cargar favoritos de localStorage:', e);
      this.favorites.set([]);
    }
  }

  removeFavorite(recipeId: string, event: Event): void {
    event.stopPropagation(); // Evitar navegar al hacer clic en quitar
    const currentFavs = this.favorites();
    const updatedFavs = currentFavs.filter(r => r.idMeal !== recipeId);
    this.favorites.set(updatedFavs);
    localStorage.setItem('recetas_favorites', JSON.stringify(updatedFavs));
  }

  viewDetails(recipeId: string): void {
    this.router.navigate(['/details', recipeId]);
  }
}
