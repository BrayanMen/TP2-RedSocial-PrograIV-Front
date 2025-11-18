# Red Social de Artes Marciales - Frontend (TP#2 Programación IV)

## 1. Contexto General del Proyecto

Este repositorio contiene el **Frontend (SPA)** para un proyecto full-stack de la materia **Programación IV** de la Tecnicatura Universitaria en Programación (UTN Avellaneda).

El proyecto completo es una "Red Social" que consiste en:

* **Backend (Este repo):** API REST desarrollada en **NestJS**.
* **Frontend:** Aplicación SPA (Single Page Application) desarrollada en **Angular**.

Esta aplicación está construida en **Angular** y consume una API REST (desarrollada en NestJS) para crear una  **red social enfocada en artistas marciales** .

## 2. Descripción Funcional y Requisitos del TP

La aplicación frontend debe cumplir con los siguientes flujos de experiencia de usuario (UX) y requisitos funcionales:

### A. Autenticación y Seguridad

* **Acceso Restringido:** Solo los usuarios registrados y logueados pueden acceder al contenido. Cualquier intento de acceso no autorizado debe redirigir al Login.
* **Registro:** Formulario con validaciones estrictas (campos obligatorios, formato de email, contraseña segura) e incluyendo la subida de una imagen de perfil (con recorte/cropper).
* **Login:** Ingreso mediante usuario/email y contraseña. El token JWT recibido debe almacenarse de forma segura (manejado vía cookies HTTP-only por el backend) y usarse para mantener la sesión.
* **Control de Sesión:**
  * Al iniciar la app, se valida el token contra el backend (`/authorize`).
  * A los 10 minutos de inactividad/uso, debe aparecer un **Modal** preguntando al usuario si desea extender su sesión.

### B. Publicaciones (Feed y Detalle)

* **Visualización:** Las publicaciones se muestran en un feed principal, ordenadas por defecto por fecha. Cada publicación debe ser un componente reutilizable (`PostCard`).
* **Ordenamiento:** El usuario debe poder cambiar el orden del feed (ej. por cantidad de "Me gusta").
* **Interacciones:**
  * **Me Gusta:** Dar y quitar "like" a las publicaciones.
  * **Comentarios:** Ver comentarios en una publicación, agregar nuevos, y editar los propios.
  * **Gestión:** El autor de una publicación (o un admin) puede eliminarla (baja lógica).
* **Paginación:** Inicialmente paginado (botón "cargar más" o similar), evolucionando a **Scroll Infinito** en etapas avanzadas.

### C. Perfiles de Usuario

* **Mi Perfil:** Pantalla para que el usuario logueado vea sus datos y sus últimas 3 publicaciones. Debe permitir la edición de datos personales.
* **Perfil de Otros:** Al hacer clic en el nombre de un usuario en el feed o comentarios, se debe navegar a su perfil público (vista de solo lectura).

### D. Panel de Administración (Solo Admin)

* **Dashboard de Usuarios:** Listado completo de usuarios con opciones para dar de baja (deshabilitar) o alta (rehabilitar) lógica.
* **Estadísticas:** Visualización de gráficos (torta, barras, líneas) alimentados por endpoints específicos del backend (ej. posts por usuario, likes por día).

### E. Funcionalidades Avanzadas (Sprints Finales)

* **Guardados:** Posibilidad de guardar publicaciones en una colección personal y verlas en una pantalla dedicada.
* **Compartir:** Funcionalidad para enviar una publicación a otro usuario específico y ver las que me han compartido ("Compartidos conmigo").
* **PWA:** La aplicación debe ser instalable (Progressive Web App).

## 3. Tecnologías (Frontend)

* **Framework:** Angular
* **Routing:** `@angular/router`
* **Estilos:** TailwindCSS, GSAP
* **Programación Reactiva:** RxJS
* **SSR:** Angular Universal (`@angular/ssr`)
* **PWA:** `@angular/service-worker`
* **Componentes de Terceros:**
  * `ngx-image-cropper` (para recortar la imagen de perfil durante el registro).

## 4. Arquitectura

La estructura del proyecto separa responsabilidades de la siguiente manera:

<pre _ngcontent-ng-c1709322443="" class="ng-tns-c1709322443-55"><sider-code-explain id="sider-code-explain" data-gpts-theme="dark"></sider-code-explain><code _ngcontent-ng-c1709322443="" role="text" data-test-id="code-content" class="code-container formatted ng-tns-c1709322443-55 no-decoration-radius">src/app/
├── core/                    # Lógica central, guards y servicios singleton
│   ├── guards/              # (AuthGuard, AdminGuard, PublicGuard)
│   ├── interceptors/        # (AuthInterceptor, ErrorInterceptor)
│   ├── interfaces/          # (User, Post, ApiResponse, etc.)
│   └── services/            # (AuthService, ApiService, PostsService, LoadingService)
│
├── features/                # Componentes "inteligentes" o Páginas
│   ├── auth/                # (Login, Register)
│   ├── home/                # (Feed de publicaciones)
│   ├── users/
│   │   ├── profile/         # (MiPerfil y Perfil de otros)
│   │   └── admin/           # (Dashboard de Usuarios y Estadísticas)
│   └── ...                  # (Futuras vistas como Post-Detail)
│
└── shared/                  # Componentes "tontos" o Reutilizables
    ├── components/
    │   ├── layout/          # (Navbar, Sidebar, Footer)
    │   ├── loading/         # (Spinner global)
    │   ├── modal/           # (Componente de modal reutilizable)
    │   ├── post-card/       # (Tarjeta de publicación)
    │   └── splash/          # (Pantalla de carga inicial)
    └── ...                  # (Pipes y Directivas personalizadas)
</code></pre>

## 5. Estado del Proyecto (Sprints 1-6)

