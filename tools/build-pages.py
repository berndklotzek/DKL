#!/usr/bin/env python3
"""Erzeugt die Unterseiten (Ratgeber, Impressum, Datenschutz, 404) aus einem
gemeinsamen Rahmen, damit Kopf- und Fusszeile überall identisch sind.
Aufruf: python3 tools/build-pages.py  — schreibt ins Projektverzeichnis.
Die Startseite index.html wird von Hand gepflegt."""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

D = 'https://www.xn--seelenfrieden-urnenrckfhrung-l7cd.ch'

def head(title_de, title_ru, desc_de, desc_ru, path, noindex=False, ld=''):
    robots = '<meta name="robots" content="noindex">\n' if noindex else '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">\n'
    return f'''<!doctype html>
<html lang="de" data-lang="de" class="no-js"
      data-title-de="{title_de}"
      data-title-ru="{title_ru}"
      data-desc-de="{desc_de}"
      data-desc-ru="{desc_ru}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title_de}</title>
<meta name="description" content="{desc_de}">
{robots}<meta name="theme-color" content="#070c11">
<meta name="color-scheme" content="dark">
<link rel="canonical" href="{D}/{path}">
<link rel="alternate" hreflang="de" href="{D}/{path}">
<link rel="alternate" hreflang="ru" href="{D}/ru/{path}">
<link rel="alternate" hreflang="x-default" href="{D}/{path}">
<meta property="og:type" content="article">
<meta property="og:locale" content="de_CH">
<meta property="og:locale:alternate" content="ru_RU">
<meta property="og:site_name" content="Seelenfrieden Urnenrückführung GmbH">
<meta property="og:title" content="{title_de}">
<meta property="og:description" content="{desc_de}">
<meta property="og:url" content="{D}/{path}">
<meta property="og:image" content="{D}/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="assets/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preload" href="assets/fonts/cormorant-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/fonts.css">
<link rel="stylesheet" href="assets/css/style.css">
{ld}
</head>
<body>

<div class="progress" aria-hidden="true"></div>
<a class="skip" href="#inhalt"><span lang="de">Zum Inhalt</span><span lang="ru">К содержанию</span></a>
'''

HEADER = '''
<header class="topbar is-scrolled">
  <div class="wrap">
    <a class="logo" href="index.html" aria-label="Seelenfrieden Urnenrückführung — Startseite">
      <svg class="logo-mark" width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r="17" fill="#17293c"/>
        <circle cx="18" cy="18" r="14.2" fill="none" stroke="#c9a86b" stroke-width="1"/>
        <path d="M14.2 12.4h7.6l-1.05 2.55a5.6 5.6 0 0 1 2.75 4.8c0 3.2-2.55 5.35-5.5 5.35s-5.5-2.15-5.5-5.35a5.6 5.6 0 0 1 2.75-4.8L14.2 12.4Z" fill="none" stroke="#f4efe6" stroke-width="1.1"/>
        <path d="M15 9.9h6" stroke="#c9a86b" stroke-width="1.1" stroke-linecap="round"/>
      </svg>
      <span class="logo-type">
        <b>Seelenfrieden</b>
        <span lang="de">Urnenrückführung · Zug</span>
        <span lang="ru">Репатриация урн · Цуг</span>
      </span>
    </a>

    <button class="burger" type="button" aria-expanded="false" aria-controls="mainnav">
      <span></span><span></span><span></span>
      <span class="visually-hidden" lang="de">Menü</span>
      <span class="visually-hidden" lang="ru">Меню</span>
    </button>

    <nav class="mainnav" id="mainnav" aria-label="Hauptnavigation">
      <a href="index.html"><span lang="de">Startseite</span><span lang="ru">Главная</span></a>
      <a href="index.html#leistungen"><span lang="de">Leistungen</span><span lang="ru">Услуги</span></a>
      <a href="index.html#ablauf"><span lang="de">Ablauf</span><span lang="ru">Порядок</span></a>
      <a href="index.html#festpreis"><span lang="de">Festpreis</span><span lang="ru">Цена</span></a>
      <a href="index.html#ratgeber"><span lang="de">Ratgeber</span><span lang="ru">Справочник</span></a>
      <a href="index.html#kontakt"><span lang="de">Kontakt</span><span lang="ru">Контакты</span></a>
      <a class="nav-cta" href="tel:+41410000000">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" style="margin-right:.5rem"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>
        <span lang="de">Jetzt anrufen</span><span lang="ru">Позвонить</span>
      </a>
      <span class="langswitch" role="group" aria-label="Sprache / Язык">
        <a href="{{PAGE}}" hreflang="de" data-set-lang="de" aria-pressed="true">DE</a>
        <a href="ru/{{PAGE}}" hreflang="ru" data-set-lang="ru" aria-pressed="false">RU</a>
      </span>
    </nav>
  </div>
</header>
'''

FOOTER = '''
<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <p class="name">Seelenfrieden<br>Urnenrückführung GmbH</p>
        <p class="tag caps"><span lang="de">Friedhofszwang? Nein danke.</span><span lang="ru">Обязательное захоронение? Нет, спасибо.</span></p>
        <p lang="de">Überführung von Urnen aus Deutschland in die Schweiz — und in die Hände der Familie. Diskret, dokumentiert, zum Festpreis.</p>
        <p lang="ru">Перевозка урн из Германии в Швейцарию — и в руки семьи. Деликатно, с документами, по фиксированной цене.</p>
      </div>
      <div>
        <h4><span lang="de">Navigation</span><span lang="ru">Навигация</span></h4>
        <ul>
          <li><a href="index.html#leistungen"><span lang="de">Leistungen</span><span lang="ru">Услуги</span></a></li>
          <li><a href="index.html#rechtslage"><span lang="de">Rechtslage</span><span lang="ru">Правовая ситуация</span></a></li>
          <li><a href="index.html#ablauf"><span lang="de">Ablauf</span><span lang="ru">Порядок действий</span></a></li>
          <li><a href="index.html#festpreis"><span lang="de">Festpreis</span><span lang="ru">Цена</span></a></li>
          <li><a href="index.html#vorsorge"><span lang="de">Vorsorge</span><span lang="ru">Планирование</span></a></li>
          <li><a href="index.html#fragen"><span lang="de">Häufige Fragen</span><span lang="ru">Частые вопросы</span></a></li>
        </ul>
      </div>
      <div>
        <h4><span lang="de">Rechtliches</span><span lang="ru">Правовая информация</span></h4>
        <ul>
          <li><a href="friedhofszwang.html"><span lang="de">Ratgeber Friedhofszwang</span><span lang="ru">Обязательное захоронение</span></a></li>
          <li><a href="urne-zu-hause-aufbewahren.html"><span lang="de">Urne zu Hause aufbewahren</span><span lang="ru">Хранить урну дома</span></a></li>
          <li><a href="zurueck-in-die-heimat.html"><span lang="de">Zurück in die Heimat: das Modell</span><span lang="ru">Возвращение домой: модель</span></a></li>
          <li><a href="bestattungsverfuegung.html"><span lang="de">Bestattungsverfügung</span><span lang="ru">Распоряжение о погребении</span></a></li>
          <li><a href="impressum.html"><span lang="de">Impressum</span><span lang="ru">Выходные данные</span></a></li>
          <li><a href="datenschutz.html"><span lang="de">Datenschutz</span><span lang="ru">Защита данных</span></a></li>
        </ul>
      </div>
      <div>
        <h4><span lang="de">Kontakt</span><span lang="ru">Контакты</span></h4>
        <address>
          Gotthardstrasse 14<br>6300 Zug, <span lang="de">Schweiz</span><span lang="ru">Швейцария</span><br>
          <a href="tel:+41410000000">+41 41 000 00 00</a><br>
          <a href="mailto:info@xn--seelenfrieden-urnenrckfhrung-l7cd.ch">info@seelenfrieden-urnenrückführung.ch</a>
        </address>
      </div>
    </div>
    <div class="foot-bottom">
      <span class="caps">© <span id="year">2026</span> Seelenfrieden Urnenrückführung GmbH, Zug</span>
      <span class="caps"><span lang="de">Deutsch · Russisch</span><span lang="ru">Немецкий · Русский</span></span>
    </div>
  </div>
</footer>

<script src="assets/js/i18n.js"></script>
<script src="assets/js/nav.js"></script>
<script src="assets/js/reveal.js"></script>
<script src="assets/js/fx.js"></script>
</body>
</html>
'''

CTA = '''
  <section class="band-alt cta-band">
    <div class="wrap reveal">
      <p class="eyebrow caps center"><span lang="de">Sprechen Sie mit uns</span><span lang="ru">Поговорите с нами</span></p>
      <h2><span lang="de">Ein erstes Gespräch kostet nichts. Auch nachts.</span><span lang="ru">Первая беседа бесплатна. Даже ночью.</span></h2>
      <div class="cta">
        <a class="btn btn-gold" href="tel:+41410000000"><span lang="de">+41 41 000 00 00</span><span lang="ru">+41 41 000 00 00</span></a>
        <a class="btn btn-ghost" href="index.html#kontakt"><span lang="de">Nachricht schreiben</span><span lang="ru">Написать сообщение</span></a>
      </div>
    </div>
  </section>
'''

def de_ru(tag, de, ru, cls=''):
    c = f' class="{cls}"' if cls else ''
    return f'<{tag}{c} lang="de">{de}</{tag}>\n<{tag}{c} lang="ru">{ru}</{tag}>'

