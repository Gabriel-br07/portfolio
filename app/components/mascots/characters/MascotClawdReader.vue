<!--
  Clawd reading — adapted from the MIT-licensed clawd-emotes-skill "reading" emote
  (https://github.com/xixicc186/clawd-emotes-skill, Copyright (c) 2026 xixicc186,
  see app/assets/mascots/CREDITS.md). Unofficial fan art, not the official Claude mascot.
  Uses the skill's own coordinates (torso 2,6 11x7; shoulders (2,10)/(13,10); ground y=15),
  so its pivots live in mascots.css under [data-state='read'].
-->
<template>
  <svg
    class="mascot-char mascot-clawd"
    viewBox="-3 3 21 14"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    focusable="false"
  >
    <rect
      class="cw-shadow"
      x="3"
      y="15"
      width="9"
      height="1"
      fill="#000"
      opacity=".5"
    />
    <g class="cw-body">
      <g fill="#DE886D">
        <rect
          x="3"
          y="13"
          width="1"
          height="2"
        />
        <rect
          x="5"
          y="13"
          width="1"
          height="2"
        />
        <rect
          x="9"
          y="13"
          width="1"
          height="2"
        />
        <rect
          x="11"
          y="13"
          width="1"
          height="2"
        />
      </g>
      <rect
        x="2"
        y="6"
        width="11"
        height="7"
        fill="#DE886D"
      />
      <g
        class="cw-eyes"
        fill="#000"
      >
        <rect
          x="4"
          y="8"
          width="1"
          height="2"
        />
        <rect
          x="10"
          y="8"
          width="1"
          height="2"
        />
      </g>
      <!-- arms cupping the book (static, so the book can stay in the body group) -->
      <rect
        x="-.3"
        y="9.6"
        width="2.6"
        height="2"
        rx=".4"
        fill="#DE886D"
        transform="rotate(28,1,10.6)"
      />
      <rect
        x="12.7"
        y="9.6"
        width="2.6"
        height="2"
        rx=".4"
        fill="#DE886D"
        transform="rotate(-28,14,10.6)"
      />
      <g>
        <polygon
          points="1.6,12.4 2.8,9.4 7.5,9.9 7.5,12.6"
          fill="#8a5a2a"
        />
        <polygon
          points="13.4,12.4 12.2,9.4 7.5,9.9 7.5,12.6"
          fill="#7a4e22"
        />
        <polygon
          points="2.2,12.1 3.2,9.7 7.5,10.1 7.5,12.2"
          fill="#F5E6C8"
        />
        <g class="cw-page">
          <polygon
            points="12.8,12.1 11.8,9.7 7.5,10.1 7.5,12.2"
            fill="#FBF1D8"
          />
        </g>
        <g
          stroke="#c9b48a"
          stroke-width=".25"
        >
          <line
            x1="3.4"
            y1="10.6"
            x2="6.9"
            y2="10.9"
          />
          <line
            x1="3.3"
            y1="11.3"
            x2="6.9"
            y2="11.5"
          />
          <line
            x1="8.1"
            y1="10.9"
            x2="11.6"
            y2="10.6"
          />
          <line
            x1="8.1"
            y1="11.5"
            x2="11.7"
            y2="11.3"
          />
        </g>
        <rect
          x="7.2"
          y="9.7"
          width=".6"
          height="2.9"
          fill="#5e3c1a"
        />
      </g>
    </g>
  </svg>
</template>
