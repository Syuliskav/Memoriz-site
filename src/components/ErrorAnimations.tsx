import React, { useEffect, useState } from 'react';

interface ErrorAnimationsProps {
  isPageSettled?: boolean;
}

/**
 * PendantLightFixture
 * Renders the 3-lamp hanging chandelier SVG at the top of the screen.
 * Generates an architectural point-by-point vector assembly animation:
 * 1. Ceiling anchor points lock in at the top ceiling boundary.
 * 2. Vector paths and intermediate nodes descend sequentially from top to bottom.
 * 3. Filaments ignite sequentially inside each lamp hood with zero coordinate displacement.
 * 4. Solidifies smoothly into the 25% opacity watermark.
 */
/**
 * PendantLightFixture
 * Renders the 3-lamp hanging chandelier SVG (#Capa_1 geometric structure) at the top of the screen.
 * Implements a strictly procedural vector drawing animation based on anchor coordinates:
 * 1. Constant linear tracing velocity (Duration = Length / Velocity).
 * 2. Strict top-to-bottom topological cascade starting from ceiling anchor points down to lamp bulbs.
 * 3. Strict Left-to-Right orientation on all horizontal segments (x1 < x2).
 * 4. Filaments ignite upon completion of each respective bulb.
 * 5. Zero clip-path/mask, zero coordinate displacement, theme compliant (var(--theme-accent) / rgb(70% 0% 0%)).
 */
