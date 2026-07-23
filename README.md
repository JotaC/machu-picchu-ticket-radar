# Machu Picchu Ticket Radar

Bot de Telegram que monitorea la disponibilidad de entradas para Machu Picchu y envía una alerta cuando encuentra cupos que cumplen las condiciones seleccionadas.

**Machu Picchu Ticket Radar** is a Telegram bot that monitors Machu Picchu ticket availability and sends an alert when matching tickets are detected.

[Español](#español) | [English](#english)

---

# Español

## ¿Qué permite hacer?

Con el bot puedes:

- Buscar entradas para una fecha específica.
- Vigilar automáticamente las entradas para el día siguiente.
- Seleccionar una ruta o todas las rutas.
- Indicar cuántas entradas necesitas.
- Elegir una revisión cada 5 o 10 minutos.
- Consultar, pausar, activar o eliminar tus alertas.
- Recibir la ruta, el horario y la cantidad de cupos encontrados.

El bot permanece en silencio mientras no encuentre entradas.

## Cómo usarlo

### 1. Abre el bot en Telegram

Ingresa al bot y escribe:

```text
/start
```

El menú puede tardar hasta aproximadamente un minuto en responder.

### 2. Crea una alerta

Pulsa:

```text
➕ Crear alerta
```

El bot te pedirá seleccionar:

1. La fecha que deseas vigilar.
2. Una ruta o todas las rutas.
3. La cantidad mínima de entradas.
4. La frecuencia de revisión.

Al terminar recibirás la confirmación:

```text
✅ ALERTA CREADA
```

## Tipos de búsqueda

### Fecha específica

Busca entradas únicamente para la fecha seleccionada.

Cuando esa fecha pasa, la alerta deja de procesarse.

### Mañana automáticamente

Busca siempre entradas para el día siguiente.

Por ejemplo:

```text
22 de julio → busca para el 23 de julio
23 de julio → busca para el 24 de julio
24 de julio → busca para el 25 de julio
```

Esta alerta permanece activa hasta que la pauses o elimines.

## Consultar tus alertas

Desde el menú principal pulsa:

```text
📋 Ver mis alertas
```

Cada alerta muestra:

- Estado.
- Fecha.
- Rutas.
- Cantidad mínima.
- Frecuencia de revisión.

También podrás:

```text
⏸️ Pausar
▶️ Activar
🗑️ Eliminar
```

## Comandos disponibles

| Comando | Función |
|---|---|
| `/start` | Abre el menú principal. |
| `/menu` | Muestra nuevamente el menú. |
| `/nueva` | Inicia una nueva alerta. |
| `/alertas` | Muestra las alertas guardadas. |
| `/estado` | Consulta el estado del bot. |
| `/cancelar` | Cancela una configuración en curso. |

## ¿Cuándo recibirás un mensaje?

En las revisiones automáticas, el bot solo te avisará cuando encuentre disponibilidad nueva que cumpla la cantidad mínima solicitada.

Mientras no encuentre entradas, permanecerá en silencio.

También puede enviarte una advertencia cuando ocurra un problema técnico importante.

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

Compra inmediatamente en:
https://tuboleto.cultura.pe/llaqta_machupicchu
```

## Consideraciones importantes

- El bot no reserva entradas.
- El bot no realiza la compra.
- La disponibilidad puede cambiar rápidamente.
- Recibir una alerta no garantiza que los cupos sigan disponibles.
- La compra debe completarse directamente en el portal oficial.
- La respuesta a comandos y botones puede tardar hasta aproximadamente un minuto.

## Portal oficial

```text
https://tuboleto.cultura.pe/llaqta_machupicchu
```

## Aviso

Este proyecto no está afiliado, patrocinado ni administrado por el Ministerio de Cultura del Perú ni por el portal Tu Boleto.

---

# English

## What can the bot do?

The bot allows users to:

- Search for tickets on a specific date.
- Automatically monitor tickets for the following day.
- Select one route or all available routes.
- Set the minimum number of required tickets.
- Check every 5 or 10 minutes.
- View, pause, activate, or delete alerts.
- Receive the route, time, and available ticket quantity.

The bot remains silent while no matching availability is found.

## How to use it

### 1. Open the Telegram bot

Open the bot and send:

```text
/start
```

The menu may take up to approximately one minute to respond.

### 2. Create an alert

Select:

```text
➕ Create alert
```

The bot will ask you to choose:

1. The date to monitor.
2. One route or all routes.
3. The minimum ticket quantity.
4. The checking frequency.

The bot will confirm when the alert has been created.

## Search types

### Specific date

The bot monitors only the selected date.

After the date has passed, the alert is no longer processed.

### Tomorrow automatically

The bot always monitors tickets for the following day.

Example:

```text
July 22 → monitors July 23
July 23 → monitors July 24
July 24 → monitors July 25
```

The alert remains active until it is paused or deleted.

## View your alerts

From the main menu, select:

```text
📋 View my alerts
```

Each alert displays:

- Status.
- Date.
- Routes.
- Minimum ticket quantity.
- Checking frequency.

Users can also:

```text
⏸️ Pause
▶️ Activate
🗑️ Delete
```

## Available commands

| Command | Purpose |
|---|---|
| `/start` | Opens the main menu. |
| `/menu` | Displays the main menu again. |
| `/nueva` | Starts a new alert. |
| `/alertas` | Displays saved alerts. |
| `/estado` | Displays the bot status. |
| `/cancelar` | Cancels the current configuration. |

## When will the bot send a message?

During automatic checks, the bot only sends a notification when it detects new availability that meets the minimum ticket quantity.

It remains silent while no matching tickets are found.

It may also send a warning if an important technical error occurs.

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

Purchase immediately at:
https://tuboleto.cultura.pe/llaqta_machupicchu
```

## Important information

- The bot does not reserve tickets.
- The bot does not complete purchases.
- Availability may change quickly.
- Receiving an alert does not guarantee that tickets will remain available.
- Purchases must be completed on the official website.
- Commands and menu buttons may take up to approximately one minute to respond.

## Official website

```text
https://tuboleto.cultura.pe/llaqta_machupicchu
```

## Disclaimer

This project is not affiliated with, sponsored by, or operated by Peru's Ministry of Culture or the Tu Boleto website.

---

## Instalación técnica / Technical installation

Para instalar una copia propia del sistema, consulta:

To install your own copy of the system, see:

```text
INSTALLATION.md
```
