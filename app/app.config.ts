export default defineAppConfig({
  global: {
    picture: {
      dark: 'https://i.imgur.com/5prWFBk.jpeg',
      light: 'https://i.imgur.com/5prWFBk.jpeg',
      alt: 'My profile picture'
    },
    email: 'bielfaria2003@gmail.com',
    available: true,
    meetingLink: 'https://cal.com/gabriel-faria07'
  },
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'neutral'
    },
    pageHero: {
      slots: {
        container: 'py-18 sm:py-24 lg:py-32',
        title: 'mx-auto max-w-xl text-pretty text-3xl sm:text-4xl lg:text-5xl',
        description: 'mt-2 text-md mx-auto max-w-2xl text-pretty sm:text-md text-muted'
      }
    }
  },
  footer: {
    colorMode: false,
    links: [
      {
        'icon': 'i-simple-icons-linkedin',
        'to': 'https://www.linkedin.com/in/faria0703',
        'target': '_blank',
        'aria-label': 'Gabriel Oliveira on LinkedIn'
      },
      {
        'icon': 'i-simple-icons-github',
        'to': 'https://github.com/Gabriel-br07',
        'target': '_blank',
        'aria-label': 'Gabriel Oliveira on GitHub'
      },
      {
        'icon': 'i-lucide-mail',
        'to': 'mailto:bielfaria2003@gmail.com',
        'aria-label': 'Email Gabriel Oliveira'
      }
    ]
  }
})
