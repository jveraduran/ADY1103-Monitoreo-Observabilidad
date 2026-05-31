# ADY1103: Monitoreo & Observabilidad

Bienvenido al repositorio central del curso práctico de Monitoreo & Observabilidad. En este programa aprenderás a transitar desde el monitoreo de infraestructura tradicional hasta la observabilidad moderna, aplicando prácticas de Ingeniería de Confiabilidad de Sitios (SRE) y FinOps.

A lo largo del curso, implementaremos soluciones tanto con stacks *Open-Source* (Prometheus y Grafana) como con servicios administrados *Cloud-Native* (AWS CloudWatch), culminando con un análisis del impacto financiero de nuestras arquitecturas de telemetría.

---

## 🎯 Objetivos del Curso

1. Diferenciar entre monitoreo pasivo y observabilidad proactiva.
2. Definir y medir acuerdos de nivel de servicio (SLI, SLO, SLA) orientados al negocio.
3. Desplegar arquitecturas de recolección de métricas bajo modelos *Pull* y *Push*.
4. Centralizar, analizar y visualizar logs y métricas para un *troubleshooting* ágil.
5. Gestionar alertas eficientes y evitar la "fatiga de alertas".
6. Auditar y optimizar los costos generados por la telemetría (FinOps).

---

## ⚠️ Entorno de Trabajo: AWS Learner Labs

Todos los laboratorios de este curso están diseñados para ejecutarse de manera segura dentro de **AWS Academy Learner Labs**. Debido a las políticas de este entorno controlado, existen consideraciones críticas que debes recordar:

* **IAM Roles:** Tienes permisos restringidos para la creación de roles IAM. Para cualquier integración de servicios (como CloudWatch Agent o EC2), **siempre utilizaremos el perfil pre-creado `LabInstanceProfile`** y el rol `LabRole`.
* **Tipos de Instancias:** Utilizaremos predominantemente instancias `t2.micro` y `t3.micro` para mantenernos dentro del presupuesto gratuito asignado.
* **Costos:** Al finalizar cada sesión, recuerda apagar (`stop`) o terminar (`terminate`) tus recursos si no tienen uso a largo plazo para conservar tus créditos del laboratorio.

---

## 📂 Índice de Laboratorios Prácticos

A continuación, encontrarás el acceso a las guías paso a paso de cada Experiencia de Aprendizaje (EA):

### EA 1: Fundamentos de Confiabilidad y Observabilidad
* [Lab 1.1.2 - Simulador de Caída de Sistemas (Break/Fix) y Debate](./EA1/ACT1.1/LAB1.1.2/README.md)
* [Lab 1.1.4 - Exploración de Métricas Base en EC2](./EA1/ACT1.1/LAB1.1.4/README.md)
* [Lab 1.2.2 - Definición de Acuerdos para E-commerce (SLO/SLI)](./EA1/ACT1.2/LAB1.2.2/README.md)
* [Lab 1.2.4 - Modelado de Umbrales en AWS](./EA1/ACT1.2/LAB1.2.4/README.md)
* [Lab 1.3.2 - Dinámica de Selección de Herramientas según el Negocio](../EA1/ACT1.3/LAB1.3.2/README.md)
* [Lab 1.3.4 - Análisis de Repositorio de Infraestructura como Código](./EA1/ACT1.3/LAB1.3.4/README.md)

### EA 2: Stack Open-Source (Prometheus & Grafana)
* [Lab 2.1.2 - Análisis de IaC y Docker Compose](./EA2/ACT2.1/LAB2.1.2/README.md)
* [Lab 2.1.4 - Despliegue de Prometheus Local en EC2](./EA2/ACT2.1/LAB2.1.4/README.md)
* [Lab 2.2.2 - Instalación de Node Exporter y Recolección de SO](./EA2/ACT2.2/LAB2.2.2/README.md)
* [Lab 2.2.4 - Ejercicios de PromQL Avanzado](./EA2/ACT2.2/LAB2.2.4/README.md)
* [Lab 2.3.2 - Despliegue de Grafana e Importación de Templates](./EA2/ACT2.3/LAB2.3.2/README.md)
* [Lab 2.3.4 - Creación de Dashboard Custom con PromQL](./EA2/ACT2.3/LAB2.3.4/README.md)

### EA 3: Monitoreo Cloud-Native (AWS CloudWatch)
* [Lab 3.1.2 - Exploración en Metrics Explorer](./EA3/ACT3.1/LAB3.1.2/README.md)
* [Lab 3.1.4 - Inyección de Carga y Análisis de Anomalías](./EA3/ACT3.1/LAB3.1.4/README.md)
* [Lab 3.2.2 - Configuración de LabInstanceProfile y CloudWatch Agent Wizard](./EA3/ACT3.2/LAB3.2.2/README.md)
* [Lab 3.2.4 - Validación de Ingesta de Logs (Syslog/SSH)](./EA3/ACT3.2/LAB3.2.4/README.md)
* [Lab 3.3.2 - Consultas de Logs Insights aplicadas a Seguridad](./EA3/ACT3.3/LAB3.3.2/README.md)
* [Lab 3.3.4 - Creación de Dashboard Unificado (Métricas + Logs)](./EA3/ACT3.3/LAB3.3.4/README.md)
* [Lab 3.4.2 - Configuración de Tópico SNS y Alarmas de CloudWatch](./EA3/ACT3.4/LAB3.4.2/README.md)
* [Lab 3.4.4 - CLI Put Metric Data y Stress Test de Alertas](./EA3/ACT3.4/LAB3.4.4/README.md)

### EA 4: FinOps y Análisis de Costos de Telemetría
* [Lab 4.1.2 - Inyección de Métricas Personalizadas vía NodeJS](./EA4/ACT4.1/LAB4.1.2/README.md)
* [Lab 4.1.4 - Gobernanza y Etiquetado en AWS (Tag Editor)](./EA4/ACT4.1/LAB4.1.4/README.md)
* [Lab 4.2.2 - Auditoría de Costos de CloudWatch con AWS Cost Explorer](./EA4/ACT4.2/LAB4.2.2/README.md)
* [Lab 4.2.4 - Proyección a Producción mediante AWS Pricing Calculator](./EA4/ACT4.2/LAB4.2.4/README.md)

---

## 🛠️ Prerrequisitos Técnicos
Para cursar estas actividades con éxito, es ideal contar con conocimientos fundamentales en:
- Navegación básica en terminales Linux (Bash).
- Conceptos básicos de redes (Puertos, Direcciones IP).
- Uso básico de control de versiones e infraestructura (Clonar repositorios, nociones de Docker).

> *"No se puede mejorar lo que no se puede medir."* - Cultura SRE