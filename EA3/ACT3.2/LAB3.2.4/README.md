# 🔬 Guía de Laboratorio 3.2.4: Validación de Ingesta y Análisis Forense de Logs (Syslog)
## 🎯 Objetivo de la Actividad
La recolección de logs es el pilar de la observabilidad para el análisis forense (Troubleshooting). En este laboratorio, los estudiantes validarán que el pipeline construido en la guía anterior funciona. Generarán intencionalmente eventos de seguridad en el sistema operativo (intentos de login fallidos) y auditarán su llegada en tiempo real a la consola de CloudWatch Logs, simulando la respuesta ante un ataque de fuerza bruta.

## ⚠️ Restricciones del Entorno (Learner Lab)
- Prerrequisito Obligatorio: Este laboratorio asume que tienen la instancia Servidor-Agente-CW encendida, con el rol LabInstanceProfile adjuntado y el agente de CloudWatch configurado para leer 
```/var/log/secure``` (como se hizo en la Guía 3.2.2). Si no tienen la instancia, deben realizar la Guía 3.2.2 primero.

- Ingesta de Datos: La capa gratuita de AWS permite 5 GB de ingesta de logs al mes, lo cual es más que suficiente para este ejercicio de simulación.

## 📝 Paso a Paso Guiado

### Paso 1: Generación de Eventos Intencionales (Simulación de Ataque)
1. Vuelvan a la terminal de su instancia a través de EC2 Instance Connect.

2. Vamos a simular un atacante intentando ingresar por SSH con un usuario que no existe. Ejecuten el siguiente comando varias veces (les pedirá una contraseña, escriban cualquier texto al azar y presionen Enter):

```bash
ssh hacker_falso@localhost
```

3. Repitan el comando ```ssh hacker_falso@localhost``` al menos 3 o 4 veces ingresando contraseñas incorrectas hasta que el sistema los expulse.

4. Opcionalmente, intenten convertirse en súper-usuario con un error intencional:

```bash
su root
```
(Escriban una contraseña incorrecta).

5. Todos estos fallos de autenticación acaban de ser grabados en el archivo físico /var/log/secure de Linux.


### Paso 2: Navegación hacia CloudWatch Logs
1. Vuelvan a la pestaña principal de su consola AWS y busquen CloudWatch.

2. En el panel lateral izquierdo, expandan la sección Logs y hagan clic en Log groups (Grupos de registros).

3. En la lista central, deberían ver un nuevo Log Group creado automáticamente por su agente llamado ```/var/log/secure```. Hagan clic sobre él.

### Paso 3: Visualización de Log Streams y Análisis en Tiempo Real
1. Dentro del Log Group, verán una pestaña llamada Log streams. Cada servidor que envía datos a este grupo crea su propio "río" o stream.

2. Hagan clic en el Log Stream que tiene el nombre del Instance ID de su servidor (ej. ```i-0abcd1234efgh5678```).

3. Análisis Forense SRE: Se encontrarán frente a la consola de eventos en crudo.

- Naveguen por los últimos eventos. Deberían poder leer en texto plano registros similares a: ```Invalid user hacker_falso from 127.0.0.1``` o ```Failed password for invalid user```.

- Hagan clic en el botón superior derecho Resume (o el ícono de "Play" para hacer tailing automático). Esto obligará a la consola a actualizarse en tiempo real.

4. Validación: Si vuelven a la terminal Linux y ejecutan otro inicio de sesión fallido, verán cómo el texto aparece casi mágicamente en la consola web de AWS en cuestión de 1 a 3 segundos. Han construido exitosamente un pipeline de observabilidad centralizado.

## Conclusión Operativa y Reflexión SRE
Este ejercicio demuestra empíricamente el inmenso valor de la centralización de logs en la cultura de Operaciones en la Nube. En una infraestructura tradicional sin observabilidad, un ingeniero tendría que conectarse manualmente por SSH a decenas (o cientos) de servidores, uno por uno, para buscar rastros en los archivos locales tras reportarse un ataque.

Gracias al pipeline construido con el Agente unificado y CloudWatch Logs, el equipo SRE puede detectar, auditar y correlacionar incidentes de seguridad en tiempo real desde un único panel de control global. Esta práctica no solo asegura que los registros sobrevivan incluso si el servidor EC2 es destruido o hackeado (persistencia externa), sino que reduce drásticamente el Tiempo Medio de Resolución (MTTR) y elimina el trabajo manual repetitivo (Toil) en la investigación de anomalías.