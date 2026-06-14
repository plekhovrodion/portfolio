import type { DesktopFile, Position, StageSize } from "@/lib/case-data";

export type { DesktopFile, Position, StageSize };

export const STAGE_WIDTH = 1600;
export const STAGE_HEIGHT = 1024;
export const HEADER_HEIGHT = 56;
export const FILE_WIDTH = 128;
export const FILE_HEIGHT = 132;
export const CARD_WIDTH = 480;
export const CARD_HEIGHT = 248;
export const CASE_WINDOW_WIDTH = 832;
export const CASE_WINDOW_HEIGHT = 780;
export const CASE_WINDOW_ANIMATION_MS = 220;
export const CASE_LIGHTBOX_ANIMATION_MS = 220;
export const LIGHTBOX_SWIPE_THRESHOLD = 48;
export const MOBILE_LAYOUT_BREAKPOINT = 900;
export const NARROW_MOBILE_BREAKPOINT = 520;
export const MOBILE_FILE_COLUMNS = 3;

export function formatCurrentTime() {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getCaseWindowSize(stageSize: StageSize) {
  return {
    width: Math.min(CASE_WINDOW_WIDTH, stageSize.width),
    height: Math.min(CASE_WINDOW_HEIGHT, stageSize.height - HEADER_HEIGHT),
  };
}

export function getCaseWindowPositionForCase(
  caseId: string,
  stageSize: StageSize,
  files: readonly DesktopFile[],
  cardPosition: Position,
) {
  if (stageSize.width <= MOBILE_LAYOUT_BREAKPOINT) {
    return { x: 0, y: HEADER_HEIGHT };
  }

  const windowSize = getCaseWindowSize(stageSize);
  let anchor = { x: 44, y: 68 };

  if (caseId === "about-me") {
    anchor = cardPosition;
  } else {
    const file = files.find((item) => item.id === caseId);
    if (file) {
      anchor = { x: file.x, y: file.y };
    }
  }

  return {
    x: clamp(anchor.x, 0, Math.max(0, stageSize.width - windowSize.width)),
    y: clamp(
      anchor.y,
      HEADER_HEIGHT,
      Math.max(HEADER_HEIGHT, stageSize.height - windowSize.height),
    ),
  };
}

export function getMobileFilePosition(index: number, stageSize: StageSize) {
  const isNarrow = stageSize.width <= NARROW_MOBILE_BREAKPOINT;
  const sidePadding = isNarrow ? 8 : 14;
  const rowGap = isNarrow ? 116 : 130;
  const availableWidth = stageSize.width - sidePadding * 2;
  const cellWidth = availableWidth / MOBILE_FILE_COLUMNS;
  const fileWidth = Math.min(FILE_WIDTH, cellWidth);
  const column = index % MOBILE_FILE_COLUMNS;
  const row = Math.floor(index / MOBILE_FILE_COLUMNS);
  const x = sidePadding + column * cellWidth + (cellWidth - fileWidth) / 2;
  const y = HEADER_HEIGHT + (isNarrow ? 232 : 228) + row * rowGap;

  return {
    x: clamp(x, 0, Math.max(0, stageSize.width - fileWidth)),
    y,
  };
}

export function getMobileCardPosition(stageSize: StageSize) {
  const sidePadding = stageSize.width <= NARROW_MOBILE_BREAKPOINT ? 8 : 14;

  return {
    x: sidePadding,
    y: HEADER_HEIGHT + 8,
  };
}

export function getMobileStageContentHeight(
  files: readonly DesktopFile[],
  cardPosition: Position,
) {
  const cardBottom = cardPosition.y + CARD_HEIGHT;
  const filesBottom = files.reduce(
    (maxBottom, file) => Math.max(maxBottom, file.y + FILE_HEIGHT),
    0,
  );

  return Math.ceil(Math.max(cardBottom + 32, filesBottom + 48));
}

const DESKTOP_STAGE_PADDING = 40;

const desktopFileOrbitOffsets: Record<string, Position> = {
  home: { x: -460, y: -320 },
  classes: { x: 48, y: -380 },
  "ai-assistant": { x: 480, y: -300 },
  profile: { x: 560, y: 70 },
  "vk-cart": { x: 440, y: 360 },
  subscription: { x: -72, y: 420 },
  motion: { x: -540, y: 100 },
};

const DESKTOP_FILE_CLEARANCE = 56;

export function getDesktopCardPosition(stageSize: StageSize): Position {
  const cardWidth = Math.min(
    CARD_WIDTH,
    stageSize.width - DESKTOP_STAGE_PADDING * 2,
  );
  const usableHeight = stageSize.height - HEADER_HEIGHT - 24;

  return {
    x: Math.max(DESKTOP_STAGE_PADDING, (stageSize.width - cardWidth) / 2),
    y: HEADER_HEIGHT + Math.max(16, (usableHeight - CARD_HEIGHT) / 2),
  };
}

function clampDesktopFilePosition(position: Position, stageSize: StageSize) {
  const padding = 16;
  const minY = HEADER_HEIGHT + 8;
  const maxX = Math.max(padding, stageSize.width - FILE_WIDTH - padding);
  const maxY = Math.max(minY, stageSize.height - FILE_HEIGHT - padding);

  return {
    x: clamp(position.x, padding, maxX),
    y: clamp(position.y, minY, maxY),
  };
}

function resolveFilePositionAvoidingCard(
  position: Position,
  cardBounds: { left: number; top: number; right: number; bottom: number },
  cardCenter: Position,
  stageSize: StageSize,
) {
  const iconBounds = {
    left: position.x,
    top: position.y,
    right: position.x + FILE_WIDTH,
    bottom: position.y + FILE_HEIGHT,
  };

  const intersectsCard =
    iconBounds.left < cardBounds.right + DESKTOP_FILE_CLEARANCE &&
    iconBounds.right > cardBounds.left - DESKTOP_FILE_CLEARANCE &&
    iconBounds.top < cardBounds.bottom + DESKTOP_FILE_CLEARANCE &&
    iconBounds.bottom > cardBounds.top - DESKTOP_FILE_CLEARANCE;

  if (!intersectsCard) {
    return clampDesktopFilePosition(position, stageSize);
  }

  const iconCenterX = position.x + FILE_WIDTH / 2;
  const iconCenterY = position.y + FILE_HEIGHT / 2;
  const dx = iconCenterX - cardCenter.x;
  const dy = iconCenterY - cardCenter.y;
  const distance = Math.hypot(dx, dy) || 1;
  const cardHalfWidth = (cardBounds.right - cardBounds.left) / 2;
  const cardHalfHeight = (cardBounds.bottom - cardBounds.top) / 2;
  const minDistance =
    Math.hypot(cardHalfWidth, cardHalfHeight) +
    Math.hypot(FILE_WIDTH / 2, FILE_HEIGHT / 2) +
    DESKTOP_FILE_CLEARANCE;

  return clampDesktopFilePosition(
    {
      x: cardCenter.x + (dx / distance) * minDistance - FILE_WIDTH / 2,
      y: cardCenter.y + (dy / distance) * minDistance - FILE_HEIGHT / 2,
    },
    stageSize,
  );
}

export function getDesktopFileOrbitPositions(
  filesList: readonly DesktopFile[],
  stageSize: StageSize,
  cardPosition: Position,
): DesktopFile[] {
  const cardWidth = Math.min(
    CARD_WIDTH,
    stageSize.width - DESKTOP_STAGE_PADDING * 2,
  );
  const centerX = cardPosition.x + cardWidth / 2;
  const centerY = cardPosition.y + CARD_HEIGHT / 2;
  const cardCenter = { x: centerX, y: centerY };
  const cardBounds = {
    left: cardPosition.x,
    top: cardPosition.y,
    right: cardPosition.x + cardWidth,
    bottom: cardPosition.y + CARD_HEIGHT,
  };
  const orbitScale = clamp(
    Math.min(
      (stageSize.width - cardWidth) / (STAGE_WIDTH - CARD_WIDTH),
      (stageSize.height - HEADER_HEIGHT - CARD_HEIGHT) /
        (STAGE_HEIGHT - HEADER_HEIGHT - CARD_HEIGHT),
    ),
    0.72,
    1.08,
  );

  return filesList.map((file) => {
    const offset = desktopFileOrbitOffsets[file.id] ?? { x: 0, y: 0 };
    const iconCenterX = centerX + offset.x * orbitScale;
    const iconCenterY = centerY + offset.y * orbitScale;
    const position = {
      x: iconCenterX - FILE_WIDTH / 2,
      y: iconCenterY - FILE_HEIGHT / 2,
    };

    return {
      ...file,
      ...resolveFilePositionAvoidingCard(
        position,
        cardBounds,
        cardCenter,
        stageSize,
      ),
    };
  });
}
