# 🔬 Guía de Laboratorio 4.1.4: Gobernanza y Etiquetado Retrospectivo (AWS Tag Editor)

## 🎯 Objetivo de la Actividad
En la nube, si un recurso no está etiquetado, no se puede auditar ni cobrar adecuadamente. El caos en la infraestructura es el enemigo de la cultura SRE y FinOps. En este laboratorio, los estudiantes aprenderán a utilizar la herramienta AWS Resource Groups & Tag Editor para cazar recursos "huérfanos" (instancias EC2, bases de datos o grupos de logs creados en laboratorios pasados) y aplicarles una estrategia de etiquetado en masa de forma retrospectiva.

## ⚠️ Restricciones del Entorno (Learner Lab)
Región: Utilicen us-east-1 (Norte de Virginia). Buscar recursos en todas las regiones ralentizará la búsqueda y podría mostrar errores de permisos.

Permisos: En Learner Labs, el entorno es compartido bajo el capó. Etiquetar recursos permite identificar qué instancia o servicio pertenece a cada estudiante, evitando que los scripts de limpieza automática del laboratorio eliminen recursos activos.

## 📝 Paso a Paso Guiado

### Paso 1: Acceso a la Herramienta de Auditoría (Tag Editor)

- Inicien sesión en la consola de AWS.

- En la barra de búsqueda superior, escriban Tag Editor y seleccionen el servicio llamado Resource Groups & Tag Editor.

- En el panel lateral izquierdo, bajo la sección de Tagging, hagan clic en Tag Editor.

### Paso 2: Búsqueda de Recursos Huérfanos
Nota SRE: Vamos a buscar instancias EC2 que hayan levantado anteriormente, o volúmenes de disco que hayan olvidado etiquetar.

- En el panel de búsqueda principal, bajo Regions, asegúrense de que esté seleccionado únicamente us-east-1.

- En el campo Resource types (Tipos de recursos), busquen y seleccionen AWS::EC2::Instance y opcionalmente AWS::Logs::LogGroup (para encontrar los grupos de CloudWatch de los laboratorios pasados).

- Dejen la sección de Tags vacía (esto le dice a AWS que traiga los recursos sin importar si tienen etiquetas o no).

- Hagan clic en el botón naranja Search resources (Buscar recursos) en la parte inferior.

### Paso 3: Aplicación de Etiquetado en Masa (Bulk Tagging)
- AWS desplegará una tabla en la parte inferior con todos los recursos encontrados.

- Revisen la lista. Verán instancias EC2 y/o Grupos de Logs.

- Marquen la casilla superior de la tabla para seleccionar todos los recursos listados (o seleccionen solo los que reconozcan como suyos).

- Hagan clic en el botón Manage tags of selected resources (Administrar etiquetas de recursos seleccionados).

- En la nueva pantalla, aplicaremos la taxonomía estándar de FinOps. Agreguen las siguientes etiquetas (espetando mayúsculas/minúsculas):

    - Tag key 1: Entorno | Tag value: Laboratorio-SRE

    - Tag key 2: Responsable | Tag value: [SuNombre_o_Matricula]

    - Tag key 3: CentroDeCostos | Tag value: AWS-Academy

- Hagan clic en el botón naranja Review and apply tag changes (Revisar y aplicar).

- Confirmen haciendo clic en Apply changes to all selected.

### Paso 4: Validación de la Gobernanza

- En la consola de búsqueda superior de AWS, diríjanse al servicio EC2.

- Hagan clic en Instances (running).

- Seleccionen cualquier instancia de su lista.

- En el panel inferior, vayan a la pestaña Tags (Etiquetas).

- Podrán verificar que las tres etiquetas (Entorno, Responsable y CentroDeCostos) han sido inyectadas exitosamente en la máquina virtual.

## 🏆 Conclusión Operativa y Reflexión SRE
La observabilidad no se limita a gráficas de rendimiento; abarca la observabilidad financiera y de inventario. Al finalizar esta actividad, los estudiantes comprenden que un "Tag" no es un campo de texto estético, sino un metadato crítico para la gobernanza Cloud. Utilizar Tag Editor permite a los equipos de plataforma corregir retrospectivamente la deuda técnica, garantizando que cada recurso aprovisionado tenga un dueño responsable, y permitiendo que AWS Cost Explorer pueda desglosar la facturación mensual por proyecto o departamento con precisión milimétrica.