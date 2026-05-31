# 🔬 Guía de Laboratorio 3.1.2: Exploración de Metrics Explorer en AWS CloudWatch

🎯 Objetivo de la Actividad
El objetivo de este laboratorio es que los estudiantes aprovisionen un servidor base y naveguen por la consola de AWS para experimentar de primera mano cómo el hipervisor de Amazon recopila telemetría por defecto. Aprenderán a filtrar datos utilizando la estructura tridimensional de CloudWatch (Namespaces, Dimensions y Metrics) sin depender de agentes internos, comprendiendo la visibilidad "desde afuera" (Caja Negra) que ofrece AWS.

⚠️ Restricciones del Entorno (Learner Lab)
Región Obligatoria: Asegúrense de estar trabajando en us-east-1 (Norte de Virginia). En Learner Labs, levantar recursos o buscar métricas en otras regiones resultará en un error de permisos o datos vacíos.

Costos: En este laboratorio utilizaremos exclusivamente Monitoreo Básico (Basic Monitoring) y el tipo de instancia t2.micro, los cuales están incluidos en la capa gratuita. No habiliten el monitoreo detallado (Detailed Monitoring) para evitar consumir los créditos limitados de su sesión.

## 📝 Paso a Paso Guiado

### Paso 1: Creación de la Instancia EC2 Base

1. Ingresen a la consola de AWS y diríjanse al servicio EC2.

2. En el panel izquierdo o principal, hagan clic en el botón naranja Launch instance (Lanzar instancia).

3. Name and tags: Asignen un nombre reconocible, por ejemplo: Servidor-Observabilidad.

4. Application and OS Images (Amazon Machine Image): Seleccionen Amazon Linux 2023 AMI (asegúrense de que tenga la etiqueta Free tier eligible).

5. Instance type: Confirmen que esté seleccionado t2.micro (Free tier eligible).

6. Key pair (login): Seleccionen la llave estándar del laboratorio llamada vockey. Si no planean conectarse por SSH, pueden elegir Proceed without a key pair.

7. Network settings: Dejen la configuración por defecto (VPC por defecto y Auto-assign public IP habilitado).

8. Hagan clic en el botón naranja Launch instance en el panel lateral derecho y esperen a que aparezca el mensaje de éxito.

### Paso 2: Localización del Recurso Base (EC2)

1. Hagan clic en el botón View all instances o regresen al panel principal de EC2.

2. Identifiquen la instancia Servidor-Observabilidad que acaban de levantar. Esperen un par de minutos hasta que el Instance state diga Running y los Status checks hayan pasado.

3. En la pestaña de detalles inferiores, copien el Instance ID (ej. i-0abcd1234efgh5678). Este ID es el "DNI" de su servidor y será su Dimensión principal de búsqueda.

### Paso 3: Navegación hacia CloudWatch
1. Utilicen el buscador superior de AWS y naveguen hacia CloudWatch.

2. En el panel lateral izquierdo, bajo la sección Metrics, hagan clic en All metrics.

3. Se encontrarán con la pantalla principal de exploración. Aquí verán tarjetas que representan los distintos Namespaces (Contenedores lógicos de métricas).

### Paso 4: Filtrado por Namespace y Dimensión
1. Hagan clic en la tarjeta EC2 (Namespace: AWS/EC2).

2. AWS les mostrará las distintas formas de agrupar estos datos. Seleccionen Per-Instance Metrics (Métricas por instancia). Esta es su Dimensión.

3. En la barra de búsqueda, peguen el Instance ID que copiaron en el Paso 2 y presionen Enter.

4. Ahora la pantalla ha filtrado todo el ruido y solo muestra la telemetría exclusiva de su servidor. (Nota: Si la instancia es muy nueva, puede que tarden de 3 a 5 minutos en aparecer los primeros datos).

### Paso 5: Visualización y Análisis (Graphing)
1. Marquen la casilla junto a la métrica CPUUtilization.

2. Vayan a la pestaña superior Graphed metrics.

3. Cambien el estadístico (Statistic) a Average y el periodo (Period) a 5 Minutes.

4. Análisis SRE: Observen la gráfica. Notarán que solo hay puntos de datos espaciados cada 5 minutos. Esto es el límite del hipervisor estándar. Además, noten la ausencia de métricas como MemoryUtilization o DiskSpaceFree; CloudWatch no puede ver dentro del sistema operativo porque aún no hemos instalado ningún agente (CloudWatch Agent).