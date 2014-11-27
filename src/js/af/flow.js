module.exports = function (lang) {
  lang = lang || 'pt';
  var questions, olympic, paralympic;
  switch (lang) {
    case 'pt':
      questions = require('./qs_pt.js');
      olympic = require('./oly-sports_pt.js');
      paralympic = require('./para-sports_pt.js');
      break;
    case 'en':
      questions = require('./qs_en.js');
      olympic = require('./oly-sports_en.js');
      paralympic = require('./para-sports_en.js');
      break;
  }

  function parseSports(list, category) {

    _.forEach(list, function (item, index) {
      if (!_.isString(item)) return;
      list[index] = {
        id: index,
        name: item,
        category: category
      }
    });
  }

  /*
  parseSports(paralympic, 'paralympic');
  parseSports(olympic, 'olympic');
  */

  var flow = {
    q: questions.teamplay,
    a0: {
      q: questions.outdoors,
      a0: {
        q: questions.doyouevenlift,
        a0: {
          q: questions.water,
          a0: [olympic.NadoSin, olympic.PoloAqu],
          a1: [olympic.Handebol, paralympic.BasquetebolEmCadDeRod, paralympic.RugbyEmCadDeRod]
        },
        a1: {
          q: questions.hipster,
          a0: [olympic.Basquetebol, olympic.TenisDeMes, olympic.Voleibol, olympic.Badminton, paralympic.TenisDeMes],
          a1: [paralympic.Goalball, paralympic.Bocha, paralympic.VoleibolSen]
        }
      },
      a1: {
        q: questions.water,
        a0: [olympic.Vela, paralympic.Vela],
        a1: {
          q: questions.footjob,
          a0: [olympic.HoqueiSobGra, olympic.Tenis, olympic.VoleiDePra, olympic.Rugby, paralympic.TenisEmCadDeRod],
          a1: [olympic.Futebol, paralympic.FutebolDe5, paralympic.FutebolDe7]
        }
      }
    },
    a1: {
      q: questions.outdoors,
      a0: {
        q: questions.doyouevenlift,
        a0: {
          q: questions.wannafight,
          a0: [olympic.Boxe, olympic.Judo, olympic.LutaEstLiv, olympic.LutaGreRom, paralympic.Judo],
          a1: {
            q: questions.bikeordance,
            a0: [olympic.LevantamentoDePes, olympic.Natacao, olympic.CiclismoDePis, paralympic.Halterofilismo, paralympic.Natacao, paralympic.ParaciclismoDePis],
            a1: [olympic.GinasticaArt, olympic.GinasticaRit, olympic.GinasticaDeTra]
          }
        },
        a1: {
          q: questions.wannafight,
          a0: [olympic.Esgrima, olympic.Taekwondo, paralympic.EsgrimaEmCadDeRod],
          a1: [olympic.GinasticaArt, olympic.GinasticaRit, olympic.GinasticaDeTra]
        }
      },
      a1: {
        q: questions.water,
        a0: {
          q: questions.dontbreath,
          a0: [olympic.MaratonasAqu, olympic.PentatloMod, olympic.Triatlo, paralympic.Paratriatlo],
          a1: [olympic.Remo, olympic.SaltosOrn, olympic.CanoagemSla, olympic.CanoagemVel, paralympic.Paracanoagem, paralympic.Remo]
        },
        a1: {
          q: questions.askacop,
          a0: {
            q: questions.suchemotions,
            a0: [olympic.HipismoAde, olympic.HipismoCCE, olympic.HipismoSal, paralympic.Hipismo],
            a1: [olympic.CiclismoBMX, olympic.CiclismoMouBik, olympic.CiclismoDeEst, paralympic.ParaciclismoDeEst]
          },
          a1: {
            q: questions.mario,
            a0: [olympic.Atletismo, paralympic.Atletismo],
            a1: [olympic.Golfe, olympic.TiroEsp, olympic.TiroComArc, paralympic.TiroComArc, paralympic.TiroEsp]
          }
        }
      }
    }
  };

  return flow;
};