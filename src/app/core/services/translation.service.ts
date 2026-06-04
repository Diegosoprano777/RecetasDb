import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, forkJoin, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, string>();
  private readonly MAX_CHUNK = 480;

  // ─── Diccionario local completo ───────────────────────────────────────────
  private readonly DICTIONARY: Record<string, string> = {
    // Categorías TheMealDB
    'Beef':          'Carne de res',
    'Breakfast':     'Desayuno',
    'Chicken':       'Pollo',
    'Dessert':       'Postre',
    'Goat':          'Cabra',
    'Lamb':          'Cordero',
    'Miscellaneous': 'Varios',
    'Pasta':         'Pasta',
    'Pork':          'Cerdo',
    'Seafood':       'Mariscos',
    'Side':          'Acompañamiento',
    'Starter':       'Entrada',
    'Vegan':         'Vegano',
    'Vegetarian':    'Vegetariano',

    // Áreas / Países
    'American':   'Americano',
    'Australian': 'Australiano',
    'British':    'Británico',
    'Canadian':   'Canadiense',
    'Chinese':    'Chino',
    'Croatian':   'Croata',
    'Dutch':      'Holandés',
    'Egyptian':   'Egipcio',
    'Filipino':   'Filipino',
    'French':     'Francés',
    'Greek':      'Griego',
    'Indian':     'Indio',
    'Irish':      'Irlandés',
    'Italian':    'Italiano',
    'Jamaican':   'Jamaicano',
    'Japanese':   'Japonés',
    'Kenyan':     'Keniano',
    'Malaysian':  'Malayo',
    'Mexican':    'Mexicano',
    'Moroccan':   'Marroquí',
    'Polish':     'Polaco',
    'Portuguese': 'Portugués',
    'Russian':    'Ruso',
    'Spanish':    'Español',
    'Thai':       'Tailandés',
    'Tunisian':   'Tunecino',
    'Turkish':    'Turco',
    'Unknown':    'Desconocido',
    'Vietnamese': 'Vietnamita',

    // Proteínas y carnes
    'Chicken Breast':      'Pechuga de pollo',
    'Chicken Thighs':      'Muslos de pollo',
    'Ground Beef':         'Carne molida de res',
    'Ground Pork':         'Carne molida de cerdo',
    'Turkey':              'Pavo',
    'Duck':                'Pato',
    'Bacon':               'Tocino',
    'Ham':                 'Jamón',
    'Sausage':             'Salchicha',
    'Salmon':              'Salmón',
    'Tuna':                'Atún',
    'Shrimp':              'Camarones',
    'Prawns':              'Langostinos',
    'Scallops':            'Vieiras',
    'Crab':                'Cangrejo',
    'Lobster':             'Langosta',
    'Squid':               'Calamar',
    'Anchovies':           'Anchoas',
    'Sardines':            'Sardinas',
    'Cod':                 'Bacalao',
    'Tilapia':             'Tilapia',

    // Lácteos y huevos
    'Egg':                 'Huevo',
    'Eggs':                'Huevos',
    'Milk':                'Leche',
    'Butter':              'Mantequilla',
    'Cream':               'Crema',
    'Sour Cream':          'Crema ácida',
    'Heavy Cream':         'Crema para batir',
    'Cheese':              'Queso',
    'Feta Cheese':         'Queso feta',
    'Parmesan':            'Parmesano',
    'Mozzarella':          'Mozzarella',
    'Cream Cheese':        'Queso crema',
    'Yogurt':              'Yogur',
    'Greek Yogurt':        'Yogur griego',

    // Cereales, harinas y pastas
    'Flour':               'Harina',
    'Bread':               'Pan',
    'Rice':                'Arroz',
    'Baking Powder':       'Polvo para hornear',
    'Baking Soda':         'Bicarbonato de sodio',

    // Aceites, salsas y condimentos
    'Oil':                 'Aceite',
    'Olive Oil':           'Aceite de oliva',
    'Vegetable Oil':       'Aceite vegetal',
    'Sesame Oil':          'Aceite de sésamo',
    'Vinegar':             'Vinagre',
    'Soy Sauce':           'Salsa de soya',
    'Fish Sauce':          'Salsa de pescado',
    'Worcestershire Sauce':'Salsa inglesa',
    'Hot Sauce':           'Salsa picante',
    'Ketchup':             'Catsup',
    'Mustard':             'Mostaza',
    'Mayonnaise':          'Mayonesa',
    'Tomato Sauce':        'Salsa de tomate',
    'Tomato Paste':        'Pasta de tomate',
    'Chicken Stock':       'Caldo de pollo',
    'Beef Stock':          'Caldo de res',
    'Vegetable Stock':     'Caldo de verduras',
    'Wine':                'Vino',
    'Red Wine':            'Vino tinto',
    'White Wine':          'Vino blanco',
    'Coconut Milk':        'Leche de coco',
    'Honey':               'Miel',
    'Peanut Butter':       'Mantequilla de cacahuate',

    // Verduras y vegetales
    'Onion':               'Cebolla',
    'Garlic':              'Ajo',
    'Tomato':              'Tomate',
    'Tomatoes':            'Tomates',
    'Potato':              'Papa',
    'Potatoes':            'Papas',
    'Sweet Potato':        'Camote',
    'Yam':                 'Ñame',
    'Carrot':              'Zanahoria',
    'Carrots':             'Zanahorias',
    'Celery':              'Apio',
    'Bell Pepper':         'Pimiento',
    'Red Pepper':          'Pimiento rojo',
    'Green Pepper':        'Pimiento verde',
    'Chili':               'Chile',
    'Spinach':             'Espinaca',
    'Broccoli':            'Brócoli',
    'Mushrooms':           'Champiñones',
    'Mushroom':            'Champiñón',
    'Zucchini':            'Calabacín',
    'Eggplant':            'Berenjena',
    'Corn':                'Maíz',
    'Peas':                'Guisantes',
    'Beans':               'Frijoles',
    'Black Beans':         'Frijoles negros',
    'Chickpeas':           'Garbanzos',
    'Lentils':             'Lentejas',
    'Spring Onions':       'Cebollas de cambray',
    'Green Onions':        'Cebolletas',
    'Leek':                'Puerro',
    'Shallots':            'Chalotes',
    'Fennel':              'Hinojo',
    'Asparagus':           'Espárragos',
    'Cauliflower':         'Coliflor',
    'Cabbage':             'Col',
    'Lettuce':             'Lechuga',
    'Kale':                'Col rizada',
    'Avocado':             'Aguacate',
    'Tofu':                'Tofu',

    // Frutas
    'Lemon':               'Limón',
    'Lime':                'Lima',
    'Orange':              'Naranja',
    'Apple':               'Manzana',
    'Banana':              'Plátano',
    'Mango':               'Mango',
    'Coconut':             'Coco',
    'Pineapple':           'Piña',
    'Strawberry':          'Fresa',
    'Blueberry':           'Arándano',

    // Especias y hierbas
    'Salt':                'Sal',
    'Pepper':              'Pimienta',
    'Sugar':               'Azúcar',
    'Water':               'Agua',
    'Ginger':              'Jengibre',
    'Cumin':               'Comino',
    'Coriander':           'Cilantro',
    'Turmeric':            'Cúrcuma',
    'Paprika':             'Pimentón',
    'Cinnamon':            'Canela',
    'Oregano':             'Orégano',
    'Thyme':               'Tomillo',
    'Rosemary':            'Romero',
    'Basil':               'Albahaca',
    'Parsley':             'Perejil',
    'Bay Leaf':            'Hoja de laurel',
    'Nutmeg':              'Nuez moscada',
    'Cardamom':            'Cardamomo',
    'Cloves':              'Clavos',
    'Chili Powder':        'Chile en polvo',
    'Curry Powder':        'Curry en polvo',
    'Garam Masala':        'Garam masala',
    'Sesame':              'Sésamo',
    'Sesame Seeds':        'Semillas de sésamo',
    'Vanilla':             'Vainilla',
    'Vanilla Extract':     'Extracto de vainilla',
    'Cocoa':               'Cacao',
    'Chocolate':           'Chocolate',

    // Frutos secos
    'Almond':              'Almendra',
    'Walnut':              'Nuez',
    'Peanut':              'Cacahuate',

    // ── Palabras sueltas para títulos de recetas ──────────────────────────
    'Baked':       'Al horno',
    'Fried':       'Frito',
    'Grilled':     'A la parrilla',
    'Roasted':     'Asado',
    'Steamed':     'Al vapor',
    'Stewed':      'Estofado',
    'Stew':        'Estofado',
    'Soup':        'Sopa',
    'Salad':       'Ensalada',
    'Cake':        'Pastel',
    'Pie':         'Tarta',
    'Pudding':     'Pudín',
    'Curry':       'Curry',
    'Stir':        'Salteado',
    'Pot':         'Olla',
    'Bowl':        'Tazón',
    'Roll':        'Rollo',
    'Rolls':       'Rollos',
    'Wrap':        'Envuelto',
    'Burger':      'Hamburguesa',
    'Sandwich':    'Sándwich',
    'Taco':        'Taco',
    'Tacos':       'Tacos',
    'Noodle':      'Fideos',
    'Noodles':     'Fideos',
    'Dumplings':   'Empanadillas',
    'Wings':       'Alitas',
    'Ribs':        'Costillas',
    'Chops':       'Chuletas',
    'Meatballs':   'Albóndigas',
    'Stuffed':     'Relleno',
    'Smoked':      'Ahumado',
    'Spicy':       'Picante',
    'Sweet':       'Dulce',
    'Sour':        'Ácido',
    'Crispy':      'Crujiente',
    'Creamy':      'Cremoso',
    'Chorizo':     'Chorizo',
    'Braised':     'Braseado',
    'Slow':        'Lento',
    'Cooked':      'Cocido',
    'with':        'con',
    'and':         'y',
    'in':          'en',
    'of':          'de',
    'the':         'el',
    'a':           'un',

    // Medidas comunes
    'to taste':    'al gusto',
    'as needed':   'según necesidad',
    'handful':     'un puñado',
    'pinch':       'una pizca',
  };

  /**
   * Traducción instantánea desde el diccionario local.
   * Hace lookup exacto primero; si falla, traduce palabra por palabra.
   */
  translateInstant(text: string): string {
    if (!text) return text;
    const trimmed = text.trim();

    // 1. Lookup exacto
    if (this.DICTIONARY[trimmed]) return this.DICTIONARY[trimmed];

    // 2. Traducción palabra a palabra para títulos compuestos
    const translated = trimmed
      .split(/(\s+|&)/)
      .map(token => {
        const t = token.trim();
        if (!t || t === '&') return t;
        // Intentar lookup de la palabra (case-insensitive)
        const entry = Object.keys(this.DICTIONARY).find(
          k => k.toLowerCase() === t.toLowerCase()
        );
        return entry ? this.DICTIONARY[entry] : t;
      })
      .join('');

    return translated;
  }

  // ─── Traducción vía API (para instrucciones largas) ───────────────────────

  private splitIntoChunks(text: string): string[] {
    const chunks: string[] = [];
    let remaining = text.trim();
    while (remaining.length > 0) {
      if (remaining.length <= this.MAX_CHUNK) { chunks.push(remaining); break; }
      let cut = remaining.lastIndexOf(' ', this.MAX_CHUNK);
      if (cut <= 0) cut = this.MAX_CHUNK;
      chunks.push(remaining.slice(0, cut).trim());
      remaining = remaining.slice(cut).trim();
    }
    return chunks;
  }

  private translateChunk(chunk: string): Observable<string> {
    if (!chunk || chunk.trim() === '') return of('');
    const trimmed = chunk.trim();
    if (this.DICTIONARY[trimmed]) return of(this.DICTIONARY[trimmed]);
    if (this.cache.has(trimmed))  return of(this.cache.get(trimmed)!);

    const encoded = encodeURIComponent(trimmed);
    return this.http
      .get<any>(`https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|es`)
      .pipe(
        map(response => {
          const translated: string = response.responseData?.translatedText ?? trimmed;
          const failed =
            response.responseStatus === 429 ||
            (typeof translated === 'string' && (
              translated.includes('MYMEMORY WARNING') ||
              translated.includes('QUERY LENGTH LIMIT')
            ));
          if (failed) return trimmed;
          this.cache.set(trimmed, translated);
          return translated;
        }),
        catchError(() => of(trimmed))
      );
  }

  /** Traduce un texto de cualquier longitud al español vía API con chunking. */
  translate(text: string): Observable<string> {
    if (!text || text.trim() === '') return of('');
    const trimmed = text.trim();
    if (this.DICTIONARY[trimmed]) return of(this.DICTIONARY[trimmed]);
    if (this.cache.has(trimmed))  return of(this.cache.get(trimmed)!);
    if (trimmed.length <= this.MAX_CHUNK) return this.translateChunk(trimmed);
    const chunks = this.splitIntoChunks(trimmed);
    return forkJoin(chunks.map(c => this.translateChunk(c))).pipe(
      map(parts => parts.join(' '))
    );
  }
}