# --------------------------------------------------------------- Ratgeber
ratgeber_body = '''
<main id="inhalt">
  <div class="page-head">
    <div class="wrap">
      <p class="crumbs caps"><a href="index.html"><span lang="de">Startseite</span><span lang="ru">Главная</span></a><span>/</span><span lang="de">Ratgeber</span><span lang="ru">Справочник</span></p>
      <p class="eyebrow caps"><span lang="de">Ratgeber</span><span lang="ru">Справочник</span></p>
      <h1><span lang="de">Der Friedhofszwang — und der Weg daran vorbei.</span><span lang="ru">Обязательное захоронение — и путь в обход.</span></h1>
      <p class="lead" lang="de">Warum in Deutschland eine Urne nicht nach Hause darf, warum das in der Schweiz anders ist — und wie das Schweizer Recht den Weg zurück in die Heimat öffnet.</p>
      <p class="lead" lang="ru">Почему в Германии урну нельзя забрать домой, почему в Швейцарии всё иначе — и как швейцарское право открывает путь домой.</p>
    </div>
  </div>

  <section class="band">
    <div class="wrap split wide">
      <aside class="toc">
        <h4><span lang="de">Inhalt</span><span lang="ru">Содержание</span></h4>
        <ol>
          <li><a href="#was"><span lang="de">Was der Friedhofszwang ist</span><span lang="ru">Что такое обязательное захоронение</span></a></li>
          <li><a href="#folgen"><span lang="de">Was er für Angehörige bedeutet</span><span lang="ru">Что это значит для близких</span></a></li>
          <li><a href="#schweiz"><span lang="de">Wie die Schweiz es hält</span><span lang="ru">Как это устроено в Швейцарии</span></a></li>
          <li><a href="#grenze"><span lang="de">Der Weg zurück in die Heimat</span><span lang="ru">Путь домой</span></a></li>
          <li><a href="#danach"><span lang="de">Was danach möglich ist</span><span lang="ru">Что возможно после</span></a></li>
          <li><a href="#vorsorge"><span lang="de">Vorsorge: die Bestattungsverfügung</span><span lang="ru">Планирование: распоряжение о погребении</span></a></li>
          <li><a href="#irrtuemer"><span lang="de">Häufige Irrtümer</span><span lang="ru">Распространённые заблуждения</span></a></li>
        </ol>
      </aside>

      <article class="prose">
        <h2 id="was"><span lang="de">Was der Friedhofszwang ist</span><span lang="ru">Что такое обязательное захоронение</span></h2>
        <p lang="de">In Deutschland regeln die sechzehn Bundesländer das Bestattungswesen in eigenen Gesetzen. Bei allen Unterschieden ist ihnen ein Grundsatz gemeinsam: Die sterblichen Überreste eines Menschen — auch die Asche nach einer Einäscherung — müssen auf einem Friedhof oder in einer dafür zugelassenen Anlage beigesetzt werden. Das ist der <strong>Friedhofszwang</strong>, oft auch Friedhofspflicht oder Beisetzungspflicht genannt.</p>
        <p lang="ru">В Германии похоронное дело регулируется законами шестнадцати федеральных земель. При всех различиях у них есть общий принцип: останки человека — в том числе прах после кремации — должны быть захоронены на кладбище или в специально допущенном для этого месте. Это и есть <strong>обязательное захоронение на кладбище</strong> (Friedhofszwang), которое также называют обязанностью погребения.</p>
        <p lang="de">Die Regel stammt aus dem 19. Jahrhundert. Damals ging es um Hygiene und Seuchenschutz — und darum, dass der Staat die Totenruhe an einem öffentlichen, kontrollierten Ort sichern wollte. Für Erdbestattungen ist das bis heute nachvollziehbar. Auf die Asche eines eingeäscherten Menschen wurde der Grundsatz später einfach übertragen, obwohl von ihr keinerlei hygienische Gefahr ausgeht.</p>
        <p lang="ru">Правило восходит к XIX веку. Тогда речь шла о гигиене и защите от эпидемий — и о том, чтобы государство обеспечивало покой умерших в публичном, контролируемом месте. Для погребения в землю это понятно и сегодня. На прах кремированного человека принцип позже просто перенесли, хотя никакой гигиенической опасности прах не представляет.</p>
        <p lang="de">Die Ausnahmen sind eng: Seebestattungen in ausgewiesenen Gebieten, Beisetzungen in Bestattungswäldern, und in Bremen seit 2015 das Verstreuen auf privatem Grund unter engen Voraussetzungen. Eine Urne im Wohnzimmer, im eigenen Garten oder an einem Lieblingsort in der Natur ist in Deutschland nirgends vorgesehen.</p>
        <p lang="ru">Исключения узки: захоронение в море в отведённых районах, погребение в «похоронных лесах» и — в Бремене с 2015 года — развеивание праха на частной земле при строгих условиях. Урна в гостиной, в собственном саду или в любимом месте на природе в Германии не предусмотрена нигде.</p>

        <h2 id="folgen"><span lang="de">Was er für Angehörige bedeutet</span><span lang="ru">Что это значит для близких</span></h2>
        <p lang="de">Für die Familie hat der Friedhofszwang sehr konkrete Folgen. Das Krematorium darf die Urne nicht an Angehörige aushändigen, sondern nur an ein Bestattungsunternehmen oder an die Friedhofsverwaltung. Die Familie sucht ein Grab aus, zahlt Grabnutzungsgebühren für zwanzig oder mehr Jahre, übernimmt die Pflege — und bindet sich damit an einen Ort, den sie vielleicht gar nicht gewählt hätte.</p>
        <p lang="ru">Для семьи обязательное захоронение имеет очень конкретные последствия. Крематорий не вправе выдать урну родственникам — только похоронному бюро или администрации кладбища. Семья выбирает могилу, платит за пользование ею двадцать и более лет, берёт на себя уход — и тем самым привязывает себя к месту, которое, возможно, и не выбрала бы.</p>
        <p lang="de">Besonders schwer wiegt das für Menschen, die nicht in Deutschland geboren sind. Wer aus Russland, Kasachstan oder der Ukraine kam, wünscht sich oft, dass die Asche nach Hause zurückkehrt oder bei der Familie bleibt — und stösst dann auf eine Vorschrift, die genau das verbietet.</p>
        <p lang="ru">Особенно тяжело это для людей, родившихся не в Германии. Те, кто приехал из России, Казахстана или Украины, часто хотят, чтобы прах вернулся домой или остался в семье, — и наталкиваются на предписание, запрещающее именно это.</p>
        <blockquote lang="de">Die Asche eines Menschen ist keine Gefahr für die Allgemeinheit. Sie ist die Erinnerung einer Familie.</blockquote>
        <blockquote lang="ru">Прах человека не представляет опасности для общества. Это память семьи.</blockquote>

        <h2 id="schweiz"><span lang="de">Wie die Schweiz es hält</span><span lang="ru">Как это устроено в Швейцарии</span></h2>
        <p lang="de">In der Schweiz ist das Bestattungswesen Sache der Kantone und Gemeinden — und es kennt keinen Friedhofszwang für Asche. Die Urne wird der Familie ausgehändigt. Was dann geschieht, entscheiden die Angehörigen oder der Verstorbene durch seinen erklärten Willen:</p>
        <p lang="ru">В Швейцарии похоронное дело относится к компетенции кантонов и общин — и не знает обязательного захоронения праха на кладбище. Урну передают семье. Что происходит дальше, решают близкие или сам умерший — своей выраженной волей:</p>
        <ul lang="de">
          <li>Die Urne bleibt zu Hause — im Wohnzimmer, in einer Nische, an einem stillen Ort.</li>
          <li>Die Asche wird in der Natur verstreut — am Berg, im Wald, auf einem See oder Fluss. Verlangt ist Rücksicht: kein Verstreuen auf fremdem Grund ohne Einverständnis, nicht an stark besuchten Orten.</li>
          <li>Die Urne wird im eigenen Garten beigesetzt — in den meisten Gemeinden ohne Bewilligung möglich.</li>
          <li>Oder klassisch: ein Urnengrab, ein Gemeinschaftsgrab, ein Bestattungswald — jederzeit möglich, aber nie Pflicht.</li>
        </ul>
        <ul lang="ru">
          <li>Урна остаётся дома — в гостиной, в нише, в тихом месте.</li>
          <li>Прах развеивают на природе — в горах, в лесу, на озере или реке. Требуется уважение: не на чужой земле без согласия, не в людных местах.</li>
          <li>Урну хоронят в собственном саду — в большинстве общин без разрешения.</li>
          <li>Или классически: урновая могила, общая могила, «похоронный лес» — всегда возможно, но никогда не обязательно.</li>
        </ul>
        <p lang="de">Der Unterschied ist kein juristisches Detail, sondern eine andere Haltung: Die Schweiz vertraut den Familien.</p>
        <p lang="ru">Разница — не юридическая деталь, а другая позиция: Швейцария доверяет семьям.</p>

        <h2 id="grenze"><span lang="de">Der Weg zurück in die Heimat</span><span lang="ru">Путь домой</span></h2>
        <p lang="de">Der Friedhofszwang gilt in Deutschland — nicht darüber hinaus. Die Bestattungsgesetze erlauben ausdrücklich, eine Urne ins Ausland zu überführen, wenn dort eine zugelassene Stelle sie übernimmt. In der Schweiz ist das die Seelenfrieden Urnenrückführung GmbH. Und weil in der Schweiz jede Person frei über die Asche ihrer Verstorbenen verfügen darf, gilt dort die Übergabe der Urne an die Angehörigen als Beisetzung. Genau darauf beruht «Zurück in die Heimat»:</p>
        <p lang="ru">Обязательное захоронение действует в Германии — но не за её пределами. Похоронные законы прямо разрешают вывезти урну за границу, если там её принимает уполномоченная сторона. В Швейцарии это Seelenfrieden Urnenrückführung GmbH. А поскольку в Швейцарии каждый может свободно распоряжаться прахом своих умерших, передача урны близким считается там захоронением. Именно на этом основано «Возвращение домой»:</p>
        <ol lang="de">
          <li><strong>Grabstelle.</strong> Sie erwerben eine Grabstelle auf einer Bergwiese oder in einem Wald in der Schweiz — zum Festpreis von 490 €, ohne Folgekosten.</li>
          <li><strong>Übernahme.</strong> Wir bestätigen dem Krematorium schriftlich, dass wir die Urne übernehmen. Ihr Bestatter oder das Krematorium sendet die Urne an uns; wir beschaffen Sterbeurkunde, Einäscherungsbescheinigung und was sonst verlangt wird.</li>
          <li><strong>Beisetzung nach Schweizer Recht.</strong> Die Urne wird Ihnen als Angehörigen übergeben — damit ist sie beigesetzt. Sie erhalten die Beisetzungsbestätigung und die Grabstellenurkunde.</li>
          <li><strong>Zurück in die Heimat.</strong> Die Urne steht zur freien Verfügung und kommt zu Ihnen nach Hause, persönlich überbracht oder per versichertem Kurier. Der Abschied kennt keine Frist.</li>
          <li><strong>Später.</strong> Wenn Sie so weit sind, setzen wir die Asche auf Ihrer Grabstelle in den Schweizer Bergen bei — ohne weitere Kosten, auf Wunsch im Beisein der Familie.</li>
        </ol>
        <ol lang="ru">
          <li><strong>Место захоронения.</strong> Вы приобретаете место на горном лугу или в лесу в Швейцарии — по фиксированной цене 490 €, без последующих расходов.</li>
          <li><strong>Принятие.</strong> Мы письменно подтверждаем крематорию, что принимаем урну. Ваше похоронное бюро или крематорий отправляет урну нам; мы получаем свидетельство о смерти, справку о кремации и всё, что ещё требуется.</li>
          <li><strong>Захоронение по швейцарскому праву.</strong> Урна передаётся вам как близким — с этого момента она считается захороненной. Вы получаете подтверждение захоронения и свидетельство о месте.</li>
          <li><strong>Возвращение домой.</strong> Урна находится в свободном распоряжении и возвращается к вам домой — лично или застрахованным курьером. Прощание не ограничено сроком.</li>
          <li><strong>Позже.</strong> Когда вы будете готовы, мы захороним прах на вашем месте в швейцарских горах — без дополнительных расходов, по желанию в присутствии семьи.</li>
        </ol>
        <div class="aside">
          <p lang="de"><strong>Was Sie selbst tun müssen:</strong> uns anrufen, die Grabstelle erwerben und eine Vollmacht unterschreiben. Das Krematorium, das Standesamt und die Behörden sprechen mit uns. Wichtig ist nur eines: Melden Sie sich, bevor die Urne in Deutschland beigesetzt wird.</p>
          <p lang="ru"><strong>Что нужно сделать вам:</strong> позвонить нам, приобрести место и подписать доверенность. С крематорием, загсом и ведомствами общаемся мы. Важно лишь одно: свяжитесь с нами до того, как урна будет захоронена в Германии.</p>
        </div>

        <h2 id="danach"><span lang="de">Was danach möglich ist</span><span lang="ru">Что возможно после</span></h2>
        <p lang="de">Sobald die Urne bei Ihnen ist, entscheiden Sie. Viele Familien stellen sie an einen stillen Platz im Haus und nehmen sich Zeit — Monate oder Jahre. Andere setzen die Asche bald auf der Grabstelle in den Schweizer Bergen bei und verbinden das mit einer Reise der Familie. Beides ist im Modell vorgesehen, beides ist bezahlt.</p>
        <p lang="ru">Как только урна у вас, решаете вы. Многие семьи ставят её в тихое место в доме и дают себе время — месяцы или годы. Другие вскоре хоронят прах на месте в швейцарских горах и совмещают это с поездкой всей семьёй. И то и другое предусмотрено моделью, и то и другое оплачено.</p>
        <p lang="de">Auch eine spätere Beisetzung an einem anderen Ort ist möglich — in einem Bestattungswald oder auf einem Friedhof in Deutschland etwa. Die Grabstelle in der Schweiz bleibt Ihnen in jedem Fall erhalten.</p>
        <p lang="ru">Возможно и последующее захоронение в другом месте — например, в «похоронном лесу» или на кладбище в Германии. Место в Швейцарии в любом случае остаётся за вами.</p>

        <h2 id="vorsorge"><span lang="de">Vorsorge: die Bestattungsverfügung</span><span lang="ru">Планирование: распоряжение о погребении</span></h2>
        <p lang="de">Wer zu Lebzeiten festlegen möchte, dass die eigene Urne nicht auf einem deutschen Friedhof bleibt, hält das in einer <strong>Bestattungsverfügung</strong> fest. Sie ist formfrei, sollte aber eigenhändig unterschrieben und datiert sein und enthalten:</p>
        <p lang="ru">Кто хочет при жизни определить, что его урна не останется на немецком кладбище, фиксирует это в <strong>распоряжении о погребении</strong>. Форма свободная, но документ должен быть собственноручно подписан и датирован и содержать:</p>
        <ul lang="de">
          <li>den Wunsch nach Einäscherung,</li>
          <li>den Wunsch, die Urne nach dem Modell «Zurück in die Heimat» über die Schweiz zur Familie zu bringen — und wo sie später beigesetzt werden soll,</li>
          <li>die Person, die das umsetzen soll (die sogenannte totenfürsorgeberechtigte Person),</li>
          <li>den Hinweis auf uns als beauftragtes Unternehmen samt Kontaktdaten.</li>
        </ul>
        <ul lang="ru">
          <li>желание быть кремированным,</li>
          <li>желание передать урну семье по модели «Возвращение домой» через Швейцарию — и где она должна быть захоронена впоследствии,</li>
          <li>лицо, которое должно это осуществить (так называемое лицо, ответственное за погребение),</li>
          <li>указание на нас как уполномоченное предприятие с контактными данными.</li>
        </ul>
        <p lang="de">Wir helfen beim Formulieren, hinterlegen eine Kopie und stellen sicher, dass Ihre Angehörigen im Ernstfall nur einen Anruf machen müssen. Das Vorsorgegespräch ist kostenlos.</p>
        <p lang="ru">Мы помогаем с формулировкой, храним копию и следим за тем, чтобы вашим близким в нужный момент было достаточно одного звонка. Консультация по планированию бесплатна.</p>

        <h2 id="irrtuemer"><span lang="de">Häufige Irrtümer</span><span lang="ru">Распространённые заблуждения</span></h2>
        <dl class="qa" lang="de">
          <dt>„Nach der Trauerfeier darf ich die Urne kurz mit nach Hause nehmen.“</dt>
          <dd>Nein. In Deutschland bleibt die Urne bis zur Beisetzung beim Bestatter oder der Friedhofsverwaltung.</dd>
          <dt>„Im eigenen Garten verstreuen wird geduldet.“</dt>
          <dd>Nein. Ausserhalb Bremens ist es eine Ordnungswidrigkeit — und Bremen verlangt eine Erklärung zu Lebzeiten.</dd>
          <dt>„Eine Überführung ins Ausland ist kompliziert und teuer.“</dt>
          <dd>Nein. Der Weg ist gesetzlich vorgesehen, dauert meist ein bis zwei Wochen, und «Zurück in die Heimat» kostet bei uns 490 € zum Festpreis — Grabstelle inklusive.</dd>
          <dt>„Ich brauche einen Bezug zur Schweiz.“</dt>
          <dd>Nein. Entscheidend ist nur, dass in der Schweiz eine zugelassene Stelle die Urne übernimmt und Sie dort eine Grabstelle haben — beides ist Teil unseres Angebots.</dd>
          <dt>„Dafür muss ich in die Schweiz reisen.“</dt>
          <dd>Nein. Die Urne kommt per Bestatter zu uns und von uns zu Ihnen nach Hause. Wer die Grabstelle sehen möchte, ist jederzeit willkommen.</dd>
        </dl>
        <dl class="qa" lang="ru">
          <dt>«После прощания я могу ненадолго взять урну домой».</dt>
          <dd>Нет. В Германии урна до захоронения остаётся у похоронного бюро или администрации кладбища.</dd>
          <dt>«Развеять в собственном саду — на это закрывают глаза».</dt>
          <dd>Нет. За пределами Бремена это административное правонарушение — а Бремен требует заявления, сделанного при жизни.</dd>
          <dt>«Вывоз за границу — это сложно и дорого».</dt>
          <dd>Нет. Путь предусмотрен законом, занимает обычно одну–две недели, а «Возвращение домой» стоит у нас 490 € по фиксированной цене — включая место захоронения.</dd>
          <dt>«Мне нужна связь со Швейцарией».</dt>
          <dd>Нет. Важно лишь, чтобы в Швейцарии урну приняла уполномоченная сторона и у вас там было место захоронения — и то и другое входит в наше предложение.</dd>
          <dt>«Для этого мне нужно ехать в Швейцарию».</dt>
          <dd>Нет. Урна поступает к нам через похоронное бюро и от нас — к вам домой. Кто хочет увидеть место захоронения, всегда желанный гость.</dd>
        </dl>

        <div class="aside">
          <p lang="de"><strong>Hinweis.</strong> Dieser Ratgeber gibt den Stand zum Zeitpunkt der Veröffentlichung wieder und ersetzt keine Rechtsberatung. Bestattungsrecht ist in Deutschland Ländersache, in der Schweiz Sache der Kantone und Gemeinden; Einzelheiten weichen ab. Wir klären jeden Fall individuell.</p>
          <p lang="ru"><strong>Примечание.</strong> Этот справочник отражает положение дел на момент публикации и не заменяет юридическую консультацию. Похоронное право в Германии относится к компетенции земель, в Швейцарии — кантонов и общин; детали различаются. Каждый случай мы проверяем индивидуально.</p>
        </div>
      </article>
    </div>
  </section>
''' + CTA + '''
</main>
'''

