# 📂 Guía de Laboratorio 2.2.2: Instalación y Análisis Profundo de Node Exporter
Duración estimada: 90 minutos (2 bloques de 45 min).

Objetivo: Comprender la arquitectura de observabilidad a nivel de sistema operativo y extraer métricas de hardware crudas para su transporte a la nube.

## 📌 1. Introducción Teórica (15 min)
Node Exporter no es una aplicación común; es un "traductor". Su función es leer los archivos virtuales del kernel de Linux ubicados en /proc (información de procesos y sistema) y /sys (información de hardware y drivers) y convertirlos al formato de texto que Prometheus entiende.

¿Por qué Node Exporter y no cAdvisor?
cAdvisor: Se enfoca en el aislamiento de recursos de contenedores (Docker/LXC).

Node Exporter: Se enfoca en la salud del "fierro" o la instancia virtual (EC2/Debian).

## 🛠️ 2. Configuración del Entorno Efímero (15 min)
Como el laboratorio se destruye, debemos asegurar que Docker y las bases estén listas.

### Actualización e instalación de dependencias
```bash
sudo apt update && sudo apt install -y docker.io docker-compose curl
sudo systemctl start docker
```

### Crear directorio de trabajo
```bash
mkdir -p ~/lab-node-exporter && cd ~/lab-node-exporter
```

## 🐳 3. Despliegue de Infraestructura con Docker (20 min)
Para que Node Exporter vea el servidor real desde adentro de un contenedor, necesitamos romper el aislamiento de Docker usando network_mode: host y montando el sistema de archivos raíz.

Crear el archivo docker-compose.yml:

```yaml
version: "3.8"
services:
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: unless-stopped
    # 'host' permite ver la red real de la EC2, no la red virtual de Docker
    network_mode: host
    pid: "host"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--path.rootfs=/rootfs'
      # Excluimos servicios wifi o bluetooth para limpiar las métricas
      - '--collector.wifi=false'
      - '--collector.bluetooth=false'
    ports:
      - "9100:9100"
```