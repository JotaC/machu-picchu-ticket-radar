# Alerta Machu Picchu / Machu Picchu Ticket Alert

Bot de Telegram para monitorear automáticamente la disponibilidad de entradas a Machu Picchu mediante Google Apps Script, Google Sheets, GitHub Actions y Playwright.

Telegram bot that automatically monitors Machu Picchu ticket availability using Google Apps Script, Google Sheets, GitHub Actions, and Playwright.

[Español](#español) | [English](#english)

---

# Español

## Descripción

**Alerta Machu Picchu** es un sistema automático que consulta periódicamente el portal oficial de venta de entradas a Machu Picchu y envía una notificación por Telegram cuando detecta disponibilidad que cumple las condiciones configuradas por el usuario.

El sistema permite crear y administrar alertas desde Telegram sin necesidad de modificar manualmente el código del repositorio.

> Este proyecto no está afiliado al Ministerio de Cultura del Perú ni al portal Tu Boleto.

## Funciones principales

El bot permite:

- Vigilar una fecha específica.
- Vigilar automáticamente las entradas correspondientes al día siguiente.
- Seleccionar una ruta determinada.
- Revisar todas las rutas disponibles.
- Definir la cantidad mínima de entradas necesarias.
- Elegir una frecuencia de revisión de 5 o 10 minutos.
- Crear varias alertas simultáneamente.
- Pausar, activar o eliminar alertas desde Telegram.
- Evitar notificaciones repetidas por la misma disponibilidad.
- Recibir el horario, la ruta y la cantidad de cupos detectados.
- Acceder directamente al portal oficial para realizar la compra.

Las ejecuciones automáticas permanecen en silencio mientras no se encuentre disponibilidad.

## Arquitectura

```text
Usuario
   │
   ▼
Telegram Bot
   │
   ▼
Google Apps Script
   │
   ▼
Google Sheets
   │
   ▼
GitHub Actions
   │
   ▼
Playwright
   │
   ▼
Portal oficial Tu Boleto
```

### Telegram

Se utiliza como interfaz para crear, consultar, pausar, activar y eliminar alertas.

### Google Apps Script

Procesa los mensajes de Telegram, administra la configuración del bot y publica una API privada para GitHub.

### Google Sheets

Almacena las alertas creadas por los usuarios.

### GitHub Actions

Ejecuta periódicamente el monitor sin necesidad de mantener una computadora encendida.

### Playwright

Abre el portal de entradas, selecciona las rutas y fechas configuradas y consulta los horarios disponibles.

## Ejemplo de notificación

```text
🚨 ENTRADAS DISPONIBLES — MACHU PICCHU

Alerta: A20260722161210FAC735
Fecha: 23/07/2026
Cantidad mínima: 4
Frecuencia: cada 10 minutos

Ruta 2-A — Clásico Diseñada
• 08:00 — 6 cupos
• 09:00 — 4 cupos

Ruta 2-B — Terraza inferior
• 10:00 — 8 cupos

Compra inmediatamente en:
https://tuboleto.cultura.pe/llaqta_machupicchu
```

## Requisitos

Para instalar el proyecto se necesita:

- Una cuenta de GitHub.
- Una cuenta de Google.
- Una cuenta de Telegram.
- Un bot creado mediante BotFather.
- Una hoja de cálculo de Google Sheets.
- Un proyecto de Google Apps Script.
- Un repositorio de GitHub con Actions habilitado.

No es necesario mantener una computadora encendida.

## Estructura recomendada del repositorio

```text
monitor-machu-picchu/
├── .github/
│   └── workflows/
│       └── monitor.yml
├── apps-script/
│   └── Codigo.gs
├── monitor.js
├── package.json
├── state.json
├── README.md
└── LICENSE
```

### `monitor.js`

Consulta la API de alertas, abre el portal oficial mediante Playwright y envía las notificaciones a Telegram.

### `.github/workflows/monitor.yml`

Define la ejecución automática del monitor mediante GitHub Actions.

### `package.json`

Contiene las dependencias y los comandos de Node.js.

### `state.json`

Guarda el último estado conocido para evitar mensajes repetidos.

### `apps-script/Codigo.gs`

Contiene el código del bot de Telegram, la integración con Google Sheets y la API utilizada por GitHub.

---

# Instalación en español

## 1. Crear un bot de Telegram

Abre Telegram y busca:

```text
@BotFather
```

Envía el comando:

```text
/newbot
```

BotFather solicitará:

1. Un nombre para el bot.
2. Un nombre de usuario que termine en `bot`.

Al finalizar entregará un token parecido a:

```text
123456789:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Guarda este token de forma privada.

No lo publiques en el repositorio.

## 2. Obtener el Chat ID

Abre el bot recién creado y envíale cualquier mensaje, por ejemplo:

```text
Hola
```

Después consulta desde el navegador:

```text
https://api.telegram.org/botTU_BOT_TOKEN/getUpdates
```

Reemplaza `TU_BOT_TOKEN` por el token entregado por BotFather.

En la respuesta aparecerá una estructura parecida a:

```json
{
  "message": {
    "chat": {
      "id": 123456789
    }
  }
}
```

El número que aparece en `id` es el `CHAT_ID`.

## 3. Crear Google Sheets

Crea una nueva hoja de cálculo en Google Sheets.

Cambia el nombre de la pestaña inferior a:

```text
ALERTAS
```

En la primera fila coloca estos encabezados:

| ALERTA_ID | ACTIVA | MODO_FECHA | FECHA_ISO | RUTAS | CANTIDAD_MIN | FRECUENCIA_MIN | CHAT_ID | CREADA_EN | ACTUALIZADA_EN |
|---|---|---|---|---|---:|---:|---|---|---|

También pueden copiarse en una sola fila:

```text
ALERTA_ID	ACTIVA	MODO_FECHA	FECHA_ISO	RUTAS	CANTIDAD_MIN	FRECUENCIA_MIN	CHAT_ID	CREADA_EN	ACTUALIZADA_EN
```

El identificador de la hoja se encuentra dentro de su dirección:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

Copia solamente el valor que aparece entre `/d/` y `/edit`.

## 4. Crear el proyecto de Google Apps Script

Desde Google Sheets abre:

```text
Extensiones → Apps Script
```

Reemplaza el contenido del archivo `Código.gs` con el código incluido en:

```text
apps-script/Codigo.gs
```

Guarda el proyecto.

## 5. Configurar las propiedades del script

En Google Apps Script abre:

```text
Configuración del proyecto → Propiedades del script
```

Agrega estas propiedades:

| Propiedad | Valor |
|---|---|
| `BOT_TOKEN` | Token entregado por BotFather |
| `CHAT_ID` | Identificador del chat de Telegram |
| `SPREADSHEET_ID` | Identificador de Google Sheets |

Los nombres deben escribirse exactamente como aparecen en la tabla.

## 6. Configurar la hoja de alertas

En el selector de funciones de Apps Script elige:

```text
configurarHojaAlertas
```

Pulsa:

```text
Ejecutar
```

Google solicitará autorización para acceder a la hoja de cálculo y realizar conexiones externas.

Después de autorizar, la hoja `ALERTAS` quedará configurada.

## 7. Crear la clave privada de la API

En Apps Script ejecuta:

```text
crearClaveApi
```

En el registro aparecerá un mensaje parecido a:

```text
MONITOR_API_KEY creada: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Copia únicamente la clave.

Esta clave también queda guardada dentro de las propiedades del script.

No la publiques.

## 8. Publicar Apps Script como aplicación web

En Apps Script abre:

```text
Implementar → Nueva implementación
```

Selecciona:

```text
Aplicación web
```

Configura:

```text
Ejecutar como: Yo
Quién tiene acceso: Cualquier usuario
```

Pulsa:

```text
Implementar
```

Copia la URL de la aplicación web.

Debe terminar en:

```text
/exec
```

Ejemplo:

```text
https://script.google.com/macros/s/XXXXXXXXXXXX/exec
```

No utilices una dirección terminada en `/dev`.

## 9. Activar la recepción de mensajes de Telegram

Este proyecto utiliza una consulta periódica mediante Google Apps Script.

En el selector de funciones ejecuta:

```text
crearTriggerTelegram
```

Esta función:

- elimina cualquier webhook anterior;
- crea un activador para revisar Telegram aproximadamente una vez por minuto;
- habilita la recepción automática de comandos y botones.

En Telegram debería llegar:

```text
✅ RECEPCIÓN AUTOMÁTICA ACTIVADA

El bot revisará Telegram automáticamente cada minuto.
```

Los comandos pueden tardar hasta aproximadamente un minuto en responder.

No ejecutes `crearWebhookTelegram` mientras utilices este método.

## 10. Crear el repositorio en GitHub

Crea un repositorio nuevo o utiliza una bifurcación de este proyecto.

El repositorio debe contener, como mínimo:

```text
monitor.js
package.json
state.json
.github/workflows/monitor.yml
```

También se recomienda incluir:

```text
apps-script/Codigo.gs
README.md
LICENSE
```

Antes de subir `Codigo.gs`, comprueba que no contenga directamente:

```text
BOT_TOKEN
CHAT_ID
SPREADSHEET_ID
MONITOR_API_KEY
```

Estos datos deben almacenarse en propiedades o secretos privados.

## 11. Configurar los secretos de GitHub

Dentro del repositorio abre:

```text
Settings
→ Secrets and variables
→ Actions
→ New repository secret
```

Crea los siguientes secretos:

| Nombre | Valor |
|---|---|
| `BOT_TOKEN` | Token del bot de Telegram |
| `CHAT_ID` | Identificador del chat |
| `ALERTS_API_URL` | URL de Apps Script terminada en `/exec` |
| `MONITOR_API_KEY` | Clave generada mediante `crearClaveApi` |

Los nombres deben conservar exactamente las mayúsculas y los guiones bajos indicados.

## 12. Probar la API

Abre en el navegador:

```text
ALERTS_API_URL?key=MONITOR_API_KEY
```

Ejemplo:

```text
https://script.google.com/macros/s/XXXXXXXX/exec?key=XXXXXXXX
```

La respuesta debe incluir:

```json
{
  "ok": true,
  "alerts": []
}
```

Cuando ya existan alertas activas, aparecerán dentro de la lista `alerts`.

No publiques ni compartas la dirección completa con la clave incluida.

## 13. Probar GitHub Actions

En el repositorio abre:

```text
Actions
→ Monitor Machu Picchu
→ Run workflow
```

Selecciona la rama:

```text
main
```

Pulsa:

```text
Run workflow
```

La ejecución manual envía un resumen por Telegram, aunque no se encuentren entradas.

La ejecución debe finalizar con una marca verde.

## 14. Crear una alerta

Abre el bot en Telegram y escribe:

```text
/start
```

Después selecciona:

1. Crear alerta.
2. Mañana automáticamente o una fecha específica.
3. Una ruta o todas las rutas.
4. Cantidad mínima de entradas.
5. Frecuencia de 5 o 10 minutos.

La alerta quedará guardada en Google Sheets y estará disponible para GitHub Actions.

---

## Comandos de Telegram

```text
/start
/menu
/nueva
/alertas
/estado
/cancelar
```

### `/start`

Abre el menú principal.

### `/menu`

Vuelve a mostrar el menú principal.

### `/nueva`

Inicia la creación de una alerta.

### `/alertas`

Muestra las alertas guardadas.

### `/estado`

Muestra el estado del bot y el número de alertas activas.

### `/cancelar`

Cancela una configuración que se encuentre en proceso.

---

## Funcionamiento de las fechas

### Fecha específica

La alerta vigila únicamente la fecha seleccionada.

Cuando la fecha queda en el pasado, el sistema deja de procesarla.

### Mañana automáticamente

La fecha se recalcula cada día utilizando la zona horaria:

```text
America/Lima
```

Ejemplo:

```text
22 de julio → revisa el 23 de julio
23 de julio → revisa el 24 de julio
24 de julio → revisa el 25 de julio
```

La alerta continúa activa hasta que el usuario la pause o elimine.

## Frecuencia de revisión

GitHub Actions ejecuta periódicamente el flujo.

El código determina qué alertas deben procesarse según la frecuencia elegida:

```text
Cada 5 minutos
Cada 10 minutos
```

Las ejecuciones programadas pueden comenzar algunos minutos después de la hora prevista.

## Tipos de notificación

### Ejecución automática

Solo envía un aviso cuando detecta disponibilidad nueva que cumple la cantidad mínima configurada.

### Ejecución manual

Envía siempre un resumen, incluso cuando no encuentra entradas.

### Error técnico

Puede enviar una advertencia cuando:

- no se puede consultar la API;
- ninguna ruta puede procesarse;
- el portal cambia su estructura;
- Telegram rechaza un mensaje.

## Seguridad

Nunca publiques:

```text
BOT_TOKEN
CHAT_ID
MONITOR_API_KEY
TELEGRAM_WEBHOOK_KEY
SPREADSHEET_ID
```

Utiliza:

- Propiedades del script en Apps Script.
- Secrets de GitHub Actions.
- Variables de entorno.

Si un token de Telegram se publica accidentalmente, revócalo desde BotFather y genera uno nuevo.

## Solución de problemas

### El bot no responde

Ejecuta nuevamente en Apps Script:

```text
crearTriggerTelegram
```

Después ejecuta:

```text
verificarTriggers
```

Debe aparecer un activador asociado a:

```text
procesarTelegram
```

### El bot tarda en responder

El modo de recepción mediante activador revisa Telegram aproximadamente una vez por minuto.

Una respuesta puede tardar varios segundos o hasta cerca de un minuto.

### GitHub no encuentra alertas

Comprueba que estos secretos existan:

```text
BOT_TOKEN
CHAT_ID
ALERTS_API_URL
MONITOR_API_KEY
```

También verifica que la API responda con:

```json
{
  "ok": true
}
```

### GitHub Actions aparece en rojo

Abre la ejecución fallida y revisa especialmente el paso:

```text
Revisar alertas y disponibilidad
```

Los archivos de diagnóstico pueden encontrarse en la sección de artefactos de la ejecución.

### Se reciben avisos repetidos

Comprueba que `state.json` pueda actualizarse y que el flujo contenga:

```yaml
permissions:
  contents: write
```

### El bot dejó de responder después de activar un webhook

Ejecuta:

```text
crearTriggerTelegram
```

Esta función elimina el webhook y restaura la consulta periódica.

## Limitaciones

- El bot no reserva ni compra entradas.
- La disponibilidad puede cambiar antes de que el usuario complete la compra.
- El proyecto depende de la estructura actual del portal oficial.
- Los cambios en el portal pueden requerir actualizar los selectores de Playwright.
- GitHub Actions puede retrasar algunas ejecuciones.
- El menú de Telegram puede tardar hasta aproximadamente un minuto en responder.
- El usuario es responsable de respetar las condiciones del portal consultado.

## Aviso legal

Este software se proporciona con fines informativos y de automatización personal.

No garantiza:

- disponibilidad de entradas;
- reservas;
- compras exitosas;
- acceso a Machu Picchu.

La compra debe realizarse directamente en el portal oficial:

```text
https://tuboleto.cultura.pe/llaqta_machupicchu
```

Este proyecto no representa ni actúa en nombre del Ministerio de Cultura del Perú.

---

# English

## Description

**Machu Picchu Ticket Alert** is an automated system that periodically checks the official Machu Picchu ticket website and sends a Telegram notification when it detects availability matching the user's alert settings.

Users can create and manage alerts directly from Telegram without manually editing the repository configuration.

> This project is not affiliated with Peru's Ministry of Culture or the Tu Boleto website.

## Main features

The bot can:

- Monitor a specific date.
- Automatically monitor tickets for the following day.
- Monitor a specific route.
- Monitor all available routes.
- Set the minimum number of required tickets.
- Check every 5 or 10 minutes.
- Manage multiple alerts.
- Pause, activate, or delete alerts from Telegram.
- Prevent duplicate notifications for the same availability.
- Report the route, time, and available ticket count.
- Provide direct access to the official purchase website.

Automatic runs remain silent when no matching availability is found.

## Architecture

```text
User
  │
  ▼
Telegram Bot
  │
  ▼
Google Apps Script
  │
  ▼
Google Sheets
  │
  ▼
GitHub Actions
  │
  ▼
Playwright
  │
  ▼
Official Tu Boleto website
```

### Telegram

Provides the interface for creating, viewing, pausing, activating, and deleting alerts.

### Google Apps Script

Processes Telegram messages, manages the bot configuration, and publishes a private API for GitHub.

### Google Sheets

Stores the alerts created by users.

### GitHub Actions

Runs the monitor periodically without requiring a computer to remain turned on.

### Playwright

Opens the ticket website, selects the configured routes and dates, and checks available time slots.

## Notification example

```text
🚨 MACHU PICCHU TICKETS AVAILABLE

Alert: A20260722161210FAC735
Date: 23/07/2026
Minimum quantity: 4
Frequency: every 10 minutes

Route 2-A — Classic Designed
• 08:00 — 6 tickets
• 09:00 — 4 tickets

Route 2-B — Lower Terrace
• 10:00 — 8 tickets

Purchase immediately at:
https://tuboleto.cultura.pe/llaqta_machupicchu
```

## Requirements

The following services are required:

- A GitHub account.
- A Google account.
- A Telegram account.
- A Telegram bot created with BotFather.
- A Google Sheets spreadsheet.
- A Google Apps Script project.
- A GitHub repository with Actions enabled.

A computer does not need to remain turned on.

## Recommended repository structure

```text
monitor-machu-picchu/
├── .github/
│   └── workflows/
│       └── monitor.yml
├── apps-script/
│   └── Codigo.gs
├── monitor.js
├── package.json
├── state.json
├── README.md
└── LICENSE
```

### `monitor.js`

Reads active alerts, opens the official website with Playwright, and sends Telegram notifications.

### `.github/workflows/monitor.yml`

Defines the automatic GitHub Actions workflow.

### `package.json`

Contains Node.js dependencies and scripts.

### `state.json`

Stores the latest known availability state to prevent duplicate notifications.

### `apps-script/Codigo.gs`

Contains the Telegram bot, Google Sheets integration, and the API used by GitHub.

---

# Installation in English

## 1. Create a Telegram bot

Open Telegram and search for:

```text
@BotFather
```

Send:

```text
/newbot
```

BotFather will ask for:

1. A display name.
2. A username ending in `bot`.

BotFather will then provide a token similar to:

```text
123456789:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Store this token privately.

Never publish it in the repository.

## 2. Get the Chat ID

Open the newly created bot and send it a message, for example:

```text
Hello
```

Then open:

```text
https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
```

Replace `YOUR_BOT_TOKEN` with the token provided by BotFather.

The response will contain something similar to:

```json
{
  "message": {
    "chat": {
      "id": 123456789
    }
  }
}
```

The number in `id` is the `CHAT_ID`.

## 3. Create the Google Sheet

Create a new Google Sheets spreadsheet.

Rename the bottom tab to:

```text
ALERTAS
```

Add the following headers to the first row:

| ALERTA_ID | ACTIVA | MODO_FECHA | FECHA_ISO | RUTAS | CANTIDAD_MIN | FRECUENCIA_MIN | CHAT_ID | CREADA_EN | ACTUALIZADA_EN |
|---|---|---|---|---|---:|---:|---|---|---|

They can also be copied as a single tab-separated row:

```text
ALERTA_ID	ACTIVA	MODO_FECHA	FECHA_ISO	RUTAS	CANTIDAD_MIN	FRECUENCIA_MIN	CHAT_ID	CREADA_EN	ACTUALIZADA_EN
```

The spreadsheet ID is located in its address:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

Copy the value between `/d/` and `/edit`.

## 4. Create the Google Apps Script project

From Google Sheets, open:

```text
Extensions → Apps Script
```

Replace the contents of `Código.gs` with the code included in:

```text
apps-script/Codigo.gs
```

Save the project.

## 5. Configure script properties

In Google Apps Script, open:

```text
Project Settings → Script properties
```

Add:

| Property | Value |
|---|---|
| `BOT_TOKEN` | Token provided by BotFather |
| `CHAT_ID` | Telegram chat identifier |
| `SPREADSHEET_ID` | Google Sheets identifier |

Property names must be written exactly as shown.

## 6. Configure the alerts sheet

Select this function in Apps Script:

```text
configurarHojaAlertas
```

Click:

```text
Run
```

Google will request authorization to access the spreadsheet and external services.

After authorization, the `ALERTAS` sheet will be ready.

## 7. Create the private API key

Run:

```text
crearClaveApi
```

The execution log will display something similar to:

```text
MONITOR_API_KEY creada: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Copy the key.

It will also be stored in the Apps Script project properties.

Do not publish it.

## 8. Deploy Apps Script as a web application

In Apps Script, open:

```text
Deploy → New deployment
```

Select:

```text
Web app
```

Configure:

```text
Execute as: Me
Who has access: Anyone
```

Click:

```text
Deploy
```

Copy the web application URL.

It must end in:

```text
/exec
```

Example:

```text
https://script.google.com/macros/s/XXXXXXXXXXXX/exec
```

Do not use a URL ending in `/dev`.

## 9. Enable Telegram message reception

This project uses periodic polling through Google Apps Script.

Run:

```text
crearTriggerTelegram
```

This function:

- removes any existing webhook;
- creates a trigger that checks Telegram approximately once per minute;
- enables automatic processing of commands and buttons.

Telegram should receive:

```text
✅ RECEPCIÓN AUTOMÁTICA ACTIVADA

El bot revisará Telegram automáticamente cada minuto.
```

Commands may take up to approximately one minute to receive a response.

Do not run `crearWebhookTelegram` while using this method.

## 10. Create the GitHub repository

Create a new repository or fork this project.

The repository must contain:

```text
monitor.js
package.json
state.json
.github/workflows/monitor.yml
```

It is also recommended to include:

```text
apps-script/Codigo.gs
README.md
LICENSE
```

Before uploading `Codigo.gs`, confirm that it does not directly contain:

```text
BOT_TOKEN
CHAT_ID
SPREADSHEET_ID
MONITOR_API_KEY
```

These values must remain in private properties or secrets.

## 11. Configure GitHub secrets

Open:

```text
Settings
→ Secrets and variables
→ Actions
→ New repository secret
```

Create:

| Name | Value |
|---|---|
| `BOT_TOKEN` | Telegram bot token |
| `CHAT_ID` | Telegram chat identifier |
| `ALERTS_API_URL` | Apps Script URL ending in `/exec` |
| `MONITOR_API_KEY` | Key generated by `crearClaveApi` |

The secret names must match exactly.

## 12. Test the API

Open:

```text
ALERTS_API_URL?key=MONITOR_API_KEY
```

Example:

```text
https://script.google.com/macros/s/XXXXXXXX/exec?key=XXXXXXXX
```

The response should include:

```json
{
  "ok": true,
  "alerts": []
}
```

Active alerts will appear inside the `alerts` array.

Never publish or share the complete address containing the API key.

## 13. Test GitHub Actions

Open:

```text
Actions
→ Monitor Machu Picchu
→ Run workflow
```

Select:

```text
main
```

Click:

```text
Run workflow
```

A manual run sends a Telegram status report even when no tickets are available.

The workflow should finish with a green check mark.

## 14. Create an alert

Open the Telegram bot and send:

```text
/start
```

Then select:

1. Create alert.
2. Tomorrow automatically or a specific date.
3. A specific route or all routes.
4. Minimum number of tickets.
5. A 5- or 10-minute frequency.

The alert will be stored in Google Sheets and read by GitHub Actions.

---

## Telegram commands

```text
/start
/menu
/nueva
/alertas
/estado
/cancelar
```

### `/start`

Opens the main menu.

### `/menu`

Displays the main menu again.

### `/nueva`

Starts the alert creation process.

### `/alertas`

Displays saved alerts.

### `/estado`

Displays the bot status and the number of active alerts.

### `/cancelar`

Cancels the current configuration process.

## Date behavior

### Specific date

The alert monitors only the selected date.

After that date passes, the system stops processing the alert.

### Tomorrow automatically

The date is recalculated every day using:

```text
America/Lima
```

Example:

```text
July 22 → monitors July 23
July 23 → monitors July 24
July 24 → monitors July 25
```

The alert remains active until it is paused or deleted.

## Check frequency

GitHub Actions runs the workflow periodically.

The code decides which alerts are due according to their configured frequency:

```text
Every 5 minutes
Every 10 minutes
```

Scheduled runs may occasionally start later than expected.

## Notification types

### Automatic run

Sends a notification only when new availability matching the required ticket count is detected.

### Manual run

Always sends a summary, even when no tickets are found.

### Technical error

The system may send a warning when:

- the alerts API cannot be read;
- no route can be processed;
- the official website changes;
- Telegram rejects a message.

## Security

Never publish:

```text
BOT_TOKEN
CHAT_ID
MONITOR_API_KEY
TELEGRAM_WEBHOOK_KEY
SPREADSHEET_ID
```

Use:

- Apps Script properties.
- GitHub Actions secrets.
- Environment variables.

If a Telegram token is accidentally exposed, revoke it through BotFather and generate a new one.

## Troubleshooting

### The bot does not respond

Run:

```text
crearTriggerTelegram
```

Then run:

```text
verificarTriggers
```

A trigger associated with the following function should appear:

```text
procesarTelegram
```

### The bot responds slowly

The trigger-based mode checks Telegram approximately once per minute.

A response may take several seconds or close to one minute.

### GitHub cannot find alerts

Confirm that the following secrets exist:

```text
BOT_TOKEN
CHAT_ID
ALERTS_API_URL
MONITOR_API_KEY
```

Also confirm that the API responds with:

```json
{
  "ok": true
}
```

### GitHub Actions fails

Open the failed run and inspect:

```text
Revisar alertas y disponibilidad
```

Diagnostic files may be available in the run artifacts.

### Duplicate notifications are received

Confirm that `state.json` can be updated and that the workflow includes:

```yaml
permissions:
  contents: write
```

### The bot stopped responding after enabling a webhook

Run:

```text
crearTriggerTelegram
```

This removes the webhook and restores periodic polling.

## Limitations

- The bot does not reserve or purchase tickets.
- Availability may change before the user completes the purchase.
- The project depends on the current structure of the official website.
- Website changes may require updating the Playwright selectors.
- GitHub Actions runs may occasionally be delayed.
- Telegram menu responses may take up to approximately one minute.
- Users are responsible for complying with the terms of the monitored website.

## Legal notice

This software is provided for personal automation and informational purposes.

It does not guarantee:

- ticket availability;
- reservations;
- successful purchases;
- admission to Machu Picchu.

Purchases must be completed directly on the official website:

```text
https://tuboleto.cultura.pe/llaqta_machupicchu
```

This project does not represent or act on behalf of Peru's Ministry of Culture.

---

## License / Licencia

This project may be distributed under the MIT License.

Este proyecto puede distribuirse bajo la licencia MIT.

See the `LICENSE` file for details.

Consulta el archivo `LICENSE` para más información.
