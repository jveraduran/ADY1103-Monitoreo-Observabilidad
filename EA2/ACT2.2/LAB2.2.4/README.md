# 🔬 Guía de Laboratorio 2.2.4: PromQL Avanzado - Matemáticas Operativas para CPU y Red
## 🎯 Objetivo de la Actividad
En la observabilidad moderna, los sensores (como Node Exporter) entregan la telemetría en formatos crudos (Counters) que son inútiles a simple vista. El objetivo de este laboratorio es que los estudiantes utilicen el lenguaje PromQL para aplicar operadores matemáticos, calcular derivadas de tiempo (velocidad) con la función rate() y consolidar datos complejos utilizando funciones de agregación espacial (avg by).

## ⚠️ Restricciones del Entorno (Learner Lab)
- Región y Capa Gratuita: Utilicen us-east-1 y una instancia t2.micro (Amazon Linux 2023).

- Puertos (Security Groups): Para ver la interfaz web de Prometheus y graficar los resultados, será obligatorio abrir el puerto 9090 en el Security Group de AWS asociado a su instancia.

## 📝 Paso a Paso Guiado
# Paso 1: Aprovisionamiento y Apertura de Puertos
1. En la consola de AWS, vayan a EC2 -> Launch instance.

2. Name: Servidor-PromQL-Lab.

3. AMI / Tipo: Amazon Linux 2023 / t2.micro. Llave: vockey.

4. En Network settings, hagan clic en Edit. Marquen Auto-assign public IP: Enable.

5. Agreguen una regla de Firewall (Add security group rule):

- Type: Custom TCP

- Port Range: 9090

- Source type: Anywhere (0.0.0.0/0)

6. Hagan clic en Launch instance.

### Paso 2: Instalación Standalone (Prometheus + Node Exporter)
1. Para consultar datos, necesitamos recolectarlos primero. Instalaremos el motor y el sensor usando Docker.

2. Conéctense a su instancia mediante EC2 Instance Connect.

3. Instalen Docker y herramientas base:

```bash
sudo dnf update -y
sudo dnf install docker stress wget -y
sudo systemctl start docker
```

4. Creen el archivo de configuración de Prometheus (para que lea el hardware local) ejecutando este bloque completo:

```bash
cat <<EOF > prometheus.yml
global:
  scrape_interval: 10s
scrape_configs:
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['localhost:9100']
EOF
```

5. Levanten Node Exporter y Prometheus en contenedores usando Docker nativo:

```bash
# Iniciar Node Exporter (Sensor de Hardware)
sudo docker run -d --net="host" --pid="host" -v "/:/host:ro,rslave" quay.io/prometheus/node-exporter:latest --path.rootfs=/host

# Iniciar Prometheus (Base de datos y Motor de Queries)
sudo docker run -d --net="host" -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus:latest
```

### Paso 3: Inyección de Carga (CPU y Red)
1. Para que nuestras gráficas matemáticas no sean líneas planas aburridas, inyectaremos caos en segundo plano.

2. Inyectar carga de CPU (al 50-100%):

```bash
stress --cpu 2 --timeout 3600 &
```

3. Inyectar carga de Red (descargar un archivo grande y descartarlo):

```bash
wget -O /dev/null http://speedtest.tele2.net/1GB.zip &
```

### Paso 4: Exploración de PromQL - Matemáticas de Red (Ancho de Banda)
1. Abran una nueva pestaña en su navegador y accedan a la interfaz de Prometheus: http://<IP_PUBLICA_EC2>:9090.

2. Vayan a la pestaña Graph (Gráfico).

3. El problema del Contador Crudo: En la barra de búsqueda, escriban node_network_receive_bytes_total y ejecuten. Verán líneas diagonales infinitas. Es el total histórico, no la velocidad actual.

4. Cálculo de Tasa (Derivada): Vamos a calcular la velocidad por segundo. Escriban:

```bash
rate(node_network_receive_bytes_total[5m])
```
Esto calcula los Bytes por Segundo. Sin embargo, las redes no se miden en Bytes, sino en Bits.

5. Matemáticas Operativas: Multipliquemos por 8 para obtener Bits, y dividamos para obtener Megabits. Filtremos también para ignorar la red interna (lo):

```bash
rate(node_network_receive_bytes_total{device!="lo"}[5m]) * 8 / 1024 / 1024
```

6. ¡Ejecuten la consulta! Ahora tienen un gráfico profesional de Mbps (Megabits por segundo), útil para facturación y SLAs de red.

### Paso 5: Exploración de PromQL - El Paradigma de la CPU
1. Borren la consulta anterior.

2. Lógica Inversa: Los sistemas operativos Linux miden la CPU contando los segundos que pasa inactiva. Escriban esto para ver la tasa de inactividad de sus núcleos:

```bash
rate(node_cpu_seconds_total{mode="idle"}[5m])
```

3. Saturación: Para obtener el uso real, debemos restarle esa inactividad al 100% (representado como 1 en fracciones matemáticas). Escriban:

```bash
1 - rate(node_cpu_seconds_total{mode="idle"}[5m])
```

4. Agregación Espacial: Si su máquina tuviera 8 núcleos, verían 8 líneas separadas. Para consolidar la salud del servidor en un solo número, promediaremos todos los núcleos usando avg by(instance) y lo multiplicaremos por 100 para convertirlo en un porcentaje amigable:

```bash
(1 - avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m]))) * 100
```

5. ¡Ejecuten! Verán cómo la gráfica refleja el pico de estrés que iniciaron en el Paso 3, expresado claramente en un porcentaje del 0 al 100%.

## 🏆 Conclusión Operativa y Reflexión SRE
Los datos crudos no son observabilidad. A través de este laboratorio, han comprobado que extraer la telemetría de un servidor es solo el 10% del trabajo. El verdadero valor de un ingeniero SRE radica en dominar lenguajes de consulta como PromQL para transformar contadores incomprensibles en indicadores de nivel de servicio (SLIs) claros, como "Ancho de banda en Mbps" o "Porcentaje general de saturación de CPU". El uso correcto de funciones de tiempo (rate) y agregación espacial (avg) evita la fatiga de alertas y entrega radiografías exactas del estado del negocio.