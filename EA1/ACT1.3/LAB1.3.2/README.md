# Guía de Laboratorio 1.3.2: Selección de Herramientas (Build vs. Buy) y Despliegue de Grafana ⚖️

**Tema:** Arquitectura de Observabilidad, Esfuerzo Operativo y TCO (Total Cost of Ownership)  
**Entorno:** AWS Learner Labs (EC2), AWS Pricing Calculator, Trabajo Grupal  
**Tiempo estimado:** 60 minutos  

---

## 🎯 Objetivo de la Actividad
Argumentar si una empresa debe construir su propio sistema de monitoreo (Stack Open-Source auto-alojado) o comprar una solución administrada (AWS CloudWatch). Para fundamentar su decisión, los equipos instalarán Grafana desde cero en un servidor y compararán el esfuerzo operativo y los costos de infraestructura frente a una solución gestionada.

---

## 🗣️ Fase 1: El Debate de Escenarios (10 minutos)

Reúnanse en grupos. Como equipo de Arquitectos Cloud, lean los siguientes 3 escenarios empresariales y decidan preliminarmente qué camino tomarían. Anoten sus decisiones.

| Escenario | Contexto de la Empresa | Reto Principal |
| :--- | :--- | :--- |
| **1. Startup Ágil** | 3 desarrolladores lanzando una App en AWS. Capital semilla limitado. Sin equipo de SysAdmins. | Necesitan velocidad máxima y no tienen tiempo para mantener servidores de monitoreo. |
| **2. Banco Tradicional** | Altísima regulación (Compliance). Tienen centros de datos físicos propios y algunas cargas en la nube. | Control total. Sus políticas de seguridad prohíben enviar telemetría a internet público. |
| **3. Entorno Híbrido** | Multinacional de Retail. Tienen servidores en AWS, Azure y máquinas físicas en bodegas. | Necesitan un panel único centralizado para ver todo sin importar dónde esté alojado. |

---

## 🛠️ Fase 2: El Reto Práctico del Esfuerzo Operativo (20 minutos)

Vamos a experimentar lo que significa elegir la ruta "Build" (Construir tu propio stack). Instalaremos Grafana, la herramienta Open Source líder en visualización.

### Paso 2.1: Despliegue del Servidor de Visualización
1. Ingresa a la consola de **EC2** y haz clic en **Launch instances**.
2. **Name:** `Servidor-Grafana-OS`.
3. **AMI:** Amazon Linux 2023.
4. **Instance type:** `t2.micro`.
5. **Network settings:** * Habilita **SSH (puerto 22)** desde cualquier lugar.
   * **¡Importante!** Haz clic en "Edit" en las reglas de red y añade una regla *Custom TCP* para abrir el **puerto 3000** (el puerto por defecto de Grafana) desde `0.0.0.0/0`.
6. Haz clic en **Launch instance** y espera a que el estado sea *Running*.

### Paso 2.2: Instalación Manual de Grafana
1. Conéctate a tu instancia mediante **EC2 Instance Connect**.
2. Ejecuta los siguientes comandos para descargar e instalar Grafana directamente desde sus repositorios oficiales:

```bash
# Actualizar el sistema
sudo dnf update -y
```

#### Descargar e instalar Grafana (versión OSS)
```bash
sudo dnf install -y [https://dl.grafana.com/oss/release/grafana-10.4.0-1.x86_64.rpm](https://dl.grafana.com/oss/release/grafana-10.4.0-1.x86_64.rpm)
```

#### Iniciar el servicio y habilitarlo para que arranque con el servidor
```bash
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

#### Verificar que está corriendo
```bash
sudo systemctl status grafana-server
```

*(Presiona la tecla q para salir del status).*

### Paso 2.3: La Reflexión del "Time-to-Value"
1. Abre una nueva pestaña en tu navegador web.

2. Ingresa la IP Pública de tu instancia seguida del puerto 3000. (Ejemplo: http://54.210.33.15:3000).

3. Inicia sesión con las credenciales por defecto:

- Usuario: admin

- Contraseña: admin (Te pedirá cambiarla, puedes saltar este paso dando clic en "Skip").

4. Ve a Connections -> Data Sources -> Add new data source.

A diferencia de CloudWatch, donde las métricas de EC2 ya estaban ahí mágicamente en 2 clics, aquí no hay nada. Para ver un gráfico, todavía tendrías que instalar un servidor Prometheus, instalar agentes (Node Exporters) en todas tus máquinas y escribir consultas PromQL.

## 💰 Fase 3: Dimensionando el "Costo Oculto" (15 minutos)
El software de Grafana es gratuito, pero el servidor que acabas de levantar no lo es. Dimensionemos el costo real para una empresa en producción.

1. Vayan a la Calculadora de Precios de AWS (AWS Pricing Calculator).

2. Ejercicio A (Stack Open Source):

- Agreguen una estimación para Amazon EC2.

- Busquen una instancia t3.large (un t2.micro no soportaría Prometheus + Grafana en producción).

- Agreguen 500 GB de disco EBS (gp3) para almacenar 6 meses de datos históricos.

- Anoten el costo mensual total.

3. Ejercicio B (CloudWatch):

- Agreguen una estimación para Amazon CloudWatch.

- Configuren: 500 Custom Metrics, 5 Dashboards, 100 GB de Logs ingeridos y 20 Alarmas.

- Anoten el costo mensual total.

## 📝 Fase 4: Entregable y Veredicto Final
Reúnan la experiencia de la instalación manual y los datos de la calculadora para elaborar su informe:

1. Evidencia Técnica: Captura de pantalla de su servidor Grafana ejecutándose (pantalla de Data Sources).

2. Tabla de Costos: Sus resultados comparativos del costo de infraestructura (EC2+EBS) vs. el costo del servicio administrado (CloudWatch).

3. Decisiones Finales: Vuelvan a los 3 escenarios de la Fase 1 (Startup, Banco, Híbrido). Con los datos de costos y el "esfuerzo operativo" (Toil) que sintieron al instalar Grafana:

- ¿Cambió alguna de sus decisiones iniciales?

- Escriban 1 párrafo justificando su herramienta final para cada uno de los 3 escenarios.

4. Conclusión: Redacten una "Regla SRE" de 2 líneas sobre qué debe evaluar una empresa antes de elegir herramientas Open Source gratuitas.

## 🧹 Limpieza del Entorno
Recuerden cuidar sus créditos del Learner Lab:

Regresen a la consola de EC2.

Seleccionen la instancia Servidor-Grafana-OS.

Vayan a Instance state y hagan clic en Terminate instance.