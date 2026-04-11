export interface RecommendedBook {
  id: string
  title: string
  author: string
  description: string
  coverSrc: string
  coverAlt: string
  buyUrl: string
  currentlyReading?: boolean
}

/** Mock data — add entries here to extend the grid. Cover files live in `public/books/`. */
export const recommendedBooks: RecommendedBook[] = [
  {
    id: 'agile-cdc',
    title: 'Agile — Desenvolvimento de Software com Entregas Frequentes',
    author: 'André Faria Gomes',
    description:
      'Práticas ágeis para entregar software de forma incremental, alinhando time de desenvolvimento às necessidades reais do negócio. (Casa do Código)',
    coverSrc: '/books/agile-casa-do-codigo.png',
    coverAlt:
      'Capa do livro Agile: fios coloridos trançados, título em destaque e selo Casa do Código',
    buyUrl: 'https://www.amazon.com.br/s?k=Agile+Desenvolvimento+de+Software+Casa+do+Código'
  },
  {
    id: 'software-craftsman',
    title: 'The Software Craftsman: Professionalism, Pragmatism, Pride',
    author: 'Sandro Mancuso',
    description:
      'Reflexões sobre profissionalismo em software: disciplina, prática deliberada e orgulho na qualidade do trabalho técnico.',
    coverSrc: '/books/software-craftsman.png',
    coverAlt:
      'Capa de The Software Craftsman: mãos de artesão entalhando madeira, série Robert C. Martin',
    buyUrl: 'https://www.amazon.com.br/s?k=The+Software+Craftsman+Sandro+Mancuso'
  },
  {
    id: 'clean-architecture-pt',
    title: 'Clean Architecture — A Craftsman’s Guide to Software Structure and Design',
    author: 'Robert C. Martin',
    description:
      'Princípios para organizar regras de negócio, limites entre camadas e dependências — da teoria a decisões práticas de arquitetura.',
    coverSrc: '/books/arquitetura-limpa.png',
    coverAlt:
      'Capa de Arquitetura Limpa: galáxia espiral em tons de azul e branco no espaço',
    buyUrl: 'https://www.amazon.com.br/s?k=Arquitetura+Limpa+Robert+C+Martin',
    currentlyReading: true
  }
]
