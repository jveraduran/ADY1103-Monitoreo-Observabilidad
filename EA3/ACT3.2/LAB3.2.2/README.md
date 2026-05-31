# 🔬 Guía de Laboratorio 3.2.2: Aprovisionamiento, IAM y Configuración del CloudWatch Agent
## 🎯 Objetivo de la Actividad
Para obtener observabilidad profunda del sistema operativo (como memoria RAM o archivos de log), AWS necesita un agente interno. En este laboratorio, los estudiantes aprovisionarán un servidor, aplicarán el principio de identidad asignando un rol preexistente (LabInstanceProfile) y ejecutarán el asistente de configuración (Wizard) para desplegar el Amazon CloudWatch Agent. Comprenderán que la seguridad y los permisos (IAM) son el paso cero de cualquier arquitectura SRE.

## ⚠️ Restricciones del Entorno (Learner Lab)
- IAM Restringido: En Learner Labs, los estudiantes no tienen permisos para crear sus propios Roles de IAM. Intentar crear uno dará un error de Access Denied. Utilizaremos estrictamente el perfil de instancia preexistente llamado LabInstanceProfile.

- Costos y Región: Utilicen us-east-1 y levanten exclusivamente una instancia t2.micro para mantenerse dentro de la capa gratuita.

## 📝 Paso a Paso Guiado

### Paso 1: Creación de la Instancia EC2 Base
1. Ingresen a la consola de AWS y diríjanse al servicio EC2.

2. Hagan clic en Launch instance (Lanzar instancia).

3. Name and tags: Asignen el nombre Servidor-Agente-CW.

4. Application and OS Images: Seleccionen Amazon Linux 2023 AMI (Free tier eligible).

5. Instance type: Confirmen que esté seleccionado t2.micro.

6. Key pair: Seleccionen la llave vockey.

7. Dejen las configuraciones de red por defecto y hagan clic en Launch instance.

8. Regresen al panel de instancias y esperen a que el estado sea Running.

### Paso 2: Configuración de IAM (Inyección de Identidad)
Nota SRE: Un servidor sin identidad no puede hablar con la API de CloudWatch. Debemos otorgarle credenciales temporales seguras.

1. En el panel de EC2, seleccionen su instancia Servidor-Agente-CW.

2. Vayan al menú superior derecho Actions -> Security -> Modify IAM role.

3. En el menú desplegable IAM role, busquen y seleccionen LabInstanceProfile.

4. Hagan clic en el botón naranja Update IAM role. Ahora su servidor tiene permiso legal para enviar telemetría y logs a AWS.

### Paso 3: Instalación del CloudWatch Agent
1. Conéctense a su instancia usando el botón Connect -> pestaña EC2 Instance Connect -> botón Connect.

2. En la terminal del navegador, instalen el paquete oficial del agente ejecutando:

```bash
sudo dnf update -y
sudo dnf install amazon-cloudwatch-agent -y
```

### Paso 4: Ejecución del Wizard (Asistente de Configuración)
1. Inicien el asistente interactivo para generar el archivo config.json ejecutando:

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

2. Respondan a las preguntas del asistente con las siguientes opciones clave (pueden dejar el resto por defecto presionando Enter):

- On which OS are you planning to use the agent? 1 (Linux)

- Are you using EC2 or On-Premises hosts? 1 (EC2)

- Do you want to turn on StatsD daemon? 2 (no)

- Do you want to monitor metrics from CollectD? 2 (no)

- Do you want to monitor any log files? 1 (yes)

- Log file path: Escriban ```/var/log/secure``` (Este es el log de autenticación en Amazon Linux).

- Log group name: Dejen el valor por defecto (```/var/log/secure```).

3. El asistente guardará el archivo en ```/opt/aws/amazon-cloudwatch-agent/bin/config.json```.

### Paso 5: Inicio y Verificación del Agente
1. Enciendan el agente pasándole el archivo de configuración que acaban de crear:

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json
```

2. Verifiquen que el servicio está corriendo correctamente:
```bash
sudo systemctl status amazon-cloudwatch-agent
```

## Conclusión Operativa y Reflexión SRE
Al finalizar este laboratorio, los estudiantes comprenderán que la observabilidad profunda de un servidor no depende únicamente de instalar software, sino que requiere una arquitectura sólida de seguridad e identidad.

El uso del perfil LabInstanceProfile demuestra de forma práctica cómo los servidores de AWS obtienen permisos temporales seguros para interactuar con otras APIs (como CloudWatch), eliminando por completo la peligrosa práctica de almacenar contraseñas o llaves estáticas (Access Keys) en texto plano dentro del código. Han logrado transformar una instancia EC2 de una "caja negra" a un nodo transparente y auditable, estableciendo el puente necesario para la extracción de telemetría interna sin comprometer la gobernanza del entorno.