# --------------------------------------------------------------- Impressum
impressum_body = '''
<main id="inhalt">
  <div class="page-head">
    <div class="wrap">
      <p class="crumbs caps"><a href="index.html"><span lang="de">Startseite</span><span lang="ru">Главная</span></a><span>/</span><span lang="de">Impressum</span><span lang="ru">Выходные данные</span></p>
      <h1><span lang="de">Impressum</span><span lang="ru">Выходные данные</span></h1>
      <p class="lead" lang="de">Angaben gemäss schweizerischem Recht.</p>
      <p class="lead" lang="ru">Сведения согласно законодательству Швейцарии.</p>
    </div>
  </div>
  <section class="band">
    <div class="wrap legal-grid">
      <div class="prose">
        <dl>
          <dt><span lang="de">Firma</span><span lang="ru">Компания</span></dt>
          <dd>Seelenfrieden Urnenrückführung GmbH</dd>
          <dt><span lang="de">Geschäftsführer</span><span lang="ru">Управляющий директор</span></dt>
          <dd><span lang="de">Daniel Klotzek</span><span lang="ru">Даниэль Клотцек</span></dd>
          <dt><span lang="de">Adresse</span><span lang="ru">Адрес</span></dt>
          <dd><address>Gotthardstrasse 14<br>6300 Zug<br><span lang="de">Kanton Zug, Schweiz</span><span lang="ru">кантон Цуг, Швейцария</span></address></dd>
          <dt><span lang="de">Rechtsform</span><span lang="ru">Правовая форма</span></dt>
          <dd><span lang="de">Gesellschaft mit beschränkter Haftung (GmbH)</span><span lang="ru">Общество с ограниченной ответственностью (GmbH)</span></dd>
          <dt><span lang="de">Handelsregister</span><span lang="ru">Торговый реестр</span></dt>
          <!-- TODO: echte UID / CHE-Nummer nach Handelsregistereintrag eintragen -->
          <dd><span lang="de">Handelsregisteramt des Kantons Zug, CHE-000.000.000</span><span lang="ru">Торговый реестр кантона Цуг, CHE-000.000.000</span></dd>
          <dt><span lang="de">Telefon</span><span lang="ru">Телефон</span></dt>
          <dd><a href="tel:+41410000000">+41 41 000 00 00</a></dd>
          <dt>E-Mail</dt>
          <dd><a href="mailto:info@xn--seelenfrieden-urnenrckfhrung-l7cd.ch">info@seelenfrieden-urnenrückführung.ch</a></dd>
        </dl>
      </div>
      <div class="prose">
        <h3><span lang="de">Haftung für Inhalte</span><span lang="ru">Ответственность за содержание</span></h3>
        <p lang="de">Die Inhalte dieser Website werden mit Sorgfalt erstellt. Für Richtigkeit, Vollständigkeit und Aktualität — insbesondere bei länderspezifischen Vorschriften, die sich kurzfristig ändern können — übernehmen wir keine Gewähr. Massgeblich ist stets die individuelle Abklärung im Einzelfall.</p>
        <p lang="ru">Содержание сайта готовится с должной тщательностью. Мы не гарантируем точность, полноту и актуальность сведений — прежде всего это касается требований отдельных стран, которые могут меняться в короткие сроки. Определяющей всегда является индивидуальная проверка в каждом конкретном случае.</p>
        <h3><span lang="de">Haftung für Links</span><span lang="ru">Ответственность за ссылки</span></h3>
        <p lang="de">Verweise auf Websites Dritter liegen ausserhalb unseres Verantwortungsbereichs. Für deren Inhalte sind ausschliesslich die jeweiligen Betreiber verantwortlich.</p>
        <p lang="ru">Ссылки на сайты третьих лиц находятся вне сферы нашей ответственности. За их содержание отвечают исключительно их операторы.</p>
        <h3><span lang="de">Urheberrecht</span><span lang="ru">Авторское право</span></h3>
        <p lang="de">Texte, Gestaltung und Grafiken dieser Website sind urheberrechtlich geschützt. Die verwendeten Schriften Cormorant Garamond und Manrope stehen unter der SIL Open Font License.</p>
        <p lang="ru">Тексты, оформление и графика сайта защищены авторским правом. Используемые шрифты Cormorant Garamond и Manrope распространяются по лицензии SIL Open Font License.</p>
        <p><a class="btn btn-text" href="datenschutz.html"><span lang="de">Zur Datenschutzerklärung</span><span lang="ru">К политике защиты данных</span></a></p>
      </div>
    </div>
  </section>
</main>
'''

