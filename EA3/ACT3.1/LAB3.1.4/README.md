# 🔬 Guía de Laboratorio 3.1.4: Inyección de Carga y Análisis de Anomalías

## 🎯 Objetivo de la Actividad
El monitoreo estático de un servidor en reposo no aporta valor. En este laboratorio, los estudiantes asumirán el rol de "Ingenieros del Caos" (Chaos Engineering). Utilizarán herramientas nativas de Linux para generar picos artificiales de estrés (CPU y Memoria). El objetivo central es que experimenten el retraso de ingesta de CloudWatch (Polling Delay) y comprendan cómo un pico de carga muy corto puede quedar "suavizado" y oculto bajo la resolución de 5 minutos.

### ⚠️ Restricciones del Entorno (Learner Lab)
- Costos y Región: Utilicen us-east-1 y levanten exclusivamente una instancia t2.micro para mantenerse dentro de la capa gratuita de AWS Academy.

- Conexión: Debido a las restricciones de puertos en redes corporativas/universitarias, se conectarán a la instancia utilizando EC2 Instance Connect directamente desde el navegador, en lugar de clientes SSH tradicionales.

- Riesgo de Congelamiento: Si inyectan demasiada carga y la instancia EC2 colapsa (pierde respuesta), no podrán reiniciarla desde el sistema operativo. Deberán forzar un reinicio (Stop/Start) desde la consola web de AWS, lo cual cambiará su IP pública.

## 📝 Paso a Paso Guiado

### Paso 1: Paso 1: Creación de la Instancia EC2 Base
1. Ingresen a la consola de AWS y diríjanse al servicio EC2.

2. Hagan clic en el botón naranja Launch instance (Lanzar instancia).

3. Name and tags: Asignen un nombre descriptivo, por ejemplo: Servidor-Caos.

4. Application and OS Images: Seleccionen Amazon Linux 2023 AMI (etiqueta Free tier eligible).

5. Instance type: Confirmen que esté seleccionado t2.micro.

6. Key pair (login): Seleccionen la llave del laboratorio llamada vockey (requerida por Learner Labs para ciertas conexiones).

7. Dejen las configuraciones de red y almacenamiento por defecto, y hagan clic en Launch instance.

8. Regresen al panel de instancias y copien el Instance ID (ej. i-0xyz...). Esperen hasta que el estado (Instance state) sea Running.

### Paso 2: Conexión e Instalación de Herramientas de Estrés
1. Seleccionen su instancia Servidor-Caos y hagan clic en el botón superior Connect.

2. Elijan la pestaña EC2 Instance Connect y hagan clic en el botón naranja Connect de la parte inferior. Se abrirá una terminal Linux en una nueva pestaña de su navegador.

3. Actualicen los repositorios e instalen la herramienta de estrés ejecutando los siguientes comandos:

```bash
sudo dnf update -y
sudo dnf install stress -y
```

### Paso 3: Ejecución del Escenario de Caos (CPU Spike)
Ejecuten el siguiente comando en la terminal para estresar los núcleos de la CPU al 100% durante exactamente 4 minutos (240 segundos):

```bash
stress --cpu 4 --timeout 240
```

2. Dejen esa pestaña del navegador abierta y trabajando. La terminal se bloqueará temporalmente mientras la herramienta inyecta la carga artificial en el procesador.

### Paso 3: Análisis Forense en CloudWatch

1. Regresen a la consola de AWS CloudWatch -> Metrics -> All metrics.

2. Busquen nuevamente su instancia y grafiquen CPUUtilization.

3. El Factor de la Paciencia (Toil): Aquí experimentarán el concepto de latencia de observabilidad. Aunque el servidor está en llamas en este instante, CloudWatch tardará entre 3 y 5 minutos en reflejar el pico en la gráfica debido al ciclo de recolección de monitoreo básico.

4. Ajusten la ventana de tiempo en la esquina superior derecha a "Last 1 Hour" para hacer un zoom adecuado al evento.

### Paso 4: Análisis Forense en CloudWatch
1. En su pestaña principal de AWS, naveguen hacia el servicio CloudWatch.

2. Vayan a Metrics -> All metrics -> EC2 -> Per-Instance Metrics.

3. En la barra de búsqueda, peguen el Instance ID de su Servidor-Caos y marquen la métrica CPUUtilization.

4. Vayan a la pestaña Graphed metrics (Métricas graficadas). Asegúrense de que Statistic esté en Average y Period en 5 Minutes.

5. El Factor de la Paciencia (Toil): Aquí experimentarán el concepto de latencia de observabilidad. Aunque el servidor está en llamas en este instante, CloudWatch tardará varios minutos en reflejar el pico en la gráfica. Refresquen la gráfica periódicamente usando el botón de recarga de CloudWatch (arriba a la derecha de la gráfica).

### Paso 5: Reflexión Operativa (El Peligro del Promedio)
1. Ajusten la ventana de tiempo en la esquina superior derecha a "Last 1 Hour" para hacer un zoom adecuado al evento.

2. Análisis SRE: Observen la gráfica resultante tras unos 10 minutos. Su servidor estuvo al 100% de CPU durante 4 minutos reales. Sin embargo, debido a que el periodo de CloudWatch está configurado en bloques de 5 minutos, la gráfica promedió esos 4 minutos de caos con 1 minuto de inactividad, mostrando probablemente un pico anómalo del ~80% en lugar del 100%.

3. Conclusión: Han demostrado empíricamente por qué el Monitoreo Básico (5 min) es engañoso y peligroso para sistemas transaccionales rápidos que auto-escalan. Esto justifica técnica y financieramente por qué un Arquitecto Cloud debe pagar por el Monitoreo Detallado (1 min) en entornos de producción críticos.