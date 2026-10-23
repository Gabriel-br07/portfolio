<!--
  Clawd-inspired pixel crab, adapted for walking from the MIT-licensed
  clawd-emotes-skill (https://github.com/xixicc186/clawd-emotes-skill,
  Copyright (c) 2026 xixicc186, MIT — see app/assets/mascots/CREDITS.md).
  Unofficial fan art: not affiliated with or endorsed by Anthropic, and not
  the official Claude mascot.
  Canvas: the skill uses viewBox="-15 -25 45 45"; shapes are shifted +15/+25
  here (user units stay >= 0) and the viewBox is cropped tight around the
  character so it fills its box at small render sizes.
  Rig (stable groups): cw-shadow (outside body), cw-body > cw-legs-a,
  cw-legs-b, torso, cw-arm-l, cw-arm-r, cw-eyes > cw-pupils, cw-mouth, cw-fx.
-->
<template>
  <svg
    class="mascot-char mascot-clawd"
    viewBox="10 22 24 20"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    focusable="false"
  >
    <!-- ground shadow: separate so it never bobs with the body -->
    <rect
      class="cw-shadow"
      x="18"
      y="40"
      width="9"
      height="1"
      fill="#000"
      opacity=".5"
    />
    <g class="cw-body">
      <!-- feet: inside the body group so they never detach -->
      <g
        class="cw-legs-a"
        fill="#DE886D"
      >
        <rect
          x="18"
          y="38"
          width="1"
          height="2"
        />
        <rect
          x="20"
          y="38"
          width="1"
          height="2"
        />
      </g>
      <g
        class="cw-legs-b"
        fill="#DE886D"
      >
        <rect
          x="24"
          y="38"
          width="1"
          height="2"
        />
        <rect
          x="26"
          y="38"
          width="1"
          height="2"
        />
      </g>
      <!-- torso -->
      <rect
        x="17"
        y="31"
        width="11"
        height="7"
        fill="#DE886D"
      />
      <!-- arms: plain 2x2 claws, as in clawd-emotes-skill -->
      <g
        class="cw-arm-l"
        fill="#DE886D"
      >
        <rect
          x="15"
          y="34"
          width="2"
          height="2"
        />
      </g>
      <g
        class="cw-arm-r"
        fill="#DE886D"
      >
        <rect
          x="28"
          y="34"
          width="2"
          height="2"
        />
      </g>
      <!-- eyes: outer group blinks, inner group shifts for "look" -->
      <g class="cw-eyes">
        <g
          class="cw-pupils"
          fill="#000"
        >
          <rect
            x="19"
            y="33"
            width="1"
            height="2"
          />
          <rect
            x="25"
            y="33"
            width="1"
            height="2"
          />
        </g>
      </g>
      <rect
        class="cw-mouth"
        x="21.4"
        y="35.8"
        width="2.2"
        height="1"
        rx=".5"
        fill="#7a2230"
      />
    </g>
    <!-- celebrate sparks (hidden unless the state animates them) -->
    <g
      class="cw-fx"
      fill="#F2B98E"
      opacity="0"
    >
      <rect
        x="30"
        y="28"
        width="1.2"
        height="1.2"
      />
      <rect
        x="33"
        y="31"
        width="1"
        height="1"
      />
      <rect
        x="31.5"
        y="25"
        width=".8"
        height=".8"
      />
    </g>
  </svg>
</template>
