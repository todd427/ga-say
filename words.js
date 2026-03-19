// ga-say word list
// Format: { irish, eng, phonetic, cat }
// cat: greetings | phrases | culture | nature | numbers | projects | misc

const WORDS = [
  // Greetings
  { irish:"Dia dhuit",          eng:"Hello (to one)",           phonetic:"Dee-ah gwit",             cat:"greetings" },
  { irish:"Dia is Muire dhuit", eng:"Hello (reply)",            phonetic:"Dee-ah iss Mwirr-ah gwit", cat:"greetings" },
  { irish:"Conas atá tú?",      eng:"How are you?",             phonetic:"KUN-us ah-TAW too",        cat:"greetings" },
  { irish:"Cad é mar atá tú?",  eng:"How are you? (Ulster)",    phonetic:"KAJ-ay mar ah-TAW too",    cat:"greetings" },
  { irish:"Tá mé go maith",     eng:"I am well",                phonetic:"taw may guh mah",          cat:"greetings" },
  { irish:"Slán",               eng:"Goodbye",                  phonetic:"slawn",                    cat:"greetings" },
  { irish:"Slán abhaile",       eng:"Safe home",                phonetic:"slawn AH-wil-yeh",         cat:"greetings" },
  { irish:"Oíche mhaith",       eng:"Good night",               phonetic:"EE-heh wah",               cat:"greetings" },

  // Phrases
  { irish:"Go raibh maith agat",eng:"Thank you",                phonetic:"guh rev MAH ag-ut",        cat:"phrases" },
  { irish:"Le do thoil",        eng:"Please",                   phonetic:"leh duh hull",             cat:"phrases" },
  { irish:"Tá brón orm",        eng:"I'm sorry",                phonetic:"taw brawn or-um",          cat:"phrases" },
  { irish:"Ceart go leor",      eng:"Fair enough / OK",         phonetic:"kyart guh lore",           cat:"phrases" },
  { irish:"Craic",              eng:"Fun / news / atmosphere",  phonetic:"crack",                    cat:"phrases" },
  { irish:"Sláinte",            eng:"Health / cheers",          phonetic:"SLAWN-che",                cat:"phrases" },
  { irish:"Fáilte",             eng:"Welcome",                  phonetic:"FAWL-che",                 cat:"phrases" },
  { irish:"Ná bac leis",        eng:"Never mind / forget it",   phonetic:"naw bock lesh",            cat:"phrases" },
  { irish:"Cúpla focal",        eng:"A few words",              phonetic:"KOOH-plah FUK-ul",         cat:"phrases" },
  { irish:"Ár dteanga",         eng:"Our language",             phonetic:"awr DYAN-gah",             cat:"phrases" },

  // Culture / language
  { irish:"scéal",              eng:"story / news",             phonetic:"shkyal",                   cat:"culture" },
  { irish:"tionól",             eng:"gathering / assembly",     phonetic:"TYUN-ole",                 cat:"culture" },
  { irish:"foclóir",            eng:"dictionary",               phonetic:"FUK-lore",                 cat:"culture" },
  { irish:"focal",              eng:"word",                     phonetic:"FUK-ul",                   cat:"culture" },
  { irish:"Gaeilge",            eng:"Irish language",           phonetic:"GWALE-gyeh",               cat:"culture" },
  { irish:"Gaeilge Beo",        eng:"Living Irish",             phonetic:"GWALE-gyeh byoh",          cat:"culture" },
  { irish:"Gaeltacht",          eng:"Irish-speaking region",    phonetic:"GWAL-tukht",               cat:"culture" },
  { irish:"seisiún",            eng:"session (music)",          phonetic:"SHESH-oon",                cat:"culture" },
  { irish:"ceol",               eng:"music",                    phonetic:"kyole",                    cat:"culture" },
  { irish:"amhrán",             eng:"song",                     phonetic:"OW-rawn",                  cat:"culture" },
  { irish:"pobal",              eng:"community / people",       phonetic:"PUB-ul",                   cat:"culture" },
  { irish:"foghlaim",           eng:"learning / to learn",      phonetic:"FOW-lim",                  cat:"culture" },
  { irish:"ceacht",             eng:"lesson",                   phonetic:"kyakht",                   cat:"culture" },
  { irish:"ceacht beag",        eng:"mini lesson",              phonetic:"kyakht byug",              cat:"culture" },
  { irish:"focal an lae",       eng:"word of the day",          phonetic:"FUK-ul un lay",            cat:"culture" },
  { irish:"séimhiú",            eng:"lenition (consonant softening)", phonetic:"SHAY-voo",           cat:"culture" },
  { irish:"snáithe",            eng:"thread",                   phonetic:"SNAW-heh",                 cat:"culture" },
  { irish:"comhrá",             eng:"conversation",             phonetic:"KOH-raw",                  cat:"culture" },
  { irish:"abair",              eng:"speak / say (command)",    phonetic:"AH-bir",                   cat:"culture" },

  // Nature
  { irish:"loch",               eng:"lake",                     phonetic:"lokh",                     cat:"nature" },
  { irish:"sliabh",             eng:"mountain",                 phonetic:"shleev",                   cat:"nature" },
  { irish:"coill",              eng:"forest / wood",            phonetic:"kwill",                    cat:"nature" },
  { irish:"abhainn",            eng:"river",                    phonetic:"OW-in",                    cat:"nature" },
  { irish:"trá",                eng:"beach",                    phonetic:"traw",                     cat:"nature" },
  { irish:"oileán",             eng:"island",                   phonetic:"IL-awn",                   cat:"nature" },

  // Numbers
  { irish:"a haon",             eng:"one",                      phonetic:"ah hayn",                  cat:"numbers" },
  { irish:"a dó",               eng:"two",                      phonetic:"ah doe",                   cat:"numbers" },
  { irish:"a trí",              eng:"three",                    phonetic:"ah tree",                  cat:"numbers" },
  { irish:"a ceathair",         eng:"four",                     phonetic:"ah KAH-her",               cat:"numbers" },
  { irish:"a cúig",             eng:"five",                     phonetic:"ah KOO-ig",                cat:"numbers" },
  { irish:"a sé",               eng:"six",                      phonetic:"ah shay",                  cat:"numbers" },
  { irish:"a seacht",           eng:"seven",                    phonetic:"ah shokht",                cat:"numbers" },
  { irish:"a hocht",            eng:"eight",                    phonetic:"ah hukht",                 cat:"numbers" },
  { irish:"a naoi",             eng:"nine",                     phonetic:"ah nee",                   cat:"numbers" },
  { irish:"a deich",            eng:"ten",                      phonetic:"ah djeh",                  cat:"numbers" },

  // FoxxeLabs / Irish-named projects
  { irish:"anseo",              eng:"here / present — Anseo platform", phonetic:"an-SHUH",           cat:"projects" },
  { irish:"sionnach",           eng:"fox — Sionnach WebGPU chat app",  phonetic:"SHUN-ukh",          cat:"projects" },
  { irish:"comhrá",             eng:"conversation — multi-model chat UI concept", phonetic:"KOH-raw", cat:"projects" },
  { irish:"abair",              eng:"speak/say — proposed TTS-first app name",    phonetic:"AH-bir",  cat:"projects" },
  { irish:"snáithe",            eng:"thread — proposed chat app name", phonetic:"SNAW-heh",           cat:"projects" },
  { irish:"mnemos",             eng:"memory (Greek root) — personal RAG system",  phonetic:"NEE-mos", cat:"projects" },
];
