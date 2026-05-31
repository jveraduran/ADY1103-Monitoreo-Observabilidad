# 🔬 Guía de Laboratorio 3.3.2: Análisis y Agregación con CloudWatch Logs Insights (Consultas SSH)
## 🎯 Objetivo de la Actividad
En este laboratorio, los estudiantes construirán un entorno completo desde cero para experimentar el poder de CloudWatch Logs Insights. El objetivo es abandonar la práctica obsoleta de leer logs manualmente con grep. Tras aprovisionar un servidor e inyectar simulaciones de ataques por SSH, escribirán queries (consultas) específicas para detectar, filtrar y agregar masivamente estos errores de autenticación agrupados por ventanas de tiempo.

## ⚠️ Restricciones del Entorno (Learner Lab)
- Región y Costos: Utilicen us-east-1 e instancias t2.micro (Capa gratuita).

- Roles IAM: No pueden crear roles nuevos. Usaremos obligatoriamente el perfil preexistente LabInstanceProfile.

- Costos de Insights: Las consultas en Logs Insights cobran por la cantidad de datos escaneados. Como solo escanearemos unos pocos kilobytes de nuestra simulación, el costo será absolutamente cero.

## 📝 Paso a Paso Guiado
### Paso 1: Aprovisionamiento de la Infraestructura Base
1. En la consola de AWS, diríjanse a EC2 y hagan clic en Launch instance.

2. Name: Asignen el nombre Servidor-Insights-SSH.

3. AMI & Tipo: Seleccionen Amazon Linux 2023 y el tipo t2.micro (Free tier eligible).

4. Key pair: Seleccionen vockey.

5. Hagan clic en Launch instance y esperen a que el estado sea Running.

### Paso 2: Configuración de Seguridad e Identidad (IAM)
1. Seleccionen la instancia Servidor-Insights-SSH.

2. Vayan a Actions -> Security -> Modify IAM role.

3. Seleccionen LabInstanceProfile en el menú desplegable y hagan clic en Update IAM role. (Esto da permiso a la máquina para enviar logs a CloudWatch).

### Paso 3: Instalación Automatizada del Agente (Enfoque SRE)
1. Conéctense a su instancia mediante el botón Connect -> EC2 Instance Connect.

2. Instalen el agente de CloudWatch ejecutando:

```bash
sudo dnf update -y
sudo dnf install amazon-cloudwatch-agent -y
```

3. En lugar de usar el asistente manual, aplicaremos la configuración como código. Creen el archivo de configuración copiando y pegando todo este bloque en la terminal y presionando Enter:

```bash
sudo cat <<EOF > /opt/aws/amazon-cloudwatch-agent/bin/config.json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/secure",
            "log_group_name": "/var/log/secure",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
EOF
```

4. Enciendan el agente con esta nueva configuración:

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json
```

### Paso 4: Inyección de Ruido (Simulación de Ataque de Fuerza Bruta)
1. En la misma terminal, inyectaremos intentos de inicio de sesión falsos para generar datos en el log de seguridad (```/var/log/secure```).

Ejecuten el siguiente comando repetidas veces (les pedirá contraseña, escriban cualquier cosa y presionen Enter):

```bash
ssh root_falso@localhost
```

2. Repitan el proceso inventando usuarios como ssh admin_hack@localhost unas 5 o 6 veces para generar suficiente volumen de datos para nuestra consulta.

### Paso 5: Acceso y Filtrado en Logs Insights
1. Regresen a la consola web de AWS y busquen el servicio CloudWatch.

2. En el panel lateral izquierdo, expandan Logs y seleccionen Logs Insights.

3. En el selector central superior (Select log group), busquen y marquen ```/var/log/secure```. Asegúrense de que el tiempo (arriba a la derecha) esté en 1h.

4. En el editor de consultas central, borren el texto predeterminado y escriban lo siguiente para encontrar los ataques:

```bash
fields @timestamp, @message
| filter @message like /Invalid user/ or @message like /Failed password/
| sort @timestamp desc
| limit 20
```

5. Hagan clic en Run query. Verán en la tabla inferior los registros exactos de sus intentos fallidos.

### Paso 6: Agregación Matemática de Incidentes
1. Para transformar este texto plano en inteligencia gráfica, modificaremos la consulta para contar cuántos ataques hubo agrupados por intervalos de 5 minutos. Reemplacen el código por:

```bash
filter @message like /Invalid user/ or @message like /Failed password/
| stats count(*) as IntentosFallidos by bin(5m)
| sort IntentosFallidos desc
```

2. Hagan clic en Run query.

3. Vayan a la pestaña Visualization (sobre los resultados) y seleccionen Bar (Barras). Han transformado registros de texto en un histograma de seguridad.

## 🏆 Conclusión Operativa y Reflexión SRE
Han verificado que un archivo de texto plano (/var/log/secure) puede convertirse en una base de datos analítica. Utilizar Logs Insights permite a los equipos SRE correlacionar masivamente eventos en cientos de servidores a la vez. Escribir consultas (Queries) es fundamental para automatizar respuestas, aislar patrones de ataque y cuantificar el impacto técnico sin depender del lento análisis humano línea por línea.