export const PendantLightFixture: React.FC<ErrorAnimationsProps> = ({ isPageSettled = true }) => {
  const [animKey, setAnimKey] = useState(0);

  // Trigger vector tracing assembly whenever the page settles 100% on screen
  useEffect(() => {
    if (isPageSettled) {
      setAnimKey(prev => prev + 1);
    }
  }, [isPageSettled]);

  return (
    <div
      key={animKey}
      className={`relative select-none transition-opacity duration-300 verified-badge-watermark ${
        isPageSettled ? 'opacity-25' : 'opacity-0 pointer-events-none'
      }`}
      style={{ width: '100%', maxWidth: '240px' }}
      aria-hidden="true"
    >
      <style>{`
        .verified-badge-watermark {
          color: var(--theme-accent);
        }
        html[data-theme="night"] .verified-badge-watermark,
        html[data-theme="amber"] .verified-badge-watermark,
        [data-theme="night"] .verified-badge-watermark,
        [data-theme="amber"] .verified-badge-watermark {
          color: rgb(70% 0% 0%);
        }

        /* Procedural line drawing keyframe with zero dot artifact before delay */
        @keyframes draw-vector {
          0% {
            opacity: 1;
            stroke-dashoffset: var(--path-len);
          }
          100% {
            opacity: 1;
            stroke-dashoffset: 0;
          }
        }

        /* Filament sequential ignition strictly cascading top to bottom */
        @keyframes filament-ignite {
          0% { opacity: 0; fill-opacity: 0; stroke-opacity: 0; }
          100% { opacity: 1; fill-opacity: 1; stroke-opacity: 1; }
        }

        .fixture-vector {
          stroke: currentColor;
          fill: none;
          stroke-linecap: round;
          stroke-miterlimit: 10;
          stroke-width: 27px;
          stroke-dasharray: var(--path-len);
          stroke-dashoffset: var(--path-len);
        }

        .fixture-drawing {
          opacity: 0;
          animation: draw-vector var(--dur) linear var(--del) forwards;
        }

        .fixture-static {
          opacity: 1;
          stroke-dashoffset: 0;
        }
      `}</style>

      <svg
        viewBox="0 0 800 800"
        fill="none"
        stroke="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ overflow: 'visible' }}
      >
        <g id="Capa_1" fill="none" stroke="currentColor">
          {/* =========================================================================
              BASE DO TETO (Níveis 0 a 2)
              ========================================================================= */}
          {/* Nível 0: Encaixe-da-base (Y = 13.56) | L = 461.02 | Dur = 0.461s | Delay = 0s */}
          <line
            id="Encaixe-da-base"
            className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
            x1="169.49"
            y1="13.56"
            x2="630.51"
            y2="13.56"
            style={{
              ['--path-len' as any]: '461.02',
              ['--dur' as any]: '0.461s',
              ['--del' as any]: '0s',
            }}
          />

          {/* Nível 1: Descida dos suportes da base (Y = 13.56 -> 67.8) | L = 54.24 | Dur = 0.054s | Delay = 0.461s */}
          <line
            id="Linha-Esquerda-da-Base"
            className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
            x1="223.73"
            y1="13.56"
            x2="223.73"
            y2="67.8"
            style={{
              ['--path-len' as any]: '54.24',
              ['--dur' as any]: '0.054s',
              ['--del' as any]: '0.461s',
            }}
          />
          <line
            id="Linah-Direita-da-Base"
            className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
            x1="576.27"
            y1="13.56"
            x2="576.27"
            y2="67.8"
            style={{
              ['--path-len' as any]: '54.24',
              ['--dur' as any]: '0.054s',
              ['--del' as any]: '0.461s',
            }}
          />

          {/* Nível 2: Linha Principal da Base (Y = 67.8) | L = 352.54 | Dur = 0.353s | Delay = 0.515s */}
          <line
            id="Linha-Prinicipal-da-Base"
            className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
            x1="223.73"
            y1="67.8"
            x2="576.27"
            y2="67.8"
            style={{
              ['--path-len' as any]: '352.54',
              ['--dur' as any]: '0.353s',
              ['--del' as any]: '0.515s',
            }}
          />

          {/* =========================================================================
              CABOS VERTICAIS (Nível 3 - Descida a partir de Y = 67.8 às 0.868s)
              ========================================================================= */}
          <line
            id="Corrente-Esquerda"
            className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
            x1="264.41"
            y1="67.8"
            x2="264.41"
            y2="298.31"
            style={{
              ['--path-len' as any]: '230.51',
              ['--dur' as any]: '0.231s',
              ['--del' as any]: '0.868s',
            }}
          />
          <line
            id="Corrente-Direita"
            className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
            x1="535.59"
            y1="67.8"
            x2="535.59"
            y2="433.9"
            style={{
              ['--path-len' as any]: '366.10',
              ['--dur' as any]: '0.366s',
              ['--del' as any]: '0.868s',
            }}
          />
          <line
            id="Corrente-do-Meio"
            className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
            x1="400"
            y1="67.8"
            x2="400"
            y2="569.49"
            style={{
              ['--path-len' as any]: '501.69',
              ['--dur' as any]: '0.502s',
              ['--del' as any]: '0.868s',
            }}
          />

          {/* =========================================================================
              CONJUNTO ESQUERDO (Inicia quando Corrente-Esquerda chega em Y = 298.31 às 1.099s)
              1. Base-do-Bocal-Esquerdo: L = 54.24 | Dur = 0.054s | Del = 1.099s
              2. Laterais do Bocal: L = 87.07 | Dur = 0.087s | Del = 1.153s
              3. Trava do Bocal: L = 54.24 | Dur = 0.054s | Del = 1.240s
              4. Bulbo Contínuo: L = 295.34 | Dur = 0.295s | Del = 1.294s (termina em 1.589s)
              5. Filamento: Acende em 1.589s
              ========================================================================= */}
          <g id="Conjunto-Esquerdo">
            <line
              id="Base-do-Bocal-Esquerdo"
              className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
              x1="237.29"
              y1="298.31"
              x2="291.53"
              y2="298.31"
              style={{
                ['--path-len' as any]: '54.24',
                ['--dur' as any]: '0.054s',
                ['--del' as any]: '1.099s',
              }}
            />
            <line
              id="Bocal-Esquerdo-LadoE"
              className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
              x1="237.29"
              y1="298.31"
              x2="237.29"
              y2="385.38"
              style={{
                ['--path-len' as any]: '87.07',
                ['--dur' as any]: '0.087s',
                ['--del' as any]: '1.153s',
              }}
            />
            <line
              id="Bocal-Esquerdo-LadoD"
              className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
              x1="291.53"
              y1="298.31"
              x2="291.53"
              y2="385.38"
              style={{
                ['--path-len' as any]: '87.07',
                ['--dur' as any]: '0.087s',
                ['--del' as any]: '1.153s',
              }}
            />
            <line
              id="Bocal-Esquerdo-Trava"
              className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
              x1="237.29"
              y1="352.54"
              x2="291.53"
              y2="352.54"
              style={{
                ['--path-len' as any]: '54.24',
                ['--dur' as any]: '0.054s',
                ['--del' as any]: '1.240s',
              }}
            />
            {/* Bulbo contínuo sem quebras */}
            <path
              id="Bulbo-Esquerdo"
              className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
              d="M237.35,385.28c-23.98,10.45-40.74,34.36-40.74,62.18,0,37.44,30.35,67.8,67.8,67.8s67.8-30.35,67.8-67.8c0-27.82-16.76-51.73-40.74-62.18"
              style={{
                ['--path-len' as any]: '295.34',
                ['--dur' as any]: '0.295s',
                ['--del' as any]: '1.294s',
              }}
            />
            {/* Filamento */}
            <g
              id="Filamento-Esquerdo"
              style={{
                animation: isPageSettled ? 'filament-ignite 0.3s ease-out 1.589s forwards' : 'none',
                opacity: isPageSettled ? 0 : 1,
              }}
            >
              <line
                className="fixture-vector fixture-static"
                x1="250.85"
                y1="447.46"
                x2="277.97"
                y2="447.46"
              />
              <line
                className="fixture-vector fixture-static"
                x1="264.41"
                y1="406.78"
                x2="264.41"
                y2="447.46"
              />
            </g>
          </g>

          {/* =========================================================================
              CONJUNTO DIREITO (Inicia quando Corrente-Direita chega em Y = 433.90 às 1.234s)
              1. Base-do-Bocal-Direito: L = 54.24 | Dur = 0.054s | Del = 1.234s
              2. Laterais do Bocal: L = 87.08 | Dur = 0.087s | Del = 1.288s
              3. Trava do Bocal: L = 54.24 | Dur = 0.054s | Del = 1.375s
              4. Bulbo Contínuo: L = 295.34 | Dur = 0.295s | Del = 1.429s (termina em 1.724s)
              5. Filamento: Acende em 1.724s
              ========================================================================= */}
          <g id="Conjunto-Direito">
            <line
              id="Base-do-Bocal-Direito"
              className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
              x1="508.47"
              y1="433.9"
              x2="562.71"
              y2="433.9"
              style={{
                ['--path-len' as any]: '54.24',
                ['--dur' as any]: '0.054s',
                ['--del' as any]: '1.234s',
              }}
            />
            <line
              id="Bocal-Direito-LadoE"
              className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
              x1="508.47"
              y1="433.9"
              x2="508.47"
              y2="520.98"
              style={{
                ['--path-len' as any]: '87.08',
                ['--dur' as any]: '0.087s',
                ['--del' as any]: '1.288s',
              }}
            />
            <line
              id="Bocal-Direito-LadoD"
              className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
              x1="562.71"
              y1="433.9"
              x2="562.71"
              y2="520.98"
              style={{
                ['--path-len' as any]: '87.08',
                ['--dur' as any]: '0.087s',
                ['--del' as any]: '1.288s',
              }}
            />
            <line
              id="Bocal-Direito-Trava"
              className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
              x1="508.47"
              y1="488.14"
              x2="562.71"
              y2="488.14"
              style={{
                ['--path-len' as any]: '54.24',
                ['--dur' as any]: '0.054s',
                ['--del' as any]: '1.375s',
              }}
            />
            {/* Bulbo contínuo sem quebras */}
            <path
              id="Bulbo-Direito"
              className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
              d="M508.54,520.87c-23.98,10.45-40.74,34.36-40.74,62.18,0,37.44,30.35,67.8,67.8,67.8s67.8-30.35,67.8-67.8c0-27.82-16.76-51.73-40.74-62.18"
              style={{
                ['--path-len' as any]: '295.34',
                ['--dur' as any]: '0.295s',
                ['--del' as any]: '1.429s',
              }}
            />
            {/* Filamento */}
            <g
              id="Filamento-Direito"
              style={{
                animation: isPageSettled ? 'filament-ignite 0.3s ease-out 1.724s forwards' : 'none',
                opacity: isPageSettled ? 0 : 1,
              }}
            >
              <line
                className="fixture-vector fixture-static"
                x1="522.03"
                y1="583.05"
                x2="549.15"
                y2="583.05"
              />
              <line
                className="fixture-vector fixture-static"
                x1="535.59"
                y1="542.37"
                x2="535.59"
                y2="583.05"
              />
            </g>
          </g>

          {/* =========================================================================
              CONJUNTO CENTRAL (Inicia quando Corrente-do-Meio chega em Y = 569.49 às 1.370s)
              1. Base-do-Bocal-do-Meio: L = 54.24 | Dur = 0.054s | Del = 1.370s
              2. Laterais do Bocal: L = 87.08 | Dur = 0.087s | Del = 1.424s
              3. Trava do Bocal: L = 54.24 | Dur = 0.054s | Del = 1.511s
              4. Bulbo Contínuo: L = 295.34 | Dur = 0.295s | Del = 1.565s (termina em 1.860s)
              5. Filamento: Acende em 1.860s
              ========================================================================= */}
          <g id="Conjunto-Central">
            <line
              id="Base-do-Bocal-do-Meio"
              className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
              x1="372.88"
              y1="569.49"
              x2="427.12"
              y2="569.49"
              style={{
                ['--path-len' as any]: '54.24',
                ['--dur' as any]: '0.054s',
                ['--del' as any]: '1.370s',
              }}
            />
            <line
              id="Bocal-Central-LadoE"
              className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
              x1="372.88"
              y1="569.49"
              x2="372.88"
              y2="656.57"
              style={{
                ['--path-len' as any]: '87.08',
                ['--dur' as any]: '0.087s',
                ['--del' as any]: '1.424s',
              }}
            />
            <line
              id="Bocal-Central-LadoD"
              className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
              x1="427.12"
              y1="569.49"
              x2="427.12"
              y2="656.57"
              style={{
                ['--path-len' as any]: '87.08',
                ['--dur' as any]: '0.087s',
                ['--del' as any]: '1.424s',
              }}
            />
            <line
              id="Bocal-Central-Trava"
              className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
              x1="372.88"
              y1="623.73"
              x2="427.12"
              y2="623.73"
              style={{
                ['--path-len' as any]: '54.24',
                ['--dur' as any]: '0.054s',
                ['--del' as any]: '1.511s',
              }}
            />
            {/* Bulbo contínuo sem quebras */}
            <path
              id="Bulbo-Central"
              className={`fixture-vector ${isPageSettled ? 'fixture-drawing' : 'fixture-static'}`}
              d="M372.94,656.46c-23.98,10.45-40.74,34.36-40.74,62.18,0,37.44,30.35,67.8,67.8,67.8s67.8-30.35,67.8-67.8c0-27.82-16.76-51.73-40.74-62.18"
              style={{
                ['--path-len' as any]: '295.34',
                ['--dur' as any]: '0.295s',
                ['--del' as any]: '1.565s',
              }}
            />
            {/* Filamento */}
            <g
              id="Filamento-Central"
              style={{
                animation: isPageSettled ? 'filament-ignite 0.3s ease-out 1.860s forwards' : 'none',
                opacity: isPageSettled ? 0 : 1,
              }}
            >
              <line
                className="fixture-vector fixture-static"
                x1="386.44"
                y1="718.64"
                x2="413.56"
                y2="718.64"
              />
              <line
                className="fixture-vector fixture-static"
                x1="400"
                y1="677.97"
                x2="400"
                y2="718.64"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

/**
 * VerifiedSpinningBadge
 * Decorative background watermark snugly nested inside the bottom-right corner of the Caderno de Erros screen.
 * Respects container boundaries without negative overflow margins.
 * The outer rosette/scalloped ring rotates around its exact center (12px, 12px),
 * while the inner verified checkmark remains completely static and upright.
 * Sized proportionally, 25% fixed opacity, colored with the theme accent (or 70% red in night/amber mode).
 */
export const VerifiedSpinningBadge: React.FC<ErrorAnimationsProps> = ({ isPageSettled = true }) => {
  return (
    <div
      className={`absolute bottom-3 right-3 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 pointer-events-none select-none z-0 transition-opacity duration-300 verified-badge-watermark ${
        isPageSettled ? 'opacity-25' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      <style>{`
        .verified-badge-watermark {
          color: var(--theme-accent);
        }
        html[data-theme="night"] .verified-badge-watermark,
        html[data-theme="amber"] .verified-badge-watermark,
        [data-theme="night"] .verified-badge-watermark,
        [data-theme="amber"] .verified-badge-watermark {
          color: rgb(70% 0% 0%);
        }
      `}</style>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52"
        style={{ overflow: 'visible' }}
      >
        {/* Spinning outer rosette ring around exact center (12px, 12px) */}
        <g
          style={{
            transformOrigin: '12px 12px',
            transformBox: 'view-box',
            animation: 'spin-clockwise 14s linear infinite',
          }}
        >
          <path
            d="M9.78133 3.89027C10.3452 3.40974 10.6271 3.16948 10.9219 3.02859C11.6037 2.70271 12.3963 2.70271 13.0781 3.02859C13.3729 3.16948 13.6548 3.40974 14.2187 3.89027C14.4431 4.08152 14.5553 4.17715 14.6752 4.25747C14.9499 4.4416 15.2584 4.56939 15.5828 4.63344C15.7244 4.66139 15.8713 4.67312 16.1653 4.69657C16.9038 4.7555 17.273 4.78497 17.5811 4.89378C18.2936 5.14546 18.8541 5.70591 19.1058 6.41844C19.2146 6.72651 19.244 7.09576 19.303 7.83426C19.3264 8.12819 19.3381 8.27515 19.3661 8.41669C19.4301 8.74114 19.5579 9.04965 19.7421 9.32437C19.8224 9.44421 19.918 9.55642 20.1093 9.78084C20.5898 10.3447 20.8301 10.6267 20.971 10.9214C21.2968 11.6032 21.2968 12.3958 20.971 13.0776C20.8301 13.3724 20.5898 13.6543 20.1093 14.2182C19.918 14.4426 19.8224 14.5548 19.7421 14.6747C19.5579 14.9494 19.4301 15.2579 19.3661 15.5824C19.3381 15.7239 19.3264 15.8709 19.303 16.1648C19.244 16.9033 19.2146 17.2725 19.1058 17.5806C18.8541 18.2931 18.2936 18.8536 17.5811 19.1053C17.273 19.2141 16.9038 19.2435 16.1653 19.3025C15.8713 19.3259 15.7244 19.3377 15.5828 19.3656C15.2584 19.4297 14.9499 19.5574 14.6752 19.7416C14.5553 19.8219 14.4431 19.9175 14.2187 20.1088C13.6548 20.5893 13.3729 20.8296 13.0781 20.9705C12.3963 21.2963 11.6037 21.2963 10.9219 20.9705C10.6271 20.8296 10.3452 20.5893 9.78133 20.1088C9.55691 19.9175 9.44469 19.8219 9.32485 19.7416C9.05014 19.5574 8.74163 19.4297 8.41718 19.3656C8.27564 19.3377 8.12868 19.3259 7.83475 19.3025C7.09625 19.2435 6.72699 19.2141 6.41893 19.1053C5.7064 18.8536 5.14594 18.2931 4.89427 17.5806C4.78546 17.2725 4.75599 16.9033 4.69706 16.1648C4.6736 15.8709 4.66188 15.7239 4.63393 15.5824C4.56988 15.2579 4.44209 14.9494 4.25796 14.6747C4.17764 14.5548 4.08201 14.4426 3.89076 14.2182C3.41023 13.6543 3.16997 13.3724 3.02907 13.0776C2.7032 12.3958 2.7032 11.6032 3.02907 10.9214C3.16997 10.6266 3.41023 10.3447 3.89076 9.78084C4.08201 9.55642 4.17764 9.44421 4.25796 9.32437C4.44209 9.04965 4.56988 8.74114 4.63393 8.41669C4.66188 8.27515 4.6736 8.12819 4.69706 7.83426C4.75599 7.09576 4.78546 6.72651 4.89427 6.41844C5.14594 5.70591 5.7064 5.14546 6.41893 4.89378C6.72699 4.78497 7.09625 4.7555 7.83475 4.69657C8.12868 4.67312 8.27564 4.66139 8.41718 4.63344C8.74163 4.56939 9.05014 4.4416 9.32485 4.25747C9.4447 4.17715 9.55691 4.08152 9.78133 3.89027Z"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
          />
        </g>

        {/* Static verified checkmark in center - never rotates */}
        <path
          d="M8.5 12.5L10.5 14.5L15.5 9.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