# --------------------------------------------------------------- Datenschutz
datenschutz_body = '''
<main id="inhalt">
  <div class="page-head">
    <div class="wrap">
      <p class="crumbs caps"><a href="index.html"><span lang="de">Startseite</span><span lang="ru">Главная</span></a><span>/</span><span lang="de">Datenschutz</span><span lang="ru">Защита данных</span></p>
      <h1><span lang="de">Datenschutzerklärung</span><span lang="ru">Политика защиты данных</span></h1>
      <p class="lead" lang="de">Kurz gesagt: Wir erheben nur, was wir brauchen, um Ihnen zu antworten und Ihren Auftrag auszuführen. Keine Cookies, keine Tracker, keine Weitergabe an Werbedienste.</p>
      <p class="lead" lang="ru">Коротко: мы собираем только то, что нужно, чтобы ответить вам и выполнить ваш заказ. Никаких cookie, трекеров и передачи рекламным службам.</p>
    </div>
  </div>
  <section class="band">
    <div class="wrap split wide">
      <aside class="toc">
        <h4><span lang="de">Inhalt</span><span lang="ru">Содержание</span></h4>
        <ol>
          <li><a href="#verantwortlich"><span lang="de">Verantwortliche Stelle</span><span lang="ru">Ответственное лицо</span></a></li>
          <li><a href="#daten"><span lang="de">Welche Daten wir bearbeiten</span><span lang="ru">Какие данные мы обрабатываем</span></a></li>
          <li><a href="#zweck"><span lang="de">Zweck und Rechtsgrundlage</span><span lang="ru">Цель и правовое основание</span></a></li>
          <li><a href="#weitergabe"><span lang="de">Weitergabe</span><span lang="ru">Передача данных</span></a></li>
          <li><a href="#dauer"><span lang="de">Aufbewahrung</span><span lang="ru">Срок хранения</span></a></li>
          <li><a href="#website"><span lang="de">Diese Website</span><span lang="ru">Этот сайт</span></a></li>
          <li><a href="#rechte"><span lang="de">Ihre Rechte</span><span lang="ru">Ваши права</span></a></li>
        </ol>
      </aside>
      <article class="prose">
        <h2 id="verantwortlich"><span lang="de">Verantwortliche Stelle</span><span lang="ru">Ответственное лицо</span></h2>
        <p lang="de">Seelenfrieden Urnenrückführung GmbH, Gotthardstrasse 14, 6300 Zug, Schweiz. E-Mail: <a href="mailto:info@xn--seelenfrieden-urnenrckfhrung-l7cd.ch">info@seelenfrieden-urnenrückführung.ch</a>. Wir bearbeiten Personendaten nach dem schweizerischen Datenschutzgesetz (DSG) und — soweit wir uns an Personen in der EU richten — nach der Datenschutz-Grundverordnung (DSGVO).</p>
        <p lang="ru">Seelenfrieden Urnenrückführung GmbH, Gotthardstrasse 14, 6300 Zug, Швейцария. E-mail: <a href="mailto:info@xn--seelenfrieden-urnenrckfhrung-l7cd.ch">info@seelenfrieden-urnenrückführung.ch</a>. Мы обрабатываем персональные данные в соответствии со швейцарским законом о защите данных (DSG) и — в той мере, в какой мы обращаемся к лицам в ЕС, — с Общим регламентом по защите данных (GDPR).</p>

        <h2 id="daten"><span lang="de">Welche Daten wir bearbeiten</span><span lang="ru">Какие данные мы обрабатываем</span></h2>
        <ul lang="de">
          <li><strong>Anfragen.</strong> Was Sie uns am Telefon, per E-Mail oder über das Kontaktformular mitteilen: Name, Telefonnummer, E-Mail-Adresse, Angaben zum Todesfall und zu Ihrem Anliegen.</li>
          <li><strong>Auftragsdaten.</strong> Zur Ausführung einer Überführung: Personalien der verstorbenen Person, Sterbeurkunde, Einäscherungsbescheinigung, Vollmacht, Rechnungsdaten.</li>
          <li><strong>Zugriffsdaten.</strong> Unser Hosting-Anbieter protokolliert beim Aufruf der Website technisch notwendige Daten (IP-Adresse, Zeitpunkt, aufgerufene Seite, Browser) in Server-Logdateien.</li>
        </ul>
        <ul lang="ru">
          <li><strong>Обращения.</strong> То, что вы сообщаете нам по телефону, по e-mail или через контактную форму: имя, номер телефона, адрес e-mail, сведения о случае смерти и о вашем вопросе.</li>
          <li><strong>Данные заказа.</strong> Для выполнения перевозки: личные данные умершего, свидетельство о смерти, справка о кремации, доверенность, платёжные реквизиты.</li>
          <li><strong>Данные доступа.</strong> Наш хостинг-провайдер при посещении сайта записывает технически необходимые данные (IP-адрес, время, открытая страница, браузер) в серверные лог-файлы.</li>
        </ul>

        <h2 id="zweck"><span lang="de">Zweck und Rechtsgrundlage</span><span lang="ru">Цель и правовое основание</span></h2>
        <p lang="de">Wir bearbeiten Ihre Daten, um Ihre Anfrage zu beantworten und den Auftrag auszuführen (Vertragserfüllung, Art. 6 Abs. 1 lit. b DSGVO), um gesetzliche Aufbewahrungs- und Nachweispflichten zu erfüllen (Art. 6 Abs. 1 lit. c DSGVO) und um die Website sicher zu betreiben (berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO). Wir verwenden Ihre Daten nicht für Werbung.</p>
        <p lang="ru">Мы обрабатываем ваши данные, чтобы ответить на обращение и выполнить заказ (исполнение договора, ст. 6 п. 1 b GDPR), чтобы выполнять законные обязанности по хранению и подтверждению (ст. 6 п. 1 c GDPR) и чтобы безопасно эксплуатировать сайт (законный интерес, ст. 6 п. 1 f GDPR). Мы не используем ваши данные для рекламы.</p>

        <h2 id="weitergabe"><span lang="de">Weitergabe</span><span lang="ru">Передача данных</span></h2>
        <p lang="de">Wir geben Daten nur an Stellen weiter, die für die Überführung zwingend beteiligt sind: Krematorien, Standesämter und Behörden, Zoll, Transporteure und Bestattungsunternehmen im Zielland, Übersetzungsbüros für beglaubigte Übersetzungen. Eine Übermittlung zwischen der Schweiz und Deutschland erfolgt nur, soweit der Auftrag es verlangt — etwa für die Übernahme vom Krematorium und die Rückführung der Urne zu Ihnen.</p>
        <p lang="ru">Мы передаём данные только тем сторонам, чьё участие в перевозке обязательно: крематориям, загсам и ведомствам, таможне, перевозчикам и похоронным предприятиям в стране назначения, бюро заверенных переводов. Передача данных между Швейцарией и Германией происходит только в той мере, в какой этого требует заказ — например, для принятия урны из крематория и её возврата вам.</p>

        <h2 id="dauer"><span lang="de">Aufbewahrung</span><span lang="ru">Срок хранения</span></h2>
        <p lang="de">Anfragen ohne Auftrag löschen wir spätestens nach zwölf Monaten. Auftragsunterlagen bewahren wir auf, solange gesetzliche Pflichten es verlangen — für Geschäftsunterlagen in der Schweiz zehn Jahre. Server-Logdateien löscht der Hosting-Anbieter nach kurzer Frist.</p>
        <p lang="ru">Обращения без заказа мы удаляем не позднее чем через двенадцать месяцев. Документы по заказам храним столько, сколько требуют законные обязанности — для деловой документации в Швейцарии десять лет. Серверные лог-файлы хостинг-провайдер удаляет через короткий срок.</p>

        <h2 id="website"><span lang="de">Diese Website</span><span lang="ru">Этот сайт</span></h2>
        <ul lang="de">
          <li><strong>Keine Cookies, kein Tracking.</strong> Wir setzen keine Analyse-, Marketing- oder Drittanbieter-Cookies ein.</li>
          <li><strong>Sprachwahl.</strong> Ihre gewählte Sprache (Deutsch oder Russisch) speichert der Browser lokal (localStorage). Diese Angabe verlässt Ihr Gerät nicht.</li>
          <li><strong>Schriften.</strong> Alle Schriften liegen auf unserem Server. Es wird keine Verbindung zu Google Fonts oder anderen Diensten aufgebaut.</li>
          <li><strong>Kontaktformular.</strong> Das Formular übermittelt Ihre Angaben an unsere E-Mail-Adresse. Ein Pflichtfeld für Bots (unsichtbar) dient nur der Abwehr von Spam.</li>
          <li><strong>Hosting.</strong> Die Website wird bei einem Anbieter mit Serverstandort in der Schweiz oder der EU betrieben. <!-- TODO: Hosting-Anbieter und Standort eintragen --></li>
        </ul>
        <ul lang="ru">
          <li><strong>Никаких cookie, никакого трекинга.</strong> Мы не используем аналитические, маркетинговые или сторонние cookie.</li>
          <li><strong>Выбор языка.</strong> Выбранный вами язык (немецкий или русский) браузер сохраняет локально (localStorage). Эти данные не покидают ваше устройство.</li>
          <li><strong>Шрифты.</strong> Все шрифты хранятся на нашем сервере. Соединение с Google Fonts или другими службами не устанавливается.</li>
          <li><strong>Контактная форма.</strong> Форма отправляет ваши данные на наш адрес e-mail. Скрытое поле для ботов служит только защите от спама.</li>
          <li><strong>Хостинг.</strong> Сайт размещён у провайдера с расположением серверов в Швейцарии или ЕС.</li>
        </ul>

        <h2 id="rechte"><span lang="de">Ihre Rechte</span><span lang="ru">Ваши права</span></h2>
        <p lang="de">Sie haben das Recht auf Auskunft über Ihre Daten, auf Berichtigung, Löschung, Einschränkung der Bearbeitung, Datenherausgabe und Widerspruch. Schreiben Sie uns an <a href="mailto:info@xn--seelenfrieden-urnenrckfhrung-l7cd.ch">info@seelenfrieden-urnenrückführung.ch</a>. Aufsichtsbehörde in der Schweiz ist der Eidgenössische Datenschutz- und Öffentlichkeitsbeauftragte (EDÖB); Personen in der EU können sich zudem an die Datenschutzbehörde ihres Wohnorts wenden.</p>
        <p lang="ru">Вы имеете право на получение сведений о ваших данных, на их исправление, удаление, ограничение обработки, выдачу данных и на возражение. Напишите нам: <a href="mailto:info@xn--seelenfrieden-urnenrckfhrung-l7cd.ch">info@seelenfrieden-urnenrückführung.ch</a>. Надзорный орган в Швейцарии — Федеральный уполномоченный по защите данных и информации (EDÖB); лица в ЕС могут также обратиться в орган по защите данных по месту жительства.</p>
        <p class="caps" style="color:var(--text-3)"><span lang="de">Stand: September 2026</span><span lang="ru">Редакция: сентябрь 2026</span></p>
      </article>
    </div>
  </section>
</main>
'''

