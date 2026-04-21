# Guía de Laboratorio 1.1.4: Exploración de Métricas Base (EC2) 📊

**Tema:** Monitoreo de "Caja Negra" (Black-Box) y visibilidad del Hipervisor  
**Entorno:** AWS Learner Labs (AWS Academy)  
**Tiempo estimado:** 30 minutos  

---

## 🎯 Objetivo de la Actividad
Identificar qué datos de telemetría es capaz de recolectar AWS de forma nativa (sin instalar agentes adicionales) y comprender el concepto de "Observabilidad desde afuera". Al final de este laboratorio, entenderás exactamente qué ve la nube y cuáles son sus puntos ciegos.

---

## 🚀 Paso 1: Despliegue de la Infraestructura Base

Vamos a levantar un servidor básico para que empiece a generar telemetría real en tu entorno.

1. Ingresa a tu entorno de **AWS Learner Lab** y dirígete a la consola de **EC2**.
2. Haz clic en el botón naranja **Launch instances**.
3. **Name:** Escribe `Servidor-Telemetria-Base`.
4. **AMI:** Selecciona **Amazon Linux 2023 AMI** (la opción por defecto).
5. **Instance type:** Selecciona `t2.micro` (gratuita y permitida en el laboratorio).
6. **Key pair:** Selecciona `vockey` o procede sin llave si no planeas conectarte por SSH.
7. **Configuración de Seguridad (IAM) - ¡CRÍTICO!:**
   * Desplázate hasta la sección **Advanced details** al final de la página.
   * En el campo **IAM instance profile**, selecciona el perfil pre-creado **`LabInstanceProfile`**. *(Nota: Aunque en este laboratorio no usaremos el agente de CloudWatch, es una excelente práctica dotar a la instancia de identidad dentro del Learner Lab).*
8. **Tags (Gobernanza):**
   * En la misma sección, asegúrate de añadir una etiqueta para identificar el costo de esta máquina:
   * **Key:** `Project` | **Value:** `EA1-Observabilidad`
9. Haz clic en **Launch instance** y espera a que el estado cambie a *Running*.

---

## 📈 Paso 2: Análisis de Métricas Nativas (Consola EC2)

Una vez que la máquina esté corriendo, el hipervisor de AWS comenzará a publicar datos automáticamente.

1. En la consola de EC2, selecciona tu instancia `Servidor-Telemetria-Base`.
2. En el panel inferior, haz clic en la pestaña **Monitoring** (Monitoreo).
3. **Observación Activa:** AWS actualiza estas gráficas cada 5 minutos de forma gratuita (Basic Monitoring). Identifica visualmente las siguientes categorías de métricas:
   * **CPU:** Revisa la gráfica de `CPU Utilization`.
   * **Red:** Revisa `Network In` (Bytes recibidos) y `Network Out` (Bytes enviados).
   * **Disco (Hardware):** Revisa `Disk Read Bytes` y `Disk Write Bytes`. *(Ojo: esto mide operaciones de I/O de la tarjeta madre, no el espacio de almacenamiento utilizado).*
   * **Estado:** Revisa `Status Check Failed`.

---

## 🔍 Paso 3: Exploración Profunda (CloudWatch Metrics Explorer)

Las gráficas de EC2 son solo un resumen. Vamos a la herramienta centralizada donde viven todos estos datos.

1. En la barra de búsqueda superior de AWS, busca y abre el servicio **CloudWatch**.
2. En el menú lateral izquierdo, despliega la sección **Metrics** y haz clic en **All metrics**.
3. Verás una tarjeta que dice **EC2**. Haz clic en ella.
4. Luego, selecciona **Per-Instance Metrics** (Métricas por instancia).
5. En la barra de búsqueda de CloudWatch, pega el **Instance ID** de tu servidor (ej. `i-0abcd12345efgh`).

**Comprende los 3 conceptos clave de la arquitectura de CloudWatch:**
* **Namespace:** Estás dentro de `AWS/EC2`, que es el "cajón" donde AWS guarda los datos de servidores.
* **Dimension:** El "Instance ID" funciona como filtro para separar tu servidor de los demás.
* **Metric Name:** Es el dato específico (ej. *CPUUtilization*). Selecciona esta métrica marcando la casilla de verificación (checkbox) para verla en la gráfica superior.

---

## ⚠️ Paso 4: El "Punto Ciego" (Reto de Análisis)

El hipervisor de AWS administra el hardware (CPU física, tarjeta de red física, disco duro físico), pero el Sistema Operativo (Linux/Windows) es una caja negra para él.

**Tu reto:**
1. Intenta buscar en CloudWatch la métrica que te indique **cuánta memoria RAM libre** le queda a tu servidor.
2. Intenta buscar la métrica que indique **cuánto espacio disponible en GB** le queda a tu disco duro (`/dev/xvda1`).

**¿Qué sucedió?**
No las encontraste. AWS sabe cuánta electricidad le está enviando a la memoria RAM, pero por cuestiones de privacidad y aislamiento tecnológico, el hipervisor **no tiene permiso para ver dentro del sistema operativo**. No sabe si la RAM está llena de caché o de aplicaciones reales.

*(Resolveremos este punto ciego en la Experiencia de Aprendizaje 3 instalando el CloudWatch Agent).*

---

## 📝 Paso 5: Entregable de la Actividad

Para finalizar este laboratorio, documenta lo siguiente en tu informe técnico:

1. Captura de pantalla de la gráfica de `CPUUtilization` de tu instancia directamente desde CloudWatch Metrics Explorer.
2. Explica con tus propias palabras la diferencia entre monitorear un paquete de red (`NetworkIn`) y monitorear el espacio libre del disco duro.
3. Justifica técnicamente por qué un servicio administrado de nube (como AWS EC2) tiene "puntos ciegos" en sus métricas por defecto.

---

## 🧹 Limpieza del Entorno
Recuerda proteger tu presupuesto del Learner Lab. Cuando hayas tomado tus capturas de pantalla:
1. Vuelve a la consola de **EC2**.
2. Selecciona tu instancia.
3. En el botón **Instance state**, selecciona **Terminate instance**.