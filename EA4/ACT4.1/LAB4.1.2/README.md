# 🔬 Guía de Laboratorio 4.1.2: Inyección de Métricas Personalizadas con Node.js (AWS SDK v3)

## 🎯 Objetivo de la Actividad
La verdadera observabilidad trasciende el uso de memoria o CPU; se trata de medir el impacto en el negocio. En este laboratorio, los estudiantes asumirán el rol de desarrolladores SRE. Utilizarán AWS CloudShell para escribir e instrumentar un script en Node.js utilizando el moderno AWS SDK v3. El objetivo crítico es aprender a enviar telemetría de negocio a CloudWatch eliminando la peligrosa práctica de usar credenciales "quemadas" (hardcoded), confiando en la cadena de proveedores por defecto (Default Credential Provider Chain) que hereda la identidad de forma segura.

## ⚠️ Restricciones del Entorno (Learner Lab)
Uso de CloudShell: Para no consumir créditos aprovisionando una máquina virtual completa, utilizaremos CloudShell. Es una terminal web efímera y gratuita que ya viene con Node.js preinstalado y hereda automáticamente sus permisos temporales de Learner Lab.

Región: Asegúrense de ejecutar CloudShell en us-east-1 (Norte de Virginia).

## 📝 Paso a Paso Guiado

### Paso 1: Acceso a CloudShell y Preparación del Entorno
Inicien sesión en la consola de AWS. En la esquina superior derecha (junto a la campana de notificaciones), hagan clic en el ícono de CloudShell (un pequeño cuadrado con el símbolo >_).

Esperen unos segundos a que el entorno de terminal se inicialice.

Creen un directorio de trabajo y entren en él:

```bash
mkdir lab-metricas-nodejs && cd lab-metricas-nodejs
```

Inicialicen un proyecto de Node.js e instalen únicamente el módulo de CloudWatch del SDK v3:

```bash
npm init -y
npm install @aws-sdk/client-cloudwatch
```

### Paso 2: Programación del Script (Enfoque de Identidad SRE)
Nota SRE: Jamás deben colocar sus "Access Keys" en el código. Al instanciar el cliente vacío, el SDK de AWS buscará inteligentemente las credenciales temporales del entorno CloudShell.

Creen el archivo de ejecución utilizando el editor nano:

```bash
nano sendMetrics.js
```

Peguen el siguiente código JavaScript. Observen que la configuración del CloudWatchClient solo requiere la región:

```bash
const { CloudWatchClient, PutMetricDataCommand } = require("@aws-sdk/client-cloudwatch");

// Inicialización segura: No hay llaves quemadas (Default Provider Chain)
const client = new CloudWatchClient({ region: "us-east-1" });

const run = async () => {
  // Construimos el payload de nuestra Métrica de Negocio
  const params = {
    MetricData: [
      {
        MetricName: "PagosProcesados",
        Dimensions: [
          { Name: "Entorno", Value: "Produccion" },
          { Name: "Moneda", Value: "USD" }
        ],
        Unit: "Count",
        Value: 15 // Valor inventado para simular 15 pagos exitosos
      },
    ],
    Namespace: "MiEmpresa/E-commerce", // Custom Namespace
  };

  try {
    const command = new PutMetricDataCommand(params);
    const response = await client.send(command);
    // Validamos el éxito del envío (HTTP 200)
    console.log("¡Éxito! Métrica enviada a CloudWatch. HTTP Status:", response.$metadata.httpStatusCode);
  } catch (err) {
    console.error("Error al enviar la métrica:", err);
  }
};

run();
```

Guarden el archivo presionando Ctrl + O, luego Enter, y salgan con Ctrl + X.

### Paso 3: Inyección de Datos y Validación (HTTP 200)
Ejecuten el script varias veces en su terminal para generar puntos de datos:

```bash
node sendMetrics.js
```

Deberían ver en la consola el mensaje: ¡Éxito! Métrica enviada a CloudWatch. HTTP Status: 200. Si ven un código 200, la API de AWS ha aceptado su telemetría matemáticamente.

### Paso 4: Comprobación Visual en CloudWatch
Abran una nueva pestaña en su navegador, vayan a la consola de AWS y busquen CloudWatch.

En el panel lateral, hagan clic en All metrics.

Debería aparecer una nueva tarjeta de Namespace llamada MiEmpresa/E-commerce.

Ingresen allí, hagan clic en Entorno, Moneda, y seleccionen la métrica PagosProcesados para graficar sus 15 pagos simulados en la nube.

## 🏆 Conclusión Operativa y Reflexión SRE
Al finalizar esta práctica, han demostrado cómo instrumentar código desde la perspectiva de desarrollo. Comprenden que la seguridad es primordial: utilizar la Cadena de Proveedores por Defecto (Default Provider Chain) del SDK de AWS anula el riesgo de exponer credenciales en repositorios como GitHub. Además, lograron ir más allá de la telemetría de hardware, inyectando métricas de valor empresarial (PagosProcesados) que permitirán al equipo FinOps o de Producto tener visibilidad del comportamiento real de los clientes.