# Lisa rayada y microplásticos

Proyecto de aula de la Universidad del Norte sobre la ingestión de microplásticos en la lisa rayada (*Mugil incilis*) de la Ciénaga Grande de Santa Marta, Colombia.

**Pregunta de investigación:** ¿Cuál es la evidencia científica sobre la ingestión de microplásticos por la lisa rayada en la Ciénaga Grande de Santa Marta, y cuáles son sus posibles implicaciones fisiológicas?

## Equipo

Sofía Miranda, Jorge Mosquera, Juliana Schultz, Giselle Torres y Salvador Sáenz.

## Estructura del repositorio

```
microplasticos-cgsm/
├── README.md              Este archivo
├── LICENSE                Licencia del código del sitio (MIT)
├── .gitignore
├── docs/                  Sitio web (GitHub Pages sirve esta carpeta)
│   ├── index.html
│   ├── css/styles.css
│   ├── js/main.js         Cuadrícula de peces
│   ├── js/juego.js        Juego «Nada con la lisa»
│   ├── js/muestreo.js     Simulador «Pesca una muestra»
│   ├── js/recorrido.js    Dibujo del «Recorrido de una fibra» (página y video)
│   ├── js/recorrido-web.js  Recorrido ligado al scroll
│   ├── assets/video/      Video MP4 del sitio
│   └── assets/img/        Imágenes e infograma del sitio
├── informe/               Informe escrito (Word) de cada entrega
├── fuentes/               Referencias y notas de lectura de los artículos
│   └── referencias.md
└── multimedia/            Video MP4 y su código (video-src/: node render.js)
```

## Publicar el sitio con GitHub Pages

1. Crea un repositorio nuevo en GitHub, por ejemplo `microplasticos-cgsm`.
2. Sube todo el contenido de esta carpeta (con Git o con *Add file > Upload files*).
3. En el repositorio, abre **Settings > Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**, la rama `main` y la carpeta `/docs`. Guarda.
5. Después de uno o dos minutos, el sitio queda en `https://TU-USUARIO.github.io/microplasticos-cgsm/`.

Con Git en la terminal:

```bash
git init
git add .
git commit -m "Primer borrador del sitio del proyecto"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/microplasticos-cgsm.git
git push -u origin main
```

Para ver el sitio en tu computador, abre `docs/index.html` en el navegador.

## Pendientes antes de la entrega (19 de noviembre de 2026)

- [ ] Verificar la referencia de Rojas-Luna et al. (2025) o cambiarla por otra fuente sobre peces del Caribe colombiano. Mientras tanto no se usa en los resultados.
- [ ] Escribir la sección de recomendaciones (en `docs/index.html` y en el informe).
- [ ] Cambiar el enlace del pie de página por la dirección real del repositorio.
- [x] Video de 42 s, 1080p 60 fps (hecho con código) en `multimedia/` y en `docs/assets/video/`.

## Licencia

El código del sitio usa la licencia MIT. Los textos del informe pertenecen a las autoras y autores del proyecto.
