# 📊 Laboratorio 2.3.4: Diseño y Construcción de Dashboards Custom desde Cero

## 📌 1. Objetivos del Laboratorio
Al finalizar este laboratorio, el estudiante será capaz de:

1. Diseñar arquitecturas de tableros de control profesionales basados en metodologías SRE como USE (Utilization, Saturation, Errors).

2. Construir paneles de visualización avanzados correlacionando múltiples tipos de datos (Gauges, Stats, Time Series).

3. Escribir expresiones avanzadas en lenguaje PromQL aplicando operadores aritméticos de conversión de escala y filtros de etiquetas eficientes.

4. Desarrollar tableros de control multi-entorno parametrizados dinámicamente mediante el uso avanzado de variables basadas en consultas analíticas de metadatos.

## 🧠 2. Principios de Diseño: La Metodología USE
Para este laboratorio custom, estructuraremos nuestro dashboard siguiendo el modelo USE propuesto por Brendan Gregg para el análisis de rendimiento de componentes de infraestructura física o virtual:

- Utilization (Utilización): El porcentaje de tiempo promedio en el que el recurso estuvo ocupado realizando trabajo útil (Ejemplo: % de uso de CPU).

- Saturation (Saturación): El grado en el cual el recurso tiene trabajo extra que no puede procesar de inmediato, usualmente reflejado en colas de espera (Ejemplo: Load Average).

- Errors (Errores): El conteo explícito de eventos de fallo en los recursos del sistema.

