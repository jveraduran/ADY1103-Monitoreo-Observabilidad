# Guía de Laboratorio 1.3.4: Análisis de Infraestructura como Código (IaC) 🕵️‍♂️

**Tema:** Lectura de repositorios, Docker Compose y Configuración de Prometheus  
**Entorno:** Trabajo Grupal / Code Review (Navegador Web o IDE)  
**Tiempo estimado:** 40 minutos  

---

## 🎯 Objetivo de la Actividad
Un buen Ingeniero de Confiabilidad (SRE) nunca ejecuta un `docker compose up` sin entender primero qué está levantando. En esta actividad, realizarán una revisión de código (*Code Review*) de los archivos del proyecto que desplegaremos en la próxima Experiencia de Aprendizaje (EA2). Aprenderán a identificar cómo se declaran los servicios, los puertos y cómo Prometheus sabe a dónde ir a buscar los datos.

---

## 📖 Contexto: El Repositorio de Observabilidad

Acaban de clonar el repositorio del equipo de plataforma. Este repositorio contiene todo lo necesario para levantar un stack de monitoreo Open-Source local que, a su vez, se conecta con la nube (Grafana Cloud). 

Su misión es analizar 3 archivos clave antes de que el equipo reciba luz verde para desplegar a producción.

---

## 🏗️ Fase 1: Análisis de `docker-compose.yaml` (La Arquitectura)

Abran el archivo `docker-compose.yaml`. Este archivo define los "servidores" (contenedores) que van a nacer.

**Actividad de análisis (Discutan en grupo):**
1. **Los Servicios:** Identifiquen los 3 servicios que se van a levantar (`prometheus`, `node-exporter`, `pushgateway`).
2. **Los Puertos:** Completen mentalmente el mapa de red. ¿En qué puerto vivirá la interfaz de Prometheus? ¿Y el Pushgateway?
3. **El "Truco" del Node Exporter:** Observen detalladamente la configuración de `node-exporter`.
```yaml
    pid: "host"
    volumes:
        - /proc:/host/proc:ro
        - /sys:/host/sys:ro
        - /:/rootfs:ro
```

*Pregunta para el grupo: Si un contenedor está aislado por naturaleza, ¿por qué le estamos "inyectando" las carpetas /proc y /sys del servidor anfitrión (host) en modo de solo lectura (ro)? ¿Qué intenta leer el node-exporter?*

## 📡 Fase 2: Análisis de prometheus.yml (El Cerebro)
Abran el archivo ```prometheus.yml```. Si el archivo anterior levantaba las máquinas, este archivo le dice a Prometheus qué hacer.

Actividad de análisis:

El Modelo Pull (Scrape): Busquen la sección ```scrape_configs```. Notarán que Prometheus tiene dos "trabajos" (```job_name```).

¿A quiénes está vigilando (raspeando) Prometheus cada 15 segundos?

El Puente a la Nube (Remote Write): Observen la sección final ```remote_write```.

```yaml
remote_write:
  - url: "<PROMETHEUS_URL>"
    basic_auth:
      username: "<GRAFANA_INSTANCE_ID>"
      password: "<GRAFANA_API_KEY>"
```

*Pregunta para el grupo: Sabemos que Prometheus usa un modelo Pull (trae métricas hacia él). Sin embargo, ¿qué hace el bloque remote_write? ¿Transforma a Prometheus en un agente Push que envía datos hacia Grafana Cloud?*

## 🐍 Fase 3: Análisis de promql.py (El Generador de Ruido)
Abran el script ```promql.py```. Como aún no tenemos clientes reales usando nuestro sistema, este script en Python simulará ser nuestra aplicación transaccional.

Actividad de análisis:

1. Tipos de Métricas: El script importa y utiliza 4 tipos de métricas fundamentales de la librería de Prometheus. Localícenlas en el código:

- Gauge: Se usa para ```app_temperature_celsius``` y ```app_cpu_usage_percent```. ¿Por qué estas métricas usan ```Gauge``` y no ```Counter```? (Pista: miren cómo se usa la función ```.set(random.uniform(...))```).

- Counter: Se usa para ```app_requests_total```. Observen que usa ```.inc()``` (incrementar) y nunca disminuye.

2. El destino: ¿Hacia dónde envía el script de Python estos datos? Fíjense en la constante ```PUSHGATEWAY_URL = "http://localhost:9091"```.

## 📝 Fase 4: Entregable de Code Review (Checklist SRE)
Para aprobar esta revisión, redacten un documento breve (1 página) respondiendo a las siguientes preguntas técnicas derivadas de su análisis:

1. Si el día de mañana agregamos una base de datos MySQL en el puerto 3306 y le ponemos un exporter en el puerto 9104... ¿En qué archivo (docker-compose.yaml o prometheus.yml) y en qué sección exactos tendríamos que agregar la IP y el puerto para que Prometheus empiece a leerla?

2. Expliquen con sus propias palabras el viaje completo de los datos del script de Python: ¿Cómo llega la temperatura aleatoria (app_temperature_celsius) desde el código Python hasta Grafana Cloud? Describan el flujo (Quién empuja a quién, y quién jala de quién).

3. ¿Por qué el node-exporter necesita permisos especiales (pid: "host") y montar volúmenes del sistema operativo host, a diferencia de los otros contenedores?