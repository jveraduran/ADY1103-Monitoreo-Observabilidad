// Importa las clases y funciones necesarias del SDK de AWS v3
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";

// --- 1. CONFIGURACIÓN DE CREDENCIALES (PARA LEARNER LABS) ---
// Reemplaza estos valores con los proporcionados en la consola de AWS Academy (AWS Details)
const AWS_REGION = process.env.AWS_REGION || "us-east-1"; 
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
const AWS_SESSION_TOKEN = process.env.AWS_SESSION_TOKEN || "";

// Inicializa el cliente de CloudWatch con credenciales explícitas
const client = new CloudWatchClient({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
        sessionToken: AWS_SESSION_TOKEN,
    }
});

const NAMESPACE = 'InfraestructuraCorporativa/SRE';

// Función para generar valores aleatorios
function getRandomFloat(min, max) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// --- 2. DICCIONARIO DE 30 RECURSOS AWS ---
// Simularemos un ecosistema Cloud completo con 30 tipos de dimensiones diferentes
const awsResources = [
    { service: 'EC2', dimName: 'InstanceId', dimValue: 'i-0abcd1234efgh5678' },
    { service: 'RDS', dimName: 'DBInstanceIdentifier', dimValue: 'prod-database-1' },
    { service: 'S3', dimName: 'BucketName', dimValue: 'sre-data-lake-corp' },
    { service: 'Lambda', dimName: 'FunctionName', dimValue: 'ProcessPaymentQueue' },
    { service: 'DynamoDB', dimName: 'TableName', dimValue: 'UsersSessionTable' },
    { service: 'ALB', dimName: 'LoadBalancer', dimValue: 'app/FrontendALB/50dc6c495c0c9188' },
    { service: 'APIGateway', dimName: 'ApiName', dimValue: 'MobileBackendAPI' },
    { service: 'ECS', dimName: 'ClusterName', dimValue: 'MicroservicesCluster' },
    { service: 'EKS', dimName: 'ClusterName', dimValue: 'KubernetesProd' },
    { service: 'SQS', dimName: 'QueueName', dimValue: 'OrderProcessingQueue' },
    { service: 'SNS', dimName: 'TopicName', dimValue: 'HighPriorityAlerts' },
    { service: 'CloudFront', dimName: 'DistributionId', dimValue: 'E1A2B3C4D5E6F7' },
    { service: 'ElastiCache', dimName: 'CacheClusterId', dimValue: 'redis-session-store' },
    { service: 'EFS', dimName: 'FileSystemId', dimValue: 'fs-12345678' },
    { service: 'NATGateway', dimName: 'NatGatewayId', dimValue: 'nat-0a1b2c3d4e5f6g7h8' },
    { service: 'TransitGateway', dimName: 'TransitGateway', dimValue: 'tgw-0987654321' },
    { service: 'Kinesis', dimName: 'StreamName', dimValue: 'ClickstreamData' },
    { service: 'Firehose', dimName: 'DeliveryStreamName', dimValue: 'LogArchiveStream' },
    { service: 'Redshift', dimName: 'ClusterIdentifier', dimValue: 'data-warehouse-1' },
    { service: 'OpenSearch', dimName: 'DomainName', dimValue: 'logs-analytics' },
    { service: 'StepFunctions', dimName: 'StateMachineArn', dimValue: 'arn:aws:states:us-east-1:123:OrderSaga' },
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

// --- 3. GENERADOR DINÁMICO POR TIMESTAMP ---
function generateMetricsForTimestamp(timestamp) {
    const metrics = [];

    // Por cada recurso de AWS, inyectamos 2 métricas operativas clave (60 métricas en total por hora)
    awsResources.forEach(resource => {
        // Métrica 1: Saturación/Uso (Porcentaje)
        metrics.push({
            MetricName: `${resource.service}_Utilization`,
            Value: getRandomFloat(10, 95),
            Unit: 'Percent',
            Dimensions: [{ Name: resource.dimName, Value: resource.dimValue }],
            Timestamp: timestamp
        });

        // Métrica 2: Tráfico/Peticiones (Conteo)
        metrics.push({
            MetricName: `${resource.service}_RequestCount`,
            Value: Math.floor(getRandomFloat(100, 5000)),
            Unit: 'Count',
            Dimensions: [{ Name: resource.dimName, Value: resource.dimValue }],
            Timestamp: timestamp
        });
    });

    return metrics;
}

// --- 4. BUCLE DE INYECCIÓN HISTÓRICA (ÚLTIMOS 14 DÍAS) ---
const injectHistoricalData = async () => {
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const now = Date.now();
    // Retrocedemos exactamente 13.8 días para asegurar que la API no lo rechace
    const past14Days = now - (13.8 * 24 * ONE_HOUR_MS); 

    console.log("⏳ Iniciando inyección masiva de telemetría (14 días, 30 Servicios)...");
    
    // Bucle: 1 iteración por cada hora de los últimos 14 días
    for (let time = past14Days; time <= now; time += ONE_HOUR_MS) {
        const currentTimestamp = new Date(time);
        const metricData = generateMetricsForTimestamp(currentTimestamp);

        // CloudWatch permite un máximo de 1000 métricas por petición. Nuestras 60 caben perfectamente.
        const command = new PutMetricDataCommand({
            Namespace: NAMESPACE,
            MetricData: metricData,
        });

        try {
            await client.send(command);
            console.log(`[OK] Inyectadas 60 métricas de 30 servicios para la fecha: ${currentTimestamp.toISOString()}`);
            
            // Pausa de 150ms para evitar Throttling Exception de AWS
            await new Promise(resolve => setTimeout(resolve, 150)); 
        } catch (error) {
            console.error(`[ERROR] Fallo en fecha ${currentTimestamp.toISOString()}:`, error.message);
        }
    }

    console.log("✅ Simulación corporativa completada. Ve a CloudWatch y explora el Namespace: " + NAMESPACE);
};

injectHistoricalData();