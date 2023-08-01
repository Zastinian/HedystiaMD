export interface Lang {
  help: Help;
  play: Play;
  errors: Errors;
  interaction: Interaction;
}

export interface Help {
  menu: string;
  buttons: Buttons;
  menus: Menus;
}

export interface Buttons {
  t1: string;
  t2: string;
  t3: string;
}

export interface Menus {
  info: string;
  interaction: string;
  music: string;
}

export interface Play {
  info: string;
  error: string;
  info2: string;
  cooldown: string;
}

export interface Errors {
  noUserMention: string;
}

export interface Interaction {
  feed: string;
  hug: string;
  kiss: string;
  pat: string;
  slap: string;
  smug: string;
}
