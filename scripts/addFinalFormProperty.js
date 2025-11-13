const fs = require('fs');
const path = require('path');

// Evolution data based on https://pokemondb.net/evolution
// true = final form, false = can still evolve
const finalFormMap = {
  // Gen 1
  1: false, 2: false, 3: true, // Bulbasaur line
  4: false, 5: false, 6: true, // Charmander line
  7: false, 8: false, 9: true, // Squirtle line
  10: false, 11: false, 12: true, // Caterpie line
  13: false, 14: false, 15: true, // Weedle line
  16: false, 17: false, 18: true, // Pidgey line
  19: false, 20: true, // Rattata line
  21: false, 22: true, // Spearow line
  23: false, 24: true, // Ekans line
  25: false, 26: true, // Pikachu line
  27: false, 28: true, // Sandshrew line
  29: false, 30: false, 31: true, // Nidoran♀ line
  32: false, 33: false, 34: true, // Nidoran♂ line
  35: false, 36: true, // Clefairy line
  37: false, 38: true, // Vulpix line
  39: false, 40: true, // Jigglypuff line
  41: false, 42: false, // Zubat -> Golbat (evolves to Crobat)
  43: false, 44: false, 45: true, // Oddish line -> Vileplume
  46: false, 47: true, // Paras line
  48: false, 49: true, // Venonat line
  50: false, 51: true, // Diglett line
  52: false, 53: true, // Meowth line
  54: false, 55: true, // Psyduck line
  56: false, 57: false, // Mankey -> Primeape (evolves to Annihilape)
  58: false, 59: true, // Growlithe line
  60: false, 61: false, 62: true, // Poliwag line -> Poliwrath
  63: false, 64: false, 65: true, // Abra line
  66: false, 67: false, 68: true, // Machop line
  69: false, 70: false, 71: true, // Bellsprout line
  72: false, 73: true, // Tentacool line
  74: false, 75: false, 76: true, // Geodude line
  77: false, 78: true, // Ponyta line
  79: false, 80: true, // Slowpoke -> Slowbro
  81: false, 82: false, // Magnemite -> Magneton (evolves to Magnezone)
  83: false, // Farfetch'd (evolves to Sirfetch'd)
  84: false, 85: true, // Doduo line
  86: false, 87: true, // Seel line
  88: false, 89: true, // Grimer line
  90: false, 91: true, // Shellder line
  92: false, 93: false, 94: true, // Gastly line
  95: false, // Onix (evolves to Steelix)
  96: false, 97: true, // Drowzee line
  98: false, 99: true, // Krabby line
  100: false, 101: true, // Voltorb line
  102: false, 103: true, // Exeggcute line
  104: false, 105: true, // Cubone line
  106: true, 107: true, // Hitmonlee, Hitmonchan
  108: false, // Lickitung (evolves to Lickilicky)
  109: false, 110: true, // Koffing line
  111: false, 112: false, // Rhyhorn -> Rhydon (evolves to Rhyperior)
  113: false, // Chansey (evolves to Blissey)
  114: false, // Tangela (evolves to Tangrowth)
  115: true, // Kangaskhan
  116: false, 117: false, // Horsea -> Seadra (evolves to Kingdra)
  118: false, 119: true, // Goldeen line
  120: false, 121: true, // Staryu line
  122: true, // Mr. Mime
  123: false, // Scyther (evolves to Scizor or Kleavor)
  124: true, // Jynx
  125: false, // Electabuzz (evolves to Electivire)
  126: false, // Magmar (evolves to Magmortar)
  127: true, 128: true, // Pinsir, Tauros
  129: false, 130: true, // Magikarp line
  131: true, 132: true, // Lapras, Ditto
  133: false, // Eevee
  134: true, 135: true, 136: true, // Vaporeon, Jolteon, Flareon
  137: false, // Porygon (evolves to Porygon2)
  138: false, 139: true, // Omanyte line
  140: false, 141: true, // Kabuto line
  142: true, 143: true, // Aerodactyl, Snorlax
  144: true, 145: true, 146: true, // Legendary birds
  147: false, 148: false, 149: true, // Dratini line
  150: true, 151: true, // Mewtwo, Mew
  
  // Gen 2
  152: false, 153: false, 154: true, // Chikorita line
  155: false, 156: false, 157: true, // Cyndaquil line
  158: false, 159: false, 160: true, // Totodile line
  161: false, 162: true, // Sentret line
  163: false, 164: true, // Hoothoot line
  165: false, 166: true, // Ledyba line
  167: false, 168: true, // Spinarak line
  169: true, // Crobat
  170: false, 171: true, // Chinchou line
  172: false, // Pichu (evolves to Pikachu)
  173: false, // Cleffa (evolves to Clefairy)
  174: false, // Igglybuff (evolves to Jigglypuff)
  175: false, 176: false, // Togepi -> Togetic (evolves to Togekiss)
  177: false, 178: true, // Natu line
  179: false, 180: false, 181: true, // Mareep line
  182: true, // Bellossom
  183: false, 184: true, // Marill line
  185: true, // Sudowoodo
  186: true, // Politoed
  187: false, 188: false, 189: true, // Hoppip line
  190: false, // Aipom (evolves to Ambipom)
  191: false, 192: true, // Sunkern line
  193: false, // Yanma (evolves to Yanmega)
  194: false, 195: true, // Wooper line
  196: true, 197: true, // Espeon, Umbreon
  198: false, // Murkrow (evolves to Honchkrow)
  199: true, // Slowking
  200: false, // Misdreavus (evolves to Mismagius)
  201: true, // Unown
  202: true, // Wobbuffet
  203: false, // Girafarig (evolves to Farigiraf)
  204: false, 205: true, // Pineco line
  206: false, // Dunsparce (evolves to Dudunsparce)
  207: false, // Gligar (evolves to Gliscor)
  208: true, // Steelix
  209: false, 210: true, // Snubbull line
  211: false, // Qwilfish (evolves to Overqwil)
  212: true, // Scizor
  213: true, 214: true, // Shuckle, Heracross
  215: false, // Sneasel (evolves to Weavile)
  216: false, 217: false, // Teddiursa -> Ursaring (evolves to Ursaluna)
  218: false, 219: true, // Slugma line
  220: false, 221: false, // Swinub -> Piloswine (evolves to Mamoswine)
  222: false, // Corsola (evolves to Cursola)
  223: false, 224: true, // Remoraid line
  225: true, // Delibird
  226: true, // Mantine
  227: true, // Skarmory
  228: false, 229: true, // Houndour line
  230: true, // Kingdra
  231: false, 232: true, // Phanpy line
  233: false, // Porygon2 (evolves to Porygon-Z)
  234: false, // Stantler (evolves to Wyrdeer)
  235: true, // Smeargle
  236: false, // Tyrogue (evolves to Hitmonlee/Hitmonchan/Hitmontop)
  237: true, // Hitmontop
  238: false, // Smoochum (evolves to Jynx)
  239: false, // Elekid (evolves to Electabuzz)
  240: false, // Magby (evolves to Magmar)
  241: true, 242: true, // Miltank, Blissey
  243: true, 244: true, 245: true, // Legendary beasts
  246: false, 247: false, 248: true, // Larvitar line
  249: true, 250: true, 251: true, // Lugia, Ho-oh, Celebi
  
  // Gen 3
  252: false, 253: false, 254: true, // Treecko line
  255: false, 256: false, 257: true, // Torchic line
  258: false, 259: false, 260: true, // Mudkip line
  261: false, 262: true, // Poochyena line
  263: false, 264: false, // Zigzagoon -> Linoone (evolves to Obstagoon)
  265: false, // Wurmple
  266: false, 267: true, // Silcoon -> Beautifly
  268: false, 269: true, // Cascoon -> Dustox
  270: false, 271: false, 272: true, // Lotad line
  273: false, 274: false, 275: true, // Seedot line
  276: false, 277: true, // Taillow line
  278: false, 279: true, // Wingull line
  280: false, 281: false, 282: true, // Ralts line -> Gardevoir
  283: false, 284: true, // Surskit line
  285: false, 286: true, // Shroomish line
  287: false, 288: false, 289: true, // Slakoth line
  290: false, 291: true, 292: true, // Nincada -> Ninjask, Shedinja
  293: false, 294: false, 295: true, // Whismur line
  296: false, 297: true, // Makuhita line
  298: false, // Azurill (evolves to Marill)
  299: false, // Nosepass (evolves to Probopass)
  300: false, 301: true, // Skitty line
  302: true, 303: true, // Sableye, Mawile
  304: false, 305: false, 306: true, // Aron line
  307: false, 308: true, // Meditite line
  309: false, 310: true, // Electrike line
  311: true, 312: true, // Plusle, Minun
  313: true, 314: true, // Volbeat, Illumise
  315: false, // Roselia (evolves to Roserade, from Budew)
  316: false, 317: true, // Gulpin line
  318: false, 319: true, // Carvanha line
  320: false, 321: true, // Wailmer line
  322: false, 323: true, // Numel line
  324: true, // Torkoal
  325: false, 326: true, // Spoink line
  327: true, // Spinda
  328: false, 329: false, 330: true, // Trapinch line
  331: false, 332: true, // Cacnea line
  333: false, 334: true, // Swablu line
  335: true, 336: true, // Zangoose, Seviper
  337: true, 338: true, // Lunatone, Solrock
  339: false, 340: true, // Barboach line
  341: false, 342: true, // Corphish line
  343: false, 344: true, // Baltoy line
  345: false, 346: true, // Lileep line
  347: false, 348: true, // Anorith line
  349: false, 350: true, // Feebas line
  351: true, 352: true, // Castform, Kecleon
  353: false, 354: true, // Shuppet line
  355: false, 356: false, // Duskull -> Dusclops (evolves to Dusknoir)
  357: true, 358: false, // Tropius, Chimecho (from Chingling)
  359: true, // Absol
  360: false, // Wynaut (evolves to Wobbuffet)
  361: false, 362: true, // Snorunt -> Glalie
  363: false, 364: false, 365: true, // Spheal line
  366: false, 367: true, 368: true, // Clamperl -> Huntail/Gorebyss
  369: true, 370: true, // Relicanth, Luvdisc
  371: false, 372: false, 373: true, // Bagon line
  374: false, 375: false, 376: true, // Beldum line
  377: true, 378: true, 379: true, // Regis
  380: true, 381: true, // Latias, Latios
  382: true, 383: true, 384: true, // Weather trio
  385: true, 386: true, // Jirachi, Deoxys
  
  // Gen 4
  387: false, 388: false, 389: true, // Turtwig line
  390: false, 391: false, 392: true, // Chimchar line
  393: false, 394: false, 395: true, // Piplup line
  396: false, 397: false, 398: true, // Starly line
  399: false, 400: true, // Bidoof line
  401: false, 402: true, // Kricketot line
  403: false, 404: false, 405: true, // Shinx line
  406: false, // Budew (evolves to Roselia)
  407: true, // Roserade
  408: false, 409: true, // Cranidos line
  410: false, 411: true, // Shieldon line
  412: false, 413: true, 414: true, // Burmy -> Wormadam/Mothim
  415: false, 416: true, // Combee line
  417: true, // Pachirisu
  418: false, 419: true, // Buizel line
  420: false, 421: true, // Cherubi line
  422: false, 423: true, // Shellos line
  424: true, // Ambipom
  425: false, 426: true, // Drifloon line
  427: false, 428: true, // Buneary line
  429: true, // Mismagius
  430: true, // Honchkrow
  431: false, 432: true, // Glameow line
  433: false, // Chingling (evolves to Chimecho)
  434: false, 435: true, // Stunky line
  436: false, 437: true, // Bronzor line
  438: false, // Bonsly (evolves to Sudowoodo)
  439: false, // Mime Jr. (evolves to Mr. Mime)
  440: false, // Happiny (evolves to Chansey)
  441: true, 442: true, // Chatot, Spiritomb
  443: false, 444: false, 445: true, // Gible line
  446: false, // Munchlax (evolves to Snorlax)
  447: false, 448: true, // Riolu line
  449: false, 450: true, // Hippopotas line
  451: false, 452: true, // Skorupi line
  453: false, 454: true, // Croagunk line
  455: true, // Carnivine
  456: false, 457: true, // Finneon line
  458: false, // Mantyke (evolves to Mantine)
  459: false, 460: true, // Snover line
  461: true, // Weavile
  462: true, // Magnezone
  463: true, // Lickilicky
  464: true, // Rhyperior
  465: true, // Tangrowth
  466: true, // Electivire
  467: true, // Magmortar
  468: true, // Togekiss
  469: true, // Yanmega
  470: true, 471: true, // Leafeon, Glaceon
  472: true, // Gliscor
  473: true, // Mamoswine
  474: true, // Porygon-Z
  475: true, // Gallade
  476: true, // Probopass
  477: true, // Dusknoir
  478: true, // Froslass
  479: true, // Rotom
  480: true, 481: true, 482: true, // Lake trio
  483: true, 484: true, // Dialga, Palkia
  485: true, 486: true, 487: true, 488: true, // Other legendaries
  489: true, 490: true, 491: true, 492: true, 493: true, // Phione, Manaphy, Darkrai, Shaymin, Arceus
  
  // Gen 5
  494: true, // Victini
  495: false, 496: false, 497: true, // Snivy line
  498: false, 499: false, 500: true, // Tepig line
  501: false, 502: false, 503: true, // Oshawott line
  504: false, 505: true, // Patrat line
  506: false, 507: false, 508: true, // Lillipup line
  509: false, 510: true, // Purrloin line
  511: false, 512: true, // Pansage line
  513: false, 514: true, // Pansear line
  515: false, 516: true, // Panpour line
  517: false, 518: true, // Munna line
  519: false, 520: false, 521: true, // Pidove line
  522: false, 523: true, // Blitzle line
  524: false, 525: false, 526: true, // Roggenrola line
  527: false, 528: true, // Woobat line
  529: false, 530: true, // Drilbur line
  531: true, // Audino
  532: false, 533: false, 534: true, // Timburr line
  535: false, 536: false, 537: true, // Tympole line
  538: true, 539: true, // Throh, Sawk
  540: false, 541: false, 542: true, // Sewaddle line
  543: false, 544: false, 545: true, // Venipede line
  546: false, 547: true, // Cottonee line
  548: false, 549: true, // Petilil line
  550: false, // Basculin (evolves to Basculegion)
  551: false, 552: false, 553: true, // Sandile line
  554: false, 555: true, // Darumaka line
  556: true, // Maractus
  557: false, 558: true, // Dwebble line
  559: false, 560: true, // Scraggy line
  561: true, // Sigilyph
  562: false, 563: false, // Yamask -> Cofagrigus (also Runerigus)
  564: false, 565: true, // Tirtouga line
  566: false, 567: true, // Archen line
  568: false, 569: true, // Trubbish line
  570: false, 571: true, // Zorua line
  572: false, 573: true, // Minccino line
  574: false, 575: false, 576: true, // Gothita line
  577: false, 578: false, 579: true, // Solosis line
  580: false, 581: true, // Ducklett line
  582: false, 583: false, 584: true, // Vanillite line
  585: false, 586: true, // Deerling line
  587: true, // Emolga
  588: false, 589: true, // Karrablast line
  590: false, 591: true, // Foongus line
  592: false, 593: true, // Frillish line
  594: true, // Alomomola
  595: false, 596: true, // Joltik line
  597: false, 598: true, // Ferroseed line
  599: false, 600: false, 601: true, // Klink line
  602: false, 603: false, 604: true, // Tynamo line
  605: false, 606: true, // Elgyem line
  607: false, 608: false, 609: true, // Litwick line
  610: false, 611: false, 612: true, // Axew line
  613: false, 614: true, // Cubchoo line
  615: true, // Cryogonal
  616: false, 617: true, // Shelmet line
  618: false, // Stunfisk (evolves to nothing, but has Galarian form evolution)
  619: false, 620: true, // Mienfoo line
  621: true, // Druddigon
  622: false, 623: true, // Golett line
  624: false, 625: false, // Pawniard -> Bisharp (evolves to Kingambit)
  626: true, // Bouffalant
  627: false, 628: true, // Rufflet line
  629: false, 630: true, // Vullaby line
  631: true, 632: true, // Heatmor, Durant
  633: false, 634: false, 635: true, // Deino line
  636: false, 637: true, // Larvesta line
  638: true, 639: true, 640: true, // Swords of Justice
  641: true, 642: true, // Tornadus, Thundurus
  643: true, 644: true, 645: true, // Reshiram, Zekrom, Landorus
  646: true, 647: true, 648: true, 649: true, // Kyurem, Keldeo, Meloetta, Genesect
  
  // Gen 6
  650: false, 651: false, 652: true, // Chespin line
  653: false, 654: false, 655: true, // Fennekin line
  656: false, 657: false, 658: true, // Froakie line
  659: false, 660: true, // Bunnelby line
  661: false, 662: false, 663: true, // Fletchling line
  664: false, 665: false, 666: true, // Scatterbug line
  667: false, 668: true, // Litleo line
  669: false, 670: false, 671: true, // Flabébé line
  672: false, 673: true, // Skiddo line
  674: false, 675: true, // Pancham line
  676: true, // Furfrou
  677: false, 678: true, // Espurr line
  679: false, 680: false, 681: true, // Honedge line
  682: false, 683: true, // Spritzee line
  684: false, 685: true, // Swirlix line
  686: false, 687: true, // Inkay line
  688: false, 689: true, // Binacle line
  690: false, 691: true, // Skrelp line
  692: false, 693: true, // Clauncher line
  694: false, 695: true, // Helioptile line
  696: false, 697: true, // Tyrunt line
  698: false, 699: true, // Amaura line
  700: true, // Sylveon
  701: true, 702: true, 703: true, // Hawlucha, Dedenne, Carbink
  704: false, 705: false, 706: true, // Goomy line
  707: true, // Klefki
  708: false, 709: true, // Phantump line
  710: false, 711: true, // Pumpkaboo line
  712: false, 713: true, // Bergmite line
  714: false, 715: true, // Noibat line
  716: true, 717: true, 718: true, 719: true, 720: true, 721: true, // Legendaries/Mythicals
  
  // Gen 7
  722: false, 723: false, 724: true, // Rowlet line
  725: false, 726: false, 727: true, // Litten line
  728: false, 729: false, 730: true, // Popplio line
  731: false, 732: false, 733: true, // Pikipek line
  734: false, 735: true, // Yungoos line
  736: false, 737: false, 738: true, // Grubbin line
  739: false, 740: true, // Crabrawler line
  741: true, // Oricorio
  742: false, 743: true, // Cutiefly line
  744: false, 745: true, // Rockruff line
  746: true, // Wishiwashi
  747: false, 748: true, // Mareanie line
  749: false, 750: true, // Mudbray line
  751: false, 752: true, // Dewpider line
  753: false, 754: true, // Fomantis line
  755: false, 756: true, // Morelull line
  757: false, 758: true, // Salandit line
  759: false, 760: true, // Stufful line
  761: false, 762: false, 763: true, // Bounsweet line
  764: true, 765: true, 766: true, // Comfey, Oranguru, Passimian
  767: false, 768: true, // Wimpod line
  769: false, 770: true, // Sandygast line
  771: true, // Pyukumuku
  772: false, 773: true, // Type: Null line
  774: true, 775: true, 776: true, 777: true, 778: true, 779: true, 780: true, 781: true, // Singles
  782: false, 783: false, 784: true, // Jangmo-o line
  785: true, 786: true, 787: true, 788: true, // Tapus
  789: false, 790: false, 791: true, 792: true, // Cosmog line
  793: true, 794: true, 795: true, 796: true, 797: true, 798: true, 799: true, 800: true, // Ultra Beasts
  801: true, 802: true, // Magearna, Marshadow
  803: false, 804: true, // Poipole line
  805: true, 806: true, 807: true, 808: false, 809: true, // More UBs and Zeraora, Meltan line
  
  // Gen 8
  810: false, 811: false, 812: true, // Grookey line
  813: false, 814: false, 815: true, // Scorbunny line
  816: false, 817: false, 818: true, // Sobble line
  819: false, 820: true, // Skwovet line
  821: false, 822: false, 823: true, // Rookidee line
  824: false, 825: false, 826: true, // Blipbug line
  827: false, 828: true, // Nickit line
  829: false, 830: true, // Gossifleur line
  831: false, 832: true, // Wooloo line
  833: false, 834: true, // Chewtle line
  835: false, 836: true, // Yamper line
  837: false, 838: false, 839: true, // Rolycoly line
  840: false, 841: true, 842: true, // Applin -> Flapple/Appletun
  843: false, 844: true, // Silicobra line
  845: true, // Cramorant
  846: false, 847: true, // Arrokuda line
  848: false, 849: true, // Toxel line
  850: false, 851: true, // Sizzlipede line
  852: false, 853: true, // Clobbopus line
  854: false, 855: true, // Sinistea line
  856: false, 857: false, 858: true, // Hatenna line
  859: false, 860: false, 861: true, // Impidimp line
  862: true, // Obstagoon
  863: true, // Perrserker
  864: true, // Cursola
  865: true, // Sirfetch'd
  866: true, // Mr. Rime
  867: true, // Runerigus
  868: false, 869: true, // Milcery line
  870: true, 871: true, // Falinks, Pincurchin
  872: false, 873: true, // Snom line
  874: true, 875: true, 876: true, 877: true, // Singles
  878: false, 879: true, // Cufant line
  880: true, 881: true, 882: true, 883: true, // Fossils
  884: false, // Duraludon (evolves to Archaludon)
  885: false, 886: false, 887: true, // Dreepy line
  888: true, 889: true, 890: true, // Zacian, Zamazenta, Eternatus
  891: false, 892: true, // Kubfu line
  893: true, 894: true, 895: true, 896: true, 897: true, 898: true, // Other legendaries
  899: true, // Wyrdeer
  900: true, // Kleavor
  901: true, // Ursaluna
  902: true, // Basculegion
  903: true, // Sneasler
  904: true, // Overqwil
  905: true, // Enamorus
  
  // Gen 9
  906: false, 907: false, 908: true, // Sprigatito line
  909: false, 910: false, 911: true, // Fuecoco line
  912: false, 913: false, 914: true, // Quaxly line
  915: false, 916: true, // Lechonk line
  917: false, 918: true, // Tarountula line
  919: false, 920: true, // Nymble line
  921: false, 922: false, 923: true, // Pawmi line
  924: false, 925: true, // Tandemaus line
  926: false, 927: true, // Fidough line
  928: false, 929: false, 930: true, // Smoliv line
  931: true, // Squawkabilly
  932: false, 933: false, 934: true, // Nacli line
  935: false, 936: true, 937: true, // Charcadet -> Armarouge/Ceruledge
  938: false, 939: true, // Tadbulb line
  940: false, 941: true, // Wattrel line
  942: false, 943: true, // Maschiff line
  944: false, 945: true, // Shroodle line
  946: false, 947: true, // Bramblin line
  948: false, 949: true, // Toedscool line
  950: true, // Klawf
  951: false, 952: true, // Capsakid line
  953: false, 954: true, // Rellor line
  955: false, 956: true, // Flittle line
  957: false, 958: false, 959: true, // Tinkatink line
  960: false, 961: true, // Wiglett line
  962: true, // Bombirdier
  963: false, 964: true, // Finizen line
  965: false, 966: true, // Varoom line
  967: true, 968: true, // Cyclizar, Orthworm
  969: false, 970: true, // Glimmet line
  971: false, 972: true, // Greavard line
  973: true, // Flamigo
  974: false, 975: true, // Cetoddle line
  976: true, 977: true, 978: true, // Veluza, Dondozo, Tatsugiri
  979: true, // Annihilape
  980: true, // Clodsire
  981: true, // Farigiraf
  982: true, // Dudunsparce
  983: true, // Kingambit
  984: true, 985: true, 986: true, 987: true, 988: true, 989: true, // Paradox Pokémon
  990: true, 991: true, 992: true, 993: true, 994: true, 995: true, // More Paradox
  996: false, 997: false, 998: true, // Frigibax line
  999: false, 1000: true, // Gimmighoul line
  1001: true, 1002: true, 1003: true, 1004: true, // Treasures of Ruin
  1005: true, 1006: true, // Roaring Moon, Iron Valiant
  1007: true, 1008: true, // Koraidon, Miraidon
  1009: true, 1010: true, // Walking Wake, Iron Leaves
  1011: false, // Dipplin (evolves to Hydrapple)
  1012: false, 1013: true, // Poltchageist line
  1014: true, 1015: true, 1016: true, // Loyal Three
  1017: true, // Ogerpon
  1018: true, // Archaludon
  1019: true, // Hydrapple
  1020: true, 1021: true, 1022: true, 1023: true, // More Paradox
  1024: true, // Terapagos
  1025: true, // Pecharunt
};

// Read the file
const filePath = path.join(__dirname, '..', 'data', 'Pokemon', 'NationalDex.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Split into lines
const lines = content.split('\n');

// Process each line
const updatedLines = lines.map((line, index) => {
  // Match lines like: { id: 152, name: "Chikorita", type1: "Grass" },
  const match = line.match(/\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)",\s*type1:\s*"([^"]+)"(?:,\s*type2:\s*"([^"]+)")?\s*(?:,\s*isFinalForm:\s*(true|false))?\s*\},?/);
  
  if (match) {
    const id = parseInt(match[1]);
    const name = match[2];
    const type1 = match[3];
    const type2 = match[4];
    const existingFinalForm = match[5];
    
    // If it already has isFinalForm, keep it
    if (existingFinalForm) {
      return line;
    }
    
    // Otherwise, add it based on our map
    const isFinalForm = finalFormMap[id] !== undefined ? finalFormMap[id] : true; // Default to true if unknown
    
    if (type2) {
      return `  { id: ${id}, name: "${name}", type1: "${type1}", type2: "${type2}", isFinalForm: ${isFinalForm} },`;
    } else {
      return `  { id: ${id}, name: "${name}", type1: "${type1}", isFinalForm: ${isFinalForm} },`;
    }
  }
  
  return line;
});

// Write back
fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf8');

console.log('✓ Successfully added isFinalForm property to all Pokémon!');
console.log(`✓ Processed ${Object.keys(finalFormMap).length} Pokémon`);
