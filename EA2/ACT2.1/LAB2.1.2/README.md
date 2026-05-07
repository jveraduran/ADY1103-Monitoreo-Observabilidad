# Laboratorio 2.1.4 - Guia Lab Despliegue Observabilidad Alloy

Este laboratorio se centra en la "inteligencia": cómo recolectar esos datos, enviarlos a la nube e instrumentar una aplicación propia.

## 📌 Resumen de la Actividad
Utilizarás Grafana Alloy como recolector central para enviar métricas a Grafana Cloud y crearás métricas personalizadas en Python.

### 1️⃣ Prerrequisitos
Haber completado el Lab 2.1.2 (Docker y Exporters activos).

Token de Grafana Cloud (```GCLOUD_RW_API_KEY```).

Puerto ```8081``` abierto para la App de Python.

Levantar la Infraestructura (Docker)
Como el laboratorio es nuevo, primero debemos encender nuestros "sensores".

1. Instalar Docker:
```bash
sudo apt update && sudo apt install -y docker.io docker-compose
sudo systemctl start docker
```
2. Lanzar contenedores:

```bash
sudo docker-compose up -d
```

### 2️⃣ Instalación de Grafana Alloy
1. Reemplaza [TOKEN], [ID] y [URL] con tus credenciales de Grafana Cloud.

    1. Inicia sesión en tu cuenta de Grafana.

    2. En el menú de la izquierda, ve a Administration > Connections > Add new connection.

    3. Busca "Linux Server" o directamente "Prometheus".

    4. Busca la sección que dice "Details" o "Manual Configuration". Allí encontrarás:

        - Remote Write Endpoint: Esa es tu TU_URL.

        - Username / Instance ID: Ese es tu TU_ID.

        - API Token: Debes generar uno con rol "MetricsPublisher"; ese es tu TU_TOKEN.

2. Ejecutar el comando en la terminal
Una vez que tengas los datos, abre la terminal de tu servidor (EC2 o Debian) y prepáralos así (sustituyendo los valores):


```bash
export GCLOUD_HOSTED_METRICS_ID="TU_ID"
export GCLOUD_HOSTED_METRICS_URL="TU_URL"
export GCLOUD_RW_API_KEY="TU_TOKEN"
/bin/sh -c "$(curl -fsSL https://storage.googleapis.com/cloud-onboarding/alloy/scripts/install-linux.sh)"
```

### 3️⃣ Configuración de Alloy (/etc/alloy/config.alloy)
Edita el archivo (sudo nano /etc/alloy/config.alloy) y agrega estos bloques al final:

```bash
prometheus.scrape "docker_containers" {
targets = [{ address = "localhost:8080" }]
forward_to = [prometheus.remote_write.metrics_service.receiver]
}

prometheus.scrape "network_probes" {
targets = [
{
address    = "localhost:9115",
__param_target = "http://localhost:8080/metrics",
instance       = "servidor_local",
},
]
metrics_path = "/probe"
params       = { module = ["http_2xx"] }
forward_to   = [prometheus.remote_write.metrics_service.receiver]
}

prometheus.scrape "python_app" {
targets = [{ address = "localhost:8081", instance = "app_python_01" }]
forward_to = [prometheus.remote_write.metrics_service.receiver]
}
```

Reinicia el servicio:
``` bash
sudo alloy validate /etc/alloy/config.alloy
sudo systemctl restart alloy
```

### 4️⃣ Instrumentación con Python
Crea una App que genere sus propias métricas.

Instalar entorno:
```bash
python3 -m venv venv
source venv/bin/activate
pip install prometheus_client flask
```

Crear app.py:
```bash
from flask import Flask, Response
from prometheus_client import CollectorRegistry, Gauge, generate_latest
import random

app = Flask(name)
registry = CollectorRegistry()

temp_gauge = Gauge('app_temperature_celsius', 'Temperatura', registry=registry)

@app.route('/metrics')
def metrics():
temp_gauge.set(random.uniform(20.0, 40.0))
return Response(generate_latest(registry), mimetype='text/plain')

if name == 'main':
app.run(host='0.0.0.0', port=8081)
```

### 5️⃣ Verificación Final

Una vez que Alloy esté corriendo y tu script de Python esté activo, sigue estos pasos para confirmar que los datos viajaron correctamente desde tu instancia EC2 hasta la nube:

1. Acceso al Explorador de Datos
Inicia sesión en tu cuenta de Grafana Cloud.

En el menú lateral izquierdo, haz clic en el icono de la brújula (Explore).

En el selector de fuente de datos (Dropdown superior izquierdo), asegúrate de seleccionar la opción que dice grafanacloud-tu-nombre-prom (es la fuente de tipo Prometheus).

2. Ejecución de Consultas de Prueba (PromQL)
En la barra de consultas, ingresa las siguientes métricas para validar cada componente:

Validación de la App Python: Escribe ```app_temperature_celsius``` y presiona ```Shift + Enter```.

¿Qué deberías ver? Una gráfica con valores que fluctúan entre 20 y 50. Si aparece la métrica en el autocompletado, la conexión es exitosa.

Validación de Red (Blackbox): Escribe ```probe_success``` y ejecuta.

¿Qué deberías ver? Un valor de ```1```. Esto indica que Blackbox está logrando "pinguear" exitosamente el puerto de cAdvisor (8080).

Validación de Infraestructura (cAdvisor): Escribe ```container_cpu_usage_seconds_total``` y ejecuta.

¿Qué deberías ver? Múltiples líneas que representan el consumo de CPU de cada contenedor corriendo en tu Docker.

3. El "Semáforo" de Salud (Targets)
Si no ves datos, puedes verificar qué está recibiendo Alloy directamente en su interfaz de diagnóstico (si tienes el puerto de Alloy abierto) o revisando los logs en la terminal:

```bash
# Ver los últimos 20 registros de Alloy para buscar errores de "Remote Write"
sudo journalctl -u alloy -n 20
```

### 💡 Tips para el Alumno:
Refresco de datos: Por defecto, la gráfica puede mostrar los últimos 1 hora. Cambia el rango de tiempo en la esquina superior derecha a "Last 5 minutes" y activa el "Live" o auto-refresh cada 10s para ver las métricas de Python en tiempo real.

Etiquetas (Labels): Fíjate que al ejecutar una métrica, abajo aparecen etiquetas como ```instance="servidor_local"```. Estas fueron las que configuraste en el archivo ```config.alloy```.