## 🏗️ 3. Paso 1: Inicialización del Lienzo y Configuración de un Dashboard Custom
1. Inicie sesión en su consola de Grafana (http://<IP>:3000).

2. En la esquina superior derecha de la sección de Dashboards, haga clic en New -> New Dashboard.

3. Acceda a las opciones globales del tablero haciendo clic en el icono del engranaje (Dashboard Settings) en la barra de herramientas superior:

- Name: Monitoreo Core e Infraestructura - [Tus Iniciales]

- Description: Dashboard de producción basado en métricas custom y la metodología SRE USE.

- Refresh live dashboard: Seleccione 5s, 10s, 30s como opciones válidas y fije el auto-refresh global por defecto en 5s.

4. Haga clic en Save dashboard en la esquina superior derecha. Asigne un mensaje de commit inicial: init: estructura base del lienzo de producción.

## 📈 4. Paso 2: Implementación de la Capa SRE de CPU (Componente: Gauge Avanzado)
Diseñaremos el panel principal de utilización de cómputo utilizando la compleja ecuación inversa del tiempo del procesador.

1. En el lienzo principal, haga clic en el botón Add visualization.

2. Seleccione su fuente de datos aprovisionada (Prometheus).

3. En la sección de edición de consultas (pestaña Query), ingrese la expresión matemática exacta de PromQL:

```bash
(1 - avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m]))) * 100
```

4. En el panel de propiedades derecho (Panel Options), ajuste los siguientes parámetros específicos de diseño:

- Title: Utilización de CPU Global (Promedio 5m)
- Description: Mide el porcentaje de tiempo real que los procesadores ejecutan tareas útiles fuera del estado Idle.
- Visualización: Cambie el selector superior de Time Series a Gauge.

5. Desplácese a la sección de configuración de escala (Standard Options):

- Unit: Misc / Percent (0-100)
- Min: 0
- Max: 100

6. Configure la política de colores críticos por umbral (Thresholds):

- Base: Color Verde (Estado Saludable).
- Añadir umbral en 70: Color Amarillo/Naranja (Estado de Alerta).
- Añadir umbral en 90: Color Rojo (Saturación Crítica / Degradación de Servicio).

7. Haga clic en Apply arriba a la derecha.

## 🧠 5. Paso 3: Monitoreo de Memoria y Capacidad Operativa (Componente: Stat Panel)
A diferencia de la CPU, la Memoria RAM es un recurso de tipo Gauge directo (sube y cambia constantemente de volumen disponible).

1. Haga clic en el botón superior de añadir panel (Add -> Visualization).

2. Query PromQL para calcular el porcentaje absoluto de ocupación de memoria en el sistema:

```bash
((node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes) * 100
```

3. Parámetros del panel derecho:

- Title: Consumo de Memoria Volátil (RAM)
- Visualización: Seleccione Stat.
- Stat Options -> Graph Mode: Seleccione Area (esto incrustará una mini-gráfica sombreada debajo del valor numérico gigante).
- Stat Options -> Color Mode: Seleccione Value.

4. Sección Standard Options:

- Unit: Misc / Percent (0-100)
- Min: 0
- Max: 100

5. Configurar Umbrales (Thresholds):

- Base: Verde
- Umbral en 80: Amarillo
- Umbral en 95: Rojo

6. Haga clic en Apply.

## 🌐 6. Paso 4: Capacidad y Rendimiento de Interfaces de Red (Componente: Time Series)
Monitorearemos el volumen real de transferencia en la interfaz principal de comunicación.

1. Haga clic en Add -> Visualization.

2. Query PromQL para medir la tasa de bytes por segundo entrantes (Descarga):

```bash
rate(node_network_receive_bytes_total{device="eth0"}[5m])
```
Nota: Si tu interfaz de red de internet se llama de otra forma (como enp0s3 o bond0), reemplaza la etiqueta device adecuadamente.

3. Añada una segunda consulta dentro del mismo panel presionando el botón + Add query para medir la subida (Carga):

```bash
rate(node_network_transmit_bytes_total{device="eth0"}[5m])
```

4. Configuración del formato de leyendas dinámicas (Options -> Legend):

- Query A: Ingrese Tráfico Entrante (Descarga) - {{device}}
- Query B: Ingrese Tráfico Saliente (Carga) - {{device}}

5. Parámetros del panel derecho:

- Title: Rendimiento de Red e Interfaces de Comunicación
- Visualización: Time Series

6. Sección Standard Options:

- Unit: Data Rate / bytes/sec (B/s)

7. Haga clic en Apply.

## 🛠️ 7. Paso 5: Parametrización Dinámica Mediante Variables Analíticas
Si dejamos el dashboard con las consultas actuales, este colapsará o se volverá confuso si conectamos múltiples servidores a nuestro Prometheus, ya que las métricas se mezclarían o se promediarían incorrectamente. Automatizaremos el entorno.

1. Ingrese a Dashboard Settings (icono de engranaje superior).

2. Seleccione el submenú Variables en la barra lateral izquierda.

3. Haga clic en Add variable.

4. Configure las opciones de metadatos exactas de la variable:

- Name: servidor
(Este nombre es el identificador que usaremos en el código PromQL como $servidor).

- Label: Instancia de Servidor
- Type: Query
- Data source: Seleccione Prometheus.
- Query: Ingrese la consulta analítica de etiquetas de Prometheus:
```bash
label_values(node_cpu_seconds_total, instance)
```
- Selection Options: Active el interruptor Include All option y Multi-value.

5. Haga clic en Apply o Save. Observe cómo aparece un selector desplegable dinámico en la parte superior del dashboard.

### 🔄 Modificación de Paneles para Enlace Dinámico
Debe editar cada uno de los paneles creados anteriormente para inyectar el filtro de la variable.

- Edite el Panel de CPU: Modifique la consulta agregando el filtro dinámico por instancia:

```bash
(1 - avg by(instance) (rate(node_cpu_seconds_total{instance=~"$servidor", mode="idle"}[5m]))) * 100
```

- Edite el Panel de Memoria RAM: Modifique la consulta agregando el filtro:
```bash
((node_memory_MemTotal_bytes{instance=~"$servidor"} - node_memory_MemAvailable_bytes{instance=~"$servidor"}) / node_memory_MemTotal_bytes{instance=~"$servidor"}) * 100
```

- Edite el Panel de Red: Modifique ambas consultas agregando el filtro:
```bash
rate(node_network_receive_bytes_total{instance=~"$servidor", device="eth0"}[5m])
```

Guarde el Dashboard. Ahora, al cambiar el valor del selector superior, los paneles mutarán dinámicamente sin necesidad de reescribir código.

## 🧪 8. Paso 6: Desafío de Ingeniería SRE (Evaluación Práctica)
Contexto del Problema: El equipo de operaciones necesita predecir fallas catastróficas por falta de almacenamiento en el disco duro raíz (/). Un dashboard reactivo que avise cuando el disco esté al 99% no da tiempo de reacción al equipo de soporte en entornos de alta carga.

El Reto:

1. Agregue un nuevo panel al final del dashboard.

2. Utilice la función predictiva avanzada de PromQL predict_linear(vector_de_rango, tiempo_en_segundos).

3. Desarrolle una consulta que tome la tendencia de llenado del sistema de archivos de la última hora ([1h]) y proyecte matemáticamente si el almacenamiento libre llegará a 0 bytes en los próximos 3 días (259200 segundos).

4. El panel debe ser de tipo de visualización Stat y debe configurarse para mostrar el resultado final transformado a Gigabytes (GB) para facilitar la lectura del operador humano.

Código PromQL de solución esperado para la evaluación:

```bash
predict_linear(node_filesystem_free_bytes{instance=~"$servidor", mountpoint="/"}[1h], 259200) / 1024 / 1024 / 1024
```

Si el valor reflejado por la visualización es inferior a cero (ejemplo: -15 GB), significa que la tendencia lineal actual indica una saturación total e interrupción del servicio antes del plazo de 3 días.

## 📂 9. Exportación del Dashboard como Código (JSON Model)
La infraestructura moderna dicta que los tableros de control no deben configurarse únicamente mediante clics manuales en interfaces de usuario web. Deben almacenarse en repositorios Git (GitOps).

1. En la barra superior del dashboard, haga clic en el icono de Share (flecha curva o tres puntos conectados).

2. Seleccione la pestaña Export.

3. Active la casilla Export for sharing externally.

4. Haga clic en Save to file. Se descargará un archivo estructurado con formato .json.

Este archivo JSON es el plano completo del dashboard que puede aprovisionarse automáticamente en entornos multiservidor distribuidos en cualquier parte del mundo.