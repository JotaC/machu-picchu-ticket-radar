import { chromium } from 'playwright';
import fs from 'node:fs';

const CONFIG = Object.freeze({
  siteUrl: 'https://tuboleto.cultura.pe/llaqta_machupicchu',

  circuitText: process.env.TARGET_CIRCUIT || 'Circuito 2',
  routeText: process.env.TARGET_ROUTE || 'Ruta 2-A',
  routeName: process.env.TARGET_ROUTE_NAME || 'Machupicchu Clásico',
  targetDate: process.env.TARGET_DATE || '2026-08-13',

  requiredTickets: Number.parseInt(
    process.env.REQUIRED_TICKETS || '4',
    10
  ),

  notifyStatus:
    String(process.env.NOTIFY_STATUS || 'false').toLowerCase() ===
    'true',

  stateFile: 'state.json',
  diagnosticDirectory: 'diagnostico'
});

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
  const parts = String(isoDate).split('-').map(Number);

  if (parts.length !== 3) {
    return new Date(Number.NaN);
  }

  return new Date(
    Date.UTC(
      parts[0],
      parts[1] - 1,
      parts[2]
    )
  );
}

function formatDatePE(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function getLimaTimestamp() {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(new Date());
}

function validateConfiguration() {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(CONFIG.targetDate)) {
    throw new Error(
      'TARGET_DATE debe tener el formato AAAA-MM-DD.'
    );
  }

  const date = parseISODate(CONFIG.targetDate);

  if (Number.isNaN(date.getTime())) {
    throw new Error('TARGET_DATE no es una fecha válida.');
  }

  if (
    !Number.isInteger(CONFIG.requiredTickets) ||
    CONFIG.requiredTickets < 1
  ) {
    throw new Error(
      'REQUIRED_TICKETS debe ser un número entero mayor que cero.'
    );
  }
}

function ensureDiagnosticDirectory() {
  fs.mkdirSync(
    CONFIG.diagnosticDirectory,
    { recursive: true }
  );
}

async function saveDiagnostic(page, name) {
  ensureDiagnosticDirectory();

  await page
    .screenshot({
      path: `${CONFIG.diagnosticDirectory}/${name}.png`,
      fullPage: true
    })
    .catch(error => {
      console.warn(
        `No se pudo guardar ${name}.png:`,
        error.message
      );
    });

  const html = await page
    .content()
    .catch(() => '');

  if (html) {
    fs.writeFileSync(
      `${CONFIG.diagnosticDirectory}/${name}.html`,
      html,
      'utf8'
    );
  }
}

function configurationKey() {
  return [
    CONFIG.circuitText,
    CONFIG.routeText,
    CONFIG.targetDate,
    CONFIG.requiredTickets
  ].join('|');
}

function loadState() {
  try {
    if (!fs.existsSync(CONFIG.stateFile)) {
      return {
        configKey: '',
        available: false
      };
    }

    const parsed = JSON.parse(
      fs.readFileSync(CONFIG.stateFile, 'utf8')
    );

    return {
      configKey: String(parsed.configKey || ''),
      available: parsed.available === true
    };
  } catch (error) {
    console.warn(
      'No se pudo leer state.json:',
      error.message
    );

    return {
      configKey: '',
      available: false
    };
  }
}

function saveState(available) {
  const newState = {
    configKey: configurationKey(),
    available: available === true,
    lastCheck: new Date().toISOString()
  };

  fs.writeFileSync(
    CONFIG.stateFile,
    JSON.stringify(newState, null, 2) + '\n',
    'utf8'
  );
}

async function sendTelegram(text) {
  const token = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!token || !chatId) {
    throw new Error(
      'No se encontraron BOT_TOKEN o CHAT_ID.'
    );
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        chat_id: chatId,
        text,
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

async function waitForPageReady(page) {
  await page
    .getByText(
      'Adquiere tu boleto',
      { exact: false }
    )
    .waitFor({
      state: 'visible',
      timeout: 60000
    });

  await page.waitForFunction(
    () => {
      const visibleSelects = Array
        .from(document.querySelectorAll('mat-select'))
        .filter(element => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);

          return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== 'hidden' &&
            style.display !== 'none'
          );
        });

      return visibleSelects.length >= 2;
    },
    null,
    { timeout: 60000 }
  );
}

async function findFormField(page, keyword) {
  const fields = page.locator('mat-form-field');
  const count = await fields.count();

  const normalizedKeyword =
    normalizeText(keyword).toLowerCase();

  for (let index = 0; index < count; index++) {
    const field = fields.nth(index);

    if (!(await field.isVisible().catch(() => false))) {
      continue;
    }

    const text = normalizeText(
      await field.innerText().catch(() => '')
    ).toLowerCase();

    if (text.includes(normalizedKeyword)) {
      return field;
    }
  }

  throw new Error(
    `No se encontró el campo correspondiente a: ${keyword}`
  );
}

async function waitForSelectEnabled(select) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const ariaDisabled =
      await select.getAttribute('aria-disabled');

    const disabled =
      await select.getAttribute('disabled');

    if (
      ariaDisabled !== 'true' &&
      disabled === null
    ) {
      return;
    }

    await select.page().waitForTimeout(500);
  }

  throw new Error(
    'El selector continuó deshabilitado.'
  );
}

async function waitForVisibleOptions(page) {
  await page.waitForFunction(
    () => {
      const options = Array.from(
        document.querySelectorAll(
          '[role="option"], mat-option'
        )
      );

      return options.some(element => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none'
        );
      });
    },
    null,
    { timeout: 30000 }
  );
}

async function getVisibleOptions(page) {
  const candidates = page.locator(
    '[role="option"], mat-option'
  );

  const count = await candidates.count();
  const visible = [];

  for (let index = 0; index < count; index++) {
    const candidate = candidates.nth(index);

    if (await candidate.isVisible().catch(() => false)) {
      visible.push(candidate);
    }
  }

  return visible;
}

async function selectMatOption(
  page,
  fieldKeyword,
  optionText,
  diagnosticName
) {
  const field = await findFormField(
    page,
    fieldKeyword
  );

  const select = field
    .locator('mat-select')
    .first();

  await select.waitFor({
    state: 'visible',
    timeout: 30000
  });

  await waitForSelectEnabled(select);

  await select.scrollIntoViewIfNeeded();
  await select.click({ force: true });

  await waitForVisibleOptions(page);

  const options = await getVisibleOptions(page);

  const optionDescriptions = [];

  for (const option of options) {
    optionDescriptions.push(
      normalizeText(
        await option.innerText().catch(() => '')
      )
    );
  }

  console.log(
    `Opciones encontradas para ${fieldKeyword}:`,
    optionDescriptions
  );

  const normalizedTarget =
    normalizeText(optionText).toLowerCase();

  let selectedOption = null;

  for (const option of options) {
    const optionValue = normalizeText(
      await option.innerText().catch(() => '')
    ).toLowerCase();

    if (optionValue.includes(normalizedTarget)) {
      selectedOption = option;
      break;
    }
  }

  if (!selectedOption) {
    await saveDiagnostic(
      page,
      `${diagnosticName}-opcion-no-encontrada`
    );

    throw new Error(
      `No se encontró "${optionText}". Opciones visibles: ` +
      optionDescriptions.join(' | ')
    );
  }

  console.log(
    'Seleccionando:',
    normalizeText(await selectedOption.innerText())
  );

  await selectedOption.click({ force: true });
  await page.waitForTimeout(1000);

  await saveDiagnostic(page, diagnosticName);
}

function parseCalendarMonth(label) {
  const cleanLabel = normalizeText(label)
    .toUpperCase()
    .replace(/\./g, '');

  const parts = cleanLabel.split(' ');

  if (parts.length < 2) {
    return null;
  }

  const month = MONTHS[parts[0]];

  const year = Number.parseInt(
    parts[parts.length - 1],
    10
  );

  if (
    month === undefined ||
    !Number.isInteger(year)
  ) {
    return null;
  }

  return { month, year };
}

async function navigateCalendarToTargetMonth(
  page,
  targetDate
) {
  const targetYear = targetDate.getUTCFullYear();
  const targetMonth = targetDate.getUTCMonth();

  const periodButton = page.locator(
    '.mat-calendar-period-button:visible'
  );

  await periodButton.waitFor({
    state: 'visible',
    timeout: 30000
  });

  for (let attempt = 0; attempt < 60; attempt++) {
    const label = await periodButton.innerText();
    const current = parseCalendarMonth(label);

    if (!current) {
      throw new Error(
        `No se pudo interpretar el mes visible: ${label}`
      );
    }

    console.log('Mes visible:', label);

    const difference =
      (targetYear - current.year) * 12 +
      (targetMonth - current.month);

    if (difference === 0) {
      await page.waitForTimeout(1200);
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

    const previousLabel = normalizeText(label);

    const responsePromise = page
      .waitForResponse(
        response =>
          response
            .url()
            .includes(
              '/visita/consulta-fechas-disponibles'
            ) &&
          response.request().method() === 'POST',
        { timeout: 30000 }
      )
      .catch(() => null);

    await button.click({ force: true });
    await responsePromise;

    await page.waitForFunction(
      oldLabel => {
        const buttonElement = document.querySelector(
          '.mat-calendar-period-button'
        );

        return (
          buttonElement &&
          buttonElement.textContent &&
          buttonElement.textContent.trim() !== oldLabel
        );
      },
      previousLabel,
      { timeout: 10000 }
    ).catch(() => {});

    await page.waitForTimeout(700);
  }

  throw new Error(
    'No se pudo llegar al mes objetivo.'
  );
}

async function openTargetCalendar(page) {
  const dateField = await findFormField(
    page,
    'fecha'
  );

  const input = dateField
    .locator('input')
    .first();

  await input.waitFor({
    state: 'visible',
    timeout: 30000
  });

  const calendar = page.locator(
    'mat-calendar:visible'
  );

  if (!(await calendar.isVisible().catch(() => false))) {
    await input.click({ force: true });
  }

  await calendar.waitFor({
    state: 'visible',
    timeout: 30000
  });

  return calendar;
}

async function selectTargetDay(
  page,
  targetDate
) {
  const targetDay = targetDate.getUTCDate();
  const targetMonth = targetDate.getUTCMonth();
  const targetYear = targetDate.getUTCFullYear();

  const monthName =
    SPANISH_MONTHS[targetMonth];

  const candidates = page.locator(
    'mat-calendar:visible button.mat-calendar-body-cell'
  );

  const count = await candidates.count();

  let fallback = null;

  for (let index = 0; index < count; index++) {
    const candidate = candidates.nth(index);

    const text = normalizeText(
      await candidate.innerText().catch(() => '')
    );

    if (text !== String(targetDay)) {
      continue;
    }

    if (!fallback) {
      fallback = candidate;
    }

    const ariaLabel = normalizeText(
      await candidate.getAttribute('aria-label')
    ).toLowerCase();

    if (
      ariaLabel.includes(String(targetYear)) &&
      ariaLabel.includes(monthName)
    ) {
      fallback = candidate;
      break;
    }
  }

  if (!fallback) {
    throw new Error(
      `No se encontró el día ${targetDay} en el calendario.`
    );
  }

  const ariaDisabled =
    await fallback.getAttribute('aria-disabled');

  const disabledAttribute =
    await fallback.getAttribute('disabled');

  const className = String(
    (await fallback.getAttribute('class')) || ''
  );

  const disabled =
    ariaDisabled === 'true' ||
    disabledAttribute !== null ||
    className.includes('mat-calendar-body-disabled') ||
    (await fallback.isDisabled().catch(() => false));

  if (disabled) {
    console.log(
      'La fecha está deshabilitada y no tiene disponibilidad.'
    );

    return false;
  }

  console.log(
    'La fecha está habilitada.'
  );

  await fallback.click({ force: true });
  await page.waitForTimeout(1500);

  return true;
}

async function readAvailableSlots(page) {
  let scheduleField;

  try {
    scheduleField = await findFormField(
      page,
      'horario'
    );
  } catch {
    console.log(
      'No apareció el campo de horarios.'
    );

    return [];
  }

  const select = scheduleField
    .locator('mat-select')
    .first();

  await select.waitFor({
    state: 'visible',
    timeout: 30000
  });

  await waitForSelectEnabled(select);
  await select.click({ force: true });

  await waitForVisibleOptions(page);

  const options = await getVisibleOptions(page);
  const slots = [];

  for (const option of options) {
    const text = normalizeText(
      await option.innerText().catch(() => '')
    );

    const ariaDisabled =
      await option.getAttribute('aria-disabled');

    const className = String(
      (await option.getAttribute('class')) || ''
    );

    const disabled =
      ariaDisabled === 'true' ||
      className.includes('option-disabled');

    const timeMatch = text.match(
      /(\d{1,2}:\d{2})/
    );

    const seatsMatch = text.match(
      /(\d+)\s+(?:boletos?|entradas?|cupos?)/i
    );

    console.log('Horario observado:', text);

    if (!timeMatch || !seatsMatch) {
      continue;
    }

    slots.push({
      time: timeMatch[1],
      seats: Number.parseInt(seatsMatch[1], 10),
      disabled,
      text
    });
  }

  await page.keyboard.press('Escape');

  return slots;
}

async function checkAvailability(page) {
  console.log('Abriendo:', CONFIG.siteUrl);

  await page.goto(CONFIG.siteUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await waitForPageReady(page);
  await saveDiagnostic(page, '01-pagina-cargada');

  await selectMatOption(
    page,
    'circuito',
    CONFIG.circuitText,
    '02-circuito-seleccionado'
  );

  await selectMatOption(
    page,
    'ruta',
    CONFIG.routeText,
    '03-ruta-seleccionada'
  );

  await openTargetCalendar(page);

  const targetDate = parseISODate(
    CONFIG.targetDate
  );

  await navigateCalendarToTargetMonth(
    page,
    targetDate
  );

  await saveDiagnostic(
    page,
    '04-mes-objetivo'
  );

  const dateEnabled = await selectTargetDay(
    page,
    targetDate
  );

  if (!dateEnabled) {
    return {
      dateEnabled: false,
      slots: [],
      matchingSlots: []
    };
  }

  await saveDiagnostic(
    page,
    '05-fecha-seleccionada'
  );

  const slots = await readAvailableSlots(page);

  await saveDiagnostic(
    page,
    '06-horarios'
  );

  const matchingSlots = slots.filter(
    slot =>
      !slot.disabled &&
      slot.seats >= CONFIG.requiredTickets
  );

  return {
    dateEnabled: true,
    slots,
    matchingSlots
  };
}

function buildAvailabilityMessage(matchingSlots) {
  const slotsText = matchingSlots
    .map(
      slot =>
        `• ${slot.time} — ${slot.seats} ` +
        (slot.seats === 1 ? 'cupo' : 'cupos')
    )
    .join('\n');

  return (
    '🚨 ENTRADAS DISPONIBLES — MACHU PICCHU\n\n' +
    `Ruta: ${CONFIG.routeText} — ${CONFIG.routeName}\n` +
    `Fecha: ${formatDatePE(CONFIG.targetDate)}\n` +
    `Cantidad requerida: ${CONFIG.requiredTickets}\n\n` +
    `Horarios encontrados:\n${slotsText}\n\n` +
    `Comprar ahora:\n${CONFIG.siteUrl}\n\n` +
    `Detectado: ${getLimaTimestamp()}`
  );
}

function buildNoAvailabilityMessage(result) {
  let detail;

  if (!result.dateEnabled) {
    detail =
      'La fecha continúa deshabilitada en el calendario.';
  } else if (result.slots.length === 0) {
    detail =
      'La fecha estaba habilitada, pero no se encontraron horarios disponibles.';
  } else {
    const slotsText = result.slots
      .map(
        slot =>
          `${slot.time}: ${slot.seats} ` +
          (slot.seats === 1 ? 'cupo' : 'cupos')
      )
      .join(', ');

    detail =
      `No existe un horario con al menos ` +
      `${CONFIG.requiredTickets} cupos. ` +
      `Horarios observados: ${slotsText}.`;
  }

  return (
    '🔎 REVISIÓN MANUAL COMPLETADA\n\n' +
    `Ruta: ${CONFIG.routeText}\n` +
    `Fecha: ${formatDatePE(CONFIG.targetDate)}\n` +
    `Cantidad requerida: ${CONFIG.requiredTickets}\n\n` +
    `${detail}\n\n` +
    `Revisado: ${getLimaTimestamp()}`
  );
}

async function main() {
  validateConfiguration();
  ensureDiagnosticDirectory();

  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    locale: 'es-PE',
    timezoneId: 'America/Lima',

    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/149.0.0.0 Safari/537.36',

    viewport: {
      width: 1440,
      height: 1100
    },

    extraHTTPHeaders: {
      'Accept-Language':
        'es-PE,es;q=0.9,en;q=0.8'
    }
  });

  const page = await context.newPage();

  page.setDefaultTimeout(30000);

  page.on('requestfailed', request => {
    console.warn(
      'Solicitud fallida:',
      request.url(),
      request.failure()?.errorText || ''
    );
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      console.warn(
        'Respuesta HTTP:',
        response.status(),
        response.url()
      );
    }
  });

  try {
    const previousState = loadState();

    const wasAvailable =
      previousState.configKey === configurationKey() &&
      previousState.available;

    const result = await checkAvailability(page);

    console.log(
      JSON.stringify(result, null, 2)
    );

    const isAvailable =
      result.matchingSlots.length > 0;

    saveState(isAvailable);

    if (isAvailable) {
      if (!wasAvailable) {
        await sendTelegram(
          buildAvailabilityMessage(
            result.matchingSlots
          )
        );

        console.log(
          'Alerta de disponibilidad enviada.'
        );
      } else {
        console.log(
          'La disponibilidad continúa activa; no se repite la alerta.'
        );

        if (CONFIG.notifyStatus) {
          await sendTelegram(
            '✅ REVISIÓN MANUAL\n\n' +
            'Las entradas continúan disponibles.\n\n' +
            buildAvailabilityMessage(
              result.matchingSlots
            )
          );
        }
      }

      return;
    }

    console.log(
      'No se encontraron cupos suficientes.'
    );

    if (CONFIG.notifyStatus) {
      await sendTelegram(
        buildNoAvailabilityMessage(result)
      );
    }
  } catch (error) {
    console.error(
      error.stack ||
      error.message ||
      String(error)
    );

    await saveDiagnostic(
      page,
      '99-error-final'
    );

    if (CONFIG.notifyStatus) {
      await sendTelegram(
        '❌ ERROR EN LA REVISIÓN MANUAL\n\n' +
        `${error.message || String(error)}\n\n` +
        `Hora: ${getLimaTimestamp()}`
      ).catch(telegramError => {
        console.error(
          'No se pudo enviar el error a Telegram:',
          telegramError.message
        );
      });
    }

    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

await main();
