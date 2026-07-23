# Instalación / Installation

[Español](#instalación-en-español) | [English](#installation-in-english)

---

# Instalación en español

Esta guía explica cómo instalar una copia propia de Alerta Machu Picchu.

## Arquitectura del sistema

```text
Telegram
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
Portal Tu Boleto
```

## Requisitos

Se necesita:

- Una cuenta de Telegram.
- Una cuenta de Google.
- Una cuenta de GitHub.
- Un bot creado con BotFather.
- Una hoja de cálculo de Google Sheets.
- Un proyecto de Google Apps Script.
- Un repositorio de GitHub con Actions habilitado.

No es necesario mantener una computadora encendida.

## 1. Crear un bot de Telegram

Busca en Telegram:

```text
@BotFather
```

Envía:

```text
/newbot
```

BotFather solicitará un nombre y un nombre de usuario para el bot.

Al finalizar entregará un token parecido a:

```text
123456789:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Guarda el token de forma privada.

Nunca lo publiques en GitHub.

## 2. Obtener el Chat ID

Abre el bot recién creado y envíale un mensaje.

Después abre en el navegador:

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

El número de `id` es el `CHAT_ID`.

## 3. Crear Google Sheets

Crea una hoja de cálculo nueva.

Cambia el nombre de la pestaña inferior a:

```text
ALERTAS
```

En la primera fila coloca:

```text
ALERTA_ID	ACTIVA	MODO_FECHA	FECHA_ISO	RUTAS	CANTIDAD_MIN	FRECUENCIA_MIN	CHAT_ID	CREADA_EN	ACTUALIZADA_EN
```

El identificador de la hoja está dentro de su URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

Copia el texto situado entre `/d/` y `/edit`.

## 4. Agregar el código de Apps Script

Desde Google Sheets abre:

```text
Extensiones → Apps Script
```

Copia el contenido de:

```text
apps-script/Codigo.gs
```

y reemplaza todo el contenido de `Código.gs`.

Pulsa **Guardar**.

## 5. Configurar las propiedades del script

En Apps Script abre:

```text
Configuración del proyecto → Propiedades del script
```

Agrega:

| Propiedad | Valor |
|---|---|
| `BOT_TOKEN` | Token entregado por BotFather |
| `CHAT_ID` | Identificador del chat |
| `SPREADSHEET_ID` | Identificador de Google Sheets |

Los nombres deben conservar exactamente las mayúsculas y guiones bajos.

## 6. Configurar la hoja

En el selector de funciones elige:

```text
configurarHojaAlertas
```

Pulsa **Ejecutar** y autoriza los permisos solicitados por Google.

## 7. Crear la clave de la API

Ejecuta:

```text
crearClaveApi
```

En el registro aparecerá:

```text
MONITOR_API_KEY creada: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Copia y guarda esa clave.

No la publiques.

## 8. Publicar la aplicación web

Abre:

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

Pulsa **Implementar**.

Copia la URL que termina en:

```text
/exec
```

No utilices una URL terminada en `/dev`.

## 9. Activar la recepción de Telegram

En Apps Script ejecuta:

```text
crearTriggerTelegram
```

Esta función crea un activador que revisa Telegram aproximadamente una vez por minuto.

También elimina cualquier webhook anterior que pueda impedir el uso de `getUpdates`.

El bot debería enviar:

```text
✅ RECEPCIÓN AUTOMÁTICA ACTIVADA

El bot revisará Telegram automáticamente cada minuto.
```

No ejecutes `crearWebhookTelegram` mientras utilices este método.

## 10. Preparar el repositorio

El repositorio debe contener:

```text
monitor.js
package.json
state.json
.github/workflows/monitor.yml
apps-script/Codigo.gs
README.md
INSTALLATION.md
LICENSE
```

La estructura recomendada es:

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
├── INSTALLATION.md
└── LICENSE
```

## 11. Configurar los secretos de GitHub

Abre:

```text
Settings
→ Secrets and variables
→ Actions
→ New repository secret
```

Crea estos cuatro secretos:

| Nombre | Valor |
|---|---|
| `BOT_TOKEN` | Token del bot |
| `CHAT_ID` | Identificador del chat |
| `ALERTS_API_URL` | URL de Apps Script terminada en `/exec` |
| `MONITOR_API_KEY` | Clave generada en Apps Script |

No agregues la clave como parte de `ALERTS_API_URL`.

## 12. Probar la API

Abre en el navegador:

```text
ALERTS_API_URL?key=MONITOR_API_KEY
```

La respuesta debe contener:

```json
{
  "ok": true,
  "alerts": []
}
```

Cuando existan alertas activas, aparecerán dentro de `alerts`.

No compartas la URL completa con la clave.

## 13. Crear una alerta desde Telegram

Escribe:

```text
/start
```

Después selecciona:

1. Crear alerta.
2. Mañana automáticamente o una fecha específica.
3. Una ruta o todas las rutas.
4. Cantidad mínima.
5. Frecuencia de 5 o 10 minutos.

La alerta aparecerá en Google Sheets.

## 14. Probar GitHub Actions

Abre:

```text
Actions
→ Monitor Machu Picchu
→ Run workflow
```

Selecciona la rama `main` y ejecuta el flujo.

La prueba manual debe:

- terminar con una marca verde;
- procesar las alertas activas;
- enviar un resumen por Telegram.

## 15. Funcionamiento automático

Las ejecuciones automáticas:

- consultan las alertas activas;
- revisan las rutas configuradas;
- permanecen en silencio cuando no hay entradas;
- envían un aviso cuando aparece disponibilidad nueva;
- actualizan `state.json` para evitar mensajes repetidos.

## Seguridad

No publiques:

```text
BOT_TOKEN
CHAT_ID
MONITOR_API_KEY
TELEGRAM_WEBHOOK_KEY
SPREADSHEET_ID
```

Los valores privados deben almacenarse en:

- Propiedades del script.
- Secretos de GitHub Actions.

Antes de publicar `apps-script/Codigo.gs`, comprueba que no contenga credenciales escritas directamente.

## Solución de problemas

### El bot no responde

Ejecuta:

```text
crearTriggerTelegram
```

Después ejecuta:

```text
verificarTriggers
```

Debe existir un activador para:

```text
procesarTelegram
```

### El bot tarda en responder

El activador consulta Telegram aproximadamente una vez por minuto.

### GitHub no encuentra alertas

Comprueba los secretos:

```text
BOT_TOKEN
CHAT_ID
ALERTS_API_URL
MONITOR_API_KEY
```

Después prueba la API manualmente.

### GitHub Actions falla

Abre la ejecución y revisa el paso:

```text
Revisar alertas y disponibilidad
```

También revisa los artefactos de diagnóstico generados por el flujo.

### Se reciben notificaciones repetidas

Comprueba que el flujo tenga:

```yaml
permissions:
  contents: write
```

También verifica que `state.json` pueda actualizarse.

---

# Installation in English

This guide explains how to install a personal copy of Machu Picchu Ticket Alert.

## System architecture

```text
Telegram
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
Tu Boleto website
```

## Requirements

The following are required:

- A Telegram account.
- A Google account.
- A GitHub account.
- A bot created with BotFather.
- A Google Sheets spreadsheet.
- A Google Apps Script project.
- A GitHub repository with Actions enabled.

A computer does not need to remain turned on.

## 1. Create a Telegram bot

Search Telegram for:

```text
@BotFather
```

Send:

```text
/newbot
```

BotFather will request a display name and a username for the bot.

It will then provide a token similar to:

```text
123456789:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Store the token privately.

Never publish it on GitHub.

## 2. Get the Chat ID

Open the newly created bot and send it a message.

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

The `id` number is the `CHAT_ID`.

## 3. Create the Google Sheet

Create a new Google Sheets spreadsheet.

Rename the bottom tab to:

```text
ALERTAS
```

Add the following headers to the first row:

```text
ALERTA_ID	ACTIVA	MODO_FECHA	FECHA_ISO	RUTAS	CANTIDAD_MIN	FRECUENCIA_MIN	CHAT_ID	CREADA_EN	ACTUALIZADA_EN
```

The spreadsheet identifier is located in its URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

Copy the value between `/d/` and `/edit`.

## 4. Add the Apps Script code

From Google Sheets, open:

```text
Extensions → Apps Script
```

Copy the contents of:

```text
apps-script/Codigo.gs
```

and replace the entire contents of `Código.gs`.

Save the project.

## 5. Configure script properties

Open:

```text
Project Settings → Script properties
```

Add:

| Property | Value |
|---|---|
| `BOT_TOKEN` | Token provided by BotFather |
| `CHAT_ID` | Telegram chat identifier |
| `SPREADSHEET_ID` | Google Sheets identifier |

Property names must match exactly.

## 6. Configure the alerts sheet

Select:

```text
configurarHojaAlertas
```

Click **Run** and authorize the requested permissions.

## 7. Create the API key

Run:

```text
crearClaveApi
```

The execution log will display:

```text
MONITOR_API_KEY creada: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Copy and store the key privately.

## 8. Deploy the web application

Open:

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

Click **Deploy**.

Copy the URL ending in:

```text
/exec
```

Do not use a URL ending in `/dev`.

## 9. Enable Telegram message reception

Run:

```text
crearTriggerTelegram
```

This function creates a trigger that checks Telegram approximately once per minute.

It also removes any previous webhook that could prevent `getUpdates` from working.

The bot should send:

```text
✅ RECEPCIÓN AUTOMÁTICA ACTIVADA

El bot revisará Telegram automáticamente cada minuto.
```

Do not run `crearWebhookTelegram` while using this method.

## 10. Prepare the repository

The repository should contain:

```text
monitor.js
package.json
state.json
.github/workflows/monitor.yml
apps-script/Codigo.gs
README.md
INSTALLATION.md
LICENSE
```

Recommended structure:

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
├── INSTALLATION.md
└── LICENSE
```

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
| `MONITOR_API_KEY` | Key generated in Apps Script |

Do not add the API key to `ALERTS_API_URL`.

## 12. Test the API

Open:

```text
ALERTS_API_URL?key=MONITOR_API_KEY
```

The response should contain:

```json
{
  "ok": true,
  "alerts": []
}
```

Active alerts will appear inside `alerts`.

Never share the complete address containing the key.

## 13. Create an alert from Telegram

Send:

```text
/start
```

Then select:

1. Create alert.
2. Tomorrow automatically or a specific date.
3. A specific route or all routes.
4. Minimum ticket quantity.
5. A 5- or 10-minute frequency.

The alert will appear in Google Sheets.

## 14. Test GitHub Actions

Open:

```text
Actions
→ Monitor Machu Picchu
→ Run workflow
```

Select the `main` branch and run the workflow.

The manual test should:

- finish with a green check mark;
- process the active alerts;
- send a summary through Telegram.

## 15. Automatic operation

Automatic runs:

- read active alerts;
- check the configured routes;
- remain silent when no tickets are found;
- send a notification when new availability appears;
- update `state.json` to prevent duplicate notifications.

## Security

Never publish:

```text
BOT_TOKEN
CHAT_ID
MONITOR_API_KEY
TELEGRAM_WEBHOOK_KEY
SPREADSHEET_ID
```

Private values must be stored in:

- Apps Script properties.
- GitHub Actions secrets.

Before publishing `apps-script/Codigo.gs`, confirm that it does not contain credentials written directly in the source code.

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

A trigger for the following function should exist:

```text
procesarTelegram
```

### The bot responds slowly

The trigger checks Telegram approximately once per minute.

### GitHub cannot find alerts

Confirm these secrets:

```text
BOT_TOKEN
CHAT_ID
ALERTS_API_URL
MONITOR_API_KEY
```

Then test the API manually.

### GitHub Actions fails

Open the failed run and inspect:

```text
Revisar alertas y disponibilidad
```

Also inspect any diagnostic artifacts generated by the workflow.

### Duplicate notifications are received

Confirm that the workflow includes:

```yaml
permissions:
  contents: write
```

Also verify that `state.json` can be updated.
