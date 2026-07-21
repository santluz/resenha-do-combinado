// types/apostas.ts
export interface Aposta {
  id?: string;
  jogoId: string;
  tipo: "primeiro_gol" | "vencedor";
  nomeVotante: string;
  voto: string;
  timeVoto?: string; // time do jogador votado (para primeiro_gol)
  criadoEm?: any;
}

export interface ConfigAposta {
  id?: string;
  jogoId: string;
  ativo: boolean;
  encerrado: boolean;
  valorAposta: number;        // Valor em reais (ex: 5)
  timeA: string;              // Nome do Time A
  timeB: string;              // Nome do Time B
  jogadoresTimeA: string[];   // Jogadores do Time A
  jogadoresTimeB: string[];   // Jogadores do Time B
  resultadoPrimeiroGol?: string;
  resultadoVencedor?: string;
}

export interface ResumoAposta {
  voto: string;
  time?: string;
  total: number;
  percentual: number;
  acertou?: boolean;
}
