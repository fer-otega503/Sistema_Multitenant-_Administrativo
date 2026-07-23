from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Analytics Service - Sistema Multitenant",
    description="Servicio analítico de apoyo para reportes y estadísticas multitenant",
    version="1.0.0"
)

# Configurar middleware de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/analytics/status")
def get_status():
    """
    Endpoint de prueba para verificar que el servicio de apoyo analítico está activo.
    """
    return {
        "status": "active",
        "message": "El servicio de apoyo analítico está activo y operativo",
        "service": "analytics-service"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
