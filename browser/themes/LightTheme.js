export const LightTheme = {
  branding: null, // Defined in custom brandings
  buttons: {
    background: '#000',
    color: '#fff'
  },
  padding: {
    titlePadding: '30px'
  },
  colors: {
    background: "#F8F8F8",
    text: "#242323",
    headings: "#292A2C",
    primary: { // Low index = low brightness
      1: "#001E1B",
      2: "#003C36",
      3: "#005A51 ",
      4: "#00786D",
      5: "#009688"
    },
    interaction: {
      1: "#33200B",
      2: "#996121",
      3: "#CC812C",
      4: "#FFA137",
      5: "#FFB45F"
    },
    gray: {
      1: "#242323",
      2: "#6C6969",
      3: "#B4AFAF",
      4: "#D2CFCF",
      5: "#F0EFEF"
    },
    denotive: {
        success: "#19B037",
        warning: "#FFA137",
        error: "#FC3C3C"
      },
  },
  layout: {
    borderRadius: {
        small: 4,
        medium: 8,
        large: 16
    },
    gutter: 32,
    sidebar: [90, 300],
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    breakpoints: {
      small: "@media (min-width: 480px)",
      medium: "@media (min-width: 768px)",
      large: "@media (min-width: 1200px)"
    }
  },
  fonts: {
    title: "'bold 40px Lato'",
    subtitle: "'regular 24px Lato'",
    heading: "'bold 18px Open Sans'",
    body: "'regular 15px Open Sans'",
    subbody: "'regular 13px Open Sans'",
    footnote: "'regular 11px Open Sans'",
  }
};
