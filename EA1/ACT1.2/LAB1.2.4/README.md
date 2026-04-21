# Guía de Laboratorio 1.2.4: Modelado de Umbrales en AWS 🎯

**Tema:** Correlación entre Métricas Técnicas y Acuerdos de Negocio (SLO)  
**Entorno:** AWS Learner Labs (EC2, CloudWatch, CloudShell)  
**Tiempo estimado:** 50 minutos  

---

## 🎯 Objetivo de la Actividad
Dejar de adivinar cuándo enviar una alerta. En este laboratorio, descubrirás empíricamente en qué punto de saturación de recursos (ej. CPU) tu servidor web comienza a fallar y a afectar a tus usuarios. Usarás este dato para modelar un umbral de alerta proactivo que proteja el SLO que definiste en la clase anterior.

---

## 📖 Contexto del Escenario: "MegaShop"

En el laboratorio anterior, tu equipo definió que la API de pagos debe tener un **SLO del 99.5% de transacciones exitosas**. 

Sin embargo, para cumplir ese objetivo, el equipo de guardia necesita recibir una alerta *antes* de que el servidor colapse. Si configuran una alarma para que suene cuando la CPU esté al 100%, ya será demasiado tarde: los clientes ya estarán experimentando errores. Tienen que descubrir en qué porcentaje exacto la máquina empieza a degradarse para colocar el umbral de advertencia en el lugar correcto.

---

## 🚀 Fase 1: Despliegue del Entorno de Pruebas

Vamos a levantar nuevamente nuestra API de pagos, pero esta vez incluiremos herramientas para estresar la máquina progresivamente.

1. Ve a la consola de **EC2** y lanza una nueva instancia.
2. **Nombre:** `MegaShop-Umbrales`.
3. **AMI:** Amazon Linux 2023.
4. **Tipo:** `t2.micro`.
5. **Red:** Permite tráfico **HTTP (puerto 80)** y **SSH (puerto 22)**.
6. **IAM Role (Advanced Details):** Selecciona `LabInstanceProfile`.
7. **User Data:** Pega el siguiente script para instalar el servidor y la herramienta de estrés:

```bash
#!/bin/bash
dnf update -y
dnf install nginx stress htop -y
systemctl start nginx
systemctl enable nginx
```

8. Lanza la instancia, espera a que esté en Running y anota su Dirección IPv4 Pública.

## 🔬 Fase 2: El Experimento de Saturación
Vas a bombardear tu servidor con peticiones web mientras, paralelamente, le subes la carga de procesamiento hasta que se rompa.

### Paso 2.1: El Monitor de Usuario (CloudShell)

1. Abre AWS CloudShell desde la barra superior.

2. Ejecuta el siguiente comando para simular un cliente comprobando la página cada 2 segundos sin parar (reemplaza <IP_DE_TU_EC2>):

```bash
while true; do curl -s -o /dev/null -w "$(date +'%T') - Código HTTP: %{http_code}\n" --max-time 2 http://<IP_DE_TU_EC2>; sleep 2; done
```
*Déjalo corriendo. Verás que responde Código HTTP: 200 de forma constante.*

### Paso 2.2: Generación de Carga (EC2 Instance Connect)

1. Abre otra pestaña, ve a la consola de EC2, selecciona tu instancia y haz clic en Connect (EC2 Instance Connect).

2. Vamos a saturar la CPU progresivamente. Ejecuta un estrés medio (1 worker) durante 5 minutos:

```bash
stress --cpu 1 --timeout 300s
```

3. Observa tu CloudShell. ¿Siguen saliendo códigos 200? Si es así, la instancia t2.micro soporta esta carga.

4. Ahora, rompamos el sistema. Cuando el comando anterior termine, ejecuta una carga destructiva (4 workers asfixiando la CPU y memoria):

```bash
stress --cpu 4 --vm 2 --vm-bytes 256M --timeout 300s
```

5. Mira tu CloudShell inmediatamente. Notarás que el servidor tarda en responder y empezarás a ver errores 000 (Time Out) o lentitud extrema. ¡Tu SLO se está rompiendo en este instante!

6. Cuando termine el tiempo, o si detienes CloudShell con Ctrl+C, la prueba habrá concluido.

## 📊 Fase 3: Análisis Forense en CloudWatch
Ahora vamos a ver cómo se reflejó ese colapso en la telemetría de AWS para encontrar nuestro número mágico.

1. Ve a la consola de CloudWatch -> Metrics -> All metrics.

2. Navega a EC2 -> Per-Instance Metrics.

3. Selecciona la métrica CPUUtilization de tu instancia MegaShop-Umbrales.

4. Ajusta el período de tiempo en la parte superior derecha a 1h y cambia el tipo de gráfico a Number (o pon el cursor sobre el pico de la gráfica de líneas).

5. Observa el porcentaje exacto que alcanzó la CPU durante los 5 minutos que duró el estrés destructivo. ¿Llegó al 90%? ¿Al 99%?

## ⚖️ Fase 4: Modelado del Umbral
Basado en la evidencia obtenida:

1. Identifica el Límite Crítico: Registren a qué porcentaje de CPU la aplicación dejó de devolver códigos HTTP 200 a tiempo. (Ej: "Descubrimos que al superar el 95% de CPU, los pagos fallan").

2. Define el Umbral Reactivo (Alarma Roja): Es el punto donde el SLO ya está en peligro inminente y alguien debe despertar de madrugada. ¿A qué nivel lo pondrías?

3. Define el Umbral Proactivo (Alarma Amarilla): Es el punto donde el sistema empieza a trabajar bajo presión, pero el cliente aún no lo nota. Permite al equipo revisar el problema en horario de oficina. (Ej: "Notificaremos por chat si la CPU supera el 75% sostenido por 10 minutos").

## 📝 Entregable del Laboratorio
Agreguen las siguientes definiciones al documento que crearon en el laboratorio anterior (1.2.2):

Captura de pantalla del pico de CPUUtilization en CloudWatch.

Umbral Crítico Definido: "Dispararemos una alerta crítica a PagerDuty/SNS cuando la métrica CPUUtilization sea mayor o igual a [X]% durante [Y] minutos".

Justificación: Una breve explicación técnica de por qué eligieron ese número exacto basándose en el experimento de CloudShell.

## 🧹 Limpieza del Entorno
¡No olvides proteger tus créditos del Learner Lab!

- Ve a la consola de EC2.

- Selecciona la instancia MegaShop-Umbrales y asegúrate de elegir Terminate instance para eliminarla definitivamente.