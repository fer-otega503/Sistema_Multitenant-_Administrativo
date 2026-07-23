# Sistema Multitenant Administrativo

Este es un proyecto completo que incluye un frontend en React (Vite), un backend principal en Node.js (Express) y un servicio de analítica en Python (FastAPI).

## Requisitos Previos

Asegúrate de tener instalados los siguientes componentes antes de comenzar:
- **Node.js** (v18 o superior recomendado) - Para el frontend y backend principal.
- **Python** (3.8 o superior) - Para el servicio de analítica.
- **PostgreSQL** - Base de datos para el backend multitenant (asegúrate de configurar las variables de entorno o tenerlo corriendo localmente).

---

## 1. Instalación de Dependencias

### Frontend
Abre una terminal y navega a la carpeta del frontend para instalar las dependencias:
```bash
cd frontend
npm install
```

### Backend Principal (Node.js)
Abre otra terminal, navega a la carpeta del backend e instala sus dependencias:
```bash
cd backend
npm install
```

### Backend Analítico (Python)
Abre otra terminal, navega a la carpeta del servicio analítico e instala los paquetes necesarios usando `pip`:
```bash
cd analytics-service
pip install -r requirements.txt
```
> **Nota:** Se recomienda crear y activar un entorno virtual (`python -m venv venv` y `source venv/bin/activate` o `venv\Scripts\activate` en Windows) antes de instalar las dependencias de Python.

---

## 2. Ejecución del Proyecto (Cómo arrancar todo)

Para que el proyecto funcione en su totalidad con la integración habilitada, debes levantar los tres servicios simultáneamente en terminales separadas.

### Iniciar el Backend Analítico (Python)
Este servicio se ejecuta en el puerto **8000**:
```bash
cd analytics-service
python main.py
```
> *Si usas uvicorn globalmente también puedes correr: `uvicorn main:app --reload`*

### Iniciar el Backend Principal (Node.js)
Este servicio actúa como servidor principal y como puente (proxy) hacia el servicio analítico. Se ejecuta en el puerto **3000**:
```bash
cd backend
npm run dev
```

### Iniciar el Frontend (React Vite)
El frontend se conecta al backend de Node.js en el puerto 3000. Para iniciarlo:
```bash
cd frontend
npm run dev
```
Normalmente Vite usará el puerto **5173**. Al iniciar, te mostrará la URL local en la terminal (ej. `http://localhost:5173/`).

---

## 3. Comprobación de la Integración
1. Abre tu navegador y navega a la URL del frontend (ej. `http://localhost:5173/`).
2. Accede con un usuario válido en el login.
3. Al ingresar, verás la vista "Sección en desarrollo". En esta vista aparecerá una tarjeta verde con el mensaje **"Integración Python Activa ✅"**, lo que confirma que:
   - El frontend contactó correctamente a Node.js.
   - Node.js reenvió la petición a Python (FastAPI).
   - Python respondió y los datos llegaron hasta el frontend de vuelta.

---

## 4. Cómo Detener el Proyecto

Para parar el proyecto, simplemente ve a cada una de las tres terminales donde tienes corriendo los servicios y presiona:

`Ctrl + C`

Al presionar esto, el proceso se interrumpirá. Asegúrate de hacerlo en las tres terminales (Frontend, Node, Python) para apagar todos los servicios por completo.