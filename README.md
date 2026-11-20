# Oh My Graphy

Editor visual de diagramas de clases UML, en español. Construido con **React 19, TypeScript, shadcn/ui, UI SDK de Vercel y React Flow**.

## Funciones

- Lienzo con zoom, desplazamiento, minimapa, cuadrícula y selección múltiple.
- Clases, interfaces, clases abstractas y enumeraciones.
- Edición de nombres, colores, atributos, métodos y descripciones desde el inspector.
- Asociación, herencia, composición, agregación, dependencia y realización con símbolos UML, etiquetas y multiplicidad en ambos extremos.
- Conexiones al arrastrar entre los puntos de las clases o mediante un formulario.
- Organización automática con Dagre, duplicación y un historial de 60 estados por diagrama.
- Varios diagramas y plantillas de pedidos, biblioteca y lienzo vacío.
- Guardado automático en `localStorage` del navegador.
- Importación de proyectos JSON validada, exportación de proyectos JSON, Mermaid, SVG vectorial y PNG de hasta 2×. Las imágenes incluyen todo el diagrama, también los elementos fuera de la pantalla.
- Atajos de teclado y paneles adaptables a pantallas pequeñas.

## Desarrollo

Requiere Node.js 22 y npm.

```bash
npm ci
npm run dev
```

```bash
npm test
npm run build
```

`npm run build` comprueba TypeScript y genera el sitio estático en `dist/`.

## Docker / Dokploy / Traefik

El `Dockerfile` usa una compilación por etapas y sirve los archivos con **NGINX sin privilegios**. El contenedor escucha únicamente en su puerto **interno 8080**.

**No hay asignaciones de puertos del host, reglas de dominio ni etiquetas de Traefik preconfiguradas.** `EXPOSE` en el Dockerfile y `expose` en Compose documentan el puerto del contenedor; no publican puertos externos.

### Opción A: Dockerfile en Dokploy

1. Conecta este repositorio y elige la rama que contiene la aplicación.
2. Selecciona el proveedor de compilación **Dockerfile**, ruta `Dockerfile` y contexto `.`.
3. Configura el dominio en Dokploy con puerto de destino **8080** y protocolo **HTTP** al contenedor.
4. Deja a Dokploy/Traefik la red, el enrutamiento externo y TLS. No añadas puertos publicados.
5. Despliega.

No requiere variables de entorno, base de datos ni volúmenes.

### Opción B: Compose

```bash
docker compose up -d --build
```

El servicio se llama `graphy` y expone internamente `8080`. En Dokploy configura el dominio para ese servicio y puerto. La red compartida con Traefik debe gestionarla tu despliegue/Dokploy; Compose no intenta asumir el nombre de una red externa existente.

### Verificación interna sin publicar puertos

```bash
docker compose exec graphy wget -q -O - http://127.0.0.1:8080/healthz
```

Respuesta esperada: `ok`. El Dockerfile incluye un `HEALTHCHECK` sobre este endpoint. GitHub Actions compila, ejecuta las pruebas, valida Compose, construye la imagen y comprueba HTTP dentro del contenedor sin publicar puertos del host.

## Datos y respaldos

Los proyectos viven en el navegador y **no se sincronizan entre dispositivos**. Cambiar de dominio u origen crea un espacio de almacenamiento diferente; borrar los datos del navegador elimina los proyectos. Usa **Exportar → Proyecto JSON** para guardar copias e **Importar proyecto JSON** para recuperarlas o moverlas a otro dispositivo.

El editor no envía tus diagramas a servicios de IA. UI SDK aporta comportamiento de controles y un puente WebMCP para los selectores y la barra del lienzo; no incluye un modelo de IA ni requiere claves API. Los paneles, botones, menús y diálogos utilizan componentes locales de shadcn/ui y Radix.

## Atajos

| Acción | Atajo |
| --- | --- |
| Crear clase | `C` |
| Seleccionar | `V` |
| Desplazar lienzo | `H` |
| Ajustar diagrama | `F` |
| Deshacer | `Ctrl/Cmd + Z` |
| Rehacer | `Ctrl/Cmd + Shift + Z` |
| Duplicar clase | `Ctrl/Cmd + D` |
| Eliminar selección | `Supr` / `Backspace` |
| Descargar JSON | `Ctrl/Cmd + S` |
| Ayuda | `?` |

Para atributos y métodos usa las firmas UML directamente: `- id: UUID`, `+ confirmar(): void`, `# validar(): Boolean` o `~ interno: String`.

## Estructura

- `src/lib/diagram.ts`: modelo, plantillas, validación, exportación Mermaid y operaciones.
- `src/lib/use-workspace.ts`: persistencia e historial por diagrama.
- `src/lib/export.ts`: exportación SVG y PNG sin servicios externos.
- `src/components/ui/`: componentes shadcn/ui.
- `src/components/choice.tsx`: selectores accesibles de UI SDK.
- `src/components/uml-node.tsx` / `uml-edge.tsx`: representación UML.
- `tests/`: importación, eliminación, exportaciones y puente de UI SDK.

UI SDK está fijado en `0.1.0-beta.13`; consulta la documentación de la versión instalada antes de actualizarlo.
