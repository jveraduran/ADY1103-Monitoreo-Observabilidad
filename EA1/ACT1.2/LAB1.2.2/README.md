# Guía de Laboratorio 1.2.2: Midiendo y Definiendo Acuerdos (SLI y SLO) 🛒

**Tema:** Ingeniería de Confiabilidad de Sitios (SRE) orientada al Negocio y Medición Real  
**Entorno:** AWS Learner Labs (EC2 + CloudShell) 
**Tiempo estimado:** 60 minutos  

---

## 🎯 Objetivo de la Actividad
Traducir la disponibilidad técnica en métricas de negocio medibles, comprobándolo primero en infraestructura real. Aprenderás a extraer un SLI técnico a partir de tráfico web en vivo y, con esa experiencia, tu equipo diseñará los Acuerdos de Nivel de Servicio (SLOs) para el e-commerce de la compañía.

---

## 📖 Contexto del Escenario: "MegaShop y el CyberMonday"
Son el equipo de *CloudOps/SRE* de **MegaShop**. Se acerca el CyberMonday y el CEO les exige "100% de disponibilidad" en la pasarela de pagos. Como ingenieros, saben que eso es imposible y demasiado costoso. 

Antes de ir a la mesa de negociación con el CEO para definir sus SLOs y su Presupuesto de Error, necesitan probar cómo se mide la disponibilidad en la realidad. Van a desplegar la API de pagos, simular tráfico de clientes, generar una caída y calcular matemáticamente la afectación.

---

## 🚀 Fase 1: Despliegue de la "API de Pagos"

Vamos a levantar un servidor web básico que simulará ser el *endpoint* donde los clientes procesan sus tarjetas de crédito.

1. Ve a la consola de **EC2** en tu entorno de AWS y lanza una nueva instancia.
2. **Nombre:** `MegaShop-API-Pagos`.
3. **AMI:** Amazon Linux 2023.
4. **Tipo:** `t2.micro`.
5. **Configuración de Red:** Permite tráfico **HTTP (puerto 80)** y **SSH (puerto 22)** desde cualquier lugar (`0.0.0.0/0`).
6. **IAM Role (Advanced Details):** Selecciona `LabInstanceProfile`.
7. **User Data:** Pega el siguiente script para instalar el servidor Nginx automáticamente al nacer:

```bash
#!/bin/bash
dnf update -y
dnf install nginx -y
systemctl start nginx
systemctl enable nginx
```

8. Lanza la instancia, espera a que esté en Running y copia su Dirección IPv4 Pública.

---
## 💥 Fase 2: Generación de Tráfico y Cálculo Real del SLI

Vamos a simular a 50 clientes intentando pagar, pero a mitad del proceso, la base de datos colapsará (apagaremos el servicio web).

### Paso 2.1: Preparar el ataque (CloudShell)

1. En la parte superior derecha de la consola de AWS, haz clic en el icono de CloudShell (el cuadrado con el símbolo >_).

2. Espera a que cargue la terminal. Vas a usar un comando que intentará hacer 50 pagos (peticiones web) seguidos, imprimiendo el código HTTP que recibe.

3. Prepara este comando (reemplaza <IP_DE_TU_EC2> con la IP pública real), pero aún no presiones Enter:

```bash
for i in {1..50}; do curl -s -o /dev/null -w "Intento $i - Código HTTP: %{http_code}\n" http://<IP_DE_TU_EC2>; sleep 1; done
```

### Paso 2.2: El Incidente
1. Abre otra pestaña en tu navegador, ve a EC2, selecciona tu instancia y haz clic en Connect (usando EC2 Instance Connect).

2. Ve a CloudShell y presiona Enter para iniciar las peticiones. Verás que empiezan a salir respuestas con "Código HTTP: 200" (Pagos exitosos).

3. Rápidamente, ve a tu terminal de Instance Connect (el servidor) y apaga la API de pagos intencionalmente ejecutando:

```bash
sudo systemctl stop nginx
```

4. Espera 5 segundos y vuelve a encenderla:

```bash
sudo systemctl start nginx
```

5. Regresa a CloudShell y espera a que terminen los 50 intentos.

### Paso 2.3: La Matemática del SLI
Revisa el output en CloudShell. Verás varios 200 (Éxito) y varios 000 o mensajes de error por Connection Refused (Fallo).

Calcula tu SLI manualmente:

- Total de Eventos: 50

- Eventos Exitosos (Códigos 200): Cúentalos en tu pantalla (supongamos que fueron 42).

- Fórmula del SLI: (Exitosos / Total) * 100 -> (42 / 50) * 100 = 84%

Conclusión técnica: Tu SLI de disponibilidad para este ejercicio fue del 84%. ¡Has perdido un 16% de tus clientes por esa pequeña caída!

---
## 📏 Fase 3: Diseño de Acuerdos de Negocio
Ahora que entienden de dónde salen los números técnicos, dejen la terminal y reúnanse con su equipo para diseñar los acuerdos formales del negocio completo.

User Journeys: Elijan las 3 interacciones más críticas del e-commerce (Ej. Búsqueda, Pago, Login).

Definición de SLIs: Para cada interacción, redacten un SLI técnico siguiendo la estructura: "La proporción de [TIPO DE SOLICITUD] que resultan en [ESTADO EXITOSO] medidas en [PUNTO DE MEDICIÓN]".

Definición de SLOs: Asignen un porcentaje de compromiso a cada SLI. (Ej. El login debe tener éxito el 99.5% de las veces durante un mes).

---
## ⚖️ Fase 4: Justificación del Presupuesto de Error
Para su SLO más crítico (ej. Pagos), redacten una justificación respondiendo al CEO:

1. ¿Por qué eligieron ese porcentaje y no el 100% que él pedía?

2. Si su SLO es del 99.5%, su Presupuesto de Error es del 0.5%. ¿Qué acciones tomará el equipo técnico si se gastan este presupuesto en los primeros 10 días del mes debido a errores de código? (Pista: ¿Congelan pases a producción?).

---
## 📝 Fase 5: Entregable y Limpieza
Consolidar en un documento el resultado de la Fase 3 y Fase 4 (Los 3 SLIs, los 3 SLOs y la justificación del Presupuesto de Error) detallando el cálculo práctico que obtuvieron en la Fase 2.


## 🧹 Limpieza del Entorno
¡No olvides proteger tus créditos del Learner Lab!

- Ve a la consola de EC2.

- Selecciona la instancia MegaShop-API-Pagos y asegúrate de elegir Terminate instance para eliminarla definitivamente.