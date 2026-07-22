import { chromium } from 'playwright';
import fs from 'node:fs';

/* ============================================================
 * CONFIGURACIÓN
 * ============================================================
 *
 * Estos valores también podrán cambiarse desde GitHub Actions.
 */

const CONFIG = Object.freeze({
  siteUrl:
    'https://tuboleto.cultura.pe/llaqta_machupicchu',

  circuitText:
    process.env.TARGET_CIRCUIT ||
    'Circuito 2',

  routeText:
    process.env.TARGET_ROUTE ||
    'Ruta 2-A',

  routeName:
    process.env.TARGET_ROUTE_NAME ||
    'Machupicchu Clásico',

  targetDate:
    process.env.TARGET_DATE ||
    '2026-08-13',

  requiredTickets:
    Number.parseInt(
      process.env.REQUIRED_TICKETS || '4',
      10
    ),

  /*
   * En una ejecución manual enviaremos también
   * el resultado cuando no haya entradas.
   */
  notifyStatus:
    String(
      process.env.NOTIFY_STATUS || 'false'
    ).toLowerCase() === 'true',

  stateFile:
    'state.json',

  screenshotFile:
    'debug.png'
});


/* ============================================================
 * MESES DEL CALENDARIO
 * ============================================================
 */

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


/* ============================================================
 * VALIDACIÓN
 * ============================================================
 */

function validateConfiguration() {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      CONFIG.targetDate
    )
  ) {
    throw new Error(
      'TARGET_DATE debe tener el formato AAAA-MM-DD.'
    );
  }

  const date = parseISODate(
    CONFIG.targetDate
  );

  if (
    Number.isNaN(date.getTime())
  ) {
    throw new Error(
      'TARGET_DATE no contiene una fecha válida.'
    );
  }

  if (
    !Number.isInteger(
      CONFIG.requiredTickets
    ) ||
    CONFIG.requiredTickets < 1
  ) {
    throw new Error(
      'REQUIRED_TICKETS debe ser un número entero mayor que cero.'
    );
  }
}


/* ============================================================
 * FUNCIONES DE TEXTO Y FECHAS
 * ============================================================
 */

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}


function parseISODate(isoDate) {
  const [
    year,
    month,
    day
  ] = isoDate
    .split('-')
    .map(Number);

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );
}


function formatDatePE(isoDate) {
  const [
    year,
    month,
    day
  ] = isoDate.split('-');

  return (
    day +
    '/' +
    month +
    '/' +
    year
  );
}


function getLimaTimestamp() {
  return new Intl.DateTimeFormat(
    'es-PE',
    {
      timeZone:
        'America/Lima',

      dateStyle:
        'short',

      timeStyle:
        'medium'
    }
  ).format(
    new Date()
  );
}


function parseCalendarMonth(label) {
  const cleanLabel =
    normalizeText(label)
      .toUpperCase()
      .replace(/\./g, '');

  const parts =
    cleanLabel.split(' ');

  if (
    parts.length < 2
  ) {
    return null;
  }

  const month =
    MONTHS[parts[0]];

  const year =
    Number.parseInt(
      parts[parts.length - 1],
      10
    );

  if (
    month === undefined ||
    !Number.isInteger(year)
  ) {
    return null;
  }

  return {
    month,
    year
  };
}


/* ============================================================
 * ESTADO PARA EVITAR ALERTAS REPETIDAS
 * ============================================================
 */

function getConfigurationKey() {
  return [
    CONFIG.circuitText,
    CONFIG.routeText,
    CONFIG.targetDate,
    CONFIG.requiredTickets
  ].join('|');
}


function loadState() {
  try {
    if (
      !fs.existsSync(
        CONFIG.stateFile
      )
    ) {
      return {
        configKey: '',
        available: false
      };
    }

    const content =
      fs.readFileSync(
        CONFIG.stateFile,
        'utf8'
      );

    const state =
      JSON.parse(content);

    return {
      configKey:
        String(
          state.configKey || ''
        ),

      available:
        state.available === true
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


function saveState(
  available
) {
  const newState = {
    configKey:
      getConfigurationKey(),

    available:
      available === true
  };

  const previousState =
    loadState();

  if (
    previousState.configKey ===
      newState.configKey &&
    previousState.available ===
      newState.available
  ) {
    return false;
  }

  fs.writeFileSync(
    CONFIG.stateFile,
    JSON.stringify(
      newState,
      null,
      2
    ) + '\n',
    'utf8'
  );

  return true;
}


/* ============================================================
 * TELEGRAM
 * ============================================================
 */

async function sendTelegram(
  text
) {
  const token =
    process.env.BOT_TOKEN;

  const chatId =
    process.env.CHAT_ID;

  if (
    !token ||
    !chatId
  ) {
    throw new Error(
      'No se encontraron BOT_TOKEN o CHAT_ID.'
    );
  }

  const url =
    `https://api.telegram.org/bot${token}/sendMessage`;

  const response =
    await fetch(
      url,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body:
          JSON.stringify({
            chat_id:
              chatId,

            text,

            disable_web_page_preview:
              false
          })
      }
    );

  const responseText =
    await response.text();

  if (
    !response.ok
  ) {
    throw new Error(
      'Telegram respondió con HTTP ' +
      response.status +
      ': ' +
      responseText
    );
  }

  const result =
    JSON.parse(
      responseText
    );

  if (
    !result.ok
  ) {
    throw new Error(
      'Telegram rechazó el mensaje: ' +
      responseText
    );
  }
}


/* ============================================================
 * SELECCIÓN DE CIRCUITO Y RUTA
 * ============================================================
 */

async function selectMatOption(
  page,
  selectIndex,
  optionText
) {
  const select =
    page
      .locator('mat-select')
      .nth(selectIndex);

  await select.waitFor({
    state: 'visible',
    timeout: 45000
  });

  await select.click();

  const option =
    page
      .locator(
        'mat-option:visible'
      )
      .filter({
        hasText:
          optionText
      })
      .first();

  await option.waitFor({
    state: 'visible',
    timeout: 30000
  });

  const completeText =
    normalizeText(
      await option.innerText()
    );

  console.log(
    'Seleccionando:',
    completeText
  );

  await option.click();
}


/* ============================================================
 * NAVEGACIÓN DEL CALENDARIO
 * ============================================================
 */

async function navigateCalendarToTargetMonth(
  page,
  targetDate
) {
  const targetYear =
    targetDate.getUTCFullYear();

  const targetMonth =
    targetDate.getUTCMonth();

  const periodButton =
    page.locator(
      '.mat-calendar-period-button'
    );

  await periodButton.waitFor({
    state: 'visible',
    timeout: 30000
  });

  /*
   * Límite de 60 movimientos para evitar
   * un bucle infinito.
   */
  for (
    let attempt = 0;
    attempt < 60;
    attempt++
  ) {
    const label =
      await periodButton.innerText();

    const current =
      parseCalendarMonth(
        label
      );

    if (
      !current
    ) {
      throw new Error(
        'No se pudo interpretar el mes del calendario: ' +
        label
      );
    }

    console.log(
      'Mes visible:',
      label
    );

    const difference =
      (
        targetYear -
        current.year
      ) * 12 +
      (
        targetMonth -
        current.month
      );

    if (
      difference === 0
    ) {
      return;
    }

    const navigationButton =
      difference > 0
        ? page.locator(
          '.mat-calendar-next-button'
        )
        : page.locator(
          '.mat-calendar-previous-button'
        );

    await navigationButton.click();

    await page.waitForTimeout(
      350
    );
  }

  throw new Error(
    'No se pudo llegar al mes objetivo.'
  );
}


/**
 * Devuelve true cuando la fecha está habilitada.
 */
async function selectTargetDay(
  page,
  targetDate
) {
  const targetDay =
    targetDate.getUTCDate();

  const targetYear =
    targetDate.getUTCFullYear();

  const candidates =
    page
      .locator(
        'button.mat-calendar-body-cell'
      )
      .filter({
        hasText:
          new RegExp(
            '^\\s*' +
            targetDay +
            '\\s*$'
          )
      });

  const count =
    await candidates.count();

  if (
    count === 0
  ) {
    throw new Error(
      'No se encontró el día ' +
      targetDay +
      ' en el calendario.'
    );
  }

  let selectedCell =
    candidates.first();

  /*
   * Si existe más de una coincidencia,
   * priorizamos la que tenga el año objetivo
   * en su etiqueta accesible.
   */
  for (
    let index = 0;
    index < count;
    index++
  ) {
    const candidate =
      candidates.nth(index);

    const ariaLabel =
      normalizeText(
        await candidate.getAttribute(
          'aria-label'
        )
      );

    if (
      ariaLabel.includes(
        String(targetYear)
      )
    ) {
      selectedCell =
        candidate;

      break;
    }
  }

  const ariaDisabled =
    await selectedCell.getAttribute(
      'aria-disabled'
    );

  const className =
    String(
      await selectedCell.getAttribute(
        'class'
      ) || ''
    );

  const disabledAttribute =
    await selectedCell.getAttribute(
      'disabled'
    );

  const isDisabled =
    ariaDisabled === 'true' ||
    disabledAttribute !== null ||
    className.includes(
      'mat-calendar-body-disabled'
    ) ||
    await selectedCell
      .isDisabled()
      .catch(
        () => false
      );

  if (
    isDisabled
  ) {
    console.log(
      'La fecha está deshabilitada.'
    );

    return false;
  }

  console.log(
    'La fecha está habilitada.'
  );

  await selectedCell.click();

  return true;
}


/* ============================================================
 * CONSULTA DE HORARIOS Y CUPOS
 * ============================================================
 */

async function readAvailableSlots(
  page
) {
  /*
   * Después de escoger la fecha aparece:
   * 0: circuito
   * 1: ruta
   * 2: horario
   */
  const scheduleSelect =
    page
      .locator('mat-select')
      .nth(2);

  await scheduleSelect.waitFor({
    state: 'visible',
    timeout: 30000
  });

  await scheduleSelect.click();

  const options =
    page.locator(
      'mat-option:visible'
    );

  await options.first().waitFor({
    state: 'visible',
    timeout: 30000
  });

  const optionCount =
    await options.count();

  const slots = [];

  for (
    let index = 0;
    index < optionCount;
    index++
  ) {
    const option =
      options.nth(index);

    const text =
      normalizeText(
        await option.innerText()
      );

    const ariaDisabled =
      await option.getAttribute(
        'aria-disabled'
      );

    const className =
      String(
        await option.getAttribute(
          'class'
        ) || ''
      );

    const isDisabled =
      ariaDisabled === 'true' ||
      className.includes(
        'mat-mdc-option-disabled'
      ) ||
      className.includes(
        'mat-option-disabled'
      );

    const timeMatch =
      text.match(
        /(\d{1,2}:\d{2})/
      );

    const seatsMatch =
      text.match(
        /(\d+)\s+boletos?/i
      );

    if (
      !timeMatch ||
      !seatsMatch
    ) {
      console.log(
        'Opción no interpretada:',
        text
      );

      continue;
    }

    const seats =
      Number.parseInt(
        seatsMatch[1],
        10
      );

    slots.push({
      time:
        timeMatch[1],

      seats,

      disabled:
        isDisabled,

      text
    });
  }

  /*
   * Cierra el panel de opciones sin elegir un horario.
   */
  await page.keyboard.press(
    'Escape'
  );

  return slots;
}


/* ============================================================
 * REVISIÓN DE TU BOLETO
 * ============================================================
 */

async function checkAvailability(
  page
) {
  console.log(
    'Abriendo:',
    CONFIG.siteUrl
  );

  await page.goto(
    CONFIG.siteUrl,
    {
      waitUntil:
        'domcontentloaded',

      timeout:
        60000
    }
  );

  await page
    .getByText(
      'Adquiere tu boleto',
      {
        exact: false
      }
    )
    .waitFor({
      state: 'visible',
      timeout: 60000
    });

  await selectMatOption(
    page,
    0,
    CONFIG.circuitText
  );

  await page.waitForTimeout(
    800
  );

  await selectMatOption(
    page,
    1,
    CONFIG.routeText
  );

  await page.waitForTimeout(
    1200
  );

  const dateInput =
    page
      .locator(
        'input[matinput][readonly]'
      )
      .first();

  await dateInput.waitFor({
    state: 'visible',
    timeout: 30000
  });

  /*
   * La página suele abrir el calendario
   * automáticamente. Si no está abierto,
   * hacemos clic en el campo de fecha.
   */
  const calendar =
    page.locator(
      'mat-calendar'
    );

  if (
    !await calendar
      .isVisible()
      .catch(
        () => false
      )
  ) {
    await dateInput.click();
  }

  await calendar.waitFor({
    state: 'visible',
    timeout: 30000
  });

  const targetDate =
    parseISODate(
      CONFIG.targetDate
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

  if (
    !dateEnabled
  ) {
    return {
      dateEnabled:
        false,

      slots:
        [],

      matchingSlots:
        []
    };
  }

  await page.waitForTimeout(
    1500
  );

  const slots =
    await readAvailableSlots(
      page
    );

  const matchingSlots =
    slots.filter(
      slot =>
        !slot.disabled &&
        slot.seats >=
          CONFIG.requiredTickets
    );

  return {
    dateEnabled:
      true,

    slots,

    matchingSlots
  };
}


/* ============================================================
 * MENSAJES
 * ============================================================
 */

function buildAvailabilityMessage(
  matchingSlots
) {
  const slotsText =
    matchingSlots
      .map(
        slot =>
          '• ' +
          slot.time +
          ' — ' +
          slot.seats +
          (
            slot.seats === 1
              ? ' cupo'
              : ' cupos'
          )
      )
      .join('\n');

  return (
    '🚨 ENTRADAS DISPONIBLES — MACHU PICCHU\n\n' +
    'Ruta: ' +
    CONFIG.routeText +
    ' — ' +
    CONFIG.routeName +
    '\n' +
    'Fecha: ' +
    formatDatePE(
      CONFIG.targetDate
    ) +
    '\n' +
    'Cantidad requerida: ' +
    CONFIG.requiredTickets +
    '\n\n' +
    'Horarios encontrados:\n' +
    slotsText +
    '\n\n' +
    'Compra inmediatamente en:\n' +
    CONFIG.siteUrl +
    '\n\n' +
    'Detectado: ' +
    getLimaTimestamp()
  );
}


function buildNoAvailabilityMessage(
  result
) {
  let detail;

  if (
    !result.dateEnabled
  ) {
    detail =
      'La fecha continúa deshabilitada en el calendario.';

  } else if (
    result.slots.length === 0
  ) {
    detail =
      'La fecha estaba habilitada, pero no se encontraron horarios legibles.';

  } else {
    const slotsText =
      result.slots
        .map(
          slot =>
            slot.time +
            ': ' +
            slot.seats +
            (
              slot.seats === 1
                ? ' cupo'
                : ' cupos'
            )
        )
        .join(', ');

    detail =
      'No existe un horario con al menos ' +
      CONFIG.requiredTickets +
      ' cupos. Horarios observados: ' +
      slotsText +
      '.';
  }

  return (
    '🔎 REVISIÓN MANUAL COMPLETADA\n\n' +
    'Ruta: ' +
    CONFIG.routeText +
    '\n' +
    'Fecha: ' +
    formatDatePE(
      CONFIG.targetDate
    ) +
    '\n' +
    'Cantidad requerida: ' +
    CONFIG.requiredTickets +
    '\n\n' +
    detail +
    '\n\n' +
    'Revisado: ' +
    getLimaTimestamp()
  );
}


/* ============================================================
 * EJECUCIÓN PRINCIPAL
 * ============================================================
 */

async function main() {
  validateConfiguration();

  const browser =
    await chromium.launch({
      headless: true
    });

  const context =
    await browser.newContext({
      locale:
        'es-PE',

      timezoneId:
        'America/Lima',

      viewport: {
        width: 1440,
        height: 1000
      }
    });

  const page =
    await context.newPage();

  page.setDefaultTimeout(
    30000
  );

  page.on(
    'console',
    message => {
      if (
        message.type() === 'error'
      ) {
        console.log(
          'Error de la página:',
          message.text()
        );
      }
    }
  );

  try {
    const previousState =
      loadState();

    const sameConfiguration =
      previousState.configKey ===
      getConfigurationKey();

    const wasAvailable =
      sameConfiguration &&
      previousState.available;

    const result =
      await checkAvailability(
        page
      );

    const isAvailable =
      result.matchingSlots.length > 0;

    console.log(
      JSON.stringify(
        result,
        null,
        2
      )
    );

    if (
      isAvailable
    ) {
      /*
       * Solo envía alerta cuando cambia
       * de no disponible a disponible.
       */
      if (
        !wasAvailable
      ) {
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

        if (
          CONFIG.notifyStatus
        ) {
          await sendTelegram(
            '✅ REVISIÓN MANUAL\n\n' +
            'Las entradas continúan disponibles.\n\n' +
            buildAvailabilityMessage(
              result.matchingSlots
            )
          );
        }
      }

      saveState(
        true
      );

      return;
    }

    /*
     * Cuando vuelve a agotarse, dejamos
     * preparado el sistema para enviar una
     * nueva alerta en la próxima liberación.
     */
    saveState(
      false
    );

    console.log(
      'No se encontraron cupos suficientes.'
    );

    if (
      CONFIG.notifyStatus
    ) {
      await sendTelegram(
        buildNoAvailabilityMessage(
          result
        )
      );
    }

  } catch (error) {
    console.error(
      error.stack ||
      error.message ||
      String(error)
    );

    await page
      .screenshot({
        path:
          CONFIG.screenshotFile,

        fullPage:
          true
      })
      .catch(
        screenshotError => {
          console.error(
            'No se pudo crear la captura:',
            screenshotError.message
          );
        }
      );

    if (
      CONFIG.notifyStatus
    ) {
      await sendTelegram(
        '❌ ERROR EN LA REVISIÓN MANUAL\n\n' +
        (
          error.message ||
          String(error)
        ) +
        '\n\nHora: ' +
        getLimaTimestamp()
      ).catch(
        telegramError => {
          console.error(
            'No se pudo enviar el error a Telegram:',
            telegramError.message
          );
        }
      );
    }

    process.exitCode = 1;

  } finally {
    await browser.close();
  }
}


await main();
