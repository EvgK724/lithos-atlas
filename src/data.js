/* Verified source records are embedded into the standalone build. */
const RESEARCH = /*__RESEARCH__*/;
const EDITORIAL = {
  khufu:{anchor:'Пирамида = организация',titles:['Геометрия','Материалы','Логистика'],engineeringTitle:'Как организовать миллионы операций',pair:'baalbek'},
  osireion:{anchor:'Остров из камня',titles:['Связь с Абидосом','Каменная конструкция','Образ первозданных вод'],engineeringTitle:'Заглублённый зал и тяжёлые перекрытия',pair:'serapeum'},
  serapeum:{anchor:'Бык, короб, подземелье',titles:['Культ Аписа','Разные эпохи','Гранит под землёй'],engineeringTitle:'Как перемещать большой саркофаг в галерее',pair:'osireion'},
  baalbek:{anchor:'Гиганты в основании',titles:['Римский храм','Блоки подиума','Каменоломня рядом'],engineeringTitle:'Большие блоки: от карьера до подиума',pair:'khufu'},
  gobekli:{anchor:'Буква Т раньше городов',titles:['Ранний неолит','Каменные фигуры','Совместная работа'],engineeringTitle:'Высечь, доставить и поставить Т-образную опору',pair:'stonehenge'},
  stonehenge:{anchor:'Камень с соединением',titles:['Несколько этапов','Происхождение камня','Работа соединений'],engineeringTitle:'Каменная сборка с шипами и пазами',pair:'gobekli'},
  newgrange:{anchor:'Свет внутри холма',titles:['Проход и камера','Каменный свод','Зимнее солнце'],engineeringTitle:'Удержать насыпь и провести свет в глубину',pair:'hagarqim'},
  hagarqim:{anchor:'Кривые стены, большие камни',titles:['Мальтийский неолит','План храма','Местный известняк'],engineeringTitle:'Мегалитическая оболочка и внутренние камеры',pair:'newgrange'},
  pumapunku:{anchor:'Сначала блок, затем узел',titles:['Мир Тиуанако','Два вида камня','Повторяемые формы'],engineeringTitle:'Модули из андезита и каменная платформа',pair:'petra'},
  petra:{anchor:'Фасад вычитают из скалы',titles:['Набатейское мастерство','Высеченный фасад','Название и назначение'],engineeringTitle:'Здание, которое получают удалением камня',pair:'pumapunku'}
};
const SEARCH_ALIASES={osireion:['Осирейон','Оссиреон','Оссирион','Osirion'],khufu:['Хуфу','Великая пирамида'],baalbek:['Баалбек'],petra:['Эль-Хазне','Аль-Хазна','Сокровищница'],hagarqim:['Хагар-Ким']};
const WONDERS = RESEARCH.wonders.map(w => ({...w,...EDITORIAL[w.id],pair:w.pair?.id||EDITORIAL[w.id].pair,pairTitle:w.pair?.title||'Сравнить конструкции',pairText:w.pair?.text||w.distinction,aliases:[...(w.aliases||[]),...(SEARCH_ALIASES[w.id]||[])],titles:w.titles||EDITORIAL[w.id].titles,anchor:w.anchor||EDITORIAL[w.id].anchor,engineeringTitle:w.engineeringTitle||EDITORIAL[w.id].engineeringTitle,cityFull:w.city,city:w.city.split(' — ')[0].split(', ')[0],lat:w.coordinates.lat,lon:w.coordinates.lon}));
const BY_ID = Object.fromEntries(WONDERS.map(w => [w.id,w]));
const memoryText = w => w.mnemonic.replace(/^Учебная ассоциация:\s*/,'');
const groupName = w => w.group === 'megalith' ? 'Мегалиты' : 'Комплексы';
