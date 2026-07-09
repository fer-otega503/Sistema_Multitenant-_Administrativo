# Sistema Administrativo de Ventas Multitenant

Este es el repositorio principal (Monorepo) para el Producto Mínimo Viable (MVP) del sistema de ventas. El proyecto utiliza una arquitectura orientada a servicios (SOA) con soporte multitenant, separando los datos de cada cliente mediante esquemas aislados dentro de la misma base de datos (Schema-per-tenant).

## Tecnologías Utilizadas

* **Backend:** Node.js con el framework Express.js.
* **Frontend:** React, inicializado mediante Vite.
* **Base de Datos:** PostgreSQL.
* **Infraestructura:** Entorno local utilizando Docker y Docker Compose.

---

## Configuración Inicial (Solo la primera vez)

### 1. Preparar el Backend
Abre tu terminal, entra a la carpeta del backend e instala las dependencias:
```bash
cd backend
npm install
```
> **Nota importante:** Pide el archivo `.env` al administrador o equipo de desarrollo y colócalo dentro de la carpeta `backend`.

### 2. Preparar el Frontend
Entra a la carpeta del frontend e instala las librerías necesarias:
```bash
cd frontend
npm install
```

### 3. Levantar la Base de Datos e Inicializar Tablas
Primero, asegúrate de iniciar el contenedor de PostgreSQL en segundo plano desde la raíz del proyecto:
```bash
docker-compose up -d
```
Luego, desde la carpeta del backend, ejecuta el script de inicialización. Esto creará el esquema base y aislará las tablas (Users, Products, Sells):
```bash
cd backend
node init-db.js
```

---

## Ejecución del Proyecto (Día a Día)

Para trabajar en el proyecto, te recomendamos abrir tres pestañas en tu terminal y ejecutar estos comandos en el siguiente orden:

### Terminal 1: Base de Datos
*Siempre inicia la base de datos primero desde la raíz del proyecto.*
```bash
docker-compose up -d
```

### Terminal 2: Backend
*Inicia el servidor backend, el cual correrá en el puerto 8090 con recarga automática.*
```bash
cd backend
npm run dev
```

### Terminal 3: Frontend
*Inicia el servidor de desarrollo de la interfaz.*
```bash
cd frontend
npm run dev
```

> **Verificación:** Por el momento, puedes verificar el estado de la base de datos ingresando a `http://localhost:8090/api/test-db` en tu navegador.

---

## Detener Servicios

Al terminar tu jornada, es importante liberar los puertos y la memoria de tu equipo deteniendo los servicios correctamente:

1. Ve a las terminales del **Frontend** y **Backend** y presiona `Ctrl + C` para detener las ejecuciones de Node.js.
2. En la terminal de la **raíz del proyecto**, detén el contenedor de PostgreSQL de forma segura:
```bash
docker-compose stop
```