# PageRank - Simulador Interactivo

Simulador visual interactivo del algoritmo **PageRank**, desarrollado como proyecto final para el curso de Álgebra Lineal. Visualiza cómo se distribuye la importancia entre nodos en una red dirigida mediante un sistema de "navegantes" que recorren la red siguiendo las reglas del algoritmo.

## Características

- **Visualización en tiempo real** de los navegantes recorriendo la red
- **4 escenarios matemáticos** predefinidos que ilustran casos reales del algoritmo
- **Panel de resultados** con porcentajes de importancia actualizados dinámicamente
- **Interactividad**: agregar picos de tráfico manual haciendo clic en los nodos
- **Factor de amortiguamiento** α = 0.85 implementado (85% seguir enlace, 15% teletransporte aleatorio)
- **Animaciones fluidas** en canvas con efecto de estela y transiciones suaves

## Escenarios incluidos

| Escenario | Descripción |
|-----------|-------------|
| **Red Original** | A distribuye a B y C. C y D alimentan a A. A termina siendo la más importante. |
| **Red en Estrella** | B, C y D apuntan exclusivamente a A. A apunta a todos. A absorbe casi todo el tráfico. |
| **Bucle Circular** | A → B → C → D → A. Todas las páginas terminan con exactamente 25% de importancia. |
| **Grupos Aislados** | Dos componentes separadas {A,B} y {C,D}. Sin amortiguamiento el algoritmo fallaría. |

## Conceptos matemáticos

### PageRank
El PageRank modela la importancia de una página como la probabilidad de que un navegante aleatorio se encuentre en esa página después de muchos pasos. Se define recursivamente:

```
PR(A) = (1 - d) + d * (PR(B)/L(B) + PR(C)/L(C) + ...)
```

donde:
- **d** es el factor de amortiguamiento (0.85)
- **L(nodo)** es el número de enlaces salientes del nodo

### Interpretación de simulación
En este simulador, cada **navegante** representa un usuario navegando por la web:
- El **85%** de las veces sigue un enlace al azar desde la página actual
- El **15%** de las veces se teletransporta a cualquier página (factor de amortiguamiento)
- El **tamaño del nodo** y el **panel de ranking** reflejan la frecuencia relativa de visitas

## Estructura del proyecto

```
├── index.html   # Estructura HTML y elementos de interfaz
├── script.js    # Lógica del simulador, clases Surfer y renderizado en canvas
├── style.css    # Estilos visuales y layout
└── readme.md    # Documentación del proyecto
```

## Cómo usar

1. Abre `index.html` en tu navegador
2. Selecciona un escenario en la barra superior
3. Observa cómo los navegantes (puntos de luz) recorren la red
4. Haz clic en cualquier nodo para agregar un pico de tráfico manual
5. Consulta el ranking lateral para ver la distribución de importancia

## Controles

| Botón | Acción |
|-------|--------|
| `+100 Navegantes` | Agrega 100 navegantes distribuidos aleatoriamente |
| `Reiniciar Simulación` | Reinicia todos los contadores y vuelve a 200 navegantes |

## Tecnologías

- HTML5 Canvas para renderizado gráfico
- Vanilla JavaScript (sin dependencias)
- CSS moderno con `backdrop-filter` y gradientes

## Autor

Proyecto desarrollado para el curso de Álgebra Lineal - Capstone
