# 🔬 Guía de Laboratorio 3.4.2: Notificaciones y Alertas (Configuración de Tópico SNS y Alarma CloudWatch)
## 🎯 Objetivo de la Actividad
El monitoreo en pantallas solo es útil si hay un humano mirándolas. En la cultura SRE, el sistema debe avisar proactivamente al ingeniero cuando hay una degradación del servicio. En este laboratorio, los estudiantes construirán un pipeline de alertas desacoplado: crearán un servidor base, configurarán un canal de notificaciones mediante Amazon SNS (Simple Notification Service) y crearán una alarma en CloudWatch que disparará un correo electrónico automáticamente si la CPU del servidor supera el umbral crítico del 70%.

## ⚠️ Restricciones del Entorno (Learner Lab)
- Región: Utilicen obligatoriamente us-east-1 (Norte de Virginia).

- Costos: Solo levantaremos una instancia t2.micro. El servicio SNS incluye 1,000 notificaciones por correo electrónico gratuitas al mes, y CloudWatch permite hasta 10 alarmas gratuitas, por lo que nos mantenemos dentro de la capa gratuita.

- Confirmación de Correo: Asegúrense de usar un correo electrónico real (institucional o personal) al que tengan acceso inmediato, ya que AWS requiere un "Opt-In" (confirmación de suscripción) por seguridad.

## 📝 Paso a Paso Guiado
### Paso 1: Aprovisionamiento de la Infraestructura Base
1. En la consola de AWS, diríjanse al servicio EC2 y hagan clic en Launch instance.

2. Name: Asignen el nombre Servidor-Alarma-SRE.

3. AMI & Tipo: Seleccionen Amazon Linux 2023 y el tipo t2.micro (Free tier eligible).

4. Key pair: Seleccionen la llave del laboratorio vockey.

5. Hagan clic en Launch instance. Una vez creada, copien el Instance ID (ej. i-0abcd1234efgh5678), lo necesitarán en el Paso 3.

### Paso 2: Creación del Canal de Notificaciones (Amazon SNS)
Nota SRE: Desacoplamos la alarma de la notificación para poder enviar un mismo mensaje a correos, SMS o sistemas como PagerDuty simultáneamente.

1. En el buscador superior de AWS, escriban SNS y abran el servicio Simple Notification Service.

2. En el panel izquierdo, hagan clic en Topics (Tópicos) y luego en el botón naranja Create topic.

3. En la sección Details, elijan el tipo Standard.

4. Name: Escriban Alertas-SRE-Equipo. Desplácense hasta abajo y hagan clic en Create topic.

5. Dentro de la pantalla de su nuevo tópico, hagan clic en la pestaña Subscriptions y luego en el botón Create subscription.

6. En el campo Protocol, seleccionen Email.

7. En Endpoint, escriban su dirección de correo electrónico real y hagan clic en Create subscription.

8. Paso Crítico: Abran su bandeja de entrada de correo electrónico. Habrán recibido un mensaje de "AWS Notifications". Ábranlo y hagan clic en el enlace Confirm subscription. Si no hacen esto, AWS bloqueará el envío de alertas por políticas de Anti-Spam.

### Paso 3: Creación de la Alarma en CloudWatch
1. Regresen a la consola web de AWS y busquen el servicio CloudWatch.

2. En el panel lateral izquierdo, bajo Alarms, hagan clic en All alarms y luego en el botón Create alarm.

3. Hagan clic en Select metric.

4. Naveguen por EC2 -> Per-Instance Metrics. Busquen su Instance ID y marquen la métrica CPUUtilization. Hagan clic en Select metric.

5. En la sección Conditions, seleccionen Greater/Equal (Mayor o igual) y escriban 70 en el campo than. Esto define nuestro umbral SRE. Hagan clic en Next.

6. En la pantalla Configure actions, bajo Alarm state trigger, dejen seleccionado In alarm.

7. En Send a notification to, seleccionen Select an existing SNS topic y elijan en el menú desplegable su tópico Alertas-SRE-Equipo. Hagan clic en Next.

8. Alarm name: Nombren la alarma como CPU-Critica-Servidor-SRE. Hagan clic en Next.

9. Revisen la configuración final en la pantalla de resumen y hagan clic en Create alarm.

10. La alarma aparecerá en estado Insufficient data por unos minutos hasta que evalúe la CPU. Luego pasará a estado OK (verde).

## 🏆 Conclusión Operativa y Reflexión SRE
Al finalizar esta guía, han implementado la piedra angular del monitoreo reactivo. Un sistema de alertas bien configurado libera a los ingenieros de la "fatiga de pantalla" (tener que mirar dashboards todo el día). Han establecido un contrato automatizado: el sistema asume la responsabilidad de vigilar el hardware en ciclos de 5 minutos, garantizando que el equipo humano solo sea interrumpido e invocado cuando existe un riesgo real de degradación (sobrepasar el umbral de SLA del 70%).