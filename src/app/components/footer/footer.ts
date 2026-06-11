import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './footer.css'
})
export class Footer {
  // Categorías populares con su valor de búsqueda en la API
  readonly popularCategories = [
    { icon: '🌴', label: 'Recetas con Pollo',  query: 'Chicken'    },
    { icon: '🥩', label: 'Cortes de Carne',    query: 'Beef'       },
    { icon: '🦞', label: 'Mariscos Frescos',   query: 'Seafood'    },
    { icon: '🍹', label: 'Postres y Bebidas',  query: 'Dessert'    },
  ];
}
