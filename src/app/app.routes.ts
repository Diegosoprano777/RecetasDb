import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Search } from './pages/search/search';
import { Favorites } from './pages/favorites/favorites';
import { Details } from './pages/details/details';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'search', component: Search },
  { path: 'favorites', component: Favorites },
  { path: 'details/:id', component: Details },
  { path: '**', component: NotFound }
];