# --------------------------------------------------------------- 404
notfound_body = '''
<main id="inhalt">
  <section class="band error-page">
    <div class="wrap">
      <p class="code" aria-hidden="true">404</p>
      <h1><span lang="de">Diese Seite gibt es nicht.</span><span lang="ru">Такой страницы нет.</span></h1>
      <p lang="de">Vielleicht ist der Link veraltet. Was Sie suchen, finden Sie auf der Startseite — oder Sie rufen uns einfach an.</p>
      <p lang="ru">Возможно, ссылка устарела. То, что вы ищете, есть на главной странице — или просто позвоните нам.</p>
      <div class="cta">
        <a class="btn btn-gold" href="index.html"><span lang="de">Zur Startseite</span><span lang="ru">На главную</span></a>
        <a class="btn btn-ghost" href="tel:+41410000000">+41 41 000 00 00</a>
      </div>
    </div>
  </section>
</main>
'''


# --------------------------------------------------------------- Weiterlesen
def related(exclude):
    items = [
      ('friedhofszwang.html', 'Der Friedhofszwang, erklärt', 'Обязательное захоронение: как это устроено', 'Rechtslage', 'Право'),
      ('urne-zu-hause-aufbewahren.html', 'Urne zu Hause aufbewahren', 'Хранить урну дома', 'Zu Hause', 'Дома'),
      ('zurueck-in-die-heimat.html', 'Zurück in die Heimat: das Modell', 'Возвращение домой: модель', 'Ablauf & Kosten', 'Порядок и цена'),
      ('bestattungsverfuegung.html', 'Die Bestattungsverfügung', 'Распоряжение о погребении', 'Vorsorge', 'Планирование'),
    ]
    cards = ''.join(f'''
        <a href="{h}" class="spot">
          <span class="caps"><span lang="de">{ede}</span><span lang="ru">{eru}</span></span>
          <h3><span lang="de">{tde}</span><span lang="ru">{tru}</span></h3>
          <span class="more"><span lang="de">Lesen</span><span lang="ru">Читать</span></span>
        </a>''' for h, tde, tru, ede, eru in items if h != exclude)
    return f'''
  <section class="band">
    <div class="wrap">
      <p class="eyebrow caps"><span lang="de">Weiterlesen</span><span lang="ru">Читать дальше</span></p>
      <div class="articles reveal-stagger" style="grid-template-columns:repeat(3,1fr)">{cards}
      </div>
    </div>
  </section>
'''

def article_ld(path, headline, desc, date_pub, date_mod, crumb):
    return f'''<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@graph": [
    {{
      "@type": "Article",
      "@id": "{D}/{path}#article",
      "headline": "{headline}",
      "description": "{desc}",
      "inLanguage": "de",
      "datePublished": "{date_pub}",
      "dateModified": "{date_mod}",
      "author": {{ "@type": "Organization", "name": "Seelenfrieden Urnenrückführung GmbH", "@id": "{D}/#org" }},
      "publisher": {{ "@id": "{D}/#org" }},
      "mainEntityOfPage": "{D}/{path}",
      "image": "{D}/assets/img/og.png",
      "about": [ "Friedhofszwang", "Urnenüberführung", "Bestattungsrecht Schweiz" ]
    }},
    {{
      "@type": "BreadcrumbList",
      "itemListElement": [
        {{ "@type": "ListItem", "position": 1, "name": "Startseite", "item": "{D}/" }},
        {{ "@type": "ListItem", "position": 2, "name": "Ratgeber", "item": "{D}/#ratgeber" }},
        {{ "@type": "ListItem", "position": 3, "name": "{crumb}", "item": "{D}/{path}" }}
      ]
    }}
  ]
}}
</script>'''

def page_ld(path, name):
    return f'''<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "{D}/{path}",
  "url": "{D}/{path}",
  "name": "{name}",
  "inLanguage": "de",
  "isPartOf": {{ "@id": "{D}/#website" }},
  "breadcrumb": {{ "@type": "BreadcrumbList", "itemListElement": [
    {{ "@type": "ListItem", "position": 1, "name": "Startseite", "item": "{D}/" }},
    {{ "@type": "ListItem", "position": 2, "name": "{name}", "item": "{D}/{path}" }} ] }}
}}
</script>'''

def article_head(crumb_de, crumb_ru, eyebrow_de, eyebrow_ru, h1_de, h1_ru, lead_de, lead_ru):
    return f'''
<main id="inhalt">
  <div class="page-head">
    <div class="wrap">
      <p class="crumbs caps"><a href="index.html"><span lang="de">Startseite</span><span lang="ru">Главная</span></a><span>/</span><a href="index.html#ratgeber"><span lang="de">Ratgeber</span><span lang="ru">Справочник</span></a><span>/</span><span lang="de">{crumb_de}</span><span lang="ru">{crumb_ru}</span></p>
      <p class="eyebrow caps"><span lang="de">{eyebrow_de}</span><span lang="ru">{eyebrow_ru}</span></p>
      <h1><span lang="de">{h1_de}</span><span lang="ru">{h1_ru}</span></h1>
      <p class="lead" lang="de">{lead_de}</p>
      <p class="lead" lang="ru">{lead_ru}</p>
    </div>
  </div>
  <section class="band">
    <div class="wrap">
      <article class="prose" style="margin-inline:auto">
'''

ARTICLE_END = '''
      </article>
    </div>
  </section>
'''

# --------------------------------------------------------------- Urne zu Hause
zuhause_body = article_head(
  'Urne zu Hause', 'Урна дома', 'Ratgeber · Zu Hause', 'Справочник · Дома',
  'Urne zu Hause aufbewahren: in Deutschland verboten, in der Schweiz erlaubt.',
  'Хранить урну дома: в Германии запрещено, в Швейцарии разрешено.',
  'Viele Angehörige möchten die Urne eines geliebten Menschen bei sich behalten. In Deutschland scheitert das am Friedhofszwang — nach Schweizer Recht ist es möglich, auch für Familien in Deutschland. Was gilt, was möglich ist und wie die Urne nach Hause kommt.',
  'Многие близкие хотят сохранить урну любимого человека у себя. В Германии это невозможно из-за обязательного захоронения — по швейцарскому праву это возможно, в том числе для семей в Германии. Что действует, что возможно и как урна возвращается домой.') + '''
        <h2><span lang="de">Darf man eine Urne zu Hause aufbewahren?</span><span lang="ru">Можно ли хранить урну дома?</span></h2>
        <p lang="de"><strong>In Deutschland: nein.</strong> Die Bestattungsgesetze aller sechzehn Bundesländer schreiben vor, dass die Asche eines Verstorbenen auf einem Friedhof oder in einer zugelassenen Anlage beigesetzt wird. Das Krematorium händigt die Urne nicht an Angehörige aus, sondern nur an ein Bestattungsunternehmen oder eine Friedhofsverwaltung. Wer die Urne dennoch zu Hause aufbewahrt, begeht eine Ordnungswidrigkeit.</p>
        <p lang="ru"><strong>В Германии: нет.</strong> Похоронные законы всех шестнадцати федеральных земель предписывают захоронение праха умершего на кладбище или в допущенном для этого месте. Крематорий не выдаёт урну родственникам — только похоронному бюро или администрации кладбища. Тот, кто всё же хранит урну дома, совершает административное правонарушение.</p>
        <p lang="de"><strong>In der Schweiz: ja.</strong> Das Bestattungswesen ist Sache der Kantone und Gemeinden, und keine dieser Ordnungen kennt einen Friedhofszwang für Asche. Die Urne wird der Familie ausgehändigt. Sie darf im Wohnzimmer stehen, in einer Nische, im Garten beigesetzt werden — oder die Asche wird an einem Ort verstreut, der dem Verstorbenen etwas bedeutet hat.</p>
        <p lang="ru"><strong>В Швейцарии: да.</strong> Похоронное дело относится к компетенции кантонов и общин, и ни одна из этих норм не знает обязательного захоронения праха. Урна передаётся семье. Она может стоять в гостиной, в нише, быть захороненной в саду — или прах развеивают в месте, которое было дорого умершему.</p>

        <h2><span lang="de">Warum das für viele Familien wichtig ist</span><span lang="ru">Почему это важно для многих семей</span></h2>
        <p lang="de">Ein Grab auf einem Friedhof bindet die Familie an einen Ort, an Öffnungszeiten, an Gebühren für zwanzig oder mehr Jahre und an Pflegepflichten. Wer umzieht, verliert die Nähe. Wer aus einem anderen Land stammt, hat oft den Wunsch, die Asche nach Hause mitzunehmen — oder sie wenigstens dort zu wissen, wo die Familie lebt. Der Friedhofszwang lässt beides nicht zu.</p>
        <p lang="ru">Могила на кладбище привязывает семью к месту, к часам работы, к платежам на двадцать и более лет и к обязанности ухода. Кто переезжает — теряет близость. Кто родом из другой страны, часто хочет забрать прах домой — или хотя бы знать, что он там, где живёт семья. Обязательное захоронение не допускает ни того, ни другого.</p>
        <blockquote lang="de">Trauer braucht Nähe. Ein Grab in einer fremden Stadt gibt sie nicht.</blockquote>
        <blockquote lang="ru">Скорби нужна близость. Могила в чужом городе её не даёт.</blockquote>

        <h2><span lang="de">Der Weg nach Hause: das Schweizer Modell</span><span lang="ru">Путь домой: швейцарская модель</span></h2>
        <p lang="de">Was in Deutschland verboten ist, ist nach Schweizer Recht möglich — und der Weg dorthin steht auch Familien offen, die in Deutschland leben. Die deutschen Bestattungsgesetze gestatten die Überführung einer Urne ins Ausland, wenn dort eine zugelassene Stelle die Urne übernimmt. In der Schweiz gilt die Übergabe der Urne an die Angehörigen als Beisetzung; danach steht die Asche zur freien Verfügung. Das Modell «Zurück in die Heimat» der Seelenfrieden Urnenrückführung GmbH nutzt genau das:</p>
        <p lang="ru">То, что запрещено в Германии, возможно по швейцарскому праву — и этот путь открыт и семьям, живущим в Германии. Немецкие похоронные законы позволяют вывезти урну за границу, если там её принимает уполномоченная сторона. В Швейцарии передача урны близким считается захоронением; после этого прах находится в свободном распоряжении. Модель «Возвращение домой» Seelenfrieden Urnenrückführung GmbH использует именно это:</p>
        <ol lang="de">
          <li>Sie erwerben eine Grabstelle in den Schweizer Bergen — zum Festpreis von 490 €, ohne Folgekosten.</li>
          <li>Wir bestätigen dem Krematorium die Übernahme; Ihr Bestatter sendet die Urne an uns. Wir beschaffen alle Unterlagen.</li>
          <li>Die Urne wird Ihnen übergeben — nach Schweizer Recht ist sie damit beigesetzt. Sie erhalten Beisetzungsbestätigung und Grabstellenurkunde.</li>
          <li>Die Urne kommt zu Ihnen nach Hause, persönlich oder per versichertem Kurier. Der Abschied kennt keine Frist.</li>
        </ol>
        <ol lang="ru">
          <li>Вы приобретаете место захоронения в швейцарских горах — по фиксированной цене 490 €, без последующих расходов.</li>
          <li>Мы подтверждаем крематорию принятие; ваше похоронное бюро отправляет урну нам. Мы получаем все документы.</li>
          <li>Урна передаётся вам — по швейцарскому праву с этого момента она считается захороненной. Вы получаете подтверждение захоронения и свидетельство о месте.</li>
          <li>Урна возвращается к вам домой, лично или застрахованным курьером. Прощание не ограничено сроком.</li>
        </ol>

        <h2><span lang="de">Und danach?</span><span lang="ru">А потом?</span></h2>
        <ul lang="de">
          <li><strong>Die Urne bleibt bei Ihnen.</strong> Ohne Frist — so lange, wie es sich richtig anfühlt.</li>
          <li><strong>Beisetzung in den Schweizer Bergen.</strong> Auf Ihrer Grabstelle, wann Sie möchten, ohne weitere Kosten — auf Wunsch im Beisein der Familie.</li>
          <li><strong>Ein anderer Ort.</strong> Auch eine spätere Beisetzung in einem Bestattungswald oder auf einem Friedhof in Deutschland ist möglich.</li>
        </ul>
        <ul lang="ru">
          <li><strong>Урна остаётся у вас.</strong> Без срока — столько, сколько это будет правильно для вас.</li>
          <li><strong>Захоронение в швейцарских горах.</strong> На вашем месте, когда захотите, без дополнительных расходов — по желанию в присутствии семьи.</li>
          <li><strong>Другое место.</strong> Возможно и последующее захоронение в «похоронном лесу» или на кладбище в Германии.</li>
        </ul>
        <div class="aside">
          <p lang="de"><strong>Ehrlich gesagt:</strong> Der Weg funktioniert nur, solange die Urne noch nicht in Deutschland beigesetzt ist. Rufen Sie uns deshalb früh an — am besten, sobald Sie wissen, dass Sie den Verstorbenen bei sich haben möchten.</p>
          <p lang="ru"><strong>Честно говоря:</strong> этот путь работает только до тех пор, пока урна ещё не захоронена в Германии. Поэтому звоните нам как можно раньше — лучше всего, как только вы поймёте, что хотите, чтобы близкий человек был рядом.</p>
        </div>
        <div class="aside">
          <p lang="de"><strong>Hinweis.</strong> Dieser Text ersetzt keine Rechtsberatung. Bestattungsrecht ist Länder- beziehungsweise Kantonssache; wir klären jeden Fall individuell.</p>
          <p lang="ru"><strong>Примечание.</strong> Этот текст не заменяет юридическую консультацию. Похоронное право относится к компетенции земель и кантонов; каждый случай мы проверяем индивидуально.</p>
        </div>
''' + ARTICLE_END + related('urne-zu-hause-aufbewahren.html') + CTA + '''
</main>
'''

