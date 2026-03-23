# 🚢 Barco & Faro — Versión 2

> **Aprende composición de funciones navegando el océano matemático**

![HTML](https://img.shields.io/badge/HTML-100%25-378ADD?style=flat-square)
![Sin dependencias](https://img.shields.io/badge/dependencias-ninguna-1D9E75?style=flat-square)
![Matemáticas](https://img.shields.io/badge/tema-Composición%20de%20Funciones-BA7517?style=flat-square)

---

## 🧠 ¿Qué aprenderás?

Este juego enseña **composición de funciones** — uno de los conceptos más importantes del precálculo — a través de una simulación interactiva real.

Una **función** es como una máquina: le metes un número y te devuelve otro.
La **composición** es encadenar dos máquinas: el resultado de la primera entra directo a la segunda.

```
(f ∘ g)(x) = f( g(x) )
              ↑
         primero g(x),
         luego ese resultado entra a f
```

### 👟 La analogía de los calcetines

| Paso | Acción | Función |
|------|--------|---------|
| 🧦 Primero | Ponerse los calcetines | g(x) |
| 👟 Luego   | Ponerse los zapatos    | f(x) |
| 🚶 Resultado | Salir de casa         | (f∘g)(x) |

> No puedes ponerte los zapatos sin los calcetines. **El orden importa.** Eso es composición.

### ✏️ Ejemplo con números

Si `g(x) = x + 3` y `f(x) = 2x`, con `x = 4`:

```
Paso 1 → g(4) = 4 + 3 = 7
Paso 2 → f(7) = 2 × 7 = 14
Respuesta: 14 ✓
```

---

## 🗺️ Tu misión — El barco y el faro

Un barco navega a **20 mi/h** paralelo a la orilla. El faro está **5 millas** perpendicular a ella.

Usarás dos funciones encadenadas para calcular la distancia exacta al faro en cada instante:

| Función | Fórmula | Qué hace |
|---------|---------|----------|
| **g** (primera) | `g(t) = 20t` | Tiempo → distancia recorrida en la orilla |
| **f** (segunda) | `f(d) = √(25 + d²)` | Distancia d → distancia directa al faro (Pitágoras) |

```
Función compuesta completa:

(f∘g)(t) = √( 25 + (20t)² )
```

### 🎯 Cómo se juega

En cada escena verás los datos del barco. Tu trabajo es resolver las funciones **paso a paso** eligiendo la respuesta correcta:

1. Calcular `d = g(t) = 20t` — ¿cuánto avanzó el barco?
2. Calcular `s = f(d) = √(25 + d²)` — ¿a qué distancia está el faro?

---

## ⭐ Escenas del juego

| Escena | t (horas) | d = g(t) | s = f(d) |
|--------|-----------|----------|----------|
| 1 | 1 h | 20 mi | ≈ 20.6 mi |
| 2 | 2 h | 40 mi | ≈ 40.3 mi |
| 3 | 3 h | 60 mi | ≈ 60.2 mi |
| 4 | 4 h | 80 mi | ≈ 80.2 mi |
| 5 | 5 h | 100 mi | ≈ 100.1 mi |
| 6 | 6 h | 120 mi | ≈ 120.1 mi |

---

## 📚 Lo que aprendes al completarlo

- ⚙️ `g(t) = 20t` — convierte tiempo en distancia recorrida a lo largo de la orilla
- 📐 `f(d) = √(25 + d²)` — usa el teorema de Pitágoras para hallar la distancia directa al faro
- 🔗 `(f∘g)(t) = √(25 + (20t)²)` — la función compuesta en un solo paso
- 🧭 Por qué **el orden importa** en la composición de funciones

---

## ⚙️ Tecnología

| Tecnología | Uso |
|-----------|-----|
| HTML5 | Estructura del juego |
| CSS3 | Estilos y animaciones |
| JavaScript | Lógica del juego |

> Sin frameworks, sin dependencias. Solo abre `index.html` en tu navegador y ¡a navegar!

---

## 🚀 Cómo ejecutar

```bash
# Clona el repositorio
git clone https://github.com/dbarrientos-dev/barco-faro-game-version-2.git

# Entra a la carpeta
cd barco-faro-game-version-2

# Abre el juego (o simplemente haz doble clic en index.html)
open index.html
```

---

## 🍴 Fork original

Basado en el trabajo de [@aebenavides898-beep](https://github.com/aebenavides898-beep/barco-faro-game-).
Versión 2 mejorada por [@dbarrientos-dev](https://github.com/dbarrientos-dev).

---

<div align="center">
  <strong>⛵ ¡Zarpa ahora y conquista la composición de funciones!</strong>
</div>
