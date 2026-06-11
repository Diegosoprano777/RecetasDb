import { Component, OnInit, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../../core/services/favorites.service';
import { Recipe } from '../../core/services/recipe.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, SlicePipe, RouterModule],
  templateUrl: './favorites.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './favorites.css'
})
export class Favorites {
  public readonly favService = inject(FavoritesService);

  // Computed para conteo de favoritos
  public readonly count = this.favService.count;

  removeFavorite(recipeId: string, event: Event): void {
    event.stopPropagation();
    this.favService.remove(recipeId);
  }

  clearAll(): void {
    this.favService.clear();
  }
}
