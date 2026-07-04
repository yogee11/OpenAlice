import type { ITheme } from '@xterm/xterm'

import { darkTheme, lightTheme } from './theme'

export type TerminalThemeVariant = 'light' | 'dark'
export type TerminalThemeRgb = readonly [number, number, number]

export interface TerminalThemeProfile {
  readonly variant: TerminalThemeVariant
  readonly name: string
  readonly foreground: TerminalThemeRgb
  readonly background: TerminalThemeRgb
  readonly palette: readonly TerminalThemeRgb[]
  readonly cursorColor: TerminalThemeRgb
  readonly cursorText: TerminalThemeRgb
  readonly selectionBackground: string
  /**
   * xterm uses this not just for paint. Its built-in OSC 4/10/11/12 handlers
   * report colors from the active theme service back to the PTY, which is the
   * web equivalent of Muxy applying a Ghostty config to a terminal surface.
   */
  readonly xtermTheme: ITheme
  /**
   * Compatibility layer for web/xterm. A true terminal engine, like Ghostty in
   * Muxy, owns this at the renderer/config layer. xterm.js still needs help for
   * TUIs that emit explicit truecolor dark backgrounds in light mode.
   */
  readonly ansiRewrite:
    | { readonly enabled: false }
    | {
        readonly enabled: true
        readonly panelBackground: TerminalThemeRgb
        readonly textForeground: TerminalThemeRgb
        readonly darkBackgroundMaxLuma: number
        readonly brightForegroundMinLuma: number
        readonly targetForegroundLuma: number
      }
}

const lightProfile: TerminalThemeProfile = {
  variant: 'light',
  name: 'OpenAlice Light',
  foreground: [28, 42, 65],
  background: [250, 248, 241],
  palette: [
    [28, 42, 65],
    [207, 34, 46],
    [17, 99, 41],
    [122, 77, 5],
    [9, 105, 218],
    [130, 80, 223],
    [27, 124, 131],
    [110, 119, 129],
    [87, 96, 106],
    [164, 14, 38],
    [26, 127, 55],
    [99, 60, 1],
    [33, 139, 255],
    [164, 117, 249],
    [49, 146, 170],
    [36, 41, 47],
  ],
  cursorColor: [47, 98, 176],
  cursorText: [250, 248, 241],
  selectionBackground: 'rgba(47, 98, 176, 0.22)',
  xtermTheme: lightTheme,
  ansiRewrite: {
    enabled: true,
    panelBackground: [244, 241, 232],
    textForeground: [28, 42, 65],
    darkBackgroundMaxLuma: 170,
    brightForegroundMinLuma: 175,
    targetForegroundLuma: 120,
  },
}

const darkProfile: TerminalThemeProfile = {
  variant: 'dark',
  name: 'OpenAlice Dark',
  foreground: [230, 237, 243],
  background: [11, 13, 16],
  palette: [
    [72, 79, 88],
    [255, 123, 114],
    [126, 231, 135],
    [210, 153, 34],
    [121, 192, 255],
    [210, 168, 255],
    [165, 214, 255],
    [230, 237, 243],
    [110, 118, 129],
    [255, 161, 152],
    [86, 211, 100],
    [227, 179, 65],
    [165, 214, 255],
    [210, 168, 255],
    [182, 227, 255],
    [240, 246, 252],
  ],
  cursorColor: [126, 231, 135],
  cursorText: [11, 13, 16],
  selectionBackground: '#264f78',
  xtermTheme: darkTheme,
  ansiRewrite: { enabled: false },
}

export function xtermThemeForVariant(variant: TerminalThemeVariant): ITheme {
  return terminalThemeProfileForVariant(variant).xtermTheme
}

export function terminalThemeProfileForVariant(variant: TerminalThemeVariant): TerminalThemeProfile {
  return variant === 'light' ? lightProfile : darkProfile
}

export interface TerminalClientThemeDTO {
  readonly fg: number
  readonly bg: number
  readonly palette: readonly number[]
  readonly cursorColor: number
  readonly cursorText: number
  readonly selectionBackground: string
}

export function terminalClientThemeDTO(profile: TerminalThemeProfile): TerminalClientThemeDTO {
  return {
    fg: rgbToInt(profile.foreground),
    bg: rgbToInt(profile.background),
    palette: profile.palette.map(rgbToInt),
    cursorColor: rgbToInt(profile.cursorColor),
    cursorText: rgbToInt(profile.cursorText),
    selectionBackground: profile.selectionBackground,
  }
}

function rgbToInt(rgb: TerminalThemeRgb): number {
  return (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]
}
