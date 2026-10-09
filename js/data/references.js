// Peer-reviewed sources cited throughout the app.
// Links open a PubMed search for the exact title so they always resolve.

const pubmed = (title) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(title)}`;

const raw = {
  mulligan2013: {
    authors: 'Mulligan EP, Cook PG',
    title: 'Effect of plantar intrinsic muscle training on medial longitudinal arch morphology and dynamic function',
    journal: 'Man Ther', year: 2013, detail: '18(5):425–430',
    type: 'Prospective trial',
    finding: '4 weeks of daily short-foot training reduced navicular drop and improved dynamic balance in people with flexible arches.',
  },
  unver2020: {
    authors: 'Unver B, Erdem EU, Akbas E',
    title: 'Effects of short-foot exercises on foot posture, pain, disability, and plantar pressure in pes planus',
    journal: 'J Sport Rehabil', year: 2020, detail: '29(4):436–440',
    type: 'Clinical trial',
    finding: 'Short-foot exercise improved foot posture index, pain and disability in adults with flat feet.',
  },
  mckeon2015: {
    authors: 'McKeon PO, Hertel J, Bramble D, Davis I',
    title: 'The foot core system: a new paradigm for understanding intrinsic foot muscle function',
    journal: 'Br J Sports Med', year: 2015, detail: '49(5):290',
    type: 'Conceptual review',
    finding: 'Frames the intrinsic foot muscles as a "foot core" that stabilises the arch, analogous to the lumbopelvic core.',
  },
  taddei2020: {
    authors: 'Taddei UT, Matias AB, Duarte M, Sacco ICN',
    title: 'Foot core training to prevent running-related injuries: a survey-based randomized clinical trial',
    journal: 'Am J Sports Med', year: 2020, detail: '48(14):3610–3619',
    type: 'Randomised controlled trial (n=118 runners)',
    finding: 'Runners doing an 8-week foot-core programme had a markedly lower running-injury rate over 12 months than controls.',
  },
  ridge2019: {
    authors: 'Ridge ST, Olsen MT, Bruening DA, et al.',
    title: 'Walking in minimalist shoes is effective for strengthening foot muscles',
    journal: 'Med Sci Sports Exerc', year: 2019, detail: '51(1):104–113',
    type: 'Randomised controlled trial',
    finding: 'Gradually walking in minimalist shoes increased foot muscle size and strength about as much as a targeted exercise programme.',
  },
  kulig2009: {
    authors: 'Kulig K, Reischl SF, Pomrantz AB, et al.',
    title: 'Nonsurgical management of posterior tibial tendon dysfunction with orthoses and resistive exercise: a randomized controlled trial',
    journal: 'Phys Ther', year: 2009, detail: '89(1):26–37',
    type: 'Randomised controlled trial',
    finding: 'Orthoses plus progressive resistive tibialis posterior exercise reduced pain and disability in early-stage adult flatfoot (PTTD).',
  },
  houck2015: {
    authors: 'Houck JR, Neville C, Tome J, Flemister A',
    title: 'Randomized controlled trial comparing orthosis augmented by either stretching or stretching and strengthening for stage II tibialis posterior tendon dysfunction',
    journal: 'Foot Ankle Int', year: 2015, detail: '36(9):1006–1016',
    type: 'Randomised controlled trial',
    finding: 'Both groups improved; adding strengthening produced gains in strength, supporting a loading-based approach.',
  },
  ross2018: {
    authors: 'Ross MH, Smith MD, Mellor R, Vicenzino B',
    title: 'Exercise for posterior tibial tendon dysfunction: a systematic review of randomised clinical trials and clinical guidelines',
    journal: 'BMJ Open Sport Exerc Med', year: 2018, detail: '4(1):e000430',
    type: 'Systematic review',
    finding: 'Progressive resistance exercise of tibialis posterior is recommended for early adult-acquired flatfoot, though trial quality is modest.',
  },
  neal2014: {
    authors: 'Neal BS, Griffiths IB, Dowling GJ, et al.',
    title: 'Foot posture as a risk factor for lower limb overuse injury: a systematic review and meta-analysis',
    journal: 'J Foot Ankle Res', year: 2014, detail: '7(1):55',
    type: 'Systematic review & meta-analysis',
    finding: 'A pronated (flatter) foot posture is at most a small risk factor, mainly for shin pain and patellofemoral pain.',
  },
  nielsen2014: {
    authors: 'Nielsen RO, Buist I, Parner ET, et al.',
    title: 'Foot pronation is not associated with increased injury risk in novice runners wearing a neutral shoe: a 1-year prospective cohort study',
    journal: 'Br J Sports Med', year: 2014, detail: '48(6):440–447',
    type: 'Prospective cohort (n=927)',
    finding: 'Pronated feet were not more likely to get injured than neutral feet in novice runners.',
  },
  rathleff2015: {
    authors: 'Rathleff MS, Mølgaard CM, Fredberg U, et al.',
    title: 'High-load strength training improves outcome in patients with plantar fasciitis: a randomized controlled trial with 12-month follow-up',
    journal: 'Scand J Med Sci Sports', year: 2015, detail: '25(3):e292–e300',
    type: 'Randomised controlled trial',
    finding: 'Slow, heavy heel raises with a towel under the toes (every other day) gave faster improvement at 3 months than stretching alone.',
  },
  koc2023: {
    authors: 'Koc TA Jr, Bise CG, Neville C, et al.',
    title: 'Heel Pain - Plantar Fasciitis: Revision 2023',
    journal: 'J Orthop Sports Phys Ther', year: 2023, detail: '53(12):CPG1–CPG39',
    type: 'Clinical practice guideline',
    finding: 'Recommends plantar fascia and calf stretching, resistance training, manual therapy, taping and education.',
  },
  digiovanni2003: {
    authors: 'DiGiovanni BF, Nawoczenski DA, Lintal ME, et al.',
    title: 'Tissue-specific plantar fascia-stretching exercise enhances outcomes in patients with chronic heel pain',
    journal: 'J Bone Joint Surg Am', year: 2003, detail: '85(7):1270–1277',
    type: 'Randomised controlled trial',
    finding: 'A plantar-fascia-specific stretch (10 × 10 s, 3×/day) outperformed a calf stretch for first-step heel pain.',
  },
  alfredson1998: {
    authors: 'Alfredson H, Pietilä T, Jonsson P, Lorentzon R',
    title: 'Heavy-load eccentric calf muscle training for the treatment of chronic Achilles tendinosis',
    journal: 'Am J Sports Med', year: 1998, detail: '26(3):360–366',
    type: 'Prospective trial',
    finding: 'The classic 12-week eccentric heel-drop protocol (3 × 15, straight and bent knee, twice daily).',
  },
  silbernagel2007: {
    authors: 'Silbernagel KG, Thomeé R, Eriksson BI, Karlsson J',
    title: 'Continued sports activity, using a pain-monitoring model, during rehabilitation in patients with Achilles tendinopathy: a randomized controlled study',
    journal: 'Am J Sports Med', year: 2007, detail: '35(6):897–906',
    type: 'Randomised controlled trial',
    finding: 'Patients could keep running if pain stayed ≤5/10 and settled by the next morning — outcomes were as good as resting.',
  },
  beyer2015: {
    authors: 'Beyer R, Kongsgaard M, Hougs Kjær B, et al.',
    title: 'Heavy slow resistance versus eccentric training as treatment for Achilles tendinopathy: a randomized controlled trial',
    journal: 'Am J Sports Med', year: 2015, detail: '43(7):1704–1711',
    type: 'Randomised controlled trial',
    finding: 'Heavy slow resistance (3 s up / 3 s down, 3×/week) was as effective as eccentrics with better adherence.',
  },
  martin2018: {
    authors: 'Martin RL, Chimenti R, Cuddeford T, et al.',
    title: 'Achilles Pain, Stiffness, and Muscle Power Deficits: Midportion Achilles Tendinopathy Revision 2018',
    journal: 'J Orthop Sports Phys Ther', year: 2018, detail: '48(5):A1–A38',
    type: 'Clinical practice guideline',
    finding: 'Strongly recommends progressive tendon loading; supports education and continued activity guided by pain.',
  },
  hebertlosier2009: {
    authors: 'Hébert-Losier K, Newsham-West RJ, Schneiders AG, Sullivan SJ',
    title: 'Raising the standards of the calf-raise test: a systematic review',
    journal: 'J Sci Med Sport', year: 2009, detail: '12(6):594–602',
    type: 'Systematic review',
    finding: 'Standardises the single-leg heel-raise test (metronome, full height) used to track calf endurance.',
  },
  willy2019: {
    authors: 'Willy RW, Hoglund LT, Barton CJ, et al.',
    title: 'Patellofemoral Pain',
    journal: 'J Orthop Sports Phys Ther', year: 2019, detail: '49(9):CPG1–CPG95',
    type: 'Clinical practice guideline',
    finding: 'Combined hip- and knee-targeted exercise is the strongest recommended treatment for patellofemoral pain.',
  },
  crossley2016: {
    authors: 'Crossley KM, van Middelkoop M, Callaghan MJ, et al.',
    title: '2016 Patellofemoral pain consensus statement from the 4th International Patellofemoral Pain Research Retreat, Manchester. Part 2: recommended physical interventions',
    journal: 'Br J Sports Med', year: 2016, detail: '50(14):844–852',
    type: 'Consensus statement',
    finding: 'Exercise therapy — especially hip plus knee strengthening — is recommended to reduce pain and improve function.',
  },
  ferber2015: {
    authors: 'Ferber R, Bolgla L, Earl-Hoopes JE, et al.',
    title: 'Strengthening of the hip and core versus knee muscles for the treatment of patellofemoral pain: a multicenter randomized controlled trial',
    journal: 'J Athl Train', year: 2015, detail: '50(4):366–377',
    type: 'Randomised controlled trial',
    finding: 'Hip/core and knee programmes both helped; hip/core produced earlier pain relief and strength gains.',
  },
  fredericson2000: {
    authors: 'Fredericson M, Cookingham CL, Chaudhari AM, et al.',
    title: 'Hip abductor weakness in distance runners with iliotibial band syndrome',
    journal: 'Clin J Sport Med', year: 2000, detail: '10(3):169–175',
    type: 'Case series with intervention',
    finding: 'Runners with ITB syndrome had weaker hip abductors; most returned to running after 6 weeks of abductor strengthening.',
  },
  winters2013: {
    authors: 'Winters M, Eskes M, Weir A, et al.',
    title: 'Treatment of medial tibial stress syndrome: a systematic review',
    journal: 'Sports Med', year: 2013, detail: '43(12):1315–1333',
    type: 'Systematic review',
    finding: 'No intervention for shin splints has strong evidence; graded return to running and load management remain the mainstay.',
  },
  vandyk2019: {
    authors: 'van Dyk N, Behan FP, Whiteley R',
    title: 'Including the Nordic hamstring exercise in injury prevention programmes halves the rate of hamstring injuries: a systematic review and meta-analysis of 8459 athletes',
    journal: 'Br J Sports Med', year: 2019, detail: '53(21):1362–1370',
    type: 'Systematic review & meta-analysis',
    finding: 'Programmes including Nordic hamstring curls cut hamstring injuries by about half.',
  },
  haroy2019: {
    authors: 'Harøy J, Clarsen B, Wiger EG, et al.',
    title: 'The Adductor Strengthening Programme prevents groin problems among male football players: a cluster-randomised controlled trial',
    journal: 'Br J Sports Med', year: 2019, detail: '53(3):150–157',
    type: 'Cluster-randomised controlled trial',
    finding: 'A single Copenhagen adduction exercise, 2–3×/week, reduced groin problems by about 41%.',
  },
  doherty2017: {
    authors: 'Doherty C, Bleakley C, Delahunt E, Holden S',
    title: 'Treatment and prevention of acute and recurrent ankle sprain: an overview of systematic reviews with meta-analysis',
    journal: 'Br J Sports Med', year: 2017, detail: '51(2):113–125',
    type: 'Umbrella review',
    finding: 'Exercise-based balance and neuromuscular training reduces the risk of recurrent ankle sprain.',
  },
  hupperets2009: {
    authors: 'Hupperets MDW, Verhagen EALM, van Mechelen W',
    title: 'Effect of unsupervised home based proprioceptive training on recurrences of ankle sprain: randomised controlled trial',
    journal: 'BMJ', year: 2009, detail: '339:b2684',
    type: 'Randomised controlled trial',
    finding: 'An 8-week unsupervised home balance programme reduced re-sprains by about 35%.',
  },
  mckeon2008: {
    authors: 'McKeon PO, Hertel J',
    title: 'Systematic review of postural control and lateral ankle instability, part II: is balance training clinically effective?',
    journal: 'J Athl Train', year: 2008, detail: '43(3):305–315',
    type: 'Systematic review',
    finding: 'Four or more weeks of balance training improves postural control and self-reported function in unstable ankles.',
  },
  lauersen2014: {
    authors: 'Lauersen JB, Bertelsen DM, Andersen LB',
    title: 'The effectiveness of exercise interventions to prevent sports injuries: a systematic review and meta-analysis of randomised controlled trials',
    journal: 'Br J Sports Med', year: 2014, detail: '48(11):871–877',
    type: 'Systematic review & meta-analysis',
    finding: 'Strength training reduced sports injuries to less than a third; stretching alone showed no protective effect.',
  },
  buist2008: {
    authors: 'Buist I, Bredeweg SW, van Mechelen W, et al.',
    title: 'No effect of a graded training program on the number of running-related injuries in novice runners: a randomized controlled trial',
    journal: 'Am J Sports Med', year: 2008, detail: '36(1):33–39',
    type: 'Randomised controlled trial',
    finding: 'A strict "10% rule" programme did not reduce injuries versus a standard plan — load matters, but rigid rules are not magic.',
  },
  heiderscheit2011: {
    authors: 'Heiderscheit BC, Chumanov ES, Michalski MP, et al.',
    title: 'Effects of step rate manipulation on joint mechanics during running',
    journal: 'Med Sci Sports Exerc', year: 2011, detail: '43(2):296–302',
    type: 'Laboratory study',
    finding: 'Raising step rate 5–10% substantially reduced loading at the knee and hip.',
  },
  bini2011: {
    authors: 'Bini R, Hume P, Croft JL',
    title: 'Effects of bicycle saddle height on knee injury risk and cycling performance',
    journal: 'Sports Med', year: 2011, detail: '41(6):463–476',
    type: 'Narrative/systematic review',
    finding: 'Saddle height changes knee joint loading; a knee angle of ~25–30° at the bottom of the stroke is a common fitting target.',
  },
  hayden2021: {
    authors: 'Hayden JA, Ellis J, Ogilvie R, et al.',
    title: 'Exercise therapy for chronic low back pain',
    journal: 'Cochrane Database Syst Rev', year: 2021, detail: '9:CD009790',
    type: 'Cochrane review',
    finding: 'Exercise reduces chronic low back pain versus no treatment; no single exercise type is clearly superior.',
  },
};

export const REFERENCES = Object.fromEntries(
  Object.entries(raw).map(([id, r]) => [id, { id, ...r, url: pubmed(r.title) }])
);

export function citation(r) {
  return `${r.authors}. ${r.title}. ${r.journal}. ${r.year};${r.detail}.`;
}

export function shortCite(r) {
  const first = r.authors.split(',')[0].split(' ')[0];
  return `${first} ${r.year}`;
}
