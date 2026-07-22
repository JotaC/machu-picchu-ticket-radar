import { chromium } from 'playwright';
import fs from 'node:fs';

const CONFIG = Object.freeze({
  siteUrl: 'https://tuboleto.cultura.pe/llaqta_machupicchu',
  alertsApiUrl: String(process.env.ALERTS_API_URL || '').trim(),
  monitorApiKey: String(process.env.MONITOR_API_KEY || '').trim(),
  botToken: String(process.env.BOT_TOKEN || '').trim(),
  fallbackChatId: String(process.env.CHAT_ID || '').trim(),
  notifyStatus:
    String(process.env.NOTIFY_STATUS || 'false').toLowerCase() === 'true',
  timeZone: 'America/Lima',
  stateFile: 'state.json',
  diagnosticDirectory: 'diagnostico',
  pageTimeoutMs: 60_000,
  actionTimeoutMs: 30_000,
  dueToleranceMs: 60_000,
  systemErrorCooldownMs: 6 * 60 * 60 * 1000
});

const ROUTES = Object.freeze([
  {
    code: '1-A',
    circuitText: 'Circuito 1',
    routeText: 'Ruta 1-A',
    name: 'Montaña Machupicchu'
  },
  {
    code: '1-B',
    circuitText: 'Circuito 1',
    routeText: 'Ruta 1-B',
    name: 'Terraza superior'
  },
  {
    code: '1-C',
    circuitText: 'Circuito 1',
    routeText: 'Ruta 1-C',
    name: 'Portada Intipunku'
  },
  {
    code: '1-D',
    circuitText: 'Circuito 1',
    routeText: 'Ruta 1-D',
    name: 'Puente Inka'
  },
  {
    code: '2-A',
    circuitText: 'Circuito 2',
    routeText: 'Ruta 2-A',
    name: 'Clásico Diseñada'
  },
  {
    code: '2-B',
    circuitText: 'Circuito 2',
    routeText: 'Ruta 2-B',
    name: 'Terraza inferior'
  },
  {
    code: '3-A',
    circuitText: 'Circuito 3',
    routeText: 'Ruta 3-A',
    name: 'Montaña Waynapicchu'
  },
  {
    code: '3-B',
    circuitText: 'Circuito 3',
    routeText: 'Ruta 3-B',
    name: 'Realeza diseñada'
  },
  {
    code: '3-C',
    circuitText: 'Circuito 3',
    routeText: 'Ruta 3-C',
    name: 'Gran Caverna'
  },
  {
    code: '3-D',
    circuitText: 'Circuito 3',
    routeText: 'Ruta 3-D',
    name: 'Huchuypicchu'
  }
]);

const ROUTE_BY_CODE = new Map(
  ROUTES.map(route => [route.code, route])
);

const MONTHS = Object.freeze({
  ENE: 0,
  ENERO: 0,
  JAN: 0,
  FEB: 1,
  FEBRERO: 1,
  MAR: 2,
  MARZO: 2,
  ABR: 3,
  ABRIL: 3,
  APR: 3,
  MAY: 4,
  MAYO: 4,
  JUN: 5,
  JUNIO: 5,
  JUL: 6,
  JULIO: 6,
  AGO: 7,
  AGOSTO: 7,
  AUG: 7,
  SET: 8,
  SEP: 8,
  SEPT: 8,
  SEPTIEMBRE: 8,
  OCT: 9,
  OCTUBRE: 9,
  NOV: 10,
  NOVIEMBRE: 10,
  DIC: 11,
  DICIEMBRE: 11,
  DEC: 11
});

const SPANISH_MONTHS = Object.freeze([
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
]);

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseISODate(isoDate) {
  const match = String(isoDate || '').match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) {
    return new Date(Number.NaN);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return new Date(Number.NaN);
  }

  return date;
}

function formatDatePE(isoDate) {
  const [year, month, day] = String(isoDate).split('-');
  return `${day}/${month}/${year}`;
}

function getLimaTimestamp() {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: CONFIG.timeZone,
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(new Date());
}

function parseCalendarMonth(label) {
  const clean = normalizeText(label)
    .toUpperCase()
    .replace(/\./g, '');

  const parts = clean.split(' ');

  if (parts.length < 2) {
    return null;
  }

  const month = MONTHS[parts[0]];
  const year = Number.parseInt(parts.at(-1), 10);

  if (month === undefined || !Number.isInteger(year)) {
    return null;
  }

  return {
    month,
    year
  };
}

function validateEnvironment() {
  const missing = [];

  if (!CONFIG.alertsApiUrl) {
    missing.push('ALERTS_API_URL');
  }

  if (!CONFIG.monitorApiKey) {
    missing.push('MONITOR_API_KEY');
  }

  if (!CONFIG.botToken) {
    missing.push('BOT_TOKEN');
  }

  if (missing.length) {
    throw new Error(
      `Faltan secretos o variables: ${missing.join(', ')}.`
    );
  }
}

function ensureDiagnosticDirectory() {
  fs.mkdirSync(CONFIG.diagnosticDirectory, {
    recursive: true
  });
}

function sanitizeFileName(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function saveDiagnostic(page, name) {
  ensureDiagnosticDirectory();

  const safeName = sanitizeFileName(name);

  await page.screenshot({
    path: `${CONFIG.diagnosticDirectory}/${safeName}.png`,
    fullPage: true
  }).catch(error => {
    console.warn(
      `No se pudo guardar ${safeName}.png:`,
      error.message
    );
  });

  const html = await page.content().catch(() => '');

  if (html) {
    fs.writeFileSync(
      `${CONFIG.diagnosticDirectory}/${safeName}.html`,
      html,
      'utf8'
    );
  }
}

function defaultState() {
  return {
    version: 2,
    alerts: {},
    system: {
      lastApiErrorNotifiedAt: null
    }
  };
}

function loadState() {
  try {
    if (!fs.existsSync(CONFIG.stateFile)) {
      return defaultState();
    }

    const parsed = JSON.parse(
      fs.readFileSync(CONFIG.stateFile, 'utf8')
    );

    return {
      version: 2,
      alerts:
        parsed &&
        typeof parsed.alerts === 'object' &&
        parsed.alerts
          ? parsed.alerts
          : {},
      system:
        parsed &&
        typeof parsed.system === 'object' &&
        parsed.system
          ? parsed.system
          : {
              lastApiErrorNotifiedAt: null
            }
    };
  } catch (error) {
    console.warn(
      'No se pudo leer state.json:',
      error.message
    );

    return defaultState();
  }
}

function saveState(state) {
  fs.writeFileSync(
    CONFIG.stateFile,
    JSON.stringify(state, null, 2) + '\n',
    'utf8'
  );
}

function splitTelegramMessage(text, maxLength = 3900) {
  const chunks = [];
  let remaining = String(text || '');

  while (remaining.length > maxLength) {
    let splitAt = remaining.lastIndexOf(
      '\n',
      maxLength
    );

    if (splitAt < Math.floor(maxLength * 0.6)) {
      splitAt = maxLength;
    }

    chunks.push(
      remaining.slice(0, splitAt).trim()
    );

    remaining = remaining
      .slice(splitAt)
      .trim();
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks;
}

async function sendTelegram(chatId, text) {
  const destination = String(
    chatId ||
    CONFIG.fallbackChatId ||
    ''
  ).trim();

  if (!destination) {
    throw new Error(
      'No existe un CHAT_ID para enviar el mensaje.'
    );
  }

  for (const chunk of splitTelegramMessage(text)) {
    const response = await fetch(
      `https://api.telegram.org/bot${CONFIG.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: destination,
          text: chunk,
          disable_web_page_preview: false
        })
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `Telegram respondió HTTP ${response.status}: ${responseText}`
      );
    }

    const result = JSON.parse(responseText);

    if (!result.ok) {
      throw new Error(
        `Telegram rechazó el mensaje: ${responseText}`
      );
    }
  }
}

function composeApiUrl() {
  const url = new URL(CONFIG.alertsApiUrl);

  url.searchParams.set(
    'key',
    CONFIG.monitorApiKey
  );

  return url;
}

function normalizeAlert(raw) {
  const id = String(raw?.id || '').trim();
  const targetDate = String(
    raw?.targetDate || ''
  ).trim();

  const chatId = String(
    raw?.chatId ||
    CONFIG.fallbackChatId ||
    ''
  ).trim();

  const requiredTickets = Number(
    raw?.requiredTickets
  );

  const frequencyMinutes = Number(
    raw?.frequencyMinutes
  );

  const rawRoutes = Array.isArray(raw?.routes)
    ? raw.routes.map(String)
    : [];

  if (!id) {
    throw new Error(
      'La API devolvió una alerta sin id.'
    );
  }

  if (
    Number.isNaN(
      parseISODate(targetDate).getTime()
    )
  ) {
    throw new Error(
      `La alerta ${id} tiene una fecha inválida: ${targetDate}.`
    );
  }

  if (!chatId) {
    throw new Error(
      `La alerta ${id} no tiene chatId.`
    );
  }

  if (
    !Number.isInteger(requiredTickets) ||
    requiredTickets < 1
  ) {
    throw new Error(
      `La alerta ${id} tiene una cantidad mínima inválida.`
    );
  }

  if (![5, 10].includes(frequencyMinutes)) {
    throw new Error(
      `La alerta ${id} tiene una frecuencia inválida.`
    );
  }

  const routes = rawRoutes.includes('ALL')
    ? ROUTES.map(route => route.code)
    : [
        ...new Set(
          rawRoutes
            .map(value => value.trim())
            .filter(Boolean)
        )
      ];

  const validRoutes = routes.filter(
    routeCode => ROUTE_BY_CODE.has(routeCode)
  );

  if (!validRoutes.length) {
    throw new Error(
      `La alerta ${id} no contiene rutas válidas.`
    );
  }

  return {
    id,
    active: raw?.active !== false,
    mode: String(raw?.mode || ''),
    targetDate,
    routes: validRoutes,
    requiredTickets,
    frequencyMinutes,
    chatId,
    expired: raw?.expired === true
  };
}

async function fetchAlerts() {
  const response = await fetch(
    composeApiUrl(),
    {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      },
      redirect: 'follow',
      cache: 'no-store'
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `La API respondió HTTP ${response.status}: ${responseText}`
    );
  }

  let payload;

  try {
    payload = JSON.parse(responseText);
  } catch {
    throw new Error(
      'La API no devolvió un JSON válido.'
    );
  }

  if (!payload.ok) {
    throw new Error(
      `La API rechazó la consulta: ${
        payload.error || 'sin detalle'
      }`
    );
  }

  if (!Array.isArray(payload.alerts)) {
    throw new Error(
      'La API no devolvió la lista alerts.'
    );
  }

  const alerts = [];
  const rejected = [];

  for (const rawAlert of payload.alerts) {
    try {
      const alert = normalizeAlert(rawAlert);

      if (
        alert.active &&
        !alert.expired
      ) {
        alerts.push(alert);
      }
    } catch (error) {
      rejected.push(error.message);
    }
  }

  if (rejected.length) {
    console.warn(
      'Alertas ignoradas por datos inválidos:',
      rejected.join(' | ')
    );
  }

  return alerts;
}

function isAlertDue(
  alert,
  alertState,
  nowMs,
  force
) {
  if (force) {
    return true;
  }

  const lastCheckedAt = Date.parse(
    String(alertState?.lastCheckedAt || '')
  );

  if (!Number.isFinite(lastCheckedAt)) {
    return true;
  }

  const intervalMs =
    alert.frequencyMinutes *
    60 *
    1000;

  return (
    nowMs - lastCheckedAt >=
    intervalMs - CONFIG.dueToleranceMs
  );
}

function isIgnoredRequest(url) {
  return (
    url.includes('google-analytics.com') ||
    url.includes('googletagmanager.com') ||
    url.includes('doubleclick.net') ||
    url.includes('sentry.io')
  );
}

async function waitForPageReady(page) {
  await page
    .getByText(
      'Adquiere tu boleto',
      {
        exact: false
      }
    )
    .waitFor({
      state: 'visible',
      timeout: CONFIG.pageTimeoutMs
    });

  await page
    .locator('mat-select')
    .nth(0)
    .waitFor({
      state: 'visible',
      timeout: CONFIG.pageTimeoutMs
    });

  await page
    .locator('mat-select')
    .nth(1)
    .waitFor({
      state: 'visible',
      timeout: CONFIG.pageTimeoutMs
    });
}

async function waitForSelectEnabled(
  select,
  timeoutMs = CONFIG.actionTimeoutMs
) {
  const startedAt = Date.now();

  while (
    Date.now() - startedAt <
    timeoutMs
  ) {
    const ariaDisabled =
      await select.getAttribute(
        'aria-disabled'
      );

    const disabled =
      await select.getAttribute(
        'disabled'
      );

    if (
      ariaDisabled !== 'true' &&
      disabled === null
    ) {
      return;
    }

    await select
      .page()
      .waitForTimeout(300);
  }

  throw new Error(
    'El selector continuó deshabilitado.'
  );
}

async function openMaterialOptions(
  page,
  select,
  label
) {
  let lastError = null;

  for (
    let attempt = 1;
    attempt <= 4;
    attempt++
  ) {
    console.log(
      `Intento ${attempt} para abrir ${label}.`
    );

    await page.keyboard
      .press('Escape')
      .catch(() => {});

    await page.waitForTimeout(300);

    const trigger = select
      .locator(
        '.mat-mdc-select-trigger, .mat-select-trigger'
      )
      .first();

    try {
      if (await trigger.count()) {
        await trigger.click({
          timeout: 8000
        });
      } else {
        await select.click({
          timeout: 8000
        });
      }
    } catch (error) {
      lastError = error;

      try {
        await select.click({
          force: true,
          timeout: 8000
        });
      } catch (forceError) {
        lastError = forceError;
      }
    }

    const options = page.locator(
      '.cdk-overlay-pane [role="option"], .cdk-overlay-pane mat-option'
    );

    try {
      await options
        .first()
        .waitFor({
          state: 'visible',
          timeout: 6000
        });

      return options;
    } catch (error) {
      lastError = error;
    }

    try {
      await select.focus();
      await select.press('Enter');

      await options
        .first()
        .waitFor({
          state: 'visible',
          timeout: 6000
        });

      return options;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `No se pudo abrir el selector de ${label}. Último error: ` +
    `${lastError?.message || 'desconocido'}`
  );
}

async function selectMaterialOption(
  page,
  selectIndex,
  targetText,
  label
) {
  const select = page
    .locator('mat-select')
    .nth(selectIndex);

  await select.waitFor({
    state: 'visible',
    timeout: CONFIG.actionTimeoutMs
  });

  await waitForSelectEnabled(select);
  await select.scrollIntoViewIfNeeded();

  const options = await openMaterialOptions(
    page,
    select,
    label
  );

  const optionCount =
    await options.count();

  const normalizedTarget =
    normalizeText(targetText)
      .toLowerCase();

  const descriptions = [];
  let selectedOption = null;

  for (
    let index = 0;
    index < optionCount;
    index++
  ) {
    const option = options.nth(index);

    if (
      !await option
        .isVisible()
        .catch(() => false)
    ) {
      continue;
    }

    const text = normalizeText(
      await option
        .innerText()
        .catch(() => '')
    );

    descriptions.push(text);

    if (
      text
        .toLowerCase()
        .includes(normalizedTarget)
    ) {
      selectedOption = option;
      break;
    }
  }

  if (!selectedOption) {
    await page.keyboard
      .press('Escape')
      .catch(() => {});

    console.log(
      `No se encontró ${targetText}. Opciones: ${descriptions.join(' | ')}`
    );

    return false;
  }

  const ariaDisabled =
    await selectedOption.getAttribute(
      'aria-disabled'
    );

  const disabled =
    await selectedOption.getAttribute(
      'disabled'
    );

  const className = String(
    await selectedOption.getAttribute(
      'class'
    ) || ''
  );

  if (
    ariaDisabled === 'true' ||
    disabled !== null ||
    className.includes(
      'option-disabled'
    )
  ) {
    await page.keyboard
      .press('Escape')
      .catch(() => {});

    console.log(
      `La opción ${targetText} está deshabilitada.`
    );

    return false;
  }

  console.log(
    'Seleccionando:',
    normalizeText(
      await selectedOption.innerText()
    )
  );

  await selectedOption
    .click({
      timeout: 10_000
    })
    .catch(async () => {
      await selectedOption.click({
        force: true,
        timeout: 10_000
      });
    });

  await page.waitForTimeout(900);

  return true;
}

async function openTargetCalendar(page) {
  const input = page
    .locator(
      'input[matinput][readonly]'
    )
    .first();

  await input.waitFor({
    state: 'visible',
    timeout: CONFIG.actionTimeoutMs
  });

  const calendar = page.locator(
    'mat-calendar:visible'
  );

  if (
    !await calendar
      .isVisible()
      .catch(() => false)
  ) {
    await input
      .click({
        timeout: 8000
      })
      .catch(async () => {
        await input.click({
          force: true,
          timeout: 8000
        });
      });
  }

  await calendar.waitFor({
    state: 'visible',
    timeout: CONFIG.actionTimeoutMs
  });
}

async function waitForCalendarLabelChange(
  periodButton,
  previousLabel
) {
  for (
    let attempt = 0;
    attempt < 30;
    attempt++
  ) {
    await periodButton
      .page()
      .waitForTimeout(250);

    const currentLabel =
      normalizeText(
        await periodButton.innerText()
      );

    if (
      currentLabel !==
      normalizeText(previousLabel)
    ) {
      return;
    }
  }
}

async function navigateCalendarToTargetMonth(
  page,
  targetDate
) {
  const targetYear =
    targetDate.getUTCFullYear();

  const targetMonth =
    targetDate.getUTCMonth();

  const periodButton = page.locator(
    '.mat-calendar-period-button:visible'
  );

  await periodButton.waitFor({
    state: 'visible',
    timeout: CONFIG.actionTimeoutMs
  });

  for (
    let attempt = 0;
    attempt < 24;
    attempt++
  ) {
    const label =
      await periodButton.innerText();

    const current =
      parseCalendarMonth(label);

    if (!current) {
      throw new Error(
        `No se pudo interpretar el mes visible: ${label}`
      );
    }

    const difference =
      (targetYear - current.year) * 12 +
      (targetMonth - current.month);

    if (difference === 0) {
      await page.waitForTimeout(1000);
      return;
    }

    const button =
      difference > 0
        ? page.locator(
            '.mat-calendar-next-button:visible'
          )
        : page.locator(
            '.mat-calendar-previous-button:visible'
          );

    const responsePromise =
      page.waitForResponse(
        response =>
          response
            .url()
            .includes(
              '/visita/consulta-fechas-disponibles'
            ) &&
          response
            .request()
            .method() === 'POST',
        {
          timeout: 12_000
        }
      ).catch(() => null);

    await button
      .click({
        timeout: 8000
      })
      .catch(async () => {
        await button.click({
          force: true,
          timeout: 8000
        });
      });

    await Promise.all([
      responsePromise,
      waitForCalendarLabelChange(
        periodButton,
        label
      )
    ]);
  }

  throw new Error(
    'No se pudo llegar al mes objetivo.'
  );
}

async function findTargetDayCell(
  page,
  targetDate
) {
  const targetDay =
    targetDate.getUTCDate();

  const targetMonth =
    targetDate.getUTCMonth();

  const targetYear =
    targetDate.getUTCFullYear();

  const monthName =
    SPANISH_MONTHS[targetMonth];

  const cells = page.locator(
    'mat-calendar:visible button.mat-calendar-body-cell'
  );

  const count = await cells.count();
  let fallback = null;

  for (
    let index = 0;
    index < count;
    index++
  ) {
    const cell = cells.nth(index);

    const text = normalizeText(
      await cell
        .innerText()
        .catch(() => '')
    );

    if (
      text !== String(targetDay)
    ) {
      continue;
    }

    fallback ??= cell;

    const ariaLabel =
      normalizeText(
        await cell.getAttribute(
          'aria-label'
        )
      ).toLowerCase();

    if (
      ariaLabel.includes(
        String(targetYear)
      ) &&
      ariaLabel.includes(monthName)
    ) {
      return cell;
    }
  }

  return fallback;
}

async function selectTargetDay(
  page,
  targetDate
) {
  const cell =
    await findTargetDayCell(
      page,
      targetDate
    );

  if (!cell) {
    throw new Error(
      `No se encontró el día ${targetDate.getUTCDate()} en el calendario.`
    );
  }

  const ariaDisabled =
    await cell.getAttribute(
      'aria-disabled'
    );

  const disabled =
    await cell.getAttribute(
      'disabled'
    );

  const className = String(
    await cell.getAttribute(
      'class'
    ) || ''
  );

  const isDisabled =
    ariaDisabled === 'true' ||
    disabled !== null ||
    className.includes(
      'mat-calendar-body-disabled'
    ) ||
    await cell
      .isDisabled()
      .catch(() => false);

  if (isDisabled) {
    console.log(
      'La fecha está deshabilitada.'
    );

    return false;
  }

  const scheduleResponse =
    page.waitForResponse(
      response =>
        response
          .url()
          .includes(
            '/visita/consulta-horarios'
          ) &&
        response
          .request()
          .method() === 'POST',
      {
        timeout: 12_000
      }
    ).catch(() => null);

  await cell
    .click({
      timeout: 8000
    })
    .catch(async () => {
      await cell.click({
        force: true,
        timeout: 8000
      });
    });

  await scheduleResponse;
  await page.waitForTimeout(1000);

  return true;
}

async function readAvailableSlots(page) {
  const scheduleSelect = page
    .locator('mat-select')
    .nth(2);

  if (
    !await scheduleSelect
      .isVisible()
      .catch(() => false)
  ) {
    console.log(
      'No apareció el selector de horarios.'
    );

    return [];
  }

  try {
    await waitForSelectEnabled(
      scheduleSelect,
      10_000
    );
  } catch {
    console.log(
      'El selector de horarios está deshabilitado.'
    );

    return [];
  }

  const options =
    await openMaterialOptions(
      page,
      scheduleSelect,
      'horarios'
    );

  const count =
    await options.count();

  const slots = [];

  for (
    let index = 0;
    index < count;
    index++
  ) {
    const option =
      options.nth(index);

    if (
      !await option
        .isVisible()
        .catch(() => false)
    ) {
      continue;
    }

    const text =
      normalizeText(
        await option
          .innerText()
          .catch(() => '')
      );

    const ariaDisabled =
      await option.getAttribute(
        'aria-disabled'
      );

    const className = String(
      await option.getAttribute(
        'class'
      ) || ''
    );

    const disabled =
      ariaDisabled === 'true' ||
      className.includes(
        'option-disabled'
      );

    const timeMatch = text.match(
      /(\d{1,2}:\d{2})/
    );

    const seatsMatch = text.match(
      /(\d+)\s*(?:boletos?|entradas?|cupos?)/i
    );

    console.log(
      'Horario observado:',
      text
    );

    if (
      !timeMatch ||
      !seatsMatch
    ) {
      continue;
    }

    slots.push({
      time: timeMatch[1],
      seats: Number.parseInt(
        seatsMatch[1],
        10
      ),
      disabled,
      text
    });
  }

  await page.keyboard
    .press('Escape')
    .catch(() => {});

  return slots;
}

async function checkRoute(
  context,
  route,
  targetDateIso
) {
  const page =
    await context.newPage();

  page.setDefaultTimeout(
    CONFIG.actionTimeoutMs
  );

  await page.route(
    '**/*',
    async routeRequest => {
      const url =
        routeRequest
          .request()
          .url();

      if (isIgnoredRequest(url)) {
        await routeRequest.abort();
      } else {
        await routeRequest.continue();
      }
    }
  );

  page.on(
    'requestfailed',
    request => {
      if (
        isIgnoredRequest(
          request.url()
        )
      ) {
        return;
      }

      console.warn(
        'Solicitud fallida:',
        request.url(),
        request.failure()?.errorText || ''
      );
    }
  );

  try {
    console.log(
      `\nRevisando ${targetDateIso} — ruta ${route.code}: ${route.name}`
    );

    const placeInfoPromise =
      page.waitForResponse(
        response =>
          response
            .url()
            .includes(
              '/visita/lugar-info'
            ) &&
          response.status() === 200,
        {
          timeout:
            CONFIG.pageTimeoutMs
        }
      ).catch(() => null);

    await page.goto(
      CONFIG.siteUrl,
      {
        waitUntil:
          'domcontentloaded',
        timeout:
          CONFIG.pageTimeoutMs
      }
    );

    await placeInfoPromise;
    await waitForPageReady(page);
    await page.waitForTimeout(700);

    const circuitSelected =
      await selectMaterialOption(
        page,
        0,
        route.circuitText,
        'circuito'
      );

    if (!circuitSelected) {
      return {
        route,
        targetDate: targetDateIso,
        processed: true,
        routeEnabled: false,
        dateEnabled: false,
        slots: [],
        error: null
      };
    }

    const datesResponse =
      page.waitForResponse(
        response =>
          response
            .url()
            .includes(
              '/visita/consulta-fechas-disponibles'
            ) &&
          response
            .request()
            .method() === 'POST',
        {
          timeout: 15_000
        }
      ).catch(() => null);

    const routeSelected =
      await selectMaterialOption(
        page,
        1,
        route.routeText,
        'ruta'
      );

    if (!routeSelected) {
      return {
        route,
        targetDate: targetDateIso,
        processed: true,
        routeEnabled: false,
        dateEnabled: false,
        slots: [],
        error: null
      };
    }

    await datesResponse;
    await openTargetCalendar(page);

    const targetDate =
      parseISODate(
        targetDateIso
      );

    await navigateCalendarToTargetMonth(
      page,
      targetDate
    );

    const dateEnabled =
      await selectTargetDay(
        page,
        targetDate
      );

    if (!dateEnabled) {
      return {
        route,
        targetDate: targetDateIso,
        processed: true,
        routeEnabled: true,
        dateEnabled: false,
        slots: [],
        error: null
      };
    }

    const slots =
      await readAvailableSlots(page);

    return {
      route,
      targetDate: targetDateIso,
      processed: true,
      routeEnabled: true,
      dateEnabled: true,
      slots,
      error: null
    };
  } catch (error) {
    console.error(
      `Error en ${targetDateIso} / ${route.code}:`,
      error.message
    );

    await saveDiagnostic(
      page,
      `error-${targetDateIso}-${route.code}`
    );

    return {
      route,
      targetDate: targetDateIso,
      processed: false,
      routeEnabled: false,
      dateEnabled: false,
      slots: [],
      error: error.message
    };
  } finally {
    await page.close();
  }
}

function checkKey(
  targetDate,
  routeCode
) {
  return `${targetDate}|${routeCode}`;
}

function availabilityKey(
  routeCode,
  time
) {
  return `${routeCode}|${time}`;
}

function groupAvailabilityByRoute(
  items
) {
  const groups = new Map();

  for (const item of items) {
    if (
      !groups.has(item.route.code)
    ) {
      groups.set(
        item.route.code,
        {
          route: item.route,
          slots: []
        }
      );
    }

    groups
      .get(item.route.code)
      .slots
      .push(item);
  }

  return [...groups.values()];
}

function buildAvailabilityBody(
  alert,
  items
) {
  const routeSections =
    groupAvailabilityByRoute(items)
      .map(group => {
        const slots = group.slots
          .map(
            item =>
              `• ${item.time} — ${item.seats} ${
                item.seats === 1
                  ? 'cupo'
                  : 'cupos'
              }`
          )
          .join('\n');

        return (
          `Ruta ${group.route.code} — ${group.route.name}\n` +
          slots
        );
      })
      .join('\n\n');

  return (
    `Alerta: ${alert.id}\n` +
    `Fecha: ${formatDatePE(alert.targetDate)}\n` +
    `Cantidad mínima: ${alert.requiredTickets}\n` +
    `Frecuencia: cada ${alert.frequencyMinutes} minutos\n\n` +
    routeSections
  );
}

function buildAvailabilityMessage(
  alert,
  items
) {
  return (
    '🚨 ENTRADAS DISPONIBLES — MACHU PICCHU\n\n' +
    buildAvailabilityBody(
      alert,
      items
    ) +
    `\n\nCompra inmediatamente en:\n${CONFIG.siteUrl}` +
    `\n\nDetectado: ${getLimaTimestamp()}`
  );
}

function buildManualSummary(
  alert,
  routeResults,
  availableItems
) {
  const processed =
    routeResults.filter(
      result => result.processed
    );

  const errors =
    routeResults.filter(
      result => !result.processed
    );

  const unavailableRoutes =
    routeResults.filter(
      result =>
        result.processed &&
        !result.routeEnabled
    );

  const notes = [];

  if (unavailableRoutes.length) {
    notes.push(
      'Rutas no habilitadas en el portal: ' +
      unavailableRoutes
        .map(item => item.route.code)
        .join(', ')
    );
  }

  if (errors.length) {
    notes.push(
      'Rutas con error: ' +
      errors
        .map(item => item.route.code)
        .join(', ')
    );
  }

  const resultText =
    availableItems.length
      ? (
          `Se encontraron cupos:\n\n` +
          buildAvailabilityBody(
            alert,
            availableItems
          )
        )
      : (
          `No se encontraron rutas con al menos ${alert.requiredTickets} cupos disponibles.`
        );

  return (
    '🔎 REVISIÓN MANUAL COMPLETADA\n\n' +
    `Alerta: ${alert.id}\n` +
    `Fecha vigilada: ${formatDatePE(alert.targetDate)}\n` +
    `Rutas procesadas: ${processed.length} de ${alert.routes.length}\n\n` +
    resultText +
    (
      notes.length
        ? `\n\n${notes.join('\n')}`
        : ''
    ) +
    `\n\nRevisado: ${getLimaTimestamp()}`
  );
}

function buildNoAlertsMessage() {
  return (
    'ℹ️ MONITOR MACHU PICCHU\n\n' +
    'La API funciona, pero no existen alertas activas y vigentes en la hoja.'
  );
}

function shouldNotifySystemError(
  lastNotifiedAt,
  nowMs
) {
  const previous = Date.parse(
    String(lastNotifiedAt || '')
  );

  return (
    !Number.isFinite(previous) ||
    nowMs - previous >=
      CONFIG.systemErrorCooldownMs
  );
}

async function main() {
  validateEnvironment();
  ensureDiagnosticDirectory();

  const now = new Date();
  const nowMs = now.getTime();
  const state = loadState();

  let alerts;

  try {
    alerts = await fetchAlerts();

    state.system
      .lastApiErrorNotifiedAt = null;
  } catch (error) {
    console.error(
      'Error consultando la API de alertas:',
      error.message
    );

    if (
      CONFIG.notifyStatus ||
      shouldNotifySystemError(
        state.system
          .lastApiErrorNotifiedAt,
        nowMs
      )
    ) {
      await sendTelegram(
        CONFIG.fallbackChatId,
        '❌ ERROR AL LEER LAS ALERTAS\n\n' +
        `${error.message}\n\nHora: ${getLimaTimestamp()}`
      ).catch(telegramError => {
        console.error(
          'No se pudo avisar por Telegram:',
          telegramError.message
        );
      });

      state.system
        .lastApiErrorNotifiedAt =
          now.toISOString();
    }

    saveState(state);

    process.exitCode = 1;
    return;
  }

  const activeIds = new Set(
    alerts.map(alert => alert.id)
  );

  for (
    const storedId of
    Object.keys(state.alerts)
  ) {
    if (!activeIds.has(storedId)) {
      delete state.alerts[storedId];
    }
  }

  if (!alerts.length) {
    console.log(
      'No existen alertas activas y vigentes.'
    );

    if (CONFIG.notifyStatus) {
      await sendTelegram(
        CONFIG.fallbackChatId,
        buildNoAlertsMessage()
      );
    }

    saveState(state);
    return;
  }

  const dueAlerts = alerts.filter(
    alert =>
      isAlertDue(
        alert,
        state.alerts[alert.id],
        nowMs,
        CONFIG.notifyStatus
      )
  );

  if (!dueAlerts.length) {
    console.log(
      'Ninguna alerta necesita revisión en esta ejecución.'
    );

    saveState(state);
    return;
  }

  console.log(
    'Alertas a procesar:',
    dueAlerts
      .map(
        alert =>
          `${alert.id} (${alert.frequencyMinutes} min)`
      )
      .join(', ')
  );

  const uniqueChecks = new Map();

  for (const alert of dueAlerts) {
    for (
      const routeCode of
      alert.routes
    ) {
      const route =
        ROUTE_BY_CODE.get(
          routeCode
        );

      uniqueChecks.set(
        checkKey(
          alert.targetDate,
          routeCode
        ),
        {
          targetDate:
            alert.targetDate,
          route
        }
      );
    }
  }

  const browser =
    await chromium.launch({
      headless: true
    });

  const context =
    await browser.newContext({
      locale: 'es-PE',
      timezoneId: CONFIG.timeZone,
      viewport: {
        width: 1440,
        height: 1100
      },
      extraHTTPHeaders: {
        'Accept-Language':
          'es-PE,es;q=0.9,en;q=0.8'
      }
    });

  const resultsByCheck =
    new Map();

  try {
    for (
      const [key, check] of
      uniqueChecks
    ) {
      const result =
        await checkRoute(
          context,
          check.route,
          check.targetDate
        );

      resultsByCheck.set(
        key,
        result
      );

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            500
          )
      );
    }
  } finally {
    await context.close();
    await browser.close();
  }

  for (const alert of dueAlerts) {
    const previous =
      state.alerts[alert.id] || {};

    const previousKeys =
      previous.targetDate ===
      alert.targetDate
        ? new Set(
            Array.isArray(
              previous.availableKeys
            )
              ? previous.availableKeys
              : []
          )
        : new Set();

    const routeResults =
      alert.routes
        .map(
          routeCode =>
            resultsByCheck.get(
              checkKey(
                alert.targetDate,
                routeCode
              )
            )
        )
        .filter(Boolean);

    const availableItems =
      routeResults
        .flatMap(
          result =>
            result.slots
              .filter(
                slot =>
                  !slot.disabled &&
                  slot.seats >=
                    alert.requiredTickets
              )
              .map(
                slot => ({
                  key:
                    availabilityKey(
                      result.route.code,
                      slot.time
                    ),
                  route:
                    result.route,
                  time:
                    slot.time,
                  seats:
                    slot.seats
                })
              )
        )
        .sort(
          (a, b) =>
            a.key.localeCompare(
              b.key
            )
        );

    const failedRouteCodes =
      new Set(
        routeResults
          .filter(
            result =>
              !result.processed
          )
          .map(
            result =>
              result.route.code
          )
      );

    const preservedKeys =
      [...previousKeys].filter(
        key =>
          failedRouteCodes.has(
            key.split('|')[0]
          )
      );

    const currentKeys = [
      ...new Set([
        ...preservedKeys,
        ...availableItems.map(
          item => item.key
        )
      ])
    ].sort();

    const newAvailableItems =
      availableItems.filter(
        item =>
          !previousKeys.has(
            item.key
          )
      );

    const allRoutesFailed =
      routeResults.length > 0 &&
      routeResults.every(
        result =>
          !result.processed
      );

    if (CONFIG.notifyStatus) {
      await sendTelegram(
        alert.chatId,
        buildManualSummary(
          alert,
          routeResults,
          availableItems
        )
      );
    } else if (
      newAvailableItems.length > 0
    ) {
      await sendTelegram(
        alert.chatId,
        buildAvailabilityMessage(
          alert,
          availableItems
        )
      );

      console.log(
        `Alerta enviada: ${alert.id}`
      );
    } else {
      console.log(
        `Sin disponibilidad nueva para ${alert.id}.`
      );
    }

    if (
      allRoutesFailed &&
      previous.allRoutesFailed !== true
    ) {
      await sendTelegram(
        alert.chatId,
        '⚠️ NO SE PUDO REVISAR TU ALERTA\n\n' +
        `Alerta: ${alert.id}\n` +
        `Fecha: ${formatDatePE(alert.targetDate)}\n\n` +
        'Ninguna de sus rutas pudo procesarse en esta ejecución.\n' +
        `Hora: ${getLimaTimestamp()}`
      ).catch(error => {
        console.error(
          'No se pudo enviar el aviso de fallo:',
          error.message
        );
      });
    }

    state.alerts[alert.id] = {
      lastCheckedAt:
        now.toISOString(),
      targetDate:
        alert.targetDate,
      availableKeys:
        currentKeys,
      allRoutesFailed,
      frequencyMinutes:
        alert.frequencyMinutes
    };
  }

  saveState(state);
}

await main();
