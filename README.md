# Machu Picchu Ticket Radar

Bot de Telegram que monitorea automáticamente la disponibilidad de entradas para Machu Picchu y envía una alerta cuando encuentra cupos que cumplen las condiciones seleccionadas.

**Machu Picchu Ticket Radar** is a Telegram bot that automatically monitors Machu Picchu ticket availability and sends an alert when matching tickets are detected.

[Español](#español) | [English](#english)

---

# Español

## ¿Qué es Machu Picchu Ticket Radar?

Machu Picchu Ticket Radar es una herramienta independiente que permite crear alertas para monitorear la disponibilidad de entradas para Machu Picchu.

El bot revisa periódicamente la disponibilidad visible en la plataforma consultada y envía una notificación por Telegram cuando encuentra entradas que cumplen las condiciones configuradas por el usuario.

El sistema tiene una finalidad exclusivamente informativa. No reserva, vende ni compra entradas.

## ¿Qué permite hacer?

Con el bot puedes:

- Buscar entradas para una fecha específica.
- Vigilar automáticamente las entradas para el día siguiente.
- Seleccionar una ruta específica o todas las rutas.
- Indicar la cantidad mínima de entradas necesarias.
- Elegir una frecuencia de revisión de 5 o 10 minutos.
- Consultar tus alertas guardadas.
- Pausar o volver a activar una alerta.
- Eliminar las alertas que ya no necesites.
- Recibir información sobre la ruta, el horario y la cantidad de cupos encontrados.

El bot permanece en silencio mientras no encuentre disponibilidad que cumpla las condiciones seleccionadas.

## Cómo usar el bot

### 1. Abre el bot en Telegram

Ingresa al bot y escribe:

```text
/start
```

El bot mostrará el menú principal.

Debido al sistema de consulta automática, la respuesta puede tardar hasta aproximadamente un minuto.

### 2. Crea una alerta

Pulsa:

```text
➕ Crear alerta
```

El bot te pedirá seleccionar:

1. La fecha que deseas vigilar.
2. Una ruta específica o todas las rutas.
3. La cantidad mínima de entradas que necesitas.
4. La frecuencia de revisión.

Cuando completes todos los pasos, recibirás una confirmación similar a:

```text
✅ ALERTA CREADA
```

## Tipos de alerta

### Fecha específica

Esta opción permite monitorear entradas únicamente para la fecha seleccionada.

Por ejemplo:

```text
Fecha seleccionada: 15/08/2026
```

La alerta buscará disponibilidad solamente para ese día.

Cuando la fecha queda en el pasado, el sistema deja de procesar la alerta.

### Mañana automáticamente

Esta opción permite buscar siempre entradas para el día siguiente, tomando como referencia la fecha y hora de Perú.

Por ejemplo:

```text
22 de julio → busca entradas para el 23 de julio
23 de julio → busca entradas para el 24 de julio
24 de julio → busca entradas para el 25 de julio
```

La fecha se actualiza automáticamente cada día.

La alerta permanece activa hasta que el usuario la pause o la elimine.

## Selección de rutas

Puedes configurar la alerta para buscar:

```text
Una ruta específica
```

o:

```text
Todas las rutas
```

Cuando eliges todas las rutas, el bot revisa las opciones disponibles para la fecha seleccionada y te informa en cuáles encontró cupos suficientes.

## Cantidad mínima de entradas

El bot permite indicar cuántas entradas necesitas.

Por ejemplo, si seleccionas:

```text
Cantidad mínima: 4
```

solo recibirás una alerta cuando el sistema encuentre al menos cuatro entradas disponibles en una misma opción de ruta y horario.

## Frecuencia de revisión

Puedes configurar la alerta para que se revise aproximadamente:

```text
Cada 5 minutos
```

o:

```text
Cada 10 minutos
```

Las ejecuciones automáticas pueden presentar pequeños retrasos debido al funcionamiento de los servicios utilizados por el sistema.

## Consultar tus alertas

Desde el menú principal pulsa:

```text
📋 Ver mis alertas
```

Cada alerta puede mostrar:

- Estado de la alerta.
- Tipo de fecha.
- Fecha monitoreada.
- Ruta o rutas seleccionadas.
- Cantidad mínima de entradas.
- Frecuencia de revisión.

Desde esta sección también puedes:

```text
⏸️ Pausar
▶️ Activar
🗑️ Eliminar
```

### Pausar una alerta

Una alerta pausada permanece guardada, pero deja de revisar la disponibilidad.

Puedes volver a activarla posteriormente.

### Eliminar una alerta

Una alerta eliminada deja de procesarse y se retira de tu lista de alertas.

## Consultar el estado del bot

Pulsa:

```text
ℹ️ Estado
```

El bot mostrará información general, como la cantidad de alertas guardadas y cuántas se encuentran activas.

## Comandos disponibles

| Comando | Función |
|---|---|
| `/start` | Abre el menú principal. |
| `/menu` | Muestra nuevamente el menú principal. |
| `/nueva` | Inicia la creación de una nueva alerta. |
| `/alertas` | Muestra las alertas guardadas. |
| `/estado` | Consulta el estado general del bot. |
| `/cancelar` | Cancela la configuración que se encuentra en curso. |

## ¿Cuándo recibirás una notificación?

Durante las revisiones automáticas, el bot solo envía un mensaje cuando encuentra nueva disponibilidad que cumple la cantidad mínima solicitada.

Mientras no encuentre entradas, permanece en silencio.

El sistema puede enviar una nueva notificación cuando:

- Aparecen cupos que no habían sido detectados anteriormente.
- Cambia la cantidad disponible.
- Aparece un nuevo horario que cumple la condición configurada.
- Se encuentra disponibilidad en una ruta distinta.

También puede enviar una advertencia si ocurre un problema técnico importante que impida realizar correctamente la consulta.

## Ejemplo de alerta

```text
🚨 ENTRADAS DISPONIBLES — MACHU PICCHU

Fecha: 23/07/2026
Cantidad mínima: 4

Ruta 2-A — Clásico Diseñada
• 08:00 — 6 cupos
• 09:00 — 4 cupos

Ruta 2-B — Terraza inferior
• 10:00 — 8 cupos

Compra directamente en el portal oficial:
https://tuboleto.cultura.pe/llaqta_machupicchu
```

## Qué hacer cuando recibas una alerta

Cuando recibas una notificación:

1. Abre inmediatamente el enlace incluido en el mensaje.
2. Verifica la disponibilidad directamente en el portal oficial.
3. Selecciona la fecha, ruta y horario correspondientes.
4. Completa la compra siguiendo las indicaciones de la plataforma oficial.

La disponibilidad puede cambiar rápidamente. Recibir una alerta no significa que las entradas estén reservadas.

## Portal oficial

La consulta final y cualquier compra deben realizarse directamente en el portal oficial correspondiente:

```text
https://tuboleto.cultura.pe/llaqta_machupicchu
```

## Consideraciones importantes

- El bot no reserva entradas.
- El bot no separa ni bloquea cupos.
- El bot no realiza compras.
- El bot no recibe pagos.
- El bot no solicita datos bancarios ni información de tarjetas.
- La disponibilidad puede cambiar rápidamente.
- Recibir una alerta no garantiza que las entradas continúen disponibles.
- La información debe verificarse directamente en el portal oficial.
- La respuesta a comandos y botones puede tardar hasta aproximadamente un minuto.
- El funcionamiento puede verse afectado por cambios, interrupciones o medidas de seguridad de la plataforma consultada.

## Aviso legal

Machu Picchu Ticket Radar es una herramienta independiente y de carácter informativo.

Este proyecto:

- No está afiliado, asociado, patrocinado, autorizado ni administrado por el Ministerio de Cultura del Perú, la plataforma Tu Boleto, ninguna entidad pública vinculada con Machu Picchu ni ningún operador turístico.
- No representa a ninguna entidad pública o privada relacionada con Machu Picchu o con la comercialización de sus entradas.
- No vende, revende, reserva, separa, bloquea, transfiere ni intermedia en la compraventa de boletos.
- No participa en la fijación de precios ni en la asignación de rutas, horarios o cupos.
- No recibe pagos, comisiones ni beneficios económicos derivados de la compra de entradas.
- No solicita información bancaria, números de tarjetas, contraseñas ni datos de pago.
- No garantiza la disponibilidad, el precio, la ruta, el horario ni la adquisición exitosa de una entrada.
- No modifica, interviene ni forma parte del proceso oficial de venta.

El bot únicamente consulta información visible y envía notificaciones informativas. Toda reserva, pago o compra debe ser realizada directamente por el usuario mediante los canales oficiales habilitados.

La disponibilidad puede cambiar entre el momento en que se genera una alerta y el momento en que el usuario accede al portal oficial. El creador y los colaboradores del proyecto no se responsabilizan por entradas agotadas, cambios de precio, modificaciones de rutas u horarios, errores de información, fallas de conexión, interrupciones del servicio, compras no completadas ni decisiones tomadas a partir de las notificaciones.

El uso del bot no crea una relación comercial, contractual, de representación, agencia o intermediación entre el usuario y el creador del proyecto.

Las denominaciones “Machu Picchu”, “Machupicchu” y “Tu Boleto”, así como los nombres institucionales, logotipos y marcas mencionados, pertenecen a sus respectivos titulares. Su utilización en este proyecto tiene únicamente una finalidad descriptiva e informativa.

## Privacidad

El bot puede almacenar únicamente la información necesaria para administrar las alertas, como:

- Identificador del chat de Telegram.
- Fecha seleccionada.
- Ruta o rutas seleccionadas.
- Cantidad mínima solicitada.
- Frecuencia de revisión.
- Estado de la alerta.

El bot no necesita solicitar:

- Nombre completo.
- Documento de identidad.
- Número de pasaporte.
- Datos bancarios.
- Información de tarjetas.
- Contraseñas.
- Información de pago.

No envíes información personal, financiera o confidencial mediante el bot.

## Uso responsable

El usuario es responsable de:

- Verificar la información en la plataforma oficial.
- Cumplir las condiciones de uso del portal consultado.
- Utilizar el bot únicamente con fines personales y legítimos.
- No emplear el sistema para reventa, acaparamiento o actividades contrarias a la normativa aplicable.
- No intentar alterar, saturar o perjudicar los servicios consultados.

## Disponibilidad del servicio

Machu Picchu Ticket Radar se proporciona sin garantía de funcionamiento permanente.

El servicio puede dejar de funcionar temporal o definitivamente debido a:

- Cambios en el portal consultado.
- Modificaciones en la estructura de la página.
- Interrupciones de Google Apps Script.
- Interrupciones de GitHub Actions.
- Problemas de Telegram.
- Límites de uso de los servicios externos.
- Medidas de seguridad o restricciones técnicas.
- Mantenimiento del proyecto.

El creador del proyecto puede modificar, suspender o retirar el servicio en cualquier momento.

## Instalación técnica

Para instalar y configurar una copia propia del sistema, consulta:

[INSTALLATION.md](INSTALLATION.md)

---

# English

## What is Machu Picchu Ticket Radar?

Machu Picchu Ticket Radar is an independent tool that allows users to create alerts for Machu Picchu ticket availability.

The bot periodically checks visible availability on the monitored platform and sends a Telegram notification when it finds tickets that match the conditions configured by the user.

The system is provided for informational purposes only. It does not reserve, sell, or purchase tickets.

## What can the bot do?

The bot allows users to:

- Search for tickets on a specific date.
- Automatically monitor tickets for the following day.
- Select one specific route or all available routes.
- Set the minimum number of tickets required.
- Choose a checking frequency of 5 or 10 minutes.
- View saved alerts.
- Pause or reactivate an alert.
- Delete alerts that are no longer needed.
- Receive information about the route, schedule, and available ticket quantity.

The bot remains silent while no matching availability is found.

## How to use the bot

### 1. Open the bot in Telegram

Open the bot and send:

```text
/start
```

The bot will display the main menu.

Because messages are processed through an automated checking system, responses may take up to approximately one minute.

### 2. Create an alert

Select:

```text
➕ Create alert
```

The bot will ask you to choose:

1. The date to monitor.
2. One specific route or all routes.
3. The minimum number of tickets required.
4. The checking frequency.

After completing the process, the bot will send a confirmation similar to:

```text
✅ ALERT CREATED
```

## Alert types

### Specific date

This option monitors tickets only for the selected date.

Example:

```text
Selected date: 15/08/2026
```

The alert will search for availability only on that date.

After the date has passed, the system stops processing the alert.

### Tomorrow automatically

This option always monitors tickets for the following day, based on Peru's date and time.

Example:

```text
July 22 → searches for July 23
July 23 → searches for July 24
July 24 → searches for July 25
```

The date is updated automatically every day.

The alert remains active until the user pauses or deletes it.

## Route selection

Alerts can be configured to search:

```text
One specific route
```

or:

```text
All routes
```

When all routes are selected, the bot checks the available options for the selected date and reports which routes have enough tickets.

## Minimum ticket quantity

The bot allows users to specify how many tickets they need.

For example, when the following condition is selected:

```text
Minimum quantity: 4
```

the bot only sends an alert when it finds at least four available tickets for the same route and time.

## Checking frequency

Alerts can be configured to run approximately:

```text
Every 5 minutes
```

or:

```text
Every 10 minutes
```

Scheduled checks may occasionally be delayed because of the external services used by the system.

## View your alerts

From the main menu, select:

```text
📋 View my alerts
```

Each alert may display:

- Alert status.
- Date type.
- Monitored date.
- Selected route or routes.
- Minimum ticket quantity.
- Checking frequency.

Users can also:

```text
⏸️ Pause
▶️ Activate
🗑️ Delete
```

### Pause an alert

A paused alert remains saved but stops checking availability.

It can be activated again later.

### Delete an alert

A deleted alert is no longer processed and is removed from the user's alert list.

## Check the bot status

Select:

```text
ℹ️ Status
```

The bot will display general information, including the number of saved alerts and the number of active alerts.

## Available commands

| Command | Purpose |
|---|---|
| `/start` | Opens the main menu. |
| `/menu` | Displays the main menu again. |
| `/nueva` | Starts the creation of a new alert. |
| `/alertas` | Displays saved alerts. |
| `/estado` | Displays the general bot status. |
| `/cancelar` | Cancels the configuration currently in progress. |

## When will the bot send a notification?

During automatic checks, the bot only sends a message when it detects new availability that meets the configured minimum quantity.

The bot remains silent when no matching tickets are found.

A new notification may be sent when:

- Tickets appear that had not been detected before.
- The available quantity changes.
- A new time slot meets the configured condition.
- Availability appears on a different route.

The bot may also send a warning when an important technical problem prevents the availability check from being completed.

## Notification example

```text
🚨 MACHU PICCHU TICKETS AVAILABLE

Date: 23/07/2026
Minimum quantity: 4

Route 2-A — Classic Designed
• 08:00 — 6 tickets
• 09:00 — 4 tickets

Route 2-B — Lower Terrace
• 10:00 — 8 tickets

Purchase directly from the official website:
https://tuboleto.cultura.pe/llaqta_machupicchu
```

## What to do after receiving an alert

When you receive a notification:

1. Open the link included in the message immediately.
2. Verify availability directly on the official website.
3. Select the corresponding date, route, and time.
4. Complete the purchase by following the official platform's instructions.

Availability may change quickly. Receiving an alert does not mean that the tickets have been reserved.

## Official website

Final availability checks and all purchases must be completed directly through the corresponding official website:

```text
https://tuboleto.cultura.pe/llaqta_machupicchu
```

## Important information

- The bot does not reserve tickets.
- The bot does not hold or block availability.
- The bot does not purchase tickets.
- The bot does not receive payments.
- The bot does not request banking or payment card information.
- Availability may change quickly.
- Receiving an alert does not guarantee that tickets will remain available.
- Information must be verified directly on the official website.
- Commands and menu buttons may take up to approximately one minute to respond.
- The bot may be affected by changes, interruptions, or security measures implemented by the monitored platform.

## Legal disclaimer

Machu Picchu Ticket Radar is an independent informational tool.

This project:

- Is not affiliated with, associated with, sponsored by, authorized by, or operated by Peru's Ministry of Culture, the Tu Boleto platform, any public authority connected with Machu Picchu, or any tour operator.
- Does not represent any public or private organization related to Machu Picchu or the sale of its tickets.
- Does not sell, resell, reserve, hold, block, transfer, or broker tickets.
- Does not participate in setting prices or assigning routes, schedules, or ticket availability.
- Does not receive payments, commissions, or financial benefits from ticket purchases.
- Does not request banking information, payment card numbers, passwords, or payment details.
- Does not guarantee availability, prices, routes, schedules, or successful ticket purchases.
- Does not modify, participate in, or form part of the official ticket sales process.

The bot only checks visible information and sends informational notifications. All reservations, payments, and purchases must be completed directly by the user through the authorized official channels.

Availability may change between the time an alert is generated and the time the user accesses the official website. The project creator and contributors are not responsible for sold-out tickets, price changes, route or schedule modifications, inaccurate information, connectivity failures, service interruptions, unsuccessful purchases, or decisions made based on the notifications.

Use of the bot does not create a commercial, contractual, agency, representation, or brokerage relationship between the user and the project creator.

The names “Machu Picchu,” “Machupicchu,” and “Tu Boleto,” as well as any institutional names, logos, and trademarks mentioned, belong to their respective owners. Their use in this project is solely descriptive and informational.

## Privacy

The bot may store only the information needed to manage alerts, such as:

- Telegram chat identifier.
- Selected date.
- Selected route or routes.
- Minimum requested quantity.
- Checking frequency.
- Alert status.

The bot does not need to request:

- Full name.
- Identity document.
- Passport number.
- Banking details.
- Payment card information.
- Passwords.
- Payment information.

Do not send personal, financial, or confidential information through the bot.

## Responsible use

Users are responsible for:

- Verifying information on the official platform.
- Complying with the terms of use of the monitored website.
- Using the bot only for personal and legitimate purposes.
- Not using the system for resale, stockpiling, or activities that violate applicable rules.
- Not attempting to alter, overload, or damage the monitored services.

## Service availability

Machu Picchu Ticket Radar is provided without any guarantee of permanent operation.

The service may stop working temporarily or permanently because of:

- Changes to the monitored website.
- Modifications to the website structure.
- Google Apps Script interruptions.
- GitHub Actions interruptions.
- Telegram service problems.
- Usage limits imposed by external services.
- Security measures or technical restrictions.
- Project maintenance.

The project creator may modify, suspend, or discontinue the service at any time.

## Technical installation

To install and configure your own copy of the system, see:

[INSTALLATION.md](INSTALLATION.md)

---

## Licencia / License

Este proyecto se distribuye conforme a la licencia incluida en el archivo:

This project is distributed under the license included in:

[LICENSE](LICENSE)
