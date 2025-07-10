// useTheme - 테마 색상 팔레트 생성 함수
const useTheme = (config = {}) => {
  // 기본 테마 색상들
  const defaultColors = {
    primary: '#00BCD4',
    secondary: '#6C757D',
    success: '#28A745',
    danger: '#DC3545',
    warning: '#FFC107',
    info: '#17A2B8',
    light: '#F8F9FA',
    dark: '#343A40'
  };

    // 색상 팔레트 생성 함수
  const generateColorPalette = (baseColor, key) => {
    const palette = {};
    
    // HSL 변환을 위한 헬퍼 함수
    const hexToHsl = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return null;
      
      const r = parseInt(result[1], 16) / 255;
      const g = parseInt(result[2], 16) / 255;
      const b = parseInt(result[3], 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      
      return [h * 360, s * 100, l * 100];
    };
    
    // HSL을 HEX로 변환하는 헬퍼 함수
    const hslToHex = (h, s, l) => {
      h /= 360;
      s /= 100;
      l /= 100;
      
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      
      let r, g, b;
      
      if (s === 0) {
        r = g = b = l;
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
      
      const toHex = (c) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };
    
    // 밝기 조정 함수
    const adjustLightness = (h, s, l, factor) => {
      const newL = Math.max(0, Math.min(100, l * factor));
      return hslToHex(h, s, newL);
    };
    
    // 채도 조정 함수
    const adjustSaturation = (h, s, l, factor) => {
      const newS = Math.max(0, Math.min(100, s * factor));
      return hslToHex(h, newS, l);
    };
    
    // HSL 값 가져오기
    const hsl = hexToHsl(baseColor);
    if (!hsl) {
      console.warn(`Invalid color format for ${key}: ${baseColor}`);
      return { [key]: { [key]: baseColor } };
    }
    
    const [h, s, l] = hsl;
    
    // 색상 팔레트 생성 (50부터 900까지)
    const lightnessFactors = {
      50: 0.95,   // 매우 밝음
      100: 0.9,
      200: 0.8,
      300: 0.7,
      400: 0.6,
      500: 0.5,   // 기본 색상
      600: 0.4,
      700: 0.3,
      800: 0.2,
      900: 0.1    // 매우 어두움
    };
    
    const saturationFactors = {
      50: 0.3,    // 매우 연함
      100: 0.5,
      200: 0.7,
      300: 0.85,
      400: 0.95,
      500: 1.0,   // 기본 채도
      600: 1.05,
      700: 1.1,
      800: 1.15,
      900: 1.2    // 매우 진함
    };
    
    // 색상 객체 생성
    palette[key] = {};
    
    // 각 단계별 색상 생성
    Object.keys(lightnessFactors).forEach(step => {
      const lightnessFactor = lightnessFactors[step];
      const saturationFactor = saturationFactors[step];
      
      // 밝기와 채도를 모두 조정하여 색상 생성
      const adjustedColor = adjustSaturation(h, s, l, saturationFactor);
      const finalColor = adjustLightness(h, s * saturationFactor, l, lightnessFactor);
      
      palette[key][step] = finalColor;
    });
    
    return palette;
  };

  // 테마 객체 생성
  const theme = {};

  // 설정된 색상들 처리
  Object.keys(config).forEach(key => {
    const color = config[key];

    // 색상이 객체인 경우 (예: { 400: '#0097A7' })
    if (typeof color === 'object' && color !== null) {
      Object.keys(color).forEach(step => {
        const stepColor = color[step];
        if (typeof stepColor === 'string') {
          // 개별 단계 색상이 제공된 경우, 해당 색상을 기반으로 팔레트 생성
          const palette = generateColorPalette(stepColor, key);
          Object.assign(theme, palette);
        }
      });
    }
    // 색상이 문자열인 경우 (예: 'primary': '#00BCD4')
    else if (typeof color === 'string') {
      const palette = generateColorPalette(color, key);
      Object.assign(theme, palette);
    }
  });

  // 기본 색상들도 추가 (설정되지 않은 경우)
  Object.keys(defaultColors).forEach(key => {
    if (!config[key]) {
      const palette = generateColorPalette(defaultColors[key], key);
      Object.assign(theme, palette);
    }
  });

  // 추가 유틸리티 색상들
  const utilityColors = {
    // 그레이스케일
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',

    // 흰색/검정
    white: '#FFFFFF',
    black: '#000000',

    // 투명도
    transparent: 'transparent',

    // 오버레이
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.1)',
    overlayDark: 'rgba(0, 0, 0, 0.8)',

    // 그림자
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowDark: 'rgba(0, 0, 0, 0.2)',

    // 테두리
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    borderDark: '#D1D5DB',

    // 배경
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',

    // 텍스트
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',

    // 상태 색상
    disabled: '#F3F4F6',
    disabledText: '#9CA3AF',
    error: '#DC3545',
    warning: '#FFC107',
    success: '#28A745',
    info: '#17A2B8'
  };

  // 유틸리티 색상들을 테마에 추가
  Object.assign(theme, utilityColors);

  return theme;
};

// 전역 함수로도 사용할 수 있도록 설정
window.useTheme = useTheme;

// CommonJS 모듈 지원
if (typeof module !== 'undefined' && module.exports) {
  module.exports = useTheme;
}

// ES6 모듈 지원
if (typeof exports !== 'undefined') {
  exports.useTheme = useTheme;
} 