### Implementado (Sprints 1-3)

Lo siguiente ya está construido y funcional:

#### Sprint 1 - Completado

* [X] Creación del proyecto Angular.
* [X] Pantallas (componentes creados): Registro, Login, Publicaciones (Feed) y MiPerfil.
* [X] Navegación básica entre componentes (`app.routes.ts`).
* [X] **Componente Login:** Formulario reactivo con validaciones (usuario/correo, contraseña).
* [X] **Componente Registro:** Formulario reactivo con validaciones (nombre, correo, usuario, contraseña, fecha de nacimiento, etc.) e integración de `ngx-image-cropper` para la foto de perfil.
* [X] **Servicio:** `AuthService` con métodos `login()` y `register()`.

#### Sprint 2 - Completado

* [X] **Página Publicaciones (Feed):**
  * [X] Muestra el listado de publicaciones consumiendo `PostsService`.
  * [X] Permite cambiar el ordenamiento (fecha, "me gusta").
  * [X] Funcionalidad de Dar y Quitar "Me Gusta" (conectado al `PostsService`).
  * [X] Botón para eliminar mis propias publicaciones.
  * [X] Uso del componente `shared/post-card` para renderizar cada post.
* [X] **Componente Mi Perfil:**
  * [X] Muestra los datos del usuario logueado.
  * [X] Muestra las últimas 3 publicaciones del usuario.

---

### Pendiente (Sprints 4-6)

Esto es lo que falta por implementar según los requisitos del TP:

#### Sprint 3 - Pendiente

* [ ] **Página Publicación (Detalle):**
  * [ ] Lógica para mostrar una publicación individual y sus comentarios.
  * [ ] Permite escribir y enviar nuevos comentarios.
  * [ ] Muestra comentarios con paginación ("cargar más").
  * [ ] Permite al usuario editar sus propios comentarios.
* [ ] **Flujo de Autenticación:**
  * [ ] **Splash Screen:** Componente que llama a `autorizar` en el `AuthService` para verificar el token al iniciar la app.
  * [X] **Guards:** `authGuard` (protege rutas privadas) y `publicGuard` (protege /login y /register).
  * [ ] **Modal de Sesión:** Lógica (probablemente en `AuthService` o `Navbar`) que detecta inactividad y muestra un modal a los 10 minutos para "extender sesión" (llama a `refrescar` token).
  * [ ] **Interceptor 401:** `ErrorInterceptor` que detecta errores 401 (Unauthorized) y redirige al Login.

#### Sprint 4 - Pendiente

* **Frontend (Vistas de Admin):**
  * [ ] **Guard:** Implementar lógica completa en `adminGuard` y proteger las rutas `/admin/*`.
  * [ ] **Página Dashboard/Usuarios (Admin):**
    * [ ] Mostrar listado de *todos* los usuarios.
    * [ ] Formulario para crear nuevos usuarios (con selector de rol).
    * [ ] Implementar botones de **baja lógica** (deshabilitar) y **alta lógica** (rehabilitar).
  * [ ] **Página Dashboard/Estadísticas (Admin):**
    * [ ] Conectar con el `AnalyticsService` del backend (aún por crear).
    * [ ] Renderizar Gráficos (torta, barras, líneas) para:
      * (Stat 1) Publicaciones por usuario.
      * (Stat 2) Comentarios realizados en un lapso de tiempo.
      * (Stat 3) Comentarios por publicación.
* **Frontend (Global):**
  * [ ] **PWA:** Configurar completamente el Service Worker (`ngsw-config.json`) para que la app sea instalable.
  * [ ] **Pipes:** Crear 3 Pipes personalizadas (ej. `TimeAgoPipe`, `SanitizeHtmlPipe`, etc.).
  * [ ] **Directivas:** Crear 3 Directivas personalizadas (ej. `appHighlight`, `appRoleBasedView`, etc.).

#### Sprint 5 - Pendiente

* **Frontend (Mejoras):**
  * [ ] **Navegación:** Hacer que los nombres de usuario en `post-card` o comentarios sean clickeables y lleven a `profile/:id`.
  * [ ] **Página Publicaciones (Feed):**
    * [ ] Reemplazar la paginación actual por  **Scroll Infinito** .
  * [ ] **Página Dashboard/Estadísticas (Admin):**
    * [ ] (Stat 4) Gráfico: Cantidad de ingresos (log in) por usuario.
    * [ ] (Stat 5) Gráfico: Cantidad de visitas a mi perfil (por otros).
    * [ ] (Stat 6) Gráfico: Cantidad de "me gusta" otorgados por día.

#### Sprint 6 - Pendiente

* **Frontend (Nuevas Funcionalidades):**
  * [ ] **Componente `post-card`:**
    * [ ] Botón para "Guardar" / "Quitar de guardados".
    * [ ] Botón "Compartir" (debe abrir un modal para elegir un usuario).
  * [ ] **Página Guardados (Nueva):**
    * [ ] Crear nueva ruta y componente (`/saved`).
    * [ ] Mostrar todas las publicaciones guardadas por el usuario.
  * [ ] **Página Compartidos (Nueva):**
    * [ ] Crear nueva ruta y componente (`/shared-with-me`).
    * [ ] Mostrar publicaciones compartidas conmigo (e indicar quién la compartió).
  * [ ] **Página Publicaciones (Feed):**
    * [ ] Agregar nuevos ordenamientos: "Por cantidad de veces guardado" y "Por cantidad de veces compartido".

# 6. Objetivo de este Archivo

El objetivo de este GEMINI.md es proveer un contexto completo a Google Gemini Code Assist. Úsalo para entender la relación entre el frontend y el backend, y cómo las funcionalidades del código se alinean con los requisitos del Trabajo Práctico (TP#2).
