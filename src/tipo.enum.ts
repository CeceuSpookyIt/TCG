export enum enumTipo {
  ataque,
  cura,
  buff,
  escudo,
  mana,
  veneno
}

export function obterNomeTipo(tipo: enumTipo): string {
  switch (tipo) {
    case enumTipo.ataque:
      return "Ataque";
    case enumTipo.cura:
      return "Cura";
    case enumTipo.buff:
      return "Buff";
    case enumTipo.escudo:
      return "Escudo";
    case enumTipo.mana:
      return "Mana";
    case enumTipo.veneno:
      return "Veneno";
    default:
      return "";
  }
}