# --------------------------------------------------------------- Zurück in die Heimat
heimat_body = article_head(
  'Zurück in die Heimat', 'Возвращение домой', 'Ratgeber · Ablauf & Kosten', 'Справочник · Порядок и цена',
  'Zurück in die Heimat: So kommt die Urne nach Schweizer Recht zu Ihnen nach Hause.',
  'Возвращение домой: как урна по швейцарскому праву возвращается к вам домой.',
  'Das Schweizer Modell in Ruhe erklärt: Grabstelle, Übernahme, Beisetzung, Rückführung. Welche Unterlagen nötig sind, wie lange es dauert, was es kostet — und was Sie selbst tun müssen.',
  'Швейцарская модель спокойно и по порядку: место захоронения, принятие, захоронение, возврат. Какие документы нужны, сколько это длится, сколько стоит — и что нужно сделать вам.') + '''
        <h2><span lang="de">Der Gedanke dahinter</span><span lang="ru">Идея, лежащая в основе</span></h2>
        <p lang="de">In Deutschland muss eine Urne auf einen Friedhof. In der Schweiz darf jede Person frei über die Asche ihrer Verstorbenen verfügen — die Übergabe der Urne an die Angehörigen gilt dort als Beisetzung. «Zurück in die Heimat» verbindet beides: Die Urne wird in der Schweiz nach Schweizer Recht beigesetzt, indem sie Ihnen übergeben wird, und kommt danach zur freien Verfügung zu Ihnen nach Hause. Der rechtliche Anker ist eine Grabstelle in den Schweizer Bergen, die Ihnen gehört.</p>
        <p lang="ru">В Германии урна должна быть на кладбище. В Швейцарии каждый может свободно распоряжаться прахом своих умерших — передача урны близким считается там захоронением. «Возвращение домой» соединяет и то и другое: урна захоранивается в Швейцарии по швейцарскому праву в момент передачи вам и после этого в свободном распоряжении возвращается к вам домой. Правовая основа — место захоронения в швейцарских горах, которое принадлежит вам.</p>
        <blockquote lang="de">Die Urne ist beigesetzt — und trotzdem bei Ihnen. Das ist kein Trick, sondern Schweizer Recht.</blockquote>
        <blockquote lang="ru">Урна захоронена — и всё же у вас. Это не уловка, а швейцарское право.</blockquote>

        <h2><span lang="de">Der Ablauf in fünf Schritten</span><span lang="ru">Порядок в пять шагов</span></h2>
        <ol lang="de">
          <li><strong>Erstgespräch und Grabstelle.</strong> Sie rufen an oder schreiben uns. Wir klären Ihren Fall, Sie erwerben die Grabstelle zum Festpreis von 490 € (inklusive Schweizer Mehrwertsteuer) und unterschreiben eine Vollmacht.</li>
          <li><strong>Übernahmebestätigung.</strong> Wir bestätigen dem Krematorium schriftlich, dass wir die Urne übernehmen. Erst damit darf das Krematorium die Urne ins Ausland abgeben.</li>
          <li><strong>Die Urne kommt in die Schweiz.</strong> Ihr Bestatter oder das Krematorium sendet die Urne an uns. Wir beschaffen Sterbeurkunde, Einäscherungsbescheinigung und was das jeweilige Bundesland verlangt.</li>
          <li><strong>Beisetzung nach Schweizer Recht.</strong> Die Urne wird Ihnen als Angehörigen übergeben — nach Schweizer Recht ist sie damit beigesetzt und steht zur freien Verfügung. Sie erhalten die Beisetzungsbestätigung und die Grabstellenurkunde.</li>
          <li><strong>Zurück in die Heimat.</strong> Wir bringen die Urne zu Ihnen nach Hause — persönlich oder per versichertem Kurier. Von jetzt an gibt es keine Frist mehr.</li>
        </ol>
        <ol lang="ru">
          <li><strong>Первая беседа и место захоронения.</strong> Вы звоните или пишете нам. Мы уточняем ваш случай, вы приобретаете место по фиксированной цене 490 € (включая швейцарский НДС) и подписываете доверенность.</li>
          <li><strong>Подтверждение о принятии.</strong> Мы письменно подтверждаем крематорию, что принимаем урну. Только после этого крематорий может выдать урну за границу.</li>
          <li><strong>Урна поступает в Швейцарию.</strong> Ваше похоронное бюро или крематорий отправляет урну нам. Мы получаем свидетельство о смерти, справку о кремации и всё, что требует соответствующая федеральная земля.</li>
          <li><strong>Захоронение по швейцарскому праву.</strong> Урна передаётся вам как близким — по швейцарскому праву с этого момента она захоронена и находится в свободном распоряжении. Вы получаете подтверждение захоронения и свидетельство о месте.</li>
          <li><strong>Возвращение домой.</strong> Мы доставляем урну к вам домой — лично или застрахованным курьером. С этого момента никаких сроков.</li>
        </ol>

        <h2><span lang="de">Welche Unterlagen gebraucht werden</span><span lang="ru">Какие документы нужны</span></h2>
        <div class="table-scroll">
        <table lang="de">
          <thead><tr><th>Dokument</th><th>Wer stellt es aus</th><th>Wozu</th></tr></thead>
          <tbody>
            <tr><td>Grabstellenurkunde</td><td>Wir</td><td>Belegt Ihre Grabstelle in der Schweiz — die Grundlage des Modells</td></tr>
            <tr><td>Übernahmebestätigung</td><td>Wir</td><td>Erlaubt dem Krematorium, die Urne an uns abzugeben</td></tr>
            <tr><td>Vollmacht</td><td>Sie</td><td>Berechtigt uns, in Ihrem Namen mit Krematorium und Behörden zu handeln</td></tr>
            <tr><td>Sterbeurkunde</td><td>Standesamt</td><td>Nachweis des Todesfalls</td></tr>
            <tr><td>Einäscherungsbescheinigung</td><td>Krematorium</td><td>Belegt, dass die Urne die Asche der genannten Person enthält</td></tr>
            <tr><td>Beisetzungsbestätigung</td><td>Wir</td><td>Bestätigt die Beisetzung nach Schweizer Recht — für Sie und für Behörden</td></tr>
          </tbody>
        </table>
        <table lang="ru">
          <thead><tr><th>Документ</th><th>Кто выдаёт</th><th>Зачем</th></tr></thead>
          <tbody>
            <tr><td>Свидетельство о месте захоронения</td><td>Мы</td><td>Подтверждает ваше место в Швейцарии — основа модели</td></tr>
            <tr><td>Подтверждение о принятии</td><td>Мы</td><td>Позволяет крематорию выдать урну нам</td></tr>
            <tr><td>Доверенность</td><td>Вы</td><td>Даёт нам право действовать от вашего имени с крематорием и ведомствами</td></tr>
            <tr><td>Свидетельство о смерти</td><td>Загс</td><td>Подтверждение факта смерти</td></tr>
            <tr><td>Справка о кремации</td><td>Крематорий</td><td>Подтверждает, что в урне прах указанного лица</td></tr>
            <tr><td>Подтверждение захоронения</td><td>Мы</td><td>Подтверждает захоронение по швейцарскому праву — для вас и для ведомств</td></tr>
          </tbody>
        </table>
        </div>
        <p lang="de">Sie müssen bei keiner Behörde anrufen. Wir kennen die Formulare der Bundesländer und beschaffen, was fehlt.</p>
        <p lang="ru">Вам не нужно звонить ни в одно ведомство. Мы знаем формы федеральных земель и получаем всё недостающее.</p>

        <h2><span lang="de">Wie lange es dauert</span><span lang="ru">Сколько это длится</span></h2>
        <p lang="de">Meist ein bis zwei Wochen nach der Einäscherung. Die Zeit geht fast vollständig für Papiere drauf. Entscheidend ist der Zeitpunkt, an dem Sie uns anrufen: Solange die Urne noch nicht in Deutschland beigesetzt ist, ist der Weg einfach. Danach wird er deutlich schwieriger.</p>
        <p lang="ru">Обычно одна–две недели после кремации. Почти всё время уходит на бумаги. Решающий момент — когда вы нам позвоните: пока урна ещё не захоронена в Германии, путь прост. После этого он значительно сложнее.</p>

        <h2><span lang="de">Was es kostet</span><span lang="ru">Сколько это стоит</span></h2>
        <p lang="de"><strong>490 € zum Festpreis, inklusive Schweizer Mehrwertsteuer.</strong> Darin enthalten: die Grabstelle in den Schweizer Bergen, das Erstgespräch, Übernahmebestätigung und alle Unterlagen, die Beisetzung nach Schweizer Recht mit Beisetzungsbestätigung und Grabstellenurkunde, die Rückführung der Urne zu Ihnen nach Hause — und die spätere Beisetzung auf der Grabstelle, auf Wunsch im Beisein der Familie. Nicht enthalten sind die Einäscherung, die Leistungen Ihres Bestatters in Deutschland und der Versand der Urne zu uns; diese gehören zur Bestattung in Deutschland.</p>
        <p lang="ru"><strong>490 € по фиксированной цене, включая швейцарский НДС.</strong> В неё входят: место захоронения в швейцарских горах, первая беседа, подтверждение о принятии и все документы, захоронение по швейцарскому праву с подтверждением и свидетельством о месте, возврат урны к вам домой — и последующее захоронение на месте, по желанию в присутствии семьи. Не включены кремация, услуги вашего похоронного бюро в Германии и отправка урны к нам; они относятся к похоронам в Германии.</p>
        <p><a class="btn btn-text" href="index.html#festpreis"><span lang="de">Zum Festpreis im Detail</span><span lang="ru">Подробно о фиксированной цене</span></a></p>

        <h2><span lang="de">Und die Grabstelle?</span><span lang="ru">А место захоронения?</span></h2>
        <p lang="de">Sie gehört Ihnen und bleibt Ihnen — eine Stelle auf einer Bergwiese oder in einem Wald in der Schweiz, ohne Grabpflege und ohne laufende Gebühren. Wenn die Zeit gekommen ist, setzen wir die Asche dort bei; die Familie kann dabei sein. Viele verbinden das mit einer Reise in die Berge — an einen Ort, den man jederzeit wieder besuchen kann, ohne Öffnungszeiten.</p>
        <p lang="ru">Оно принадлежит вам и остаётся за вами — место на горном лугу или в лесу в Швейцарии, без ухода за могилой и без текущих платежей. Когда придёт время, мы захороним там прах; семья может присутствовать. Многие совмещают это с поездкой в горы — в место, которое можно посещать снова и снова, без часов работы.</p>
        <div class="aside">
          <p lang="de"><strong>Hinweis.</strong> Grundlage des Modells ist das Schweizer Bestattungsrecht. In Deutschland ist Bestattungsrecht Ländersache; dieser Text ersetzt keine Rechtsberatung. Wir besprechen Ihren Fall vorab offen — auch die Grenzen des Modells.</p>
          <p lang="ru"><strong>Примечание.</strong> Основа модели — швейцарское похоронное право. В Германии похоронное право относится к компетенции земель; этот текст не заменяет юридическую консультацию. Ваш случай мы обсуждаем заранее и открыто — включая границы модели.</p>
        </div>
''' + ARTICLE_END + related('zurueck-in-die-heimat.html') + CTA + '''
</main>
'''

