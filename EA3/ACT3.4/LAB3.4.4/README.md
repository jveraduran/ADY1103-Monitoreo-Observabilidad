# 🔬 Guía de Laboratorio 3.4.4: Ingesta de Métricas Custom (CLI) y Stress Test de Alertas
## 🎯 Objetivo de la Actividad
En SRE, no solo monitoreamos el hardware (CPU/RAM); necesitamos monitorear el comportamiento del negocio (ej. usuarios conectados o ventas por segundo). En este laboratorio, los estudiantes interactuarán con la API de CloudWatch a través de la AWS CLI. Enviarán una métrica "inventada" o customizada hacia la nube. Finalmente, validarán el pipeline construido en el laboratorio anterior (Guía 3.4.2) forzando un estrés extremo en el servidor para comprobar empíricamente la llegada de la notificación de emergencia al correo electrónico.

## ⚠️ Restricciones del Entorno (Learner Lab)
- Permisos IAM Estrictos: Para que la máquina pueda ejecutar el comando de inyección de métricas (aws cloudwatch put-metric-data), DEBE tener adjuntado el rol LabInstanceProfile. Sin esto, recibirán un error de Access Denied.

- Dependencia: Este laboratorio asume que realizaron el Paso 2 y 3 de la Guía 3.4.2 y ya cuentan con la alarma CPU-Critica-Servidor-SRE conectada a su correo.

## 📝 Paso a Paso Guiado
### Paso 1: Aprovisionamiento de la Infraestructura e Identidad
1. Vayan a EC2 -> Launch instance.

2. Name: Servidor-CLI-Stress.

3. AMI / Tipo: Amazon Linux 2023 / t2.micro. Seleccionen la llave vockey y hagan clic en Launch instance.

4. Paso Crítico: Seleccionen su nueva instancia, vayan a Actions -> Security -> Modify IAM role. Seleccionen LabInstanceProfile y guarden los cambios. Esto inyecta credenciales seguras en el servidor para usar la CLI.

### Paso 2: Conexión e Instalación de Herramientas
1. Conéctense a su instancia mediante EC2 Instance Connect.

2. Amazon Linux 2023 ya trae la herramienta aws-cli preinstalada. Instalaremos únicamente el paquete de estrés ejecutando:

```bash
sudo dnf update -y
sudo dnf install stress -y
```

### Paso 3: Inyección de Métrica Customizada (Business Metric)
1. Para demostrar cómo el software puede enviar telemetría de negocio a AWS sin usar el Agente de CloudWatch, inyectaremos una métrica inventada llamada UsuariosConectados.

2. Ejecuten el siguiente comando en su terminal:

```bash
aws cloudwatch put-metric-data --metric-name "UsuariosConectados" --namespace "MiEmpresa/E-commerce" --value 150 --region us-east-1
```

3. Ejecuten el comando un par de veces más, cambiando el número del --value (ej. 175, 120, etc.) para simular el comportamiento de una app.

4. Validación: Vayan a la consola de CloudWatch -> All metrics. Verán que apareció una nueva tarjeta llamada MiEmpresa/E-commerce. Si entran, podrán graficar su métrica de negocio personalizada.

### Paso 4: Disparo del Incidente (Stress Test para Alerta)
1. Ahora vamos a simular un incidente crítico para validar nuestra alarma de CPU. Regresen a la terminal de su instancia Linux.

2. Como nuestra alarma evalúa datos en ventanas de 5 minutos, necesitamos inyectar carga por al menos 6 minutos (360 segundos) continuos para asegurarnos de romper el umbral promediado. Ejecuten:

```bash
stress --cpu 4 --timeout 400
```

3. La terminal quedará bloqueada mientras el procesador se satura al 100%.

### Paso 5: Validación del Pipeline de Respuesta a Incidentes
1. Vuelvan a la consola web de AWS -> CloudWatch -> Alarms.

2. Observen el estado de su alarma CPU-Critica-Servidor-SRE.

3. Tras unos 4 a 6 minutos, verán que el estado cambia bruscamente de color verde (OK) a rojo (In alarm).

4. Abran la bandeja de entrada de su correo electrónico. Deberían recibir un mensaje automático de AWS SNS con el Asunto: ALARM: "CPU-Critica-Servidor-SRE" in US East (N. Virginia).

5. Si abren el correo, verán el payload técnico exacto que detalla por qué la alarma se disparó (el valor del umbral superado).

### 🏆 Conclusión Operativa y Reflexión SRE
Con esta práctica, han validado el ciclo de vida completo de un incidente técnico. Han aprendido que la observabilidad no se limita a métricas nativas del proveedor de la nube; mediante la CLI (y las APIs), los equipos de desarrollo pueden instrumentar métricas propias de negocio (PutMetricData). Finalmente, las pruebas de estrés (Chaos Engineering) demuestran ser fundamentales. Un SRE nunca asume que una alarma funciona simplemente porque la configuró; siempre inyecta fallos artificiales para auditar empíricamente que la notificación llegará a la persona adecuada antes de que el código llegue a producción.