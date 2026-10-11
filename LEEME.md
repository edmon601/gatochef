# Gato Chef 🐱🍪

Juego de cocina con minijuegos para una niña de 5 años. Sin publicidad, sin compras, sin enlaces
externos y sin pedir ningún dato. Una vez instalado funciona sin internet.

## Qué hace el juego

Un gatito chef naranja guía a la niña para cocinar **10 recetas**, cada una con sus propios minijuegos.
Todas están abiertas desde el inicio (sin bloqueos, para que nunca se frustre).

| Receta | Minijuegos |
|---|---|
| 🍪 **Galletas** (6) | Echar ingredientes (¡el calcetín es una trampa!) · romper huevos · mezclar girando el dedo · cortar formas · hornear esperando el timbre · decorar con chispas |
| 🍕 **Pizza** (6) | Amasar tocando la masa · pintar la salsa con el dedo sin salirse · poner ingredientes (¡el osito no va!) · hornear · **💨 soplar para enfriar** · cortar deslizando el dedo |
| 🥗 **Ensalada** (5) | Lavar frotando la suciedad · cortar deslizando el dedo (¡el zapato no!) · arrastrar al tazón (¡el osito no!) · echar aliño y soltar en la zona verde · mezclar |
| 🍲 **Sopa** (6) | Ingredientes a la olla (¡el chocolate no!) · llenar de agua hasta la zona verde · reventar burbujas · revolver · tres pizcas de sal y probar · **💨 soplar para enfriar** |
| 🍝 **Espagueti** (6) | Agua hasta la zona verde · ingredientes (¡el calcetín no!) · reventar burbujas · salsa de tomate · mezclar · **💨 soplar para enfriar** |
| ☕ **Chocolate caliente** (6) | Servir la leche · ingredientes (¡la cebolla no!) · mezclar · calentar y sacar cuando suene · **💨 soplar para enfriar** · decorar (¡el brócoli no!) |
| 🥞 **Panqueques** (5) | Ingredientes (¡el osito no!) · mezclar · **voltear deslizando hacia arriba** cuando esté dorado (2 veces) · miel · fruta (¡el zapato no!) |
| 🍔 **Hamburguesa** (5) | Lavar verduras · cocinar la carne · **apilar en orden** (pan, carne, queso, lechuga, pan) · kétchup · papitas y refresco |
| 🎂 **Torta** (8) | Ingredientes (¡el pescado no!) · mezclar · llenar el molde · hornear · crema · decorar · **poner las velas contando** (ni más ni menos) · **💨 soplar las velas con el micrófono** |
| 🧁 **Cupcakes** (5) | Ingredientes (¡el calcetín no!) · mezclar · hornear · crema · decorar (¡la cebolla no!) |

- Tocar al gato = maullido agradable.
- Equivocarse = maullido de gato estresado, **un solo maullido de 2 segundos** (la cara de susto del gato dura lo mismo). Sin castigo: siempre puede repetir el paso.
- Una voz explica cada paso, y cada instrucción lleva dibujos para quien aún no lee.
- Al terminar una receta, el gato celebra y la tarjeta de esa receta gana una ⭐ (hasta 5).
- Está pensado en vertical. Si se gira un celular a horizontal aparece "¡Gira el celular!"
  (las tablets sí funcionan en horizontal).

## Instalar en Android (igual que Equilibra)

1. Sube **todo el contenido de esta carpeta** al mismo tipo de alojamiento que usaste para Equilibra
   (cualquier hosting web con HTTPS sirve: GitHub Pages, Netlify, etc.).
2. Abre la dirección en **Chrome** en el celular o tablet.
3. Menú de Chrome (⋮) → **Instalar aplicación** (o "Agregar a pantalla de inicio").
4. Se instala con el icono del gato chef y se abre a pantalla completa.

> Abrir `index.html` directamente desde el almacenamiento del celular NO sirve para instalarlo:
> hace falta alojarlo en una dirección https.

## 🧠 Niveles de dificultad

En **Ajustes para papás → Dificultad** (por defecto **2 · Chef**):

| Nivel | Qué cambia |
|---|---|
| 1 · Fácil | Como antes: un toque por ingrediente, zonas verdes grandes. |
| 2 · Chef | **Cantidades**: cada ingrediente trae un número (0/2, 0/3…) y hay que tocarlo exactamente esas veces (si se pasa, ¡ya está completo!). Paso extra **🧠 Memoriza la receta** (ve 3 ingredientes, desaparecen y los elige de memoria). Zonas verdes más angostas, más vueltas al mezclar, horno con menos margen, más burbujas con **burbujas de fuego 🔥 que NO se tocan**, más panqueques que voltear, hamburguesa de 7 capas y sal con cantidad variable (2 a 5 pizcas). |
| 3 · Maestro | Todo lo anterior más difícil y con **2 trampas extra** en cada paso de ingredientes (jabón, globo, calcetín…), cantidades de hasta 3, memoria con menos tiempo y velas de la torta con cantidad aleatoria. |

## 🎤 Soplar con el micrófono

En los pasos "💨 ¡Sopla para enfriar!" la comida sale muy caliente (humo y barra de temperatura). La niña
sopla hacia el celular y el **micrófono detecta si de verdad sopló**: la barra baja mientras hay soplido y
sube despacito si deja de soplar. Cuando se enfría puede comer 🍴. Si intenta comer **antes** de que se enfríe,
¡quema! y el gato maúlla estresado. Hablar, gritar o aplaudir NO cuenta como soplido.

- La primera vez Chrome pide **permiso de micrófono**: papá o mamá debe tocar **Permitir**. Se recuerda para siempre.
  Si lo negó: candado junto a la dirección → Permisos → Micrófono → Permitir.
- Muy sensible: detecta soplidos suaves (nivel 2.5 por defecto). Una vez que baja la temperatura, **la comida no se vuelve a calentar**.
- **No graba ni guarda ni envía nada**: solo mide el sonido en el momento y el micrófono se apaga al terminar el paso.
- Si no hay micrófono o no hay permiso, aparece un botón 💨 que se mantiene presionado para "soplar".
- Requiere HTTPS (igual que para instalarlo). Mientras el micrófono está encendido, algunos Android bajan un poco el volumen de los sonidos; es normal.
- En Ajustes para papás: **🎤 Probar micrófono** muestra una barra en vivo y dice "💨 Soplido detectado".
  Si a tu hija no le detecta soplidos suaves, sube **Sensibilidad del soplido** (hasta 8); si se activa con ruido de fondo, bájala.
  También se puede desactivar el micrófono (entonces usa el botón 💨).

## Ajustes para papás

En la pantalla de inicio, **mantén presionado 1 segundo el engranaje ⚙️** (arriba a la derecha,
casi invisible a propósito para que la niña no lo abra):

- Volumen general y **volumen del maullido de error** (más bajo por defecto)
- **Dificultad** (1, 2 o 3)
- Activar o desactivar la voz que explica
- Activar o desactivar el maullido estresado (si algún día le asusta)

## Sonidos reales (maullidos y cocina)

**Ya incluido:** el maullido del gato estresado (audio de Luis, recortado a un solo maullido de 2 s y bajado de volumen) va **dentro de `embedded-sounds.js`**, así que suena aunque no subas la carpeta `sounds/`. Suena cada vez que la niña se equivoca; mientras suena no se apila otro y la voz no lo tapa. (`sounds/meow-bad-1.mp3` es solo la copia del archivo.)

El resto de sonidos (maullido agradable, cocina) los **fabrica el juego por sí mismo** como reemplazo. Para usar sonidos reales:

1. Pon los archivos (.mp3, .ogg o .wav) en la carpeta `sounds/` con estos nombres:

   | Nombre | Cuándo suena |
   |---|---|
   | `meow-ok-1`, `meow-ok-2`, `meow-ok-3` | Al tocar al gato (agradables) |
   | `meow-bad-1`, `meow-bad-2`, `meow-bad-3` | Al equivocarse (estresados) |
   | `crack` | Romper huevos |
   | `plop` | Ingrediente cae al tazón |
   | `chop` | Cortar formas |
   | `swoosh` | Mezclar |
   | `ding` | Timbre del horno |
   | `tada` | Paso terminado |
   | `sizzle` | Sonido del horno (se repite) |

   No hace falta tener todos: los que falten usan el sonido de reemplazo.
2. Escribe los nombres con extensión en `sounds/list.json`, por ejemplo:
   `["meow-ok-1.mp3", "meow-bad-1.mp3", "crack.wav"]` (la lista actual ya trae `meow-bad-1.mp3`; agrega los nuevos sin quitarlo)
3. En `sw.js` sube el número de `CACHE` (ahora es `gatochef-v6`; pasa a `gatochef-v7`) y agrega los archivos nuevos a la lista `CORE` para que
   los celulares ya instalados descarguen los cambios.

## Actualizar y comprobar que tienes la versión nueva

1. Sube **todos** los archivos al hosting (incluido `embedded-sounds.js`).
2. Abre la app **dos veces** (la primera descarga la versión nueva, la segunda la usa).
3. Comprueba: en la pantalla de inicio **mantén presionado 1 segundo el engranaje ⚙️**. Abajo debe decir
   `Versión 6 · Maullido de error: cargado ✓ (2 s)`. Con el botón **🔊 Probar el maullido de error** lo oyes sin tener que equivocarte.
4. Si NO aparece la línea de "Versión" o dice otra versión, el celular sigue con archivos viejos: en Android abre
   Ajustes → Aplicaciones → Gato Chef → Almacenamiento → **Borrar caché** (y si hace falta **Borrar datos**), o desinstala y vuelve a instalar.

## Archivos

- `index.html`, `style.css`: pantallas y estilos.
- `embedded-sounds.js`: el maullido de error incluido dentro del juego.
- `game.js`: motor del juego, el gato, los sonidos y la pantalla de inicio.
- `recipes.js`: las recetas y todos sus minijuegos.
- `manifest.json`, `sw.js`, `icons/`: lo que lo hace instalable y funcional sin internet.
- `sounds/`: sonidos opcionales.
