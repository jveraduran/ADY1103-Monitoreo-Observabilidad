# 🔬 Guía de Laboratorio 4.2.4: Proyección de Producción y Presupuestos (Calculadora AWS + CloudWatch)

## 🎯 Objetivo de la Actividad
En la cultura SRE, un ingeniero no solo reacciona al gasto actual, sino que diseña la arquitectura pensando en su costo futuro a gran escala.

En este laboratorio aprenderás a diferenciar entre las herramientas de monitoreo en tiempo real (CloudWatch Dashboards) y las herramientas de planificación estratégica (AWS Pricing Calculator). Modelaremos el costo de llevar nuestro script a un clúster de producción y cerraremos el ciclo actualizando nuestras alarmas de presupuesto.

## 📝 Paso a Paso Guiado

### Fase 1: Análisis de la Línea Base (La Realidad Actual)
Antes de proyectar el futuro, un SRE debe entender el presente revisando el Dashboard construido en la etapa anterior.

- En la consola de AWS, dirígete a CloudWatch -> All metrics.

- Navega hacia AWS/Usage -> By AWS Resource y selecciona la métrica CallCount del servicio CloudWatch.

- En la pestaña de Graphed metrics, asegúrate de tener tu expresión matemática configurada: (m1 / 1000) * 0.01 con el periodo en 5 Minutes y la estadística en Sum.

- Observa el pico de la gráfica. Esto representa el gasto base de una sola ejecución de nuestro script en el entorno de pruebas.

### Fase 2: Proyección Teórica (El Escenario Futuro)
El equipo de Arquitectura ha decidido que la telemetría es tan valiosa que, el próximo mes, el script se desplegará en un clúster de producción con 50 instancias EC2, cada una enviando 20 métricas personalizadas cada minuto. Vamos a calcular su costo.

- Abre una nueva pestaña en tu navegador e ingresa a la AWS Pricing Calculator: calculator.aws

- Haz clic en el botón Create Estimate (Crear estimación).

- En la barra de búsqueda, escribe Amazon CloudWatch y haz clic en Configure (Configurar).

- Selecciona la misma región donde estás trabajando tu laboratorio (ej. us-east-1).

- Cálculo de Métricas Personalizadas (Custom Metrics):

    - Multiplicamos: 50 instancias x 20 métricas = 1,000 métricas únicas.

    - En la sección Metrics, despliega Number of Custom metrics e ingresa 1000.

- Cálculo de Peticiones a la API (PutMetricData):

    - Si cada instancia envía sus datos en un paquete cada 60 segundos, genera 1 petición por minuto.

    - Multiplicamos: 50 peticiones/minuto x 60 minutos x 24 horas x 30 días = 2,160,000 peticiones al mes.

    - En la sección API Requests, ingresa 2.16 y selecciona Millions.

- Desplázate al final de la página y observa el costo mensual proyectado para este clúster (debería rondar los $321.60 USD mensuales).

### Fase 3: Cierre del Ciclo SRE (Actualización de Alarmas)
Ahora que sabemos que nuestro entorno de producción costará aproximadamente $321.60 USD al mes, debemos protegerlo. Si un error de código causa que el script envíe datos cada segundo en lugar de cada minuto, ese costo se multiplicaría por 60.

- Regresa a la consola principal de AWS y ve a CloudWatch -> Alarms -> All alarms.

- Selecciona la casilla junto a tu alarma creada anteriormente (ej. FinOps-Control-Gastos-API).

- En el menú superior de la derecha, haz clic en Actions -> Edit (Editar).

- Avanza hasta la sección de Conditions (Condiciones).

- Ajuste del Umbral: Ya no estamos cuidando un laboratorio de centavos, sino un entorno de producción. Ajusta el Threshold (Umbral) para que el sistema te alerte si detecta un comportamiento de gasto anómalo basado en tu nuevo cálculo. Por ejemplo, puedes configurarlo para que envíe una alerta si el gasto en la ventana de tiempo evaluada supera la proporción equivalente a $350.00 USD.

- Haz clic en Next hasta llegar al final y guarda los cambios haciendo clic en Update alarm.

## 🏆 Conclusión SRE
¡Felicidades! Has completado un flujo FinOps de nivel corporativo. Primero usaste datos reales en CloudWatch para entender el comportamiento de tu código; luego usaste la AWS Pricing Calculator para traducir arquitectura a finanzas; y finalmente, conectaste ambos mundos configurando un límite de seguridad automatizado. El Dashboard muestra la realidad, pero la Calculadora y las Alarmas protegen el futuro de la empresa.