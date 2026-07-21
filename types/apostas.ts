export interface Aposta { id?: string; jogoId: string; tipo: "primeiro_gol" | "vencedor"; nomeVotante: string; voto: string; criadoEm?: any; }
export interface ConfigAposta { id?: string; jogoId: string; ativo: boolean; adversario: string; jogadores: string[]; encerrado: boolean; resultadoPrimeiroGol?: string; resultadoVencedor?: string; }
export interface ResumoAposta { voto: string; total: number; percentual: number; acertou?: boolean; }
