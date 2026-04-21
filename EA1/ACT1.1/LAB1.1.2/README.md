# Guía de Laboratorio 1.1.2: Simulador de Caída de Sistemas y Debate 🚨
**Tema:** Troubleshooting Tradicional vs. Observabilidad Moderna  
**Entorno:** AWS Learner Labs (AWS Academy)  
**Tiempo estimado:** 45 minutos  

---

## 📖 Contexto del Escenario: "El E-commerce en Black Friday"
Son las 2:00 a.m. del Black Friday. Eres parte del equipo de guardia (*On-Call*) y el sitio web de ventas principal de la empresa acaba de dejar de responder. Los clientes están reportando en redes sociales que la página no carga. ¡Tu trabajo es descubrir qué está pasando!

---

## 🚀 Fase 1: Preparación del Entorno (Despliegue)

Vamos a levantar el servidor web simulado. Para ahorrar tiempo, inyectaremos un script que instalará el servidor automáticamente al nacer la máquina.

### Paso 1: Lanzar la Instancia EC2
1. Ingresa a tu entorno de **AWS Learner Lab** y ve a la consola de **EC2**.
2. Haz clic en **Launch instances** (Lanzar instancias).
3. **Name:** Escribe `Web-Server-BlackFriday`.
4. **AMI:** Selecciona **Amazon Linux 2023 AMI** (la opción por defecto).
5. **Instance type:** Selecciona `t2.micro` (es gratuita y permitida en el lab).
6. **Key pair:** Selecciona `vockey` (la llave por defecto de AWS Academy) o procede sin llave si usarás EC2 Instance Connect.
7. **Network settings:**
   - Habilita **Allow SSH traffic from anywhere**.
   - Habilita **Allow HTTP traffic from the internet** (¡Muy importante para ver la web!).
8. **Advanced details (Desplázate hasta abajo):**
   - En el cuadro de texto **User data**, pega el siguiente código exacto. Esto instalará Nginx y la herramienta de estrés sin que tengas que hacerlo a mano:

```bash
#!/bin/bash
# Actualizar el sistema
dnf update -y
# Instalar servidor web y herramienta de estrés
dnf install nginx stress htop -y
# Iniciar y habilitar Nginx
systemctl start nginx
systemctl enable nginx
```

9. Haz clic en Launch instance.
10. Espera unos 2 minutos, copia la Dirección IPv4 Pública de tu instancia y pégala en tu navegador. Deberías ver la pantalla de bienvenida de Nginx.


## 💥 Fase 2: El Sabotaje (Generando el Incidente)

Ahora vamos a simular la avalancha masiva de usuarios que colapsará el servidor.

1. Conéctate a tu instancia EC2. La forma más rápida es seleccionando tu instancia y haciendo clic en Connect en la parte superior derecha, usando EC2 Instance Connect.

2. En la terminal negra del navegador, ejecuta el siguiente comando para iniciar el ataque de estrés (saturará la CPU y la memoria por 10 minutos):

```bash
sudo stress --cpu 4 --io 2 --vm 1 --vm-bytes 256M --timeout 600s
```

3. Intenta recargar la página web de Nginx en tu navegador. Notarás que tarda muchísimo o simplemente da error (Time Out). ¡El incidente ha comenzado!

## 🕵️‍♂️ Fase 3: Troubleshooting Tradicional (A ciegas)

Mientras el comando de estrés sigue corriendo, abre otra pestaña de conexión a tu servidor (otra sesión de EC2 Instance Connect). Actuarás como un SysAdmin clásico.

1. Ejecuta el comando clásico para ver el consumo de recursos:

```bash
top
```
(Presiona la tecla q para salir de top)

2. Ejecuta una vista más amigable de los procesos:

```bash
htop
```
(Presiona F10 o q para salir)

3. Verifica el estado de la memoria RAM:

```bash
free -m
```
Reflexión en esta fase: Siente el "lag" al escribir en la terminal. Piensa en lo difícil que es leer estos datos en tiempo real bajo presión.

☁️ Fase 4: El Enfoque CloudOps (Monitoreo Moderno)
Deja la terminal y vámonos a las herramientas que la nube nos ofrece.

1. Regresa a la consola principal de AWS EC2 (fuera de la terminal).

2. Selecciona tu instancia Web-Server-BlackFriday.

3. En el panel inferior, haz clic en la pestaña Monitoring (Monitoreo).

4. Observa las gráficas de CloudWatch que vienen por defecto.

- Busca la gráfica de CPU Utilization (Utilización de CPU).

- Busca la gráfica de Network In/Out (Tráfico de red).

**Nota:** CloudWatch actualiza las métricas estándar cada 5 minutos, por lo que es posible que debas esperar un momento para ver el pico reflejado visualmente.

🗣️ Fase 5: Preguntas para el Debate en Clase
Una vez finalizado el ejercicio (el comando de estrés terminará solo después de 10 minutos), reúnanse en grupos o en plenaria y respondan:

1. Escalabilidad del dolor: ¿Cuánto tardaron en entender qué pasaba usando la terminal top? ¿Qué harían si en lugar de 1 servidor, el E-commerce tuviera un grupo de 50 servidores? ¿Entrarían por SSH a los 50 uno por uno?

2. Monitoreo vs. Observabilidad: La gráfica de AWS nos dijo que la CPU estaba al 100% (Monitoreo base). Pero, ¿les dijo qué línea de código o qué consulta específica a la base de datos causó ese pico? ¿Qué nos falta para tener Observabilidad real?

3. Proactividad: ¿Debimos enterarnos de este colapso porque un cliente se quejó en Twitter? ¿Qué mecanismos deberíamos configurar para que el sistema nos avise antes de llegar al colapso total?

🧹 Fase 6: Limpieza del Laboratorio (¡Cuida tu presupuesto!)
Para evitar gastar los créditos del Learner Lab innecesariamente:

1. Ve a la consola de EC2.

2. Selecciona la instancia Web-Server-BlackFriday.

3. Haz clic en el menú Instance state y selecciona Terminate instance (Terminar instancia).