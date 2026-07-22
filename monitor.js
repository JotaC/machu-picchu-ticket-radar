name: Monitor Machu Picchu

on:
  # Permite realizar pruebas manuales.
  workflow_dispatch:

  # Ejecuta el monitor aproximadamente cada 10 minutos.
  schedule:
    - cron: "7,17,27,37,47,57 * * * *"

permissions:
  contents: write

# Evita que dos revisiones se ejecuten simultáneamente.
concurrency:
  group: monitor-machu-picchu
  cancel-in-progress: false

jobs:
  revisar-disponibilidad:
    runs-on: ubuntu-latest

    # Ahora se revisan las diez rutas.
    timeout-minutes: 15

    env:
      BOT_TOKEN: ${{ secrets.BOT_TOKEN }}
      CHAT_ID: ${{ secrets.CHAT_ID }}

      # Cantidad mínima necesaria en un mismo horario.
      REQUIRED_TICKETS: "4"

      # La prueba manual envía un resumen aunque no haya cupos.
      # Las ejecuciones automáticas solo avisan si aparecen entradas.
      NOTIFY_STATUS: ${{ github.event_name == 'workflow_dispatch' && 'true' || 'false' }}

    steps:
      - name: Descargar repositorio
        uses: actions/checkout@v4

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Instalar dependencias
        run: npm install

      - name: Instalar Chromium
        run: npx playwright install --with-deps chromium

      - name: Revisar disponibilidad
        run: npm run monitor

      # Elimina la hora de la última revisión para evitar
      # crear un commit nuevo cada diez minutos cuando
      # la disponibilidad no haya cambiado.
      - name: Normalizar estado
        if: always()
        run: |
          if [ -f state.json ]; then
            node - <<'NODE'
            const fs = require('node:fs');

            const state = JSON.parse(
              fs.readFileSync('state.json', 'utf8')
            );

            delete state.lastCheck;

            fs.writeFileSync(
              'state.json',
              JSON.stringify(state, null, 2) + '\n',
              'utf8'
            );
            NODE
          fi

      - name: Guardar estado del monitor
        if: always()
        run: |
          if [ ! -f state.json ]; then
            echo "No se generó state.json."
            exit 0
          fi

          git config user.name "Monitor Machu Picchu"
          git config user.email "actions@github.com"

          git add state.json

          if git diff --cached --quiet; then
            echo "La disponibilidad no cambió."
            exit 0
          fi

          git commit -m "Actualizar estado del monitor [skip ci]"
          git pull --rebase
          git push

      - name: Guardar diagnóstico
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: diagnostico-${{ github.run_number }}
          path: diagnostico/
          if-no-files-found: ignore
          retention-days: 7
