/* Sprachumschaltung Deutsch / Russisch.
   Das HTML bleibt einsprachig deutsch. Beim Umschalten werden alle Textknoten
   und relevanten Attribute anhand dieses Wörterbuchs ersetzt; der deutsche
   Ursprungstext wird gemerkt, damit das Zurückschalten verlustfrei ist.
   Neue Texte auf der Seite: hier den deutschen Text als Schlüssel und die
   russische Fassung als Wert ergänzen. Fehlt ein Eintrag, bleibt der Text
   deutsch. */
(function () {
  const RU = {
    /* Kopf & Meta */
    "Daniel Klotzek — Versicherungsmakler & Finanzberater in Wiesloch, Heidelberg und Umgebung": "Даниэль Клотцек — страховой брокер и финансовый консультант в Вислохе, Гейдельберге и окрестностях",
    "Unabhängige Versicherungs- und Finanzberatung für Wiesloch, Dielheim, Nußloch, Leimen und Heidelberg. Geprüfter Fachmann für Versicherungsvermittlung (IHK). Erstgespräch online per Google Meet buchen.": "Независимые страховые и финансовые консультации для Вислоха, Дильхайма, Нусслоха, Лаймена и Гейдельберга. Дипломированный специалист по страховому посредничеству (IHK). Запись на первую встречу онлайн через Google Meet.",
    "Daniel Klotzek — Versicherungsmakler & Finanzberater": "Даниэль Клотцек — страховой брокер и финансовый консультант",
    "Absicherung, die zu Ihrem Leben passt. Unabhängige Beratung im Rhein-Neckar-Raum — online per Google Meet oder bei Ihnen vor Ort.": "Защита, которая подходит вашей жизни. Независимые консультации в регионе Рейн-Неккар — онлайн через Google Meet или у вас дома.",
    "Zur Startseite": "На главную",
    "Versicherungsmakler · Finanzberater": "Страхование · Финансы",
    "Menü öffnen": "Открыть меню",
    "Menü schließen": "Закрыть меню",
    "Hauptnavigation": "Главное меню",
    "Leistungen": "Услуги",
    "Über mich": "Обо мне",
    "Ablauf": "Как это работает",
    "Region": "Регион",
    "Kontakt": "Контакты",
    "Termin buchen": "Записаться",

    /* Hero */
    "Unabhängiger Versicherungsmakler · Rhein-Neckar": "Независимый страховой брокер · Рейн-Неккар",
    "Absicherung, die zu": "Защита, которая подходит",
    "Ihrem Leben": "вашей жизни",
    "passt.": ".",
    "Persönliche Versicherungs- und Finanzberatung für Wiesloch, Dielheim, Nußloch, Leimen und Heidelberg — unabhängig, verständlich, auf Augenhöhe. Online per Google Meet oder bei Ihnen vor Ort.": "Персональные страховые и финансовые консультации для Вислоха, Дильхайма, Нусслоха, Лаймена и Гейдельберга — независимо, понятно, на равных. Онлайн через Google Meet или у вас дома. Консультации на русском языке.",
    "Online-Termin buchen": "Записаться онлайн",
    "Leistungen entdecken": "Смотреть услуги",
    "Geprüfter Fachmann für Versicherungsvermittlung (IHK)": "Дипломированный специалист по страховому посредничеству (IHK)",
    "Logistik- und Mobilitätsmanagement (B.Sc.)": "Логистика и управление мобильностью (B.Sc.)",
    "Zugang zu allen namhaften Gesellschaften": "Доступ ко всем ведущим страховым компаниям",
    "Ihr Berater vor Ort": "Ваш консультант рядом",
    "geprüft": "сертиф.",
    "Erstgespräch": "Первая встреча",
    "30 Min. per Google Meet": "30 мин. в Google Meet",
    "Unabhängig": "Независимо",
    "Ihr Interesse zuerst": "Ваши интересы — прежде всего",

    /* Partner */
    "Alle namhaften Versicherer — ein Ansprechpartner.": "Все ведущие страховщики — один контакт.",
    "Als unabhängiger Makler vergleiche ich für Sie den Markt und wähle aus dem Angebot führender Gesellschaften, statt Ihnen ein Hausprodukt zu verkaufen.": "Как независимый брокер я сравниваю для вас рынок и выбираю из предложений ведущих компаний, а не продаю продукт одной фирмы.",
    "Versicherungsgesellschaften, Auswahl": "Страховые компании, выборка",
    "Auswahl. Die genannten Marken gehören den jeweiligen Gesellschaften. Eine Zusammenarbeit besteht im Rahmen der Maklertätigkeit; es handelt sich nicht um eine Empfehlung einzelner Produkte.": "Выборка. Указанные товарные знаки принадлежат соответствующим компаниям. Сотрудничество осуществляется в рамках брокерской деятельности и не является рекомендацией отдельных продуктов.",

    /* Leistungen */
    "Von der Berufsunfähigkeit bis zur": "От страхования нетрудоспособности до",
    "Baufinanzierung": "ипотеки",
    "— alles aus einer Hand.": "— всё из одних рук.",
    "Ich analysiere, was Sie wirklich brauchen, vergleiche den Markt und begleite Sie langfristig. Ohne Fachchinesisch, ohne Verkaufsdruck.": "Я анализирую, что вам действительно нужно, сравниваю рынок и сопровождаю вас долгие годы. Без сложных терминов и без давления.",
    "Leistungsbereiche": "Направления услуг",
    "Privatkunden": "Частным клиентам",
    "Gewerbe & Logistik": "Бизнес и логистика",
    "Finanzen & Vorsorge": "Финансы и пенсия",
    "Berufsunfähigkeit": "Нетрудоспособность",
    "Ihre Arbeitskraft ist Ihr größtes Vermögen. Ich finde den Tarif, der im Ernstfall wirklich zahlt — mit sauberer Gesundheitsprüfung vorab.": "Ваша трудоспособность — ваш главный капитал. Я подберу тариф, который действительно выплатит в трудной ситуации, с корректной проверкой здоровья заранее.",
    "BU": "Страхование BU",
    "Grundfähigkeit": "Базовые способности",
    "Dread Disease": "Тяжёлые заболевания",
    "Kranken & Pflege": "Здоровье и уход",
    "Private Krankenvollversicherung, Zusatzbausteine für Zahn, Klinik und Sehhilfe sowie eine Pflegevorsorge, die Ihre Familie entlastet.": "Частное медицинское страхование, дополнительные модули для стоматологии, стационара и очков, а также страхование ухода, которое разгрузит вашу семью.",
    "PKV": "Частная медстраховка",
    "Zusatz": "Дополнительная",
    "Pflege": "Уход",
    "Altersvorsorge": "Пенсионное обеспечение",
    "Ob Rürup, Riester, betriebliche Altersvorsorge oder ETF-Police: Wir bauen eine Vorsorge, die flexibel bleibt und Steuern sinnvoll nutzt.": "Rürup, Riester, корпоративная пенсия или полис на ETF: мы выстроим обеспечение, которое остаётся гибким и разумно использует налоговые льготы.",
    "Basisrente": "Базовая пенсия",
    "bAV": "Корпоративная пенсия",
    "Fondspolice": "Фондовый полис",
    "Haftpflicht & Recht": "Ответственность и право",
    "Privathaftpflicht, Rechtsschutz und Unfallversicherung — die Grundabsicherung, die jeder braucht, sauber aufeinander abgestimmt.": "Гражданская ответственность, юридическая защита и страхование от несчастных случаев — базовая защита, нужная каждому, грамотно согласованная.",
    "Privathaftpflicht": "Гражданская ответственность",
    "Rechtsschutz": "Юридическая защита",
    "Unfall": "Несчастный случай",
    "Haus & Wohnen": "Дом и жильё",
    "Hausrat, Wohngebäude und Elementarschutz. Gerade im Kraichgau lohnt ein Blick auf Starkregen und Rückstau.": "Домашнее имущество, здание и защита от стихийных бедствий. В Крайхгау особенно важно учесть ливни и обратный подпор воды.",
    "Hausrat": "Имущество",
    "Wohngebäude": "Здание",
    "Elementar": "Стихийные бедствия",
    "Kfz & Mobilität": "Авто и мобильность",
    "Pkw, Motorrad, E-Auto oder Wohnmobil: Tarifvergleich mit Blick auf Leistung statt nur auf den Preis — inklusive Schadenservice.": "Легковой автомобиль, мотоцикл, электромобиль или автодом: сравнение тарифов по качеству покрытия, а не только по цене, включая помощь при страховом случае.",
    "Kfz": "Авто",
    "E-Mobilität": "Электромобили",
    "Camper": "Автодом",
    "Transport & Flotte": "Транспорт и автопарк",
    "Mein Studienschwerpunkt: Verkehrshaftung, Warentransport, Flottenverträge und Logistik-Deckungen — ich spreche die Sprache Ihrer Branche.": "Моя специализация по образованию: ответственность перевозчика, страхование грузов, договоры на автопарк и покрытия для логистики — я говорю на языке вашей отрасли.",
    "Flotte": "Автопарк",
    "Verkehrshaftung": "Ответственность перевозчика",
    "Warentransport": "Грузы",
    "Betriebshaftpflicht & Inhalt": "Ответственность бизнеса и имущество",
    "Betriebs- und Vermögensschadenhaftpflicht, Inhaltsversicherung und Betriebsunterbrechung, passend zu Größe und Risiko Ihres Unternehmens.": "Ответственность предприятия и за имущественный ущерб, страхование оборудования и перерыва в деятельности — по размеру и рискам вашего бизнеса.",
    "Betriebshaftpflicht": "Ответственность предприятия",
    "Inhalt": "Оборудование",
    "Ertragsausfall": "Потеря дохода",
    "Cyber & D&O": "Кибер и D&O",
    "Datenverlust, Erpressung, Managerhaftung: Moderne Risiken brauchen moderne Policen — mit Assistance im Krisenfall.": "Потеря данных, вымогательство, ответственность руководителей: современные риски требуют современных полисов — с поддержкой в кризисной ситуации.",
    "Cyber": "Кибер",
    "Mitarbeiter & bAV": "Сотрудники и корпоративная пенсия",
    "Betriebliche Altersvorsorge, Krankenzusatz und Gruppenunfall: Benefits, die Fachkräfte halten — mit schlanker Verwaltung für Sie.": "Корпоративная пенсия, дополнительная медстраховка и групповое страхование от несчастных случаев: бонусы, которые удерживают специалистов, с минимальной администрацией для вас.",
    "bKV": "Корпоративная медстраховка",
    "Gruppenunfall": "Групповое страхование",
    "Existenzgründung": "Открытие бизнеса",
    "Schlank starten, richtig absichern: Ich stelle das Grundpaket zusammen, das zur Gründungsphase passt, und wachse mit Ihrem Betrieb mit.": "Стартовать экономно, но защищённо: я соберу базовый пакет для этапа основания и буду расти вместе с вашим бизнесом.",
    "Gründerpaket": "Пакет для стартапа",
    "Berufshaftpflicht": "Профессиональная ответственность",
    "Bestandsanalyse": "Анализ договоров",
    "Ich prüfe Ihre bestehenden Gewerbeverträge auf Lücken, Doppelungen und Preis — und kümmere mich um die Umstellung.": "Я проверю ваши действующие бизнес-договоры на пробелы, дублирование и цену — и возьму на себя переоформление.",
    "Vertragscheck": "Проверка договоров",
    "Sanierung": "Оптимизация",
    "Vom ersten Angebot bis zur Anschlussfinanzierung: Ich vergleiche Banken und Bausparkassen und begleite Sie durch die Kaufphase.": "От первого предложения до рефинансирования: я сравниваю банки и строительно-сберегательные кассы и сопровождаю вас на этапе покупки.",
    "Immobilienkauf": "Покупка недвижимости",
    "Anschluss": "Рефинансирование",
    "Bausparen": "Bausparen",
    "Vermögensaufbau": "Накопление капитала",
    "Sparpläne, Fondsdepots und fondsgebundene Vorsorge — kostenbewusst und breit gestreut, abgestimmt auf Ihren Zeithorizont.": "Накопительные планы, фондовые депо и инвестиционное обеспечение — с низкими издержками и широкой диверсификацией, под ваш горизонт планирования.",
    "ETF-Sparplan": "План на ETF",
    "Depot": "Депо",
    "Kinder-Vorsorge": "Накопления для детей",
    "Ruhestandsplanung": "Планирование пенсии",
    "Was kommt an, was fehlt? Ich rechne Ihre Rentenlücke ehrlich durch und zeige, wie sie sich mit Augenmaß schließen lässt.": "Сколько вы получите и чего не хватит? Я честно рассчитаю ваш пенсионный разрыв и покажу, как разумно его закрыть.",
    "Rentenlücke": "Пенсионный разрыв",
    "Entnahmeplan": "План выплат",

    /* Kennzahlen */
    "Warum unabhängig": "Почему независимый",
    "Ich arbeite für Sie —": "Я работаю для вас —",
    "nicht für eine Versicherung.": "а не для страховой компании.",
    "unabhängig: keine Bindung an eine Gesellschaft, keine Produktvorgaben.": "независимости: без привязки к одной компании, без навязанных продуктов.",
    "Beratungshonorar. Die Vergütung erfolgt über die vermittelten Verträge.": "гонорар за консультацию. Вознаграждение выплачивается через заключённые договоры.",
    "Ansprechpartner für alle Verträge, Schäden und Fragen — auch nach dem Abschluss.": "контактное лицо по всем договорам, страховым случаям и вопросам — и после заключения.",
    "Rückmeldung an Werktagen. Sie erreichen mich, wenn es darauf ankommt.": "на ответ в рабочие дни. Вы дозвонитесь до меня, когда это важно.",

    /* Über mich */
    "Daniel Klotzek, Versicherungsmakler": "Даниэль Клотцек, страховой брокер",
    "Gute Beratung heißt: Sie verstehen am Ende, was Sie abschließen — und warum.": "Хорошая консультация — это когда вы понимаете, что подписываете и почему.",
    "Versicherungsmakler und Finanzberater aus dem Rhein-Neckar-Raum — mit Fachausbildung, Studienabschluss und dem Anspruch, Komplexes einfach zu erklären.": "Страховой брокер и финансовый консультант из региона Рейн-Неккар — с профессиональным образованием, дипломом и стремлением объяснять сложное просто.",
    "Nach meinem Studium des Logistik- und Mobilitätsmanagements habe ich mich als Versicherungsfachmann qualifiziert und bin heute als unabhängiger Makler in Wiesloch, Dielheim, Nußloch, Leimen und Heidelberg unterwegs. Aus dem Studium bringe ich das Verständnis für Prozesse, Risiken und Zahlen mit — aus der Praxis das Gespür dafür, was Menschen wirklich brauchen.": "После учёбы по специальности «Логистика и управление мобильностью» я получил квалификацию специалиста по страхованию и сегодня работаю независимым брокером в Вислохе, Дильхайме, Нусслохе, Лаймене и Гейдельберге. Из учёбы я вынес понимание процессов, рисков и цифр, из практики — чутьё на то, что людям действительно нужно.",
    "Ich glaube an lange Beziehungen statt schneller Abschlüsse. Deshalb bekommen Sie bei mir eine ehrliche Analyse, transparente Vergleiche und einen Ansprechpartner, der auch im Schadenfall erreichbar bleibt.": "Я верю в долгие отношения, а не в быстрые сделки. Поэтому у меня вы получите честный анализ, прозрачные сравнения и контактное лицо, которое остаётся на связи и при страховом случае.",
    "Sachkundenachweis nach § 34d GewO, eingetragen im Vermittlerregister": "Подтверждение квалификации по § 34d GewO, запись в реестре посредников",
    "Betriebswirtschaftlicher Studienabschluss mit Schwerpunkt Prozesse, Verkehr und Risiko": "Экономическое высшее образование со специализацией на процессах, транспорте и рисках",
    "Verwurzelt im Rhein-Neckar-Raum": "Укоренён в регионе Рейн-Неккар",
    "Persönliche Termine zwischen Kraichgau und Bergstraße, online deutschlandweit": "Личные встречи между Крайхгау и Бергштрассе, онлайн — по всей Германии",

    /* Grundsätze */
    "Grundsätze": "Принципы",
    "Drei Zusagen, an denen Sie mich": "Три обещания, по которым вы можете меня",
    "messen": "судить",
    "dürfen.": ".",
    "Erst verstehen, dann empfehlen": "Сначала понять, потом рекомендовать",
    "Jede Beratung beginnt mit Ihrer Situation — Familie, Beruf, Pläne, Budget. Erst danach geht es um Produkte.": "Каждая консультация начинается с вашей ситуации — семья, работа, планы, бюджет. И только потом речь идёт о продуктах.",
    "Transparent bis ins Kleingedruckte": "Прозрачность до мелкого шрифта",
    "Sie sehen, was verglichen wurde und warum ich zu einem Tarif rate. Ausschlüsse und Kosten erkläre ich, bevor Sie unterschreiben.": "Вы видите, что сравнивалось и почему я советую именно этот тариф. Исключения и расходы я объясняю до того, как вы подпишете.",
    "Da, wenn es darauf ankommt": "Рядом, когда это важно",
    "Im Schadenfall, bei Änderungen im Leben, bei Fragen: Ein Anruf genügt. Ich bleibe Ihr Ansprechpartner — nicht eine Hotline.": "При страховом случае, переменах в жизни, любых вопросах: достаточно одного звонка. Ваш контакт — я, а не горячая линия.",

    /* Ablauf */
    "So läuft es ab": "Как это работает",
    "In vier Schritten zur": "Четыре шага к",
    "passenden": "подходящей",
    "Absicherung.": "защите.",
    "Klar strukturiert, in Ihrem Tempo. Das Erstgespräch ist unverbindlich und kostenfrei.": "Чётко структурировано, в вашем темпе. Первая встреча ни к чему не обязывает и бесплатна.",
    "Kennenlernen": "Знакомство",
    "Ein 30-minütiges Gespräch per Google Meet, telefonisch oder bei Ihnen zu Hause. Sie erzählen, ich höre zu und stelle die richtigen Fragen.": "30-минутный разговор в Google Meet, по телефону или у вас дома. Вы рассказываете, я слушаю и задаю правильные вопросы.",
    "Online · vor Ort": "Онлайн · на месте",
    "Analyse": "Анализ",
    "Ich prüfe Ihre bestehenden Verträge, decke Lücken und Doppelungen auf und priorisiere, was wirklich wichtig ist.": "Я проверяю ваши действующие договоры, выявляю пробелы и дублирование и расставляю приоритеты.",
    "Bestandscheck": "Проверка договоров",
    "Konzept & Vergleich": "Концепция и сравнение",
    "Sie erhalten einen verständlichen Vergleich über die relevanten Gesellschaften — mit klarer Empfehlung und Begründung.": "Вы получаете понятное сравнение по релевантным компаниям — с чёткой рекомендацией и обоснованием.",
    "Marktvergleich": "Сравнение рынка",
    "Umsetzung & Betreuung": "Оформление и сопровождение",
    "Ich erledige Anträge, Kündigungen und Umstellungen und bleibe dauerhaft an Ihrer Seite — auch im Schadenfall.": "Я оформляю заявления, расторжения и переходы и остаюсь рядом с вами постоянно — и при страховом случае.",
    "Ein Leben lang": "На всю жизнь",

    /* Region */
    "Vor Ort für Sie": "Рядом с вами",
    "Zwischen Kraichgau und": "Как дома между Крайхгау и",
    "Bergstraße": "Бергштрассе",
    "zu Hause.": ".",
    "Beratung bei Ihnen am Küchentisch, im Büro oder online — ich bin in der ganzen Region unterwegs.": "Консультация у вас за кухонным столом, в офисе или онлайн — я работаю по всему региону.",
    "Wiesloch": "Вислох (Wiesloch)",
    "Dielheim": "Дильхайм (Dielheim)",
    "Nußloch": "Нусслох (Nußloch)",
    "Leimen": "Лаймен (Leimen)",
    "Heidelberg": "Гейдельберг (Heidelberg)",
    "Walldorf, Sandhausen, Rauenberg, St. Leon-Rot und Umgebung": "Вальдорф, Зандхаузен, Рауэнберг, Санкт-Леон-Рот и окрестности",
    "Termin in Ihrer Nähe vereinbaren": "Назначить встречу рядом с вами",

    /* Termin */
    "Erstgespräch per": "Первая встреча в",
    "— in zwei Minuten gebucht.": "— запись за две минуты.",
    "Wählen Sie einen freien Termin. Sie erhalten sofort eine Bestätigung mit dem Google-Meet-Link per E-Mail.": "Выберите свободное время. Подтверждение со ссылкой на Google Meet сразу придёт на вашу электронную почту.",
    "30 Minuten": "30 минут",
    ", unverbindlich und kostenfrei": ", ни к чему не обязывает и бесплатно",
    "Videogespräch über Google Meet — kein Konto nötig, funktioniert im Browser und am Handy": "Видеозвонок через Google Meet — без аккаунта, работает в браузере и на телефоне",
    "Terminbestätigung und Erinnerung automatisch per E-Mail": "Подтверждение и напоминание автоматически по электронной почте",
    "Lieber persönlich? Im Gespräch vereinbaren wir gern einen Vor-Ort-Termin": "Предпочитаете лично? В разговоре мы договоримся о встрече на месте",
    "Kalender in neuem Fenster öffnen": "Открыть календарь в новом окне",
    "Termin per E-Mail anfragen": "Запросить встречу по e-mail",
    "Hinweis für den Seiteninhaber:": "Примечание для владельца сайта:",
    "ist noch kein Google-Terminplan hinterlegt. Anleitung in der": "ещё не указана ссылка на Google-календарь. Инструкция в файле",
    "Terminkalender laden": "Загрузить календарь",
    "Der Kalender wird von Google bereitgestellt. Beim Laden werden Verbindungsdaten (u. a. Ihre IP-Adresse) an Google übermittelt.": "Календарь предоставляется Google. При загрузке данные соединения (в том числе ваш IP-адрес) передаются в Google.",
    "Kalender anzeigen": "Показать календарь",
    "Lieber per E-Mail anfragen": "Лучше написать по e-mail",
    "Mit dem Klick stimmen Sie dem Laden des Google-Kalenders zu. Details in der": "Нажимая, вы соглашаетесь на загрузку Google Календаря. Подробности — в разделе",
    "Datenschutzerklärung": "«Политика конфиденциальности»",
    "Terminbuchung – Google Kalender": "Запись на встречу — Google Календарь",

    /* Kontakt */
    "Fragen? Ich bin": "Есть вопросы? Я",
    "erreichbar.": "на связи.",
    "Rufen Sie an, schreiben Sie mir oder nutzen Sie das Formular — ich melde mich innerhalb eines Werktags.": "Позвоните, напишите или воспользуйтесь формой — я отвечу в течение одного рабочего дня.",
    "Telefon": "Телефон",
    "E-Mail": "E-mail",
    "Büro": "Офис",
    "Erreichbarkeit": "Часы работы",
    "Name": "Имя",
    "Thema": "Тема",
    "Allgemeine Anfrage": "Общий вопрос",
    "Krankenversicherung": "Медицинское страхование",
    "Haus, Hausrat, Haftpflicht": "Дом, имущество, ответственность",
    "Gewerbe / Logistik": "Бизнес / логистика",
    "Ihre Nachricht": "Ваше сообщение",
    "Ich habe die": "Я ознакомился(-ась) с разделом",
    "gelesen und bin mit der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage einverstanden.": "и согласен(-на) на обработку моих данных для ответа на запрос.",
    "Nachricht senden": "Отправить сообщение",
    "Das Formular öffnet Ihr E-Mail-Programm mit der vorbereiteten Nachricht. Es werden keine Daten auf dieser Website gespeichert.": "Форма откроет вашу почтовую программу с подготовленным письмом. На этом сайте данные не сохраняются.",
    "Anfrage über die Website": "Запрос с сайта",

    /* CTA & Fusszeile */
    "Bereit für Klarheit bei Ihren": "Готовы навести порядок в своих",
    "Versicherungen?": "страховках?",
    "Kostenfreies Erstgespräch": "Бесплатная первая встреча",
    "Unabhängige Versicherungs- und Finanzberatung für Wiesloch, Dielheim, Nußloch, Leimen, Heidelberg und Umgebung.": "Независимые страховые и финансовые консультации для Вислоха, Дильхайма, Нусслоха, Лаймена, Гейдельберга и окрестностей.",
    "Versicherungsmakler mit Erlaubnis nach § 34d Abs. 1 GewO · Vermittlerregister-Nr.": "Страховой брокер с лицензией по § 34d абз. 1 GewO · № в реестре посредников",
    "Termin per Google Meet": "Встреча в Google Meet",
    "QR-Code & Visitenkarte": "QR-код и визитка",
    "Daniel Klotzek. Alle Rechte vorbehalten.": "Даниэль Клотцек. Все права защищены.",
    "Impressum": "Выходные данные (Impressum)",
    "Datenschutz": "Конфиденциальность",
    "Erstinformation": "Первичная информация"
  };

  const STORE = "dkl-lang";
  const originals = new WeakMap();     /* Knoten → deutscher Ursprungstext */
  const ATTRS = ["aria-label", "alt", "placeholder", "title"];
  const SKIP = "script, style, svg, code";

  function lookup(text, lang) {
    const key = text.trim();
    if (!key) return null;
    if (lang === "de") return null;
    const hit = RU[key];
    if (hit === undefined) return null;
    const lead = text.slice(0, text.indexOf(key)), trail = text.slice(text.indexOf(key) + key.length);
    /* Beginnt die Übersetzung mit einem Satzzeichen, darf davor kein Leerraum stehen. */
    return (/^[.,;:!?»]/.test(hit) ? "" : lead) + hit + trail;
  }

  function apply(lang) {
    const root = document.documentElement;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement;
        if (!p || p.closest(SKIP)) return NodeFilter.FILTER_REJECT;
        return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const n of nodes) {
      if (!originals.has(n)) originals.set(n, n.nodeValue);
      const de = originals.get(n);
      n.nodeValue = lookup(de, lang) || de;
    }
    root.querySelectorAll("*").forEach(el => {
      for (const a of ATTRS) {
        if (!el.hasAttribute(a)) continue;
        const k = "__i18n_" + a;
        if (!(k in el)) el[k] = el.getAttribute(a);
        el.setAttribute(a, lookup(el[k], lang) || el[k]);
      }
    });
    document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]').forEach(m => {
      if (!m.__i18n) m.__i18n = m.content;
      m.content = lookup(m.__i18n, lang) || m.__i18n;
    });
    root.lang = lang;
    document.querySelectorAll(".langswitch button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  }

  let current = "de";
  const param = new URLSearchParams(location.search).get("lang");
  try { current = param || localStorage.getItem(STORE) || "de"; } catch (e) { current = param || "de"; }
  if (current !== "ru") current = "de";

  function set(lang) {
    current = lang === "ru" ? "ru" : "de";
    try { localStorage.setItem(STORE, current); } catch (e) { /* privater Modus */ }
    apply(current);
  }

  window.I18N = {
    get lang() { return current; },
    set,
    refresh: () => apply(current),
    t: (s) => (current === "de" ? s : (RU[s] || s))
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".langswitch button").forEach(b => b.addEventListener("click", () => set(b.dataset.lang)));
    apply(current);
  });
})();
