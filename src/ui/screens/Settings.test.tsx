import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Settings } from './Settings'

describe('Settings (Ajustes/Info)', () => {
  it('mostra informações local-first e PWA/offline', () => {
    render(<Settings />)
    expect(screen.getByText('Sobre o Eixo')).toBeInTheDocument()
    expect(
      screen.getByText('App local-first: funciona no seu dispositivo.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/abre offline após o primeiro carregamento/),
    ).toBeInTheDocument()
  })

  it('avisa sobre dados locais e indica backup na próxima fase', () => {
    render(<Settings />)
    expect(screen.getByText(/Limpar os dados do navegador/)).toBeInTheDocument()
    expect(screen.getByText(/exportação em JSON/)).toBeInTheDocument()
  })

  it('mostra status do dispositivo sem quebrar quando APIs não existem', () => {
    // jsdom não tem wakeLock nem vibrate → deve renderizar "Não", sem erro.
    render(<Settings />)
    expect(screen.getByText('Status do dispositivo')).toBeInTheDocument()
    expect(screen.getByText('Recursos offline')).toBeInTheDocument()
    expect(screen.getByText('Manter tela acesa')).toBeInTheDocument()
    expect(screen.getByText('Vibração')).toBeInTheDocument()
  })

  it('mostra a seção de segurança', () => {
    render(<Settings />)
    expect(
      screen.getByText(
        'Este app não substitui avaliação médica ou fisioterapêutica.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Dor aguda')).toBeInTheDocument()
  })
})