# --------------------------------------------------------------- Bestattungsverfügung
verfuegung_body = article_head(
  'Bestattungsverfügung', 'Распоряжение о погребении', 'Ratgeber · Vorsorge', 'Справочник · Планирование',
  'Die Bestattungsverfügung: zu Lebzeiten festlegen, wo Sie ruhen.',
  'Распоряжение о погребении: определить при жизни, где вы будете покоиться.',
  'Wer nicht in ein Reihengrab will, sondern zur Familie nach Hause und später auf eine Bergwiese, kann das heute schon verbindlich regeln. Was in eine Bestattungsverfügung gehört, wie sie wirkt und wie wir sie hinterlegen.',
  'Кто не хочет в рядовую могилу, а хочет к семье, в горы или домой, может оформить это уже сегодня. Что должно быть в распоряжении о погребении, как оно действует и как мы его храним.') + '''
        <h2><span lang="de">Was eine Bestattungsverfügung ist</span><span lang="ru">Что такое распоряжение о погребении</span></h2>
        <p lang="de">Eine Bestattungsverfügung ist eine schriftliche Erklärung, in der Sie zu Lebzeiten festlegen, wie Ihre Bestattung ablaufen soll: Einäscherung oder Erdbestattung, Ort der Beisetzung, Art der Feier, wer sich kümmert. In Deutschland ist der Wille des Verstorbenen für die Angehörigen und die Behörden verbindlich — soweit er sich im Rahmen des Gesetzes bewegt. Und genau hier liegt der Punkt: Der Wunsch, die Urne ins Ausland zu überführen, bewegt sich im Rahmen des Gesetzes.</p>
        <p lang="ru">Распоряжение о погребении — это письменное заявление, в котором вы при жизни определяете, как должны пройти ваши похороны: кремация или погребение в землю, место захоронения, форма прощания, кто этим займётся. В Германии воля умершего обязательна для близких и ведомств — в рамках закона. И именно здесь ключевой момент: желание вывезти урну за границу находится в рамках закона.</p>

        <h2><span lang="de">Warum sie für die Überführung wichtig ist</span><span lang="ru">Почему оно важно для перевозки</span></h2>
        <p lang="de">Ohne Verfügung entscheiden nach dem Tod die nächsten Angehörigen — oft unter Zeitdruck, oft uneins, oft ohne zu wissen, dass es eine Alternative zum Friedhof gibt. Mit einer Verfügung ist der Weg vorgezeichnet: Das Krematorium weiss, dass die Urne an uns übergeben wird; die Familie weiss, wen sie anruft; niemand muss in der Trauer eine Entscheidung treffen, die Sie längst getroffen haben.</p>
        <p lang="ru">Без распоряжения после смерти решают ближайшие родственники — часто в спешке, часто без единого мнения, часто не зная, что есть альтернатива кладбищу. С распоряжением путь предопределён: крематорий знает, что урна передаётся нам; семья знает, кому звонить; никому не приходится в горе принимать решение, которое вы давно приняли.</p>
        <blockquote lang="de">Vorsorge ist kein Abschied vom Leben. Es ist ein Geschenk an die, die bleiben.</blockquote>
        <blockquote lang="ru">Планирование — не прощание с жизнью. Это подарок тем, кто остаётся.</blockquote>

        <h2><span lang="de">Was hineingehört</span><span lang="ru">Что должно быть в документе</span></h2>
        <ul lang="de">
          <li><strong>Ihre Personalien</strong> — Name, Geburtsdatum, Adresse.</li>
          <li><strong>Die Bestattungsart</strong> — Einäscherung.</li>
          <li><strong>Der Wunsch nach Rückführung</strong> — «Meine Urne soll nach dem Modell ‹Zurück in die Heimat› über die Schweiz meiner Familie zur freien Verfügung übergeben werden.» Nennen Sie, was danach geschehen soll: bei der Familie bleiben, später Beisetzung auf der Grabstelle in den Schweizer Bergen oder an einem anderen Ort.</li>
          <li><strong>Die verantwortliche Person</strong> — wer Ihre Verfügung umsetzt (in Deutschland «totenfürsorgeberechtigt»). Am besten mit Ersatzperson.</li>
          <li><strong>Das beauftragte Unternehmen</strong> — Seelenfrieden Urnenrückführung GmbH, Zug, mit unseren Kontaktdaten.</li>
          <li><strong>Datum und eigenhändige Unterschrift.</strong> Eine notarielle Beglaubigung ist nicht nötig, schadet aber nicht.</li>
        </ul>
        <ul lang="ru">
          <li><strong>Ваши личные данные</strong> — имя, дата рождения, адрес.</li>
          <li><strong>Вид погребения</strong> — кремация.</li>
          <li><strong>Желание возврата</strong> — «Моя урна должна быть передана моей семье в свободное распоряжение по модели ‹Возвращение домой› через Швейцарию». Укажите, что должно произойти дальше: остаться у семьи, позже — захоронение на месте в швейцарских горах или в другом месте.</li>
          <li><strong>Ответственное лицо</strong> — кто исполнит ваше распоряжение (в Германии «totenfürsorgeberechtigt»). Лучше с запасным лицом.</li>
          <li><strong>Уполномоченное предприятие</strong> — Seelenfrieden Urnenrückführung GmbH, Цуг, с нашими контактами.</li>
          <li><strong>Дата и собственноручная подпись.</strong> Нотариальное заверение не обязательно, но не повредит.</li>
        </ul>

        <h2><span lang="de">Wo die Verfügung liegen sollte</span><span lang="ru">Где должно храниться распоряжение</span></h2>
        <p lang="de">Nicht im Bankschliessfach und nicht im Testament — beides wird oft erst Wochen nach der Bestattung geöffnet. Besser: ein Exemplar bei der verantwortlichen Person, ein Exemplar bei uns, ein Hinweis in der Brieftasche. Wir hinterlegen Ihre Verfügung zusammen mit einer vorbereiteten Übernahmebestätigung, sodass im Ernstfall ein einziger Anruf genügt.</p>
        <p lang="ru">Не в банковской ячейке и не в завещании — и то и другое часто открывают лишь спустя недели после похорон. Лучше: один экземпляр у ответственного лица, один у нас, пометка в бумажнике. Мы храним ваше распоряжение вместе с заранее подготовленным подтверждением о принятии, чтобы в нужный момент хватило одного звонка.</p>

        <h2><span lang="de">Das Vorsorgegespräch</span><span lang="ru">Консультация по планированию</span></h2>
        <p lang="de">Wir helfen beim Formulieren, reservieren auf Wunsch schon jetzt Ihre Grabstelle in den Schweizer Bergen und besprechen die Kosten, die Ihre Angehörigen später erwarten — zum Festpreis, der heute schon gilt. Das Gespräch ist kostenlos und verpflichtet zu nichts. Auf Deutsch oder Russisch, bei uns in Zug, am Telefon oder per Video.</p>
        <p lang="ru">Мы помогаем с формулировкой, по желанию уже сейчас резервируем ваше место в швейцарских горах и обсуждаем расходы, которые ожидают ваших близких, — по фиксированной цене, действующей уже сегодня. Беседа бесплатна и ни к чему не обязывает. На немецком или русском, у нас в Цуге, по телефону или по видеосвязи.</p>
        <div class="aside">
          <p lang="de"><strong>Hinweis.</strong> Dieser Text ersetzt keine Rechtsberatung. Für erbrechtliche Fragen wenden Sie sich an eine Notarin oder einen Anwalt; die Bestattungsverfügung selbst können Sie ohne Beistand verfassen.</p>
          <p lang="ru"><strong>Примечание.</strong> Этот текст не заменяет юридическую консультацию. По вопросам наследственного права обратитесь к нотариусу или адвокату; само распоряжение о погребении вы можете составить без помощи.</p>
        </div>
''' + ARTICLE_END + related('bestattungsverfuegung.html') + CTA + '''
</main>
'''

