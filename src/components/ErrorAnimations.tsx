import React, { useEffect, useState } from 'react';

interface ErrorAnimationsProps {
  isPageSettled?: boolean;
}

/**
 * PendantLightFixture
 * Renders the 3-lamp hanging chandelier SVG at the top of the screen.
 * Generates an animation creating its anchor points sequentially from top to bottom
 * whenever the page is 100% on screen (current mode is 'errors' and scrolling/dragging is idle).
 */
export const PendantLightFixture: React.FC<ErrorAnimationsProps> = ({ isPageSettled = true }) => {
  const [animKey, setAnimKey] = useState<number>(0);

  // Trigger/reset animation whenever the page settles into view
  useEffect(() => {
    if (isPageSettled) {
      setAnimKey(prev => prev + 1);
    }
  }, [isPageSettled]);

  return (
    <div
      key={animKey}
      className={`relative select-none transition-opacity duration-300 ${
        isPageSettled ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ width: '100%', maxWidth: '170px' }}
      aria-hidden="true"
    >
      {/* Downward ambient glow aura when lamps are illuminated */}
      <div
        className="absolute top-14 left-2 right-2 h-36 rounded-full pointer-events-none blur-2xl opacity-30"
        style={{
          background: 'radial-gradient(ellipse at top, var(--theme-warning) 0%, var(--theme-accent) 45%, transparent 75%)',
          animation: 'bulb-ignite 0.6s 1.1s ease forwards',
        }}
      />

      {/* HTML Wrapper for guaranteed top-to-bottom reveal clip-path animation across all browser engines */}
      <div
        className="w-full h-auto"
        style={{
          animation: 'pendant-reveal-down 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          willChange: 'clip-path',
        }}
      >
        <svg
          viewBox="0 0 59 59"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto drop-shadow-xs"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <filter id="lamp-filament-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Cords & Chandelier Fixture Body */}
          <g>
            <path
              d="M46.5,0h-4h-26h-4c-0.553,0-1,0.447-1,1s0.447,1,1,1h3v3c0,0.553,0.447,1,1,1h2v15h-1c-0.553,0-1,0.447-1,1v4v1.809 c-1.842,1.064-3,3.036-3,5.191c0,3.309,2.691,6,6,6s6-2.691,6-6c0-2.155-1.158-4.127-3-5.191V26v-4c0-0.553-0.447-1-1-1h-1V6h8v35 h-1c-0.553,0-1,0.447-1,1v4v1.809c-1.842,1.064-3,3.036-3,5.191c0,3.309,2.691,6,6,6s6-2.691,6-6c0-2.155-1.158-4.127-3-5.191V46 v-4c0-0.553-0.447-1-1-1h-1V6h8v25h-1c-0.553,0-1,0.447-1,1v4v1.809c-1.842,1.064-3,3.036-3,5.191c0,3.309,2.691,6,6,6s6-2.691,6-6 c0-2.155-1.158-4.127-3-5.191V36v-4c0-0.553-0.447-1-1-1h-1V6h2c0.553,0,1-0.447,1-1V2h3c0.553,0,1-0.447,1-1S47.053,0,46.5,0z M18.5,23h2v2h-2V23z M23.5,33c0,2.206-1.794,4-4,4s-4-1.794-4-4c0-1.586,0.942-3.023,2.401-3.662 c0.363-0.159,0.599-0.519,0.599-0.916V27h2v1.422c0,0.397,0.235,0.757,0.599,0.916C22.558,29.977,23.5,31.414,23.5,33z M28.5,43h2 v2h-2V43z M33.5,53c0,2.206-1.794,4-4,4s-4-1.794-4-4c0-1.586,0.942-3.023,2.401-3.662c0.363-0.159,0.599-0.519,0.599-0.916V47h2 v1.422c0,0.397,0.235,0.757,0.599,0.916C32.558,49.977,33.5,51.414,33.5,53z M38.5,33h2v2h-2V33z M43.5,43c0,2.206-1.794,4-4,4 s-4-1.794-4-4c0-1.586,0.942-3.023,2.401-3.662c0.363-0.159,0.599-0.519,0.599-0.916V37h2v1.422c0,0.397,0.235,0.757,0.599,0.916 C42.558,39.977,43.5,41.414,43.5,43z M41.5,4h-24V2h24V4z"
              fill="var(--theme-text-secondary)"
            />

            {/* Left Bulb (y~32) */}
            <path
              d="M20.5,32v-2c0-0.553-0.447-1-1-1s-1,0.447-1,1v2c-0.553,0-1,0.447-1,1s0.447,1,1,1h2c0.553,0,1-0.447,1-1S21.053,32,20.5,32z"
              fill="var(--theme-warning)"
              filter="url(#lamp-filament-glow)"
              style={{ animation: 'bulb-ignite 0.4s 0.35s ease forwards' }}
            />

            {/* Right Bulb (y~42) */}
            <path
              d="M40.5,42v-2c0-0.553-0.447-1-1-1s-1,0.447-1,1v2c-0.553,0-1,0.447-1,1s0.447,1,1,1h2c0.553,0,1-0.447,1-1S41.053,42,40.5,42z"
              fill="var(--theme-warning)"
              filter="url(#lamp-filament-glow)"
              style={{ animation: 'bulb-ignite 0.4s 0.65s ease forwards' }}
            />

            {/* Center Bulb (y~52) */}
            <path
              d="M30.5,52v-2c0-0.553-0.447-1-1-1s-1,0.447-1,1v2c-0.553,0-1,0.447-1,1s0.447,1,1,1h2c0.553,0,1-0.447,1-1S31.053,52,30.5,52z"
              fill="var(--theme-warning)"
              filter="url(#lamp-filament-glow)"
              style={{ animation: 'bulb-ignite 0.4s 0.95s ease forwards' }}
            />
          </g>

          {/* Sequential Anchor Point Nodes (Created top-to-bottom) */}
          {/* 1. Top Mount Anchors (0.05s) */}
          <g style={{ animation: 'anchor-pop 0.3s 0.05s cubic-bezier(0.16, 1, 0.3, 1) both', transformOrigin: '29.5px 2px' }}>
            <rect x="16.5" y="1" width="2" height="2" fill="var(--theme-surface)" stroke="var(--theme-accent)" strokeWidth="0.75" />
            <rect x="28.5" y="0" width="2" height="2" fill="var(--theme-accent)" stroke="var(--theme-surface)" strokeWidth="0.5" />
            <rect x="40.5" y="1" width="2" height="2" fill="var(--theme-surface)" stroke="var(--theme-accent)" strokeWidth="0.75" />
          </g>

          {/* 2. Left Lamp Anchor (0.35s) */}
          <g style={{ animation: 'anchor-pop 0.3s 0.35s cubic-bezier(0.16, 1, 0.3, 1) both', transformOrigin: '19.5px 28px' }}>
            <circle cx="19.5" cy="23.5" r="1.3" fill="var(--theme-accent)" stroke="var(--theme-surface)" strokeWidth="0.5" />
            <rect x="18.5" y="31" width="2" height="2" fill="var(--theme-warning)" stroke="var(--theme-surface)" strokeWidth="0.5" />
          </g>

          {/* 3. Right Lamp Anchor (0.65s) */}
          <g style={{ animation: 'anchor-pop 0.3s 0.65s cubic-bezier(0.16, 1, 0.3, 1) both', transformOrigin: '39.5px 38px' }}>
            <circle cx="39.5" cy="33.5" r="1.3" fill="var(--theme-accent)" stroke="var(--theme-surface)" strokeWidth="0.5" />
            <rect x="38.5" y="41" width="2" height="2" fill="var(--theme-warning)" stroke="var(--theme-surface)" strokeWidth="0.5" />
          </g>

          {/* 4. Center Lamp Anchor (0.95s) */}
          <g style={{ animation: 'anchor-pop 0.3s 0.95s cubic-bezier(0.16, 1, 0.3, 1) both', transformOrigin: '29.5px 48px' }}>
            <circle cx="29.5" cy="43.5" r="1.3" fill="var(--theme-accent)" stroke="var(--theme-surface)" strokeWidth="0.5" />
            <rect x="28.5" y="51" width="2" height="2" fill="var(--theme-warning)" stroke="var(--theme-surface)" strokeWidth="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
};

/**
 * VerifiedSpinningBadge
 * Replaces the static checkmark icon in the empty state ("Caderno de Erros Zerado").
 * The outer rosette/scalloped ring rotates around its exact center (12px, 12px),
 * while the inner verified checkmark remains completely static and upright.
 * Only appears when the scroll/drag is NOT in activity.
 */
export const VerifiedSpinningBadge: React.FC<ErrorAnimationsProps> = ({ isPageSettled = true }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center transition-all duration-300 ${
        isPageSettled ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="w-16 h-16 bg-success-bg text-success rounded-2xl flex items-center justify-center mx-auto border border-success-border shadow-xs">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-9 h-9 text-success"
          style={{ overflow: 'visible' }}
        >
          {/* Spinning outer rosette ring around exact center (12px, 12px) */}
          <g
            style={{
              transformOrigin: '12px 12px',
              transformBox: 'view-box',
              animation: 'spin-clockwise 8s linear infinite',
            }}
          >
            <path
              d="M9.78133 3.89027C10.3452 3.40974 10.6271 3.16948 10.9219 3.02859C11.6037 2.70271 12.3963 2.70271 13.0781 3.02859C13.3729 3.16948 13.6548 3.40974 14.2187 3.89027C14.4431 4.08152 14.5553 4.17715 14.6752 4.25747C14.9499 4.4416 15.2584 4.56939 15.5828 4.63344C15.7244 4.66139 15.8713 4.67312 16.1653 4.69657C16.9038 4.7555 17.273 4.78497 17.5811 4.89378C18.2936 5.14546 18.8541 5.70591 19.1058 6.41844C19.2146 6.72651 19.244 7.09576 19.303 7.83426C19.3264 8.12819 19.3381 8.27515 19.3661 8.41669C19.4301 8.74114 19.5579 9.04965 19.7421 9.32437C19.8224 9.44421 19.918 9.55642 20.1093 9.78084C20.5898 10.3447 20.8301 10.6267 20.971 10.9214C21.2968 11.6032 21.2968 12.3958 20.971 13.0776C20.8301 13.3724 20.5898 13.6543 20.1093 14.2182C19.918 14.4426 19.8224 14.5548 19.7421 14.6747C19.5579 14.9494 19.4301 15.2579 19.3661 15.5824C19.3381 15.7239 19.3264 15.8709 19.303 16.1648C19.244 16.9033 19.2146 17.2725 19.1058 17.5806C18.8541 18.2931 18.2936 18.8536 17.5811 19.1053C17.273 19.2141 16.9038 19.2435 16.1653 19.3025C15.8713 19.3259 15.7244 19.3377 15.5828 19.3656C15.2584 19.4297 14.9499 19.5574 14.6752 19.7416C14.5553 19.8219 14.4431 19.9175 14.2187 20.1088C13.6548 20.5893 13.3729 20.8296 13.0781 20.9705C12.3963 21.2963 11.6037 21.2963 10.9219 20.9705C10.6271 20.8296 10.3452 20.5893 9.78133 20.1088C9.55691 19.9175 9.44469 19.8219 9.32485 19.7416C9.05014 19.5574 8.74163 19.4297 8.41718 19.3656C8.27564 19.3377 8.12868 19.3259 7.83475 19.3025C7.09625 19.2435 6.72699 19.2141 6.41893 19.1053C5.7064 18.8536 5.14594 18.2931 4.89427 17.5806C4.78546 17.2725 4.75599 16.9033 4.69706 16.1648C4.6736 15.8709 4.66188 15.7239 4.63393 15.5824C4.56988 15.2579 4.44209 14.9494 4.25796 14.6747C4.17764 14.5548 4.08201 14.4426 3.89076 14.2182C3.41023 13.6543 3.16997 13.3724 3.02907 13.0776C2.7032 12.3958 2.7032 11.6032 3.02907 10.9214C3.16997 10.6266 3.41023 10.3447 3.89076 9.78084C4.08201 9.55642 4.17764 9.44421 4.25796 9.32437C4.44209 9.04965 4.56988 8.74114 4.63393 8.41669C4.66188 8.27515 4.6736 8.12819 4.69706 7.83426C4.75599 7.09576 4.78546 6.72651 4.89427 6.41844C5.14594 5.70591 5.7064 5.14546 6.41893 4.89378C6.72699 4.78497 7.09625 4.7555 7.83475 4.69657C8.12868 4.67312 8.27564 4.66139 8.41718 4.63344C8.74163 4.56939 9.05014 4.4416 9.32485 4.25747C9.4447 4.17715 9.55691 4.08152 9.78133 3.89027Z"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
            />
          </g>

          {/* Static verified checkmark in center - never rotates */}
          <path
            d="M8.5 12.5L10.5 14.5L15.5 9.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};
