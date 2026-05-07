# Laboratorio 2.1.2 - Guia Lab Analisis IaC DockerCompose

Este laboratorio se centra en la preparación del host y el despliegue de los "productores de métricas" (Exporters) utilizando Docker.

## 📌 Resumen de la Actividad
Desplegarás la base técnica del stack de observabilidad. Aprenderás a orquestar contenedores que extraen métricas del sistema y de red, preparando el terreno para la recolección centralizada.

### 1️⃣ Prerrequisitos
Servidor Debian/Ubuntu (Local o AWS EC2).

Acceso con privilegios sudo.

Puertos abiertos en Security Groups: 8080 (cAdvisor) y 9115 (Blackbox).

### 2️⃣ Instalación del Motor de Orquestación (Docker)

Actualizar e instalar dependencias:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg lsb-release
```

Configurar repositorio oficial de Docker:
```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
```

Instalar Docker Engine y Compose:
```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### 3️⃣ Infraestructura como Código (IaC)

#### A. Crear archivo de configuración para Blackbox (blackbox.yml):
Define cómo vamos a probar los servicios (vía HTTP e ICMP).

```bash
modules:
http_2xx:
prober: http
timeout: 5s
http:
method: GET
icmp:
prober: icmp
timeout: 5s
```

#### B. Crear archivo de orquestación (docker-compose.yml):
```bash
version: "3.8"
services:
cadvisor:
image: gcr.io/cadvisor/cadvisor:latest
container_name: cadvisor
restart: unless-stopped
ports:
- "8080:8080"
volumes:
- /:/rootfs:ro
- /var/run:/var/run:ro
- /sys:/sys:ro
- /var/lib/docker/:/var/lib/docker:ro
privileged: true

blackbox_exporter:
image: prom/blackbox-exporter:latest
container_name: blackbox_exporter
restart: unless-stopped
ports:
- "9115:9115"
volumes:
- ./blackbox.yml:/etc/blackbox_exporter/config.yml:ro
```

### 4️⃣ Despliegue y Validación
Iniciar servicios:
```bash
sudo docker compose up -d
```

Validar que los exportadores exponen datos:
```bash
curl -s http://localhost:8080/metrics | head -n 5
curl -s http://localhost:9115/metrics | head -n 5
```

### 5️⃣ Diccionario de Métricas Técnicas
container_cpu_usage_seconds_total: Consumo de CPU por ID de contenedor.

container_memory_usage_bytes: RAM consumida por cada proceso Docker.

probe_success: Resultado del último chequeo de red (1=OK, 0=Fallo).