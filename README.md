# Time Tracker

App web local para contabilizar la jornada laboral. Hecha con React + TypeScript + Vite + Tailwind CSS. Todos los datos se guardan en el `localStorage` del navegador, sin backend ni servidor.

## Funcionalidades

- **Cronómetro por intervalos**: inicia y detiene un intervalo de trabajo cuando quieras; cada tramo queda guardado por separado.
- **Reloj de jornada**: total de horas trabajadas hoy y en la semana, con barra de progreso respecto a tu objetivo configurado.
- **Historial**: gráfico mensual de horas trabajadas por día (con línea de objetivo diario) y listado de días registrados, expandibles para revisar o editar sus intervalos.
- **Calendario**: festivos (con preset de Barcelona incluido) y días de vacaciones marcados manualmente, con contador de vacaciones restantes en el año.
- **Edición manual de intervalos**: corrige la hora de inicio/fin o añade una nota a cualquier intervalo, tanto en "Hoy" como en el Historial.
- **Modo oscuro**: interruptor en Configuración, con detección inicial de la preferencia del sistema.
- **Configuración**: horas objetivo por día/semana, días de vacaciones anuales, gestión de festivos (cargar preset, añadir/eliminar), y exportación de una copia de seguridad en JSON.

## Desarrollo

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
npm run preview
```