# Ratgeber-Hauptseite bekommt ebenfalls «Weiterlesen»
ratgeber_body = ratgeber_body.replace(CTA + '''
</main>''', related('friedhofszwang.html') + CTA + '''
</main>''')

PUB = '2026-09-06'
pages = {
  'friedhofszwang.html': (
    'Friedhofszwang in Deutschland: Was gilt, was erlaubt ist, wie die Schweiz es hält',
    'Обязательное захоронение в Германии: что действует, что разрешено, как это устроено в Швейцарии',
    'Warum in Deutschland eine Urne nicht nach Hause darf, wie die Schweiz es hält und wie das Schweizer Recht den Weg zurück in die Heimat öffnet. Mit Bestattungsverfügung und häufigen Irrtümern.',
    'Почему в Германии урну нельзя забрать домой, как это устроено в Швейцарии и как проходит перевозка через границу. С распоряжением о погребении и распространёнными заблуждениями.',
    ratgeber_body, False,
    lambda path: article_ld(path, 'Der Friedhofszwang — und der Weg daran vorbei', 'Warum in Deutschland eine Urne nicht nach Hause darf, wie die Schweiz es hält und wie das Schweizer Recht den Weg nach Hause öffnet.', PUB, PUB, 'Friedhofszwang')),
  'urne-zu-hause-aufbewahren.html': (
    'Urne zu Hause aufbewahren: In Deutschland verboten, in der Schweiz erlaubt',
    'Хранить урну дома: в Германии запрещено, в Швейцарии разрешено',
    'Darf man eine Urne zu Hause aufbewahren? In Deutschland nein, nach Schweizer Recht ja — auch für Familien in Deutschland. Was gilt, warum das wichtig ist und wie die Urne über die Schweiz nach Hause kommt.',
    'Можно ли хранить урну дома? В Германии нет, по швейцарскому праву да — в том числе для семей в Германии. Что действует, почему это важно и как урна через Швейцарию возвращается домой.',
    zuhause_body, False,
    lambda path: article_ld(path, 'Urne zu Hause aufbewahren: in Deutschland verboten, nach Schweizer Recht möglich', 'Darf man eine Urne zu Hause aufbewahren? In Deutschland nein, nach Schweizer Recht ja — und so kommt sie nach Hause.', PUB, PUB, 'Urne zu Hause aufbewahren')),
  'zurueck-in-die-heimat.html': (
    'Zurück in die Heimat: Urne nach Schweizer Recht nach Hause — Ablauf, Unterlagen, Kosten',
    'Возвращение домой: урна по швейцарскому праву домой — порядок, документы, стоимость',
    'So funktioniert das Schweizer Modell: Grabstelle in den Bergen, Übernahme vom Krematorium, Beisetzung nach Schweizer Recht, Rückführung der Urne nach Hause. Unterlagen, Dauer und Festpreis 490 €.',
    'Как работает швейцарская модель: место в горах, принятие из крематория, захоронение по швейцарскому праву, возврат урны домой. Документы, сроки и фиксированная цена 490 €.',
    heimat_body, False,
    lambda path: article_ld(path, 'Zurück in die Heimat: So kommt die Urne nach Schweizer Recht zu Ihnen nach Hause', 'Das Schweizer Modell Schritt für Schritt: Grabstelle, Übernahme, Beisetzung, Rückführung — Unterlagen, Dauer, Kosten.', PUB, PUB, 'Zurück in die Heimat')),
  'bestattungsverfuegung.html': (
    'Bestattungsverfügung: Zu Lebzeiten festlegen, dass die Urne zur Familie kommt',
    'Распоряжение о погребении: определить при жизни, что урна вернётся в семью',
    'Wie Sie mit einer Bestattungsverfügung verbindlich festlegen, dass Ihre Urne über die Schweiz zu Ihrer Familie kommt: Inhalt, Wirkung, Aufbewahrung, kostenloses Vorsorgegespräch.',
    'Как распоряжением о погребении определить, что ваша урна через Швейцарию вернётся к вашей семье: содержание, действие, хранение, бесплатная консультация.',
    verfuegung_body, False,
    lambda path: article_ld(path, 'Die Bestattungsverfügung: zu Lebzeiten festlegen, wo Sie ruhen', 'Was in eine Bestattungsverfügung gehört, wie sie wirkt und wie wir sie hinterlegen.', PUB, PUB, 'Bestattungsverfügung')),
  'impressum.html': (
    'Impressum — Seelenfrieden Urnenrückführung GmbH, Zug',
    'Выходные данные — Seelenfrieden Urnenrückführung GmbH, Цуг',
    'Impressum der Seelenfrieden Urnenrückführung GmbH mit Sitz in Zug: Firma, Geschäftsführung, Adresse, Handelsregister, Haftung.',
    'Выходные данные Seelenfrieden Urnenrückführung GmbH, Цуг: компания, руководство, адрес, торговый реестр, ответственность.',
    impressum_body, False, lambda path: page_ld(path, 'Impressum')),
  'datenschutz.html': (
    'Datenschutzerklärung — Seelenfrieden Urnenrückführung GmbH',
    'Политика защиты данных — Seelenfrieden Urnenrückführung GmbH',
    'Welche Daten die Seelenfrieden Urnenrückführung GmbH bearbeitet, wozu, wie lange — und was diese Website nicht tut: keine Cookies, kein Tracking, keine Google Fonts.',
    'Какие данные обрабатывает Seelenfrieden Urnenrückführung GmbH, зачем и как долго — и чего этот сайт не делает: никаких cookie, трекинга и Google Fonts.',
    datenschutz_body, False, lambda path: page_ld(path, 'Datenschutzerklärung')),
  '404.html': (
    'Seite nicht gefunden — Seelenfrieden Urnenrückführung GmbH',
    'Страница не найдена — Seelenfrieden Urnenrückführung GmbH',
    'Diese Seite gibt es nicht.', 'Такой страницы нет.',
    notfound_body, True, lambda path: ''),
}

# --------------------------------------------------------------- Russische Fassung
def to_ru(html, name):
    """Leitet aus einer deutschen Seite die Fassung unter /ru/ ab: Russisch als
    Standardsprache, eigene Adresse, Pfade eine Ebene höher."""
    a = dict(re.findall(r'(data-title-ru|data-desc-ru)="([^"]*)"', html))
    h = html.replace('<html lang="de" data-lang="de"', '<html lang="ru" data-lang="ru"', 1)
    h = re.sub(r'<title>.*?</title>', '<title>' + a.get('data-title-ru', '') + '</title>', h, count=1, flags=re.S)
    h = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="' + a.get('data-desc-ru', '') + '">', h, count=1)
    path = '' if name == 'index.html' else name
    h = h.replace(f'<link rel="canonical" href="{D}/{path}">', f'<link rel="canonical" href="{D}/ru/{path}">')
    h = h.replace(f'<meta property="og:url" content="{D}/{path}">', f'<meta property="og:url" content="{D}/ru/{path}">')
    h = h.replace('<meta property="og:locale" content="de_CH">\n<meta property="og:locale:alternate" content="ru_RU">', '<meta property="og:locale" content="ru_RU">\n<meta property="og:locale:alternate" content="de_CH">')
    h = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="' + a.get('data-title-ru', '') + '">', h, count=1)
    h = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="' + a.get('data-desc-ru', '') + '">', h, count=1)
    h = h.replace('href="assets/', 'href="../assets/').replace('src="assets/', 'src="../assets/').replace('href="site.webmanifest"', 'href="../site.webmanifest"')
    h = h.replace('"inLanguage": "de"', '"inLanguage": "ru"')
    # Sprachumschalter: DE zeigt nach oben, RU auf sich selbst
    h = re.sub(r'<a href="([\w.-]+)" hreflang="de" data-set-lang="de" aria-pressed="true">DE</a>', r'<a href="../\1" hreflang="de" data-set-lang="de" aria-pressed="false">DE</a>', h)
    h = re.sub(r'<a href="ru/([\w.-]+)" hreflang="ru" data-set-lang="ru" aria-pressed="false">RU</a>', r'<a href="\1" hreflang="ru" data-set-lang="ru" aria-pressed="true">RU</a>', h)
    return h

os.makedirs(os.path.join(ROOT, 'ru'), exist_ok=True)
written = []
for name, (tde, tru, dde, dru, body, noindex, ld) in pages.items():
    html = head(tde, tru, dde, dru, name, noindex, ld(name)) + HEADER.replace('{{PAGE}}', name) + body + FOOTER
    with open(os.path.join(ROOT, name), 'w', encoding='utf-8') as f:
        f.write(html)
    with open(os.path.join(ROOT, 'ru', name), 'w', encoding='utf-8') as f:
        f.write(to_ru(html, name))
    written.append(name)
    print('wrote', name, '+ ru/', len(html))

# Startseite: nur die russische Fassung ableiten
with open(os.path.join(ROOT, 'index.html'), encoding='utf-8') as f:
    index_html = f.read()
with open(os.path.join(ROOT, 'ru', 'index.html'), 'w', encoding='utf-8') as f:
    f.write(to_ru(index_html, 'index.html'))
print('wrote ru/index.html')

# --------------------------------------------------------------- Sitemap
def url_entry(path, prio, freq):
    de = f'{D}/{path}'; ru = f'{D}/ru/{path}'
    def block(loc):
        return f'''  <url>
    <loc>{loc}</loc>
    <lastmod>{PUB}</lastmod><changefreq>{freq}</changefreq><priority>{prio}</priority>
    <xhtml:link rel="alternate" hreflang="de" href="{de}"/>
    <xhtml:link rel="alternate" hreflang="ru" href="{ru}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="{de}"/>
  </url>
'''
    return block(de) + block(ru)

sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
sitemap += url_entry('', '1.0', 'monthly')
for name in ['friedhofszwang.html', 'urne-zu-hause-aufbewahren.html', 'zurueck-in-die-heimat.html', 'bestattungsverfuegung.html']:
    sitemap += url_entry(name, '0.8', 'yearly')
for name in ['impressum.html', 'datenschutz.html']:
    sitemap += url_entry(name, '0.2', 'yearly')
sitemap += '</urlset>\n'
with open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8') as f:
    f.write(sitemap)
print('wrote sitemap.xml')
