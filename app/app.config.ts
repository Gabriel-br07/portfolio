export default defineAppConfig({
  global: {
    picture: {
      dark: '/images/profile/avatar.webp',
      light: '/images/profile/avatar.webp',
      alt: 'My profile picture'
    },
    email: 'bielfaria2003@gmail.com',
    available: true,
    meetingLink: 'https://cal.com/gabriel-faria07',
    // Topics exposed as `knowsAbout` in the Person JSON-LD (technologies used in the projects).
    knowsAbout: [
      'Back-end development',
      'Full-stack development',
      'Rust',
      'Axum',
      'Python',
      'FastAPI',
      'Prefect',
      'PostgreSQL',
      'OpenSearch',
      'Vue',
      'Nuxt',
      'OAuth2'
    ]
  },
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'neutral'
    },
    pageHero: {
      slots: {
        container: 'pt-18 pb-12 sm:pt-24 sm:pb-16 lg:pt-32 lg:pb-20',
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
