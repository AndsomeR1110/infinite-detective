import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 赛博朋克主题色
        cyber: {
          purple: "#9D4EDD",
          pink: "#FF006E",
          blue: "#00B4D8",
          green: "#06FFA5",
          red: "#FF0035",
          yellow: "#FFBE0B",
        },
        // 黑色电影主题色
        noir: {
          black: "#0A0A0A",
          dark: "#1A1A1A",
          gray: "#2D2D2D",
          light: "#404040",
        },
      },
      backgroundImage: {
        // 氛围渐变背景
        "neon-rain": "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        "cyber-slums": "linear-gradient(135deg, #2d2d2d 0%, #4a1919 100%)",
        "high-tech-lab": "linear-gradient(135deg, #e0e0e0 0%, #a8dadc 100%)",
        "noir-bar": "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%)",
        "danger-alley": "linear-gradient(135deg, #1a0000 0%, #4a0000 100%)",
        "matrix-digital": "linear-gradient(135deg, #000000 0%, #001a00 100%)",
      },
      animation: {
        // 高 Tension 效果
        "red-pulse": "redPulse 2s infinite",
        "shake": "shake 0.5s infinite",
        "shake-hard": "shakeHard 0.3s infinite",

        // Glitch 效果
        "glitch": "glitch 0.3s infinite",
        "glitch-fast": "glitch 0.1s infinite",

        // 打字机光标
        "blink": "blink 1s infinite",

        // 淡入淡出
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-out": "fadeOut 0.3s ease-in",

        // 脉冲效果（不同速度）
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-fast": "pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",

        // 理智值警告
        "sanity-warning": "sanityWarning 1s infinite",
        "sanity-critical": "sanityCritical 0.5s infinite",

        // 扫描线效果（数字空间）
        "scanline": "scanline 8s linear infinite",

        // 霓虹闪烁
        "neon-flicker": "neonFlicker 1.5s infinite",
      },
      keyframes: {
        // 红色脉冲（高 Tension）
        redPulse: {
          "0%, 100%": {
            boxShadow: "inset 0 0 50px rgba(220, 38, 38, 0.3)",
          },
          "50%": {
            boxShadow: "inset 0 0 100px rgba(220, 38, 38, 0.5)",
          },
        },

        // 抖动效果
        shake: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translate(-2px, 0)" },
          "20%, 40%, 60%, 80%": { transform: "translate(2px, 0)" },
        },
        shakeHard: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "10%, 30%, 50%, 70%, 90%": {
            transform: "translate(-4px, 2px) rotate(-1deg)",
          },
          "20%, 40%, 60%, 80%": {
            transform: "translate(4px, -2px) rotate(1deg)",
          },
        },

        // Glitch 效果
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },

        // 光标闪烁
        blink: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },

        // 淡入
        fadeIn: {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },

        // 淡出
        fadeOut: {
          from: {
            opacity: "1",
            transform: "translateY(0)",
          },
          to: {
            opacity: "0",
            transform: "translateY(-10px)",
          },
        },

        // 理智值警告
        sanityWarning: {
          "0%, 100%": {
            boxShadow: "0 0 5px rgba(239, 68, 68, 0.5)",
          },
          "50%": {
            boxShadow: "0 0 20px rgba(239, 68, 68, 0.8)",
          },
        },
        sanityCritical: {
          "0%, 100%": {
            boxShadow: "0 0 10px rgba(239, 68, 68, 0.7)",
            transform: "scale(1)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(239, 68, 68, 1)",
            transform: "scale(1.02)",
          },
        },

        // 扫描线
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },

        // 霓虹闪烁
        neonFlicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": {
            opacity: "1",
          },
          "20%, 24%, 55%": { opacity: "0.6" },
        },
      },
      filter: {
        // 模糊效果（理智值低时）
        "blur-sm": "blur(1px)",
        "blur-md": "blur(3px)",
        "blur-lg": "blur(5px)",
      },
    },
  },
  plugins: [],
};

export default config;
