export interface RecommendedBook {
  id: string
  title: string
  author: string
  description: string
  coverSrc: string
  coverAlt: string
  buyUrl: string
  status?: BookStatus
}

/** read: finished; reading: in progress; next: queued after the current one. */
export type BookStatus = 'read' | 'reading' | 'next'

/** Mock data — add entries here to extend the grid. Cover files live in `public/books/`. */
export const recommendedBooks: RecommendedBook[] = [
  {
    id: 'agile-cdc',
    title: 'Agile — Desenvolvimento de Software com Entregas Frequentes',
    author: 'André Faria Gomes',
    description:
      'Práticas ágeis para entregar software de forma incremental, alinhando time de desenvolvimento às necessidades reais do negócio. (Casa do Código)',
    coverSrc: '/books/agile-casa-do-codigo.jpg',
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
    coverSrc: '/books/software-craftsman.jpg',
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
    coverSrc: '/books/arquitetura-limpa.jpg',
    coverAlt:
      'Capa de Arquitetura Limpa: galáxia espiral em tons de azul e branco no espaço',
    buyUrl: 'https://www.amazon.com.br/s?k=Arquitetura+Limpa+Robert+C+Martin',
    status: 'read'
  },
  {
    id: 'refactoring',
    title: 'Refatoração — Aperfeiçoando o Design de Códigos Existentes',
    author: 'Martin Fowler',
    description:
      'Como melhorar a estrutura de um código existente em pequenos passos seguros, com catálogo de refatorações e sinais de quando aplicá-las.',
    coverSrc: '/books/refatoracao.jpg',
    coverAlt: 'Capa de Refatoração de Martin Fowler',
    buyUrl: 'https://www.amazon.com.br/s?k=Refatoracao+Martin+Fowler',
    status: 'reading'
  },
  {
    id: 'python-classic-cs-problems',
    title: 'Problemas Clássicos de Ciência da Computação com Python',
    author: 'David Kopec',
    description:
      'Resolve problemas clássicos de ciência da computação com Python, da estrutura de dados a algoritmos.',
    coverSrc: '/books/problemas-classicos-python.jpg',
    coverAlt: 'Capa de Problemas Clássicos de Ciência da Computação com Python',
    buyUrl: 'https://www.amazon.com.br/s?k=Problemas+Classicos+de+Ciencia+da+Computacao+com+Python',
    status: 'next'
  }
]
