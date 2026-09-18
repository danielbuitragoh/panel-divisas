# Cómo subirlo a GitHub

Panel de divisas latinoamericanas frente al euro, con datos de 98 bancos centrales. Sin servidor.

## 1 · Crear el repositorio y subirlo

En GitHub, crea un repositorio nuevo llamado `panel-divisas`, **público** y **vacío**
(sin README, sin licencia, sin .gitignore — ya están aquí). Después, desde esta
carpeta:

```bash
git init
git add .
git commit -m "Primera versión"
git branch -M main
git remote add origin https://github.com/danielbuitragoh/panel-divisas.git
git push -u origin main
```

Si la carpeta ya tenía git, sáltate `git init` y `git branch -M main`.

## 2 · Antes de publicar, comprueba

Que no sube ningún secreto:

```bash
git ls-files | grep -iE "\.env$|secret|credential"
```

Debe devolver vacío (o solo archivos `.ejemplo`).

## 3 · Encender la demo

**Settings → Pages → Source: GitHub Actions**. El workflow `desplegar.yml` publica solo en cada push a `main`.

Queda en `https://danielbuitragoh.github.io/panel-divisas/`.



## 4 · Los dos minutos que más rinden

En la portada del repositorio, junto a **About** (arriba a la derecha, el
engranaje):

- **Descripción:** Panel de divisas latinoamericanas frente al euro, con datos de 98 bancos centrales. Sin servidor.
- **Website:** el enlace de la demo si la hay, y si no, tu portafolio.
- **Topics:** `react, typescript, vite, recharts, data-visualization, accessibility, dataviz, github-pages`

Los topics son lo que hace que el repositorio aparezca en búsquedas de GitHub.

Y fíjalo en tu perfil: **tu perfil → Customize your pins**.
