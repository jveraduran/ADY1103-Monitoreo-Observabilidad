# 🔬 Guía de Laboratorio 3.3.4: Construcción de un Dashboard Unificado en CloudWatch
## 🎯 Objetivo de la Actividad
La fragmentación de la información retrasa el diagnóstico (MTTR). Si un ingeniero revisa la CPU en una pantalla y los logs de seguridad en otra, pierde contexto. En este laboratorio, aprovisionarán un servidor desde cero, generarán una "tormenta perfecta" (alta CPU combinada con ataques SSH) y construirán un Single Pane of Glass (Panel de Control Único). Este Dashboard de CloudWatch combinará widgets de métricas de hardware y resultados interactivos de Logs Insights.

## ⚠️ Restricciones del Entorno (Learner Lab)
- Límites de Capa Gratuita: La capa gratuita permite hasta 3 Dashboards.

- Identidad SRE: Recordar adjuntar siempre el LabInstanceProfile para habilitar el agente interno.

- Utilizaremos t2.micro y us-east-1 por requerimientos normativos del lab.

## 📝 Paso a Paso Guiado
### Paso 1: Aprovisionamiento Completo e Identidad

1. Vayan a EC2 -> Launch instance.

2. Name: Servidor-Dashboard-Central.

3. AMI / Tipo / Llave: Amazon Linux 2023 / t2.micro / vockey.

4. Hagan clic en Launch instance.

5. Una vez en ejecución, seleccionen la instancia, vayan a Actions -> Security -> Modify IAM role.

6. Elijan LabInstanceProfile y guarden los cambios. (¡Vital para poder enviar logs!). Copien el Instance ID de la instancia, lo usarán luego.

### Paso 2: Instalación del Agente y Herramientas
1. Conéctense a la instancia vía EC2 Instance Connect.

2. Instalen el agente de CloudWatch y la herramienta de estrés (stress):

```bash
sudo dnf update -y
sudo dnf install amazon-cloudwatch-agent stress -y
```

3. Configuren el agente para enviar logs ejecutando este bloque:

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

4. Inicien el agente:

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json
EOF
```

### Paso 3: Generación del Escenario de Crisis (Tormenta Perfecta)

1. Para que nuestro Dashboard muestre información interesante, simularemos un incidente.

2. Generen un pico de CPU de 5 minutos ejecutando (esto bloqueará temporalmente la terminal, dejen que termine):

```bash
stress --cpu 4 --timeout 300 &
```

3. Mientras la CPU está trabajando en segundo plano, generen fallos de autenticación SSH ejecutando varias veces:

```bash
ssh atacante1@localhost
ssh atacante2@localhost
```

### Paso 4: Creación del Lienzo del Dashboard

1. Naveguen a CloudWatch en la consola de AWS.

2. En el menú lateral izquierdo (sección Metrics), hagan clic en Dashboards.

3. Clic en Create dashboard.

4. Nombre del dashboard: SRE-Command-Center. Hagan clic en Create.

### Paso 5: Integración del Widget de Métricas (CPU)

1. Al crear el dashboard, aparecerá un menú. Seleccionen Line (Gráfico de líneas) y luego Next.

2. En Data source elijan Metrics.

3. Naveguen a EC2 -> Per-Instance Metrics.

4. Peguen en el buscador el Instance ID de su Servidor-Dashboard-Central y marquen la métrica CPUUtilization.

5. Cambien el título superior a Saturación de CPU - EC2.

6. Asegúrense de que la pestaña inferior Graphed metrics tenga configurado Statistic: Average y Period: 5 Minutes.

7. Hagan clic en Create widget (esquina inferior derecha).

### Paso 6: Integración del Widget de Logs Insights (Seguridad SSH)

1. En el lienzo de su Dashboard, hagan clic en + (Add widget) en la barra superior.

2. Elijan Bar (Gráfico de barras) y hagan clic en Next.

3. En el selector Select log group(s) (arriba), marquen /var/log/secure.

4. En el editor de texto, peguen la consulta agregada:

```bash
filter @message like /Invalid user/ or @message like /Failed password/
| stats count(*) as IntentosFallidos by bin(5m)
```

5. Cambien el título a Auditoría de Seguridad - Intentos SSH.

6. Hagan clic en Run query para ver sus datos del Paso 3, y luego en Create widget.

### Paso 7: Diseño del Layout y Guardado Definitivo

1. Arrastren y redimensionen los paneles. En SRE, se utiliza el patrón en "F": la métrica más crítica (CPU) suele ir a la izquierda, y los detalles o logs a la derecha o debajo.

2. Cambien el marco de tiempo del Dashboard (arriba a la derecha) a 1h.

3. Paso Crítico: Hagan clic en el botón azul Save (arriba a la derecha). Si abandonan la página sin guardar, perderán el diseño.

## 🏆 Conclusión Operativa y Reflexión SRE
Han consolidado un pipeline de observabilidad avanzado en AWS. Combinar telemetría de hardware (métricas estándar) con análisis semántico de software (Logs Insights) en un Single Pane of Glass es el estándar de oro en SRE. Cuando ocurre un incidente real a las 3:00 AM, este tablero permite a los ingenieros determinar visual y casi instantáneamente si un pico inusual de consumo de procesador es causado por tráfico legítimo o por una avalancha de ataques de fuerza bruta al servicio SSH, reduciendo drásticamente la "fatiga de contexto".