# 🔬 Guía de Laboratorio 4.2.2: Auditoría FinOps SRE y Simulación de Costos

## 🎯 Objetivo de la Actividad
En la cultura SRE, el control financiero (FinOps) se realiza directamente desde la telemetría, sin esperar a fin de mes. En entornos académicos como Learner Labs (donde el acceso a la facturación está bloqueado o cubierto por la capa gratuita), los ingenieros deben ser creativos.

En este laboratorio inyectaremos telemetría simulada para 30 tipos de recursos distintos de AWS abarcando los últimos 14 días. Luego, usaremos CloudWatch Metric Math para convertir el uso técnico (peticiones a la API) en un "Dashboard de Costos Simulados" en dólares, sobre el cual configuraremos una alarma crítica de presupuesto.

## 📝 Paso a Paso Guiado

### Paso 1: Preparación del Entorno en CloudShell
En la consola de AWS, abran CloudShell (el ícono de la terminal en la barra de navegación superior).

Inicialicen el proyecto de Node.js ejecutando estos comandos uno por uno:

```bash
npm install @aws-sdk/client-cloudwatch
```

### Paso 2: Creación del Script de Inyección (metrics.js)
Abran el editor de texto integrado ejecutando: nano metrics.js

Peguen el siguiente código. (Nota: Si están en Learner Lab, recuerden reemplazar las variables TU_ACCESS_KEY_AQUI con las credenciales temporales del botón "AWS Details").

```bash
const { CloudWatchClient, PutMetricDataCommand } = require("@aws-sdk/client-cloudwatch");

// --- 1. CONFIGURACIÓN DE CREDENCIALES ---
const AWS_REGION = process.env.AWS_REGION || "us-east-1"; 
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "TU_ACCESS_KEY_AQUI";
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "TU_SECRET_KEY_AQUI";
const AWS_SESSION_TOKEN = process.env.AWS_SESSION_TOKEN || "TU_SESSION_TOKEN_AQUI";

const client = new CloudWatchClient({
    region: AWS_REGION,
    credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY, sessionToken: AWS_SESSION_TOKEN }
});

const NAMESPACE = 'InfraestructuraCorporativa/SRE';

function getRandomFloat(min, max) { return parseFloat((Math.random() * (max - min) + min).toFixed(2)); }

// --- 2. DICCIONARIO DE 30 RECURSOS AWS ---
const awsResources = [
    { service: 'EC2', dimName: 'InstanceId', dimValue: 'i-0abcd1234efgh5678' },
    { service: 'RDS', dimName: 'DBInstanceIdentifier', dimValue: 'prod-database-1' },
    { service: 'S3', dimName: 'BucketName', dimValue: 'sre-data-lake-corp' },
    { service: 'Lambda', dimName: 'FunctionName', dimValue: 'ProcessPaymentQueue' },
    { service: 'DynamoDB', dimName: 'TableName', dimValue: 'UsersSessionTable' },
    { service: 'ALB', dimName: 'LoadBalancer', dimValue: 'app/FrontendALB/50dc6c49' },
    { service: 'APIGateway', dimName: 'ApiName', dimValue: 'MobileBackendAPI' },
    { service: 'ECS', dimName: 'ClusterName', dimValue: 'MicroservicesCluster' },
    { service: 'EKS', dimName: 'ClusterName', dimValue: 'KubernetesProd' },
    { service: 'SQS', dimName: 'QueueName', dimValue: 'OrderProcessingQueue' },
    { service: 'SNS', dimName: 'TopicName', dimValue: 'HighPriorityAlerts' },
    { service: 'CloudFront', dimName: 'DistributionId', dimValue: 'E1A2B3C4D5E6F7' },
    { service: 'ElastiCache', dimName: 'CacheClusterId', dimValue: 'redis-session-store' },
    { service: 'EFS', dimName: 'FileSystemId', dimValue: 'fs-12345678' },
    { service: 'NATGateway', dimName: 'NatGatewayId', dimValue: 'nat-0a1b2c3d4e5f' },
    { service: 'TransitGateway', dimName: 'TransitGateway', dimValue: 'tgw-0987654321' },
    { service: 'Kinesis', dimName: 'StreamName', dimValue: 'ClickstreamData' },
    { service: 'Firehose', dimName: 'DeliveryStreamName', dimValue: 'LogArchiveStream' },
    { service: 'Redshift', dimName: 'ClusterIdentifier', dimValue: 'data-warehouse-1' },
    { service: 'OpenSearch', dimName: 'DomainName', dimValue: 'logs-analytics' },
    { service: 'StepFunctions', dimName: 'StateMachineArn', dimValue: 'arn:aws:states:us-east-1:123' },
    { service: 'Glue', dimName: 'JobName', dimValue: 'DailyETLProcess' },
    { service: 'SageMaker', dimName: 'EndpointName', dimValue: 'FraudDetectionModel' },
    { service: 'CodePipeline', dimName: 'PipelineName', dimValue: 'BackendCI-CD' },
    { service: 'CodeBuild', dimName: 'ProjectName', dimValue: 'BuildDockerImages' },
    { service: 'ECR', dimName: 'RepositoryName', dimValue: 'backend-api-repo' },
    { service: 'ElasticBeanstalk', dimName: 'EnvironmentName', dimValue: 'LegacyApp-Prod' },
    { service: 'WAFV2', dimName: 'WebACL', dimValue: 'GlobalSecurityRule' },
    { service: 'Route53', dimName: 'HostedZoneId', dimValue: 'Z1234567890ABC' },
    { service: 'Cognito', dimName: 'UserPoolId', dimValue: 'us-east-1_A1b2C3d4' }
];

function generateMetricsForTimestamp(timestamp) {
    const metrics = [];
    awsResources.forEach(resource => {
        metrics.push({ MetricName: `${resource.service}_Utilization`, Value: getRandomFloat(10, 95), Unit: 'Percent', Dimensions: [{ Name: resource.dimName, Value: resource.dimValue }], Timestamp: timestamp });
        metrics.push({ MetricName: `${resource.service}_RequestCount`, Value: Math.floor(getRandomFloat(100, 5000)), Unit: 'Count', Dimensions: [{ Name: resource.dimName, Value: resource.dimValue }], Timestamp: timestamp });
    });
    return metrics;
}

// --- 3. BUCLE DE INYECCIÓN HISTÓRICA (14 DÍAS) ---
const injectHistoricalData = async () => {
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const now = Date.now();
    const past14Days = now - (13.8 * 24 * ONE_HOUR_MS); 
    console.log("⏳ Iniciando inyección masiva de telemetría (14 días, 30 Servicios)...");
    
    for (let time = past14Days; time <= now; time += ONE_HOUR_MS) {
        const currentTimestamp = new Date(time);
        const command = new PutMetricDataCommand({ Namespace: NAMESPACE, MetricData: generateMetricsForTimestamp(currentTimestamp) });
        try {
            await client.send(command);
            console.log(`[OK] Inyectadas 60 métricas para la fecha: ${currentTimestamp.toISOString()}`);
            await new Promise(resolve => setTimeout(resolve, 150)); 
        } catch (error) {
            console.error(`[ERROR] Fallo en fecha ${currentTimestamp.toISOString()}:`, error.message);
        }
    }
    console.log("✅ Simulación completada.");
};

injectHistoricalData();
```

Guarden y salgan (Ctrl + O, Enter, Ctrl + X).

### Paso 3: Ejecución de la Carga Masiva
En la terminal de CloudShell, ejecuten el script:

```bash
node metrics.js
```

Observen en la terminal cómo se inyectan los datos hora por hora, llenando el vacío histórico de las últimas dos semanas. Esto generará miles de transacciones hacia la API.

### Paso 4: Creación del Dashboard FinOps (Metric Math)
Dado que la consola de Billing mostrará $0.00 en la capa gratuita, calcularemos el costo nosotros mismos. AWS cobra $0.01 USD por cada 1,000 llamadas a la API de CloudWatch.

- Vayan a CloudWatch -> All metrics.

- Entren al Namespace AWS/Usage -> By AWS Resource.

- Busquen la métrica CallCount del servicio CloudWatch y márquenla.

- Vayan a la pestaña Graphed metrics. La métrica aparecerá con el ID m1.

- Cambien el Statistic a Sum y el Period a 5 Minutes (crítico para que la gráfica no muestre "No data available").

- Hagan clic en Add math -> Start with empty expression.

- En la nueva fila (e1), ingresen la fórmula de conversión financiera: (m1 / 1000) * 0.01

- En la columna de Label, nómbrenla "Costo Simulado (USD)". Desmarquen la casilla de m1 para visualizar únicamente la línea de dinero e1.

- Ajusten el selector de tiempo (arriba a la derecha) a las últimas 3h o 12h. Verán un pico claro representando el dinero gastado por la ejecución de su script.

### Paso 5: Alerta Proactiva de Presupuesto (FinOps Alerting)

- En el panel izquierdo de CloudWatch, vayan a Alarms -> All alarms y hagan clic en Create alarm.

- En la pantalla, hagan clic en el botón azul Select metric.

- Reconstrucción de la fórmula: Naveguen a AWS/Usage -> By AWS Resource -> seleccionen CallCount. Vayan a Graphed metrics, cambien el periodo a 5 Minutes y el Statistic a Sum. Creen nuevamente el math expression (m1 / 1000) * 0.01.

- Paso Clave: Desmarquen la casilla de m1 y dejen marcada solo la casilla de e1 (la expresión matemática). Hagan clic en Select metric abajo a la derecha.

- En la sección Conditions, seleccionen Static y Greater/Equal. En el valor (Threshold), escriban 0.05 (5 centavos de dólar). Hagan clic en Next.

- En la configuración de acciones (SNS), seleccionen su tópico de alertas de laboratorio previamente creado (ej. el que envía correos a su bandeja). Hagan clic en Next.

- Nombren su alarma FinOps-Control-Gastos-API y guárdenla.

## 🏆 Conclusión SRE
Con este laboratorio han logrado una madurez operativa altísima. No solo lograron automatizar y generar tráfico masivo realista, sino que aprendieron que la Observabilidad SRE incluye vigilar la "billetera". Al traducir llamadas de red crudas a dólares mediante CloudWatch Math y conectarlas a un sistema de notificaciones, han construido un control automático que protegerá el presupuesto de cualquier empresa real.