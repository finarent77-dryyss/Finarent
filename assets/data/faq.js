// FAQ Finarent — 56 questions/réponses sur 8 thématiques
// Source : "FINARENT FAQ.pdf" (Document de référence — Mai 2026)
export const FAQ_CATEGORIES = [
  {
    id: 'finarent',
    icon: 'fa-circle-info',
    color: 'secondary',
    title: 'Finarent & son rôle de courtier',
    description: 'Qui nous sommes, comment nous travaillons, ce que ça vous coûte.',
    questions: [
      {
        q: "Qu'est-ce que Finarent ?",
        a: "Finarent est un courtier en financement et assurance professionnelle spécialisé dans l'accompagnement des entreprises : TPE, PME, indépendants, professions libérales et artisans. Notre métier consiste à comparer les offres de nos partenaires bancaires, financiers et assurantiels pour vous proposer la solution la plus adaptée à votre projet, qu'il s'agisse de financement de matériel, de véhicules, de besoins de trésorerie ou de couvertures d'assurance.",
      },
      {
        q: "Quels sont les services proposés par Finarent ?",
        a: "Finarent intervient sur quatre grands métiers : le financement professionnel (crédit-bail, leasing, prêt classique), la location de véhicules ou matériel (LOA et LLD), l'assurance professionnelle (RC Pro, multirisque, décennale, flotte, cyber, prévoyance) et le conseil en optimisation financière. Le tout en un point d'entrée unique.",
      },
      {
        q: "Pourquoi passer par un courtier plutôt que d'aller directement en banque ou en assurance ?",
        a: "Trois raisons principales : le gain de temps (un seul interlocuteur consulte plusieurs établissements à votre place), la négociation (notre volume d'affaires permet d'obtenir de meilleures conditions que celles affichées au guichet), et l'expertise (nous connaissons les critères d'acceptation de chaque partenaire et orientons votre dossier vers le bon interlocuteur). En moyenne, nos clients économisent jusqu'à 30 % sur leur assurance pro et obtiennent un taux de financement plus compétitif qu'en démarche directe.",
      },
      {
        q: "Combien coûtent les services de Finarent ?",
        a: "La consultation, la simulation et le montage de votre dossier sont entièrement gratuits. Finarent est rémunéré par ses partenaires (banques, sociétés de financement, compagnies d'assurance) sous forme de commission d'apport d'affaires, sans surcoût pour vous. La rémunération est encadrée par les obligations de transparence de la DDA (Directive Distribution d'Assurances) et de la réglementation IOBSP.",
      },
      {
        q: "Finarent est-il indépendant ?",
        a: "Oui, Finarent est un courtier indépendant non lié à un groupe bancaire ou assurantiel unique. Cela nous permet de comparer objectivement les offres et de défendre uniquement vos intérêts. Nos partenariats sont publics et disponibles sur demande.",
      },
      {
        q: "Finarent est-il inscrit à l'ORIAS ?",
        a: "Oui. Finarent est immatriculé à l'ORIAS (Organisme pour le Registre Unique des Intermédiaires en Assurance, Banque et Finance) en tant qu'Intermédiaire en Opérations de Banque et Services de Paiement (IOBSP) et Intermédiaire en Assurance (IAS). Notre numéro ORIAS est consultable sur www.orias.fr. Nous sommes également soumis au contrôle de l'ACPR (Autorité de Contrôle Prudentiel et de Résolution).",
      },
      {
        q: "Mes données personnelles sont-elles protégées ?",
        a: "Absolument. Finarent applique strictement le Règlement Général sur la Protection des Données (RGPD). Vos données ne sont transmises qu'aux partenaires strictement nécessaires à l'étude de votre dossier, avec votre consentement explicite. Vous disposez à tout moment d'un droit d'accès, de rectification, d'opposition et d'effacement de vos données. La politique de confidentialité complète est consultable sur le site.",
      },
      {
        q: "Qui peut faire appel à Finarent ?",
        a: "Tous les professionnels : auto-entrepreneurs et micro-entreprises, EI/EIRL, EURL/SARL, SAS/SASU, SA, SCI, professions libérales (médecins, avocats, architectes, experts-comptables…), artisans, commerçants, associations à activité économique, exploitations agricoles. Que vous soyez en création, en développement ou en transmission, nous adaptons notre accompagnement.",
      },
    ],
  },
  {
    id: 'credit-bail',
    icon: 'fa-handshake',
    color: 'secondary',
    title: 'Crédit-bail & leasing professionnel',
    description: 'Tout savoir sur le financement par leasing pour vos équipements.',
    questions: [
      {
        q: "Qu'est-ce que le crédit-bail (ou leasing) ?",
        a: "Le crédit-bail, aussi appelé leasing, est un mode de financement par lequel une société financière (le crédit-bailleur) achète un bien à votre place et vous le loue pendant une durée déterminée (généralement 3 à 7 ans). À l'issue du contrat, vous pouvez lever l'option d'achat à un prix résiduel défini à l'avance, restituer le bien ou prolonger la location. Le crédit-bail permet de financer jusqu'à 100 % de la valeur TTC d'un bien sans apport.",
      },
      {
        q: "Quelle est la différence entre crédit-bail et location financière ?",
        a: "La différence est essentiellement juridique : le crédit-bail prévoit obligatoirement une option d'achat en fin de contrat, alors que la location financière n'en prévoit pas. Sur le plan fiscal et comptable, les deux dispositifs fonctionnent de manière similaire : les loyers sont des charges déductibles du résultat imposable. Le crédit-bail est encadré par le Code monétaire et financier, la location financière par le Code de commerce.",
      },
      {
        q: "Quels types de biens peut-on financer en crédit-bail ?",
        a: "Pratiquement tout équipement à usage professionnel : matériel informatique et bureautique, machines-outils, matériel industriel ou agricole, matériel médical et dentaire, véhicules utilitaires et poids lourds, mobilier, télécommunications, et plus largement tout bien d'équipement durable. Pour l'immobilier professionnel, on parle de crédit-bail immobilier (CBI).",
      },
      {
        q: "Quel montant peut-on financer avec Finarent ?",
        a: "Finarent vous accompagne sur des financements de 3 000 € à 500 000 € selon votre besoin. Au-delà, nous mobilisons des partenaires spécialisés sur les gros tickets (BNP Paribas Leasing Solutions, CA Leasing, Bpifrance Leasing) pour des projets plus importants, notamment en crédit-bail immobilier.",
      },
      {
        q: "Quelle est la durée d'un contrat de crédit-bail ?",
        a: "La durée standard est de 24 à 84 mois pour le mobilier, généralement calée sur la durée d'amortissement comptable du bien. Pour l'immobilier, les contrats peuvent aller jusqu'à 15 ou 20 ans. Plus la durée est courte, plus l'avantage fiscal est important, mais plus les loyers sont élevés.",
      },
      {
        q: "Faut-il un apport pour un crédit-bail ?",
        a: "En principe non : le crédit-bail finance 100 % de la valeur TTC du bien. En pratique, certains organismes demandent un premier loyer majoré (de 10 à 30 % du prix) ou un dépôt de garantie, particulièrement pour les jeunes entreprises ou les secteurs jugés risqués. Finarent négocie pour minimiser ou supprimer cet apport quand votre profil le permet.",
      },
      {
        q: "Quels sont les avantages du crédit-bail par rapport à un achat comptant ?",
        a: "Le crédit-bail préserve votre trésorerie (pas d'immobilisation de capital), étale le paiement de la TVA sur les loyers, permet la déductibilité fiscale des loyers, n'apparaît pas comme une dette au bilan (avant levée d'option), permet de renouveler facilement le matériel obsolète, et inclut souvent l'entretien et l'assurance dans des formules tout-compris.",
      },
      {
        q: "Et par rapport à un crédit bancaire classique ?",
        a: "Le crédit-bail est généralement plus facile à obtenir : la société financière reste propriétaire du bien jusqu'à la levée d'option, ce qui constitue sa garantie. L'acceptation est donc plus rapide et les exigences en termes d'apport sont moindres. En revanche, le coût total est souvent légèrement supérieur à celui d'un prêt amortissable classique.",
      },
      {
        q: "Que se passe-t-il en fin de contrat ?",
        a: "Vous avez trois options : lever l'option d'achat (paiement de la valeur résiduelle, généralement 1 à 6 % du prix initial) et devenir propriétaire du bien, restituer le matériel au crédit-bailleur sans pénalité (si vous avez respecté les termes du contrat), ou renouveler le contrat sur un nouveau bien. Cette flexibilité est l'un des grands atouts du crédit-bail.",
      },
      {
        q: "Peut-on résilier un crédit-bail avant son terme ?",
        a: "La résiliation anticipée est possible mais coûteuse : elle implique généralement le règlement des loyers restant à échoir, parfois actualisés. Pour cette raison, il est essentiel de bien calibrer la durée du contrat dès la signature. Finarent vous conseille pour éviter le sur-engagement.",
      },
    ],
  },
  {
    id: 'loa',
    icon: 'fa-file-contract',
    color: 'accent',
    title: "LOA — Location avec Option d'Achat",
    description: 'Le leasing pour vos véhicules : voiture, utilitaire, moto.',
    questions: [
      {
        q: "Qu'est-ce que la LOA ?",
        a: "La LOA, ou Location avec Option d'Achat, est une forme de leasing principalement utilisée pour les véhicules. Vous payez un loyer mensuel pendant la durée du contrat (24 à 72 mois), avec la possibilité d'acheter le véhicule à la fin pour un prix prédéfini (la valeur résiduelle). C'est l'équivalent du crédit-bail mais appliqué aux véhicules, et accessible aussi bien aux particuliers qu'aux professionnels.",
      },
      {
        q: "Quelle est la différence entre LOA et crédit-bail ?",
        a: "Techniquement, c'est très similaire : les deux comprennent une option d'achat finale. La distinction est surtout d'usage : on parle de LOA pour les véhicules (voitures, utilitaires, motos) et de crédit-bail pour le matériel d'équipement professionnel. La LOA est ouverte aux particuliers, alors que le crédit-bail est réservé aux professionnels.",
      },
      {
        q: "Quels véhicules peut-on financer en LOA ?",
        a: "Tous types : voitures particulières neuves ou d'occasion récente, véhicules utilitaires légers (VUL), poids lourds, motos, vélos électriques professionnels, véhicules électriques et hybrides. Finarent négocie avec une dizaine de partenaires (Arval, Ayvens, Leasys, Mobilize, Stellantis Financial Services, captives constructeurs, plateformes digitales) pour vous offrir le meilleur rapport qualité/prix.",
      },
      {
        q: "Quel est l'avantage de la LOA par rapport à un achat à crédit ?",
        a: "Quatre avantages principaux : loyers généralement inférieurs à des mensualités de crédit classique (car vous ne financez pas la totalité du véhicule, seulement sa dépréciation), pas d'apport obligatoire dans la plupart des cas, flexibilité en fin de contrat (achat, restitution, renouvellement), et possibilité d'intégrer entretien et assurance dans le loyer pour une visibilité budgétaire totale.",
      },
      {
        q: "Quel kilométrage est-il possible de souscrire ?",
        a: "Le kilométrage annuel est défini à la signature du contrat, généralement entre 10 000 et 50 000 km/an. Plus le kilométrage prévu est élevé, plus le loyer augmente (car le véhicule se déprécie plus vite). Un dépassement en fin de contrat est facturé au km supplémentaire (tarif fixé d'avance). À l'inverse, un kilométrage inférieur peut donner lieu à un avoir partiel selon les organismes.",
      },
      {
        q: "Peut-on faire une LOA en tant qu'auto-entrepreneur ?",
        a: "Oui. Les auto-entrepreneurs et micro-entrepreneurs peuvent souscrire une LOA, à condition de justifier d'une certaine ancienneté (généralement 1 an minimum d'activité) et de revenus stables. Finarent travaille avec des partenaires habitués à ce statut et accompagne les dossiers atypiques.",
      },
      {
        q: "Le véhicule en LOA est-il immatriculé à mon nom ?",
        a: "Le véhicule est immatriculé à votre nom (utilisateur), mais la carte grise mentionne que le titulaire est le crédit-bailleur (location à long terme). Vous êtes responsable de l'usage du véhicule, mais juridiquement non-propriétaire jusqu'à la levée éventuelle de l'option d'achat. C'est cette propriété conservée qui rend la LOA plus accessible que le crédit classique.",
      },
    ],
  },
  {
    id: 'lld',
    icon: 'fa-calendar-days',
    color: 'accent',
    title: 'LLD — Location Longue Durée',
    description: 'La location pure tout-compris pour les flottes et les pros.',
    questions: [
      {
        q: "Qu'est-ce que la LLD ?",
        a: "La LLD, ou Location Longue Durée, est une location pure de longue durée, sans option d'achat en fin de contrat. Vous payez un loyer mensuel fixe en échange de la mise à disposition d'un véhicule (ou d'un matériel) neuf, généralement avec un ensemble de services inclus (entretien, assistance, pneumatiques, parfois assurance). À l'issue du contrat, le véhicule est restitué.",
      },
      {
        q: "Quelle est la différence entre LOA et LLD ?",
        a: "La différence essentielle : la LOA inclut une option d'achat finale, la LLD non. La LLD est donc une location pure, sans intention de propriété. En contrepartie, les loyers LLD sont souvent légèrement inférieurs à ceux de la LOA, et les services tout-compris sont plus systématiquement inclus. La LLD est privilégiée par les flottes d'entreprise qui souhaitent renouveler régulièrement leurs véhicules sans gestion administrative.",
      },
      {
        q: "Quels services sont généralement inclus dans une LLD ?",
        a: "Le « tout-compris » LLD couvre en général : l'entretien et les révisions, le remplacement des pneumatiques, l'assistance 24h/24, la garantie perte financière (gap), la gestion administrative (carte grise, taxes), et selon les options : l'assurance tous risques, le véhicule de remplacement, la carte carburant et de recharge. Les majors comme Arval, Ayvens ou Leasys proposent des packages très complets.",
      },
      {
        q: "Quels sont les avantages fiscaux de la LLD pour une entreprise ?",
        a: "Les loyers de LLD sont déductibles du résultat imposable, sous réserve des plafonds applicables aux véhicules de tourisme (limites dépendant des émissions de CO₂ et du prix d'acquisition). Pour les véhicules utilitaires, la déduction est intégrale. La TVA est récupérable sur les loyers des utilitaires et de certains véhicules de tourisme à usage exclusivement professionnel. La LLD permet aussi de ne pas faire apparaître le véhicule à l'actif du bilan.",
      },
      {
        q: "Peut-on résilier une LLD avant son terme ?",
        a: "Oui, mais avec des indemnités de résiliation pouvant représenter plusieurs mois de loyer, calculées selon une formule contractuelle. Certains acteurs proposent désormais des contrats plus flexibles (clauses de sortie anticipée après une période minimale, type Ayvens Flex). Finarent vérifie ces conditions avant souscription.",
      },
      {
        q: "La LLD est-elle adaptée aux indépendants ?",
        a: "Tout à fait. Les acteurs comme Arval, Lizy, Welease ou Captain Drive proposent des offres LLD accessibles aux indépendants et auto-entrepreneurs avec un kilométrage modéré (5 000 à 25 000 km/an). C'est une solution idéale pour disposer d'un véhicule professionnel récent, sans investissement initial et avec un budget mensuel maîtrisé.",
      },
      {
        q: "Peut-on faire de la LLD sur du matériel autre que des véhicules ?",
        a: "Oui. La LLD existe pour le matériel informatique et bureautique, les équipements professionnels (médical, dentaire, restauration), et même les vélos électriques d'entreprise. Le principe est identique : location pure avec services inclus, restitution en fin de contrat. C'est aussi appelé « location financière » sur ce périmètre.",
      },
    ],
  },
  {
    id: 'assurance',
    icon: 'fa-shield-halved',
    color: 'rose-600',
    title: 'Assurance professionnelle',
    description: 'RC Pro, décennale, multirisque, cyber, prévoyance TNS.',
    questions: [
      {
        q: "Quelles assurances sont obligatoires pour un professionnel ?",
        a: "Cela dépend de votre activité. La RC Professionnelle est obligatoire pour les professions réglementées : santé (médecins, infirmiers, kinés), droit (avocats, notaires, huissiers), conseil (experts-comptables, agents immobiliers), bâtiment (assurance décennale), transport routier, et plus. Pour les autres activités, elle n'est pas légalement obligatoire mais reste fortement recommandée. La mutuelle santé collective est obligatoire dès le premier salarié.",
      },
      {
        q: "Qu'est-ce que la RC Pro et qu'est-ce qu'elle couvre ?",
        a: "La Responsabilité Civile Professionnelle couvre les dommages matériels, immatériels et corporels que vous, vos salariés ou vos sous-traitants pourriez causer à un tiers (client, fournisseur, prestataire) dans le cadre de votre activité. Elle prend en charge l'indemnisation de la victime, les frais de défense en cas de procédure et les éventuels dommages et intérêts.",
      },
      {
        q: "Combien coûte une assurance RC Pro ?",
        a: "Le tarif dépend de plusieurs facteurs : secteur d'activité (un BTP coûte plus cher qu'un consultant), chiffre d'affaires, taille de l'entreprise, garanties choisies et franchises. À titre indicatif, une RC Pro pour un auto-entrepreneur dans le conseil démarre autour de 10-15 €/mois, alors qu'une PME du bâtiment paiera plusieurs milliers d'euros par an. Finarent compare gratuitement plusieurs devis pour vous proposer le meilleur rapport garanties/prix.",
      },
      {
        q: "Qu'est-ce que l'assurance décennale ?",
        a: "L'assurance décennale est obligatoire pour tous les professionnels du bâtiment qui interviennent sur des ouvrages neufs ou en rénovation lourde. Elle garantit pendant 10 ans la réparation des dommages compromettant la solidité de l'ouvrage ou le rendant impropre à sa destination. Sans décennale, un artisan ne peut légalement intervenir sur un chantier.",
      },
      {
        q: "Qu'est-ce que la multirisque professionnelle (MRP) ?",
        a: "La multirisque professionnelle est un contrat qui regroupe plusieurs garanties pour protéger les locaux et le matériel de votre entreprise : incendie, dégâts des eaux, vol, vandalisme, bris de machine, perte d'exploitation, RC exploitation. C'est l'équivalent professionnel de la multirisque habitation. Indispensable dès que vous occupez un local.",
      },
      {
        q: "Qu'est-ce que l'assurance cyber ?",
        a: "La cyber-assurance couvre les conséquences financières d'une attaque informatique : ransomware, vol de données, fraude au président, intrusion. Elle prend en charge la restauration des données, les frais d'expertise, les pertes d'exploitation, les sanctions RGPD et l'indemnisation des tiers. De plus en plus indispensable pour toutes les entreprises traitant des données numériques.",
      },
      {
        q: "Et l'assurance flotte automobile ?",
        a: "L'assurance flotte est destinée aux entreprises possédant plusieurs véhicules (généralement à partir de 3-5 véhicules). Elle simplifie la gestion en regroupant tous les véhicules sur un contrat unique, avec des tarifs négociés. Finarent compare les offres des principaux assureurs (AXA, Allianz, Generali, MMA, Groupama) pour optimiser votre prime.",
      },
      {
        q: "Qu'est-ce que la prévoyance TNS ?",
        a: "La prévoyance TNS (Travailleurs Non Salariés) protège les indépendants et chefs d'entreprise contre les aléas de la vie professionnelle : arrêt de travail (indemnités journalières), invalidité, décès. Contrairement aux salariés, les TNS bénéficient d'une couverture sociale minimale, d'où la nécessité d'une prévoyance complémentaire. Les cotisations sont déductibles dans le cadre de la loi Madelin.",
      },
      {
        q: "Puis-je résilier mon assurance pro en cours d'année ?",
        a: "Depuis la loi Hamon et la loi Châtel, vous pouvez résilier à la date anniversaire avec un préavis de 2 mois. Au-delà d'un an d'ancienneté, certains contrats permettent une résiliation à tout moment. Des motifs de résiliation anticipée existent aussi (cessation d'activité, modification du risque, augmentation tarifaire injustifiée). Finarent accompagne vos changements de contrat pour éviter toute rupture de couverture.",
      },
    ],
  },
  {
    id: 'financement-bancaire',
    icon: 'fa-coins',
    color: 'accent',
    title: 'Financement bancaire professionnel',
    description: 'Prêt pro, trésorerie, création, Bpifrance, alternatives.',
    questions: [
      {
        q: "Quels types de financements bancaires Finarent peut-il négocier ?",
        a: "Tous les financements pro classiques : prêt amortissable à moyen et long terme, prêt création / reprise d'entreprise, prêt de trésorerie, découvert autorisé, ligne de crédit, escompte, affacturage, cession Dailly. Nous travaillons avec les grands réseaux bancaires (BNP, Crédit Agricole, Société Générale, BPCE, Crédit Mutuel, LCL, La Banque Postale) ainsi qu'avec Bpifrance et les plateformes alternatives (October, Defacto, Mansa).",
      },
      {
        q: "Faut-il un apport pour obtenir un prêt professionnel ?",
        a: "Les banques exigent généralement un apport de 20 à 30 % du projet pour un prêt classique. Toutefois, des solutions existent sans apport ou avec apport minimal : le crédit-bail (financement 100 %), les garanties Bpifrance ou des sociétés de caution mutuelle (SIAGI, SOCAMA), les prêts d'honneur des réseaux Initiative France ou Réseau Entreprendre. Finarent identifie la meilleure combinaison selon votre profil.",
      },
      {
        q: "Quels documents préparer pour une demande de prêt pro ?",
        a: "Le dossier type comprend : Kbis ou extrait d'immatriculation, statuts de la société, pièce d'identité du dirigeant, RIB pro, 3 derniers bilans comptables et liasses fiscales (si entreprise existante), prévisionnel financier sur 3 ans (pour création/développement), business plan, devis ou bon de commande du bien à financer. Finarent fournit une checklist personnalisée selon votre dossier.",
      },
      {
        q: "Combien de temps faut-il pour obtenir un prêt pro ?",
        a: "Avec Finarent, vous recevez une première réponse de principe sous 48 heures. L'instruction complète du dossier (étude, accord définitif, déblocage des fonds) prend ensuite de 2 à 6 semaines selon la complexité du projet et le partenaire. Pour les financements alternatifs (October, Defacto, Mansa), les délais peuvent être plus courts (3 à 10 jours).",
      },
      {
        q: "Que faire en cas de refus bancaire ?",
        a: "Un refus d'une banque n'est pas un refus du marché. Finarent peut représenter votre dossier à plusieurs partenaires en parallèle, ajuster le montage financier (apport, durée, garanties), explorer les solutions alternatives (crédit-bail, crowdlending, prêts d'honneur, Bpifrance) et mobiliser des cautions mutuelles pour rassurer le prêteur. Notre rôle est précisément de transformer un « non » en « oui ».",
      },
      {
        q: "Qu'est-ce que Bpifrance et comment peut-elle m'aider ?",
        a: "Bpifrance est la Banque Publique d'Investissement, bras armé de l'État pour soutenir les entreprises. Elle propose des garanties (qui réduisent le risque pour la banque et facilitent votre accord), des prêts directs (prêt d'amorçage, prêt croissance), du crédit-bail mobilier (à partir de 70 k€), et des aides à l'innovation. Finarent intègre systématiquement Bpifrance dans les montages quand c'est pertinent.",
      },
      {
        q: "Quels sont les taux de financement actuels ?",
        a: "Les taux varient selon le profil emprunteur, la durée et le type de financement. À titre indicatif, en 2026 : crédit pro classique entre 4 et 7 % selon les profils, crédit-bail entre 4 et 9 %, LOA véhicule entre 3 et 6 % (taux nominal proportionnel). Les conditions exactes vous seront communiquées après étude personnalisée. Demandez une simulation gratuite sur notre site pour obtenir des chiffres précis pour votre projet.",
      },
    ],
  },
  {
    id: 'procedure',
    icon: 'fa-clock',
    color: 'secondary',
    title: 'Procédure & délais',
    description: 'Étapes type, délais de réponse, taux d\'acceptation.',
    questions: [
      {
        q: "Comment se déroule un dossier avec Finarent, étape par étape ?",
        a: "La procédure type comporte cinq étapes : (1) prise de contact via simulation en ligne, formulaire ou téléphone ; (2) analyse de votre besoin et collecte des pièces justificatives ; (3) consultation simultanée de plusieurs partenaires et négociation ; (4) présentation des offres comparées et conseil sur la meilleure option ; (5) signature, mise en place du financement ou du contrat et suivi post-souscription.",
      },
      {
        q: "Combien de temps pour obtenir une réponse ?",
        a: "Finarent s'engage sur une première réponse de principe sous 48 heures ouvrées. Pour les dossiers simples (RC Pro indépendant, petit financement matériel), une attestation peut être émise dans la journée. Pour les financements plus structurés, comptez 1 à 3 semaines entre la demande initiale et le déblocage des fonds. Nous tenons le client informé à chaque étape.",
      },
      {
        q: "Comment obtenir une simulation ?",
        a: "Trois façons : (1) via le simulateur en ligne sur finarent.fr (rapide, sans engagement, réponse immédiate sur les ordres de grandeur) ; (2) par téléphone avec un conseiller dédié ; (3) en remplissant le formulaire de contact. La simulation est totalement gratuite et sans engagement. Aucun prélèvement n'est effectué avant la signature d'un contrat ferme.",
      },
      {
        q: "Quels sont les taux d'acceptation observés ?",
        a: "Nous affichons un taux d'accord supérieur à 98 % sur les dossiers que nous présentons à nos partenaires, grâce à un pré-filtrage rigoureux et à notre connaissance fine des critères de chaque organisme. Ce taux concerne les dossiers que nous estimons éligibles ; certaines demandes peuvent être réorientées dès l'analyse initiale vers des solutions alternatives plus adaptées.",
      },
      {
        q: "Finarent peut-il accompagner une entreprise en création ?",
        a: "Oui, c'est même l'un de nos points forts. Les entreprises en création ont souvent du mal à obtenir un financement en banque classique. Finarent mobilise pour elles les dispositifs adaptés : garantie création Bpifrance, prêts d'honneur (Initiative France, Réseau Entreprendre, ADIE), microcrédit, crédit-bail sans historique exigé, financement alternatif. Nous accompagnons aussi sur l'assurance dès l'immatriculation.",
      },
      {
        q: "Puis-je faire plusieurs simulations ?",
        a: "Bien sûr. Vous pouvez simuler autant de projets que nécessaire, comparer plusieurs scénarios (durée, montant, type de financement) et nous solliciter à différents stades de votre activité (lancement, développement, transmission). Notre service est conçu pour être un partenaire de long terme.",
      },
    ],
  },
  {
    id: 'fiscalite',
    icon: 'fa-scale-balanced',
    color: 'primary',
    title: 'Fiscalité, comptabilité & juridique',
    description: 'Déductibilité, TVA, Madelin, cession, statuts.',
    questions: [
      {
        q: "Les loyers de leasing sont-ils déductibles fiscalement ?",
        a: "Oui, les loyers de crédit-bail et de location financière sont entièrement déductibles du résultat imposable, à condition que le bien soit affecté à l'activité professionnelle. Pour les véhicules de tourisme, des plafonds s'appliquent selon le taux d'émission de CO₂ (loi de finances en vigueur). Pour les véhicules utilitaires, la déduction est intégrale.",
      },
      {
        q: "Comment le crédit-bail apparaît-il au bilan ?",
        a: "Pendant la durée du contrat, le bien financé en crédit-bail n'apparaît pas à l'actif du bilan : c'est l'un des avantages dits « hors bilan ». Les loyers sont enregistrés en charges au compte de résultat. Seul l'engagement hors bilan est mentionné dans les annexes comptables. Au moment de la levée d'option, le bien intègre l'actif pour sa valeur résiduelle. Note : les normes IFRS 16 imposent désormais aux entreprises concernées d'inscrire les contrats de location à l'actif.",
      },
      {
        q: "La TVA est-elle récupérable sur les loyers ?",
        a: "La TVA est récupérable sur les loyers selon les mêmes règles que pour un achat : intégralement sur les matériels professionnels et les véhicules utilitaires, partiellement ou non sur les véhicules de tourisme (sauf usage exclusivement professionnel : taxis, auto-écoles, etc.). Le crédit-bail permet d'étaler le paiement de la TVA sur les loyers, ce qui peut être un avantage de trésorerie.",
      },
      {
        q: "Quelles sont mes obligations en matière d'assurance pour un bien en leasing ?",
        a: "Le contrat de leasing impose généralement à l'utilisateur d'assurer le bien financé contre les principaux risques (incendie, vol, dommages, RC exploitation) avec le crédit-bailleur comme bénéficiaire en cas de sinistre. Finarent peut proposer une assurance dédiée, parfois intégrée au loyer dans les formules tout-compris LLD/LOA.",
      },
      {
        q: "Que se passe-t-il en cas de difficulté financière de mon entreprise ?",
        a: "En cas de défaut de paiement, le crédit-bailleur peut résilier le contrat et reprendre le bien (puisqu'il en reste propriétaire). Les loyers déjà versés restent acquis. Il est donc essentiel de communiquer en amont avec son courtier et son partenaire financier en cas de difficultés : des solutions de réaménagement (report d'échéances, allongement de durée) peuvent être négociées avant la mise en demeure.",
      },
      {
        q: "Qu'est-ce que la loi Madelin et comment me concerne-t-elle ?",
        a: "La loi Madelin permet aux Travailleurs Non Salariés (TNS) de déduire de leur revenu imposable les cotisations versées au titre de la prévoyance, de la santé et de la retraite supplémentaire, dans certaines limites. Pour les indépendants, c'est un levier d'optimisation fiscale important. Finarent propose des contrats Madelin via ses partenaires spécialisés (Alptis, SwissLife, April).",
      },
      {
        q: "Mon contrat est-il transférable en cas de cession d'entreprise ?",
        a: "Le transfert d'un contrat de crédit-bail ou de leasing dans le cadre d'une cession d'entreprise nécessite l'accord préalable du crédit-bailleur. Cet accord est généralement donné dès lors que le repreneur présente une solidité financière équivalente. Pour les contrats d'assurance, la cession se fait également avec l'accord de l'assureur, qui peut adapter les conditions selon le profil du repreneur.",
      },
      {
        q: "Quel statut juridique est le plus adapté pour bénéficier de financements ?",
        a: "Toutes les formes juridiques sont éligibles aux financements professionnels (EI, EURL, SARL, SAS, SASU, SA, SCI…), mais certaines facilitent l'obtention d'un financement bancaire : les sociétés à capital social (SARL, SAS) inspirent davantage confiance que l'entreprise individuelle, surtout pour les gros montants. La micro-entreprise est éligible aux solutions adaptées (LOA, crédit-bail petit ticket, microcrédit). Notre rôle est d'orienter votre dossier vers le partenaire le plus à l'aise avec votre statut.",
      },
    ],
  },
];
