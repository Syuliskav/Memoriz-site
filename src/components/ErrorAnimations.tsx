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
export const PendantLightFixture: React.FC<ErrorAnimationsProps> = ({ isPageSettled = true }) => {
  const [animKey, setAnimKey] = useState(0);

  // Trigger point-by-point assembly whenever the page settles 100% on screen
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
      style={{ width: '100%', maxWidth: '170px' }}
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

        /* Point-by-point vector path drawing animation */
        @keyframes pendant-point-by-point-stroke {
          0% {
            stroke-dashoffset: 480;
            fill-opacity: 0;
            stroke-opacity: 1;
          }
          65% {
            stroke-dashoffset: 0;
            fill-opacity: 0.2;
            stroke-opacity: 1;
          }
          90% {
            fill-opacity: 0.85;
            stroke-opacity: 0.6;
          }
          100% {
            stroke-dashoffset: 0;
            fill-opacity: 1;
            stroke-opacity: 0;
          }
        }

        /* Sequential anchor node materialization & fadeout */
        @keyframes anchor-node-pop-ceiling {
          0% { opacity: 0; transform: scale(0); }
          25% { opacity: 1; transform: scale(1.4); }
          50% { opacity: 0.9; transform: scale(1); }
          85% { opacity: 0.7; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.6); }
        }

        @keyframes anchor-node-pop-left {
          0%, 20% { opacity: 0; transform: scale(0); }
          40% { opacity: 1; transform: scale(1.4); }
          60% { opacity: 0.9; transform: scale(1); }
          85% { opacity: 0.7; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.6); }
        }

        @keyframes anchor-node-pop-right {
          0%, 45% { opacity: 0; transform: scale(0); }
          65% { opacity: 1; transform: scale(1.4); }
          75% { opacity: 0.9; transform: scale(1); }
          88% { opacity: 0.7; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.6); }
        }

        @keyframes anchor-node-pop-center {
          0%, 65% { opacity: 0; transform: scale(0); }
          80% { opacity: 1; transform: scale(1.4); }
          90% { opacity: 0.9; transform: scale(1); }
          96% { opacity: 0.7; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.6); }
        }

        /* Filament sequential ignition */
        @keyframes filament-ignite-left {
          0%, 35% { opacity: 0; fill-opacity: 0; }
          45% { opacity: 1; fill-opacity: 1; }
          100% { opacity: 1; fill-opacity: 1; }
        }

        @keyframes filament-ignite-right {
          0%, 60% { opacity: 0; fill-opacity: 0; }
          70% { opacity: 1; fill-opacity: 1; }
          100% { opacity: 1; fill-opacity: 1; }
        }

        @keyframes filament-ignite-center {
          0%, 75% { opacity: 0; fill-opacity: 0; }
          85% { opacity: 1; fill-opacity: 1; }
          100% { opacity: 1; fill-opacity: 1; }
        }
      `}</style>

      <svg
        viewBox="0 0 59 59"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ overflow: 'visible' }}
      >
        <g fill="currentColor">
          {/* Main Fixture Body: Progressive vector contour drawing and fill assembly */}
          <path
            d="M46.5,0h-4h-26h-4c-0.553,0-1,0.447-1,1s0.447,1,1,1h3v3c0,0.553,0.447,1,1,1h2v15h-1c-0.553,0-1,0.447-1,1v4v1.809 c-1.842,1.064-3,3.036-3,5.191c0,3.309,2.691,6,6,6s6-2.691,6-6c0-2.155-1.158-4.127-3-5.191V26v-4c0-0.553-0.447-1-1-1h-1V6h8v35 h-1c-0.553,0-1,0.447-1,1v4v1.809c-1.842,1.064-3,3.036-3,5.191c0,3.309,2.691,6,6,6s6-2.691,6-6c0-2.155-1.158-4.127-3-5.191V46 v-4c0-0.553-0.447-1-1-1h-1V6h8v25h-1c-0.553,0-1,0.447-1,1v4v1.809c-1.842,1.064-3,3.036-3,5.191c0,3.309,2.691,6,6,6s6-2.691,6-6 c0-2.155-1.158-4.127-3-5.191V36v-4c0-0.553-0.447-1-1-1h-1V6h2c0.553,0,1-0.447,1-1V2h3c0.553,0,1-0.447,1-1S47.053,0,46.5,0z M18.5,23h2v2h-2V23z M23.5,33c0,2.206-1.794,4-4,4s-4-1.794-4-4c0-1.586,0.942-3.023,2.401-3.662 c0.363-0.159,0.599-0.519,0.599-0.916V27h2v1.422c0,0.397,0.235,0.757,0.599,0.916C22.558,29.977,23.5,31.414,23.5,33z M28.5,43h2 v2h-2V43z M33.5,53c0,2.206-1.794,4-4,4s-4-1.794-4-4c0-1.586,0.942-3.023,2.401-3.662c0.363-0.159,0.599-0.519,0.599-0.916V47h2 v1.422c0,0.397,0.235,0.757,0.599,0.916C32.558,49.977,33.5,51.414,33.5,53z M38.5,33h2v2h-2V33z M43.5,43c0,2.206-1.794,4-4,4 s-4-1.794-4-4c0-1.586,0.942-3.023,2.401-3.662c0.363-0.159,0.599-0.519,0.599-0.916V37h2v1.422c0,0.397,0.235,0.757,0.599,0.916 C42.558,39.977,43.5,41.414,43.5,43z M41.5,4h-24V2h24V4z"
            stroke="currentColor"
            strokeWidth="0.4"
            strokeDasharray="480"
            strokeDashoffset="480"
            style={{
              animation: isPageSettled ? 'pendant-point-by-point-stroke 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' : 'none',
            }}
          />

          {/* Left Lamp Filament (y ~32) - Ignites as left lamp forms */}
          <path
            d="M20.5,32v-2c0-0.553-0.447-1-1-1s-1,0.447-1,1v2c-0.553,0-1,0.447-1,1s0.447,1,1,1h2c0.553,0,1-0.447,1-1 S21.053,32,20.5,32z"
            style={{
              animation: isPageSettled ? 'filament-ignite-left 1.6s ease-out forwards' : 'none',
            }}
          />

          {/* Right Lamp Filament (y ~42) - Ignites as right lamp forms */}
          <path
            d="M40.5,42v-2c0-0.553-0.447-1-1-1s-1,0.447-1,1v2c-0.553,0-1,0.447-1,1s0.447,1,1,1h2c0.553,0,1-0.447,1-1 S41.053,42,40.5,42z"
            style={{
              animation: isPageSettled ? 'filament-ignite-right 1.6s ease-out forwards' : 'none',
            }}
          />

          {/* Center Lamp Filament (y ~52) - Ignites as center lamp forms */}
          <path
            d="M30.5,52v-2c0-0.553-0.447-1-1-1s-1,0.447-1,1v2c-0.553,0-1,0.447-1,1s0.447,1,1,1h2c0.553,0,1-0.447,1-1 S31.053,52,30.5,52z"
            style={{
              animation: isPageSettled ? 'filament-ignite-center 1.6s ease-out forwards' : 'none',
            }}
          />

          {/* Vector Blueprint Anchor Points (Pontos de Âncora) - materialize sequentially to guide drawing */}
          {isPageSettled && (
            <g className="pointer-events-none">
              {/* Ceiling anchor points (t=0s..0.3s) */}
              <circle cx="17.5" cy="2" r="0.9" style={{ animation: 'anchor-node-pop-ceiling 1.6s ease-out forwards', transformOrigin: '17.5px 2px' }} />
              <circle cx="29.5" cy="2" r="0.9" style={{ animation: 'anchor-node-pop-ceiling 1.6s ease-out forwards', transformOrigin: '29.5px 2px' }} />
              <circle cx="41.5" cy="2" r="0.9" style={{ animation: 'anchor-node-pop-ceiling 1.6s ease-out forwards', transformOrigin: '41.5px 2px' }} />

              {/* Left cord intermediate & bulb anchor points (t=0.3s..0.6s) */}
              <circle cx="19.5" cy="23" r="0.8" style={{ animation: 'anchor-node-pop-left 1.6s ease-out forwards', transformOrigin: '19.5px 23px' }} />
              <circle cx="19.5" cy="27" r="0.8" style={{ animation: 'anchor-node-pop-left 1.6s ease-out forwards', transformOrigin: '19.5px 27px' }} />
              <circle cx="19.5" cy="33" r="0.9" style={{ animation: 'anchor-node-pop-left 1.6s ease-out forwards', transformOrigin: '19.5px 33px' }} />

              {/* Right cord intermediate & bulb anchor points (t=0.6s..0.9s) */}
              <circle cx="39.5" cy="33" r="0.8" style={{ animation: 'anchor-node-pop-right 1.6s ease-out forwards', transformOrigin: '39.5px 33px' }} />
              <circle cx="39.5" cy="37" r="0.8" style={{ animation: 'anchor-node-pop-right 1.6s ease-out forwards', transformOrigin: '39.5px 37px' }} />
              <circle cx="39.5" cy="43" r="0.9" style={{ animation: 'anchor-node-pop-right 1.6s ease-out forwards', transformOrigin: '39.5px 43px' }} />

              {/* Center cord intermediate & bulb anchor points (t=0.9s..1.2s) */}
              <circle cx="29.5" cy="43" r="0.8" style={{ animation: 'anchor-node-pop-center 1.6s ease-out forwards', transformOrigin: '29.5px 43px' }} />
              <circle cx="29.5" cy="47" r="0.8" style={{ animation: 'anchor-node-pop-center 1.6s ease-out forwards', transformOrigin: '29.5px 47px' }} />
              <circle cx="29.5" cy="53" r="0.9" style={{ animation: 'anchor-node-pop-center 1.6s ease-out forwards', transformOrigin: '29.5px 53px' }} />
            </g>
          )}
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

