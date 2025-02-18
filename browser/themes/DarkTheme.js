export const DarkTheme = {
  branding: null, // Defined in custom brandings
  colors: {
    background: "#F8F8F8",
    text: "#242323",
    headings: "#FFFFFF",
    primary: {
      // Low index = low brightness
      1: "#001E1B",
      2: "#003C36",
      3: "#005A51 ",
      4: "#00786D",
      5: "#009688",
    },
    interaction: {
      1: "#33200B",
      2: "#996121",
      3: "#CC812C",
      4: "#FFA137",
      5: "#FFB45F",
    },
    gray: {
      1: "#242323",
      2: "#6C6969",
      3: "#B4AFAF",
      4: "#D2CFCF",
      5: "#F0EFEF",
    },
    denotive: {
      success: "#19B037",
      warning: "#FFA137",
      error: "#FC3C3C",
    },
  },
  layout: {
    borderRadius: {
      small: 4,
      medium: 8,
      large: 16,
    },
    gutter: 32,
    sidebar: [90, 300],
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    breakpoints: {
      small: "@media (min-width: 480px)",
      medium: "@media (min-width: 768px)",
      large: "@media (min-width: 1200px)",
    },
  },
  fonts: {
    title: "bold 40px Roboto",
    subtitle: "300 24px Roboto",
    heading: "300 20px Roboto",
    body: "300 15px Roboto",
    subbody: "300 13px Roboto",
    label: "300 12px Roboto",
    footnote: "300 9px Roboto",
  },
};
