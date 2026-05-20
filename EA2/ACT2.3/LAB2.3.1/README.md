# 🚀 Laboratorio 2.3.2: Guía de Laboratorio Avanzada - Despliegue de Grafana, Conexión y Plantillas de la Comunidad
Duración Estimada: 135 minutos (3 horas académicas de 45 minutos)
Nivel: Intermedio
Enfoque: Operaciones DevOps / Ingeniería de Fiabilidad de Sitios (SRE)

## 📌 1. Objetivos del Laboratorio
Al finalizar este laboratorio, el estudiante será capaz de:

Orquestar un entorno completo de visualización y recolección de métricas persistentes utilizando Docker Compose.

Comprender el modelo de seguridad, permisos de almacenamiento y aislamiento de red nativo de Grafana.

Conectar e interconectar almacenes de series temporales (Prometheus) utilizando DNS interno de contenedores.

Descubrir, evaluar, importar y depurar plantillas estructuradas de dashboards de la comunidad oficial de Grafana (Dashboard ID: 1860).

## 🧠 2. Fundamentos Teóricos y Arquitectura
### 2.1 El Rol de Grafana en la Pila de Observabilidad
Grafana funciona exclusivamente como una capa de consulta y visualización unificada. A diferencia de los sistemas tradicionales de monitoreo monolíticos, Grafana no almacena métricas de series temporales en su base de datos interna. Su base de datos integrada (típicamente SQLite) solo almacena metadatos: usuarios, contraseñas hash, permisos, nombres de paneles y configuraciones JSON de los dashboards.

### 2.2 Redes de Contenedores y Resolución DNS de Docker
Al desplegar infraestructura distribuida en Docker, el uso de direcciones IP estáticas (172.X.X.X) representa un antipatrón crítico. Docker incluye un servidor DNS embebido que resuelve el nombre de los servicios definidos en el archivo docker-compose.yml. Por lo tanto, cuando Grafana necesite consumir datos de Prometheus, la resolución se gestionará mediante el nombre del servicio http://prometheus:9090.

### 2.3 Plantillas Orientadas a Objetos (Dashboards como Código)
Cada dashboard en Grafana es, en el fondo, un objeto JSON estructurado. La comunidad de Grafana comparte estas plantillas en un repositorio central. Cuando importamos el Dashboard ID 1860 ("Node Exporter Full"), estamos inyectando un archivo estructurado que mapea de manera estandarizada las métricas nativas expuestas por el componente Node Exporter.

## 🛠️ 3. Prerrequisitos y Preparación del Entorno
Garantizaremos un lienzo limpio eliminando conflictos previos y preparando estructuras de almacenamiento con persistencia real.

# 1. Actualizar repositorios e instalar utilidades esenciales
```bash
sudo apt update && sudo apt install -y curl git systemctl docker.io docker-compose
```

# 2. Asegurar que el servicio de Docker esté activo y habilitado en el arranque
```bash
sudo systemctl enable --now docker
```

# 3. Crear el árbol de directorios para el laboratorio
```bash
mkdir -p ~/lab-grafana-templates/grafana-storage
mkdir -p ~/lab-grafana-templates/prometheus-config
```

# 4. Corregir permisos de almacenamiento para Grafana
# Grafana corre internamente con el usuario no-root UID 472. Si el directorio del host
# pertenece a root, el contenedor fallará al intentar inicializar su base de datos SQLite.
```bash
sudo chown -R 472:472 ~/lab-grafana-templates/grafana-storage
cd ~/lab-grafana-templates
```

## 🐳 4. Paso 1: Definición de la Infraestructura como Código (IaC)
Procederemos a escribir la configuración completa de nuestra pila de monitoreo.
1. Crear el archivo de configuración de Prometheus (prometheus-config/prometheus.yml):

```yaml
global:
  scrape_interval: 15s     # Frecuencia con la que Prometheus solicita métricas
  evaluation_interval: 15s # Frecuencia con la que se evalúan las reglas de alerta

scrape_configs:
  - job_name: 'prometheus-interno'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'infraestructura-host'
    static_configs:
      - targets: ['node-exporter:9100']
```

2. Crear el archivo principal de orquestación (docker-compose.yml):

```yaml
version: "3.8"

networks:
  observabilidad_net:
    driver: bridge

services:
  prometheus:
    image: prom/prometheus:v2.45.0
    container_name: prometheus-core
    restart: unless-stopped
    networks:
      - observabilidad_net
    volumes:
      - ./prometheus-config/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    ports:
      - "9090:9090"

  node-exporter:
    image: prom/node-exporter:v1.6.1
    container_name: node-exporter-agent
    restart: unless-stopped
    networks:
      - observabilidad_net
    pid: "host" # Crucial para que el exportador lea los procesos del sistema operativo real
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--path.rootfs=/rootfs'
    ports:
      - "9100:9100"

  grafana:
    image: grafana/grafana-oss:10.0.3
    container_name: grafana-ui
    restart: unless-stopped
    networks:
      - observabilidad_net
    ports:
      - "3000:3000"
    volumes:
      - ./grafana-storage:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=SRE_Master_2026!
      - GF_USERS_ALLOW_SIGN_UP=false
```

3. Desplegar los servicios en segundo plano:
```bash
sudo docker-compose up -d
```

4. Validar que todos los contenedores estén en estado operativo (Up):

```bash
sudo docker-compose ps
```

## 🔗 5. Paso 2: Aprovisionamiento y Conexión de Data Sources
1. Abra su navegador web e ingrese a la interfaz de Grafana: http://<IP_DE_TU_SERVIDOR>:3000

2. Autentíquese con las credenciales configuradas:

- Usuario: admin

- Contraseña: SRE_Master_2026!

3. En el menú de navegación izquierdo, diríjase a Connections -> Data Sources.

4. Haga clic en el botón azul Add data source.

5. Seleccione la opción Prometheus.

6. En la sección de configuración de la conexión (HTTP):

- URL: Ingrese http://prometheus:9090
(Nota: No utilice localhost ni 127.0.0.1, ya que desde la perspectiva interna del contenedor de Grafana, localhost se refiere a sí mismo, no al host ni a Prometheus).

7. Desplácese hasta la parte inferior de la pantalla y haga clic en Save & Test.

8. Verifique la aparición del banner verde confirmando el éxito de la conexión: "Successfully queried the Prometheus API."

## 🎨 6. Paso 3: Importación Estructurada del Dashboard ID 1860
El Dashboard 1860 es desarrollado y mantenido por la comunidad para proveer un monitoreo completo de sistemas Linux utilizando Node Exporter.

1. En la barra de navegación de Grafana, haga clic en el icono de Dashboards (cuadrículas).

2. Haga clic en el botón desplegable New situado en la esquina superior derecha y seleccione Import.

3. En el campo de texto etiquetado como Find and import dashboards via grafana.com, escriba el identificador único: 1860 y presione Load.

4. Grafana leerá los metadatos de la API oficial y presentará las opciones de configuración del dashboard "Node Exporter Full".

5. Configurar opciones de importación:

- Folder: Seleccione General.

- Prometheus: En el menú desplegable, seleccione la fuente de datos aprovisionada en el paso anterior (Prometheus).

6. Haga clic en el botón Import.

## 🔍 7. Paso 4: Análisis Forense de la Plantilla Importada
Actividad de Análisis Crítico para el Estudiante:
Una vez cargado el dashboard, observe las métricas reflejadas en tiempo real. Modifique el selector de tiempo en la esquina superior derecha a Last 5 minutes y active el refresco automático cada 10s.

Responda las siguientes preguntas analizando el comportamiento de las gráficas:

1. El Selector Superior (Variables): Cambie el selector de Job o Host. Observe cómo toda la pantalla cambia en cascada. Esto se debe a que las consultas internas no están ligadas a un servidor estático, sino a una variable dinámica denominada $node o $instance.

2. Uptime: Ubique el panel que calcula el Uptime del servidor. Si detiene temporalmente el envío de métricas, ¿cómo calcula este panel el tiempo transcurrido? (Utiliza la función time() - node_boot_time_seconds).

## 🧪 8. Paso 5: Validación Práctica de la Persistencia de Datos
Uno de los mayores errores en laboratorios efímeros es no comprobar el estado de persistencia de las configuraciones de visualización.

1. Regrese a la terminal Linux y ejecute una destrucción completa del entorno de contenedores:

```bash
sudo docker-compose down
```

2. Verifique que no queden contenedores en ejecución: sudo docker-compose ps

3.  Vuelva a inicializar la infraestructura completa:

```bash
sudo docker-compose up -d
```

4. Recargue su navegador web en http://<IP_DE_TU_SERVIDOR>:3000. Inicie sesión.

5. Vaya a la sección de Dashboards.

Pregunta de Evaluación: ¿El Dashboard 1860 y la configuración de nuestra fuente de datos Prometheus siguen existiendo? Explique detalladamente por qué el directorio ./grafana-storage fue capaz de retener este estado a pesar de que el ciclo de vida del contenedor llegó a su fin.

## 🛠️ 9. Tabla de Solución de Problemas (Troubleshooting)

## 🛠️ 9. Tabla de Solución de Problemas (Troubleshooting)

| Síntoma Encontrado | Causa Raíz Probable | Solución Operativa |
| :--- | :--- | :--- |
| El contenedor de Grafana se reinicia constantemente o muestra un error `Permission Denied` en los logs. | El directorio local `./grafana-storage` fue creado por el usuario root y el usuario interno `472` no tiene permisos de escritura. | Ejecutar de forma inmediata: `sudo chown -R 472:472 ./grafana-storage` y reiniciar la pila con `docker-compose restart`. |
| Al presionar *Save & Test*, Grafana retorna un error del tipo `HTTP Error Bad Gateway` o `Connection Refused`. | Se ingresó una URL incorrecta como `http://localhost:9090` o Prometheus falló en su inicialización. | Cambiar la URL de la fuente de datos a la ruta del DNS interno de Docker: `http://prometheus:9090`. Comprobar logs de prometheus con `docker logs prometheus-core`. |
| El Dashboard 1860 carga correctamente pero todos los paneles muestran un mensaje informando `No Data`. | Prometheus no está recolectando de forma efectiva las métricas de Node Exporter debido a una falla en el archivo de configuración `prometheus.yml`. | Acceder a `http://<IP>:9090/targets` y verificar si el endpoint `node-exporter:9100` está en estado verde (`UP`). |