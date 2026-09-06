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
          <li><a href="urne-ins-ausland-ueberfuehren.html"><span lang="de">Urne ins Ausland überführen</span><span lang="ru">Вывезти урну за границу</span></a></li>
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
      <p class="lead" lang="de">Warum in Deutschland eine Urne nicht nach Hause darf, warum das in der Schweiz anders ist, und wie eine Überführung über die Grenze rechtlich und praktisch abläuft.</p>
      <p class="lead" lang="ru">Почему в Германии урну нельзя забрать домой, почему в Швейцарии всё иначе и как юридически и практически проходит перевозка через границу.</p>
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
          <li><a href="#grenze"><span lang="de">Der Weg über die Grenze</span><span lang="ru">Путь через границу</span></a></li>
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

        <h2 id="grenze"><span lang="de">Der Weg über die Grenze</span><span lang="ru">Путь через границу</span></h2>
        <p lang="de">Der Friedhofszwang gilt in Deutschland — nicht darüber hinaus. Die Bestattungsgesetze erlauben ausdrücklich, eine Urne ins Ausland zu überführen, wenn dort eine Stelle die Urne rechtmässig entgegennimmt. In der Schweiz ist das ein Bestattungsunternehmen wie die Seelenfrieden Urnenrückführung GmbH. Der Ablauf:</p>
        <p lang="ru">Обязательное захоронение действует в Германии — но не за её пределами. Похоронные законы прямо разрешают вывезти урну за границу, если там её законно принимает уполномоченная сторона. В Швейцарии это похоронное предприятие, такое как Seelenfrieden Urnenrückführung GmbH. Порядок:</p>
        <ol lang="de">
          <li><strong>Übernahmebestätigung.</strong> Wir bestätigen dem Krematorium schriftlich, dass wir die Urne übernehmen und in der Schweiz ordnungsgemäss verwahren beziehungsweise übergeben.</li>
          <li><strong>Unterlagen.</strong> Sterbeurkunde, Einäscherungsbescheinigung und — je nach Bundesland — ein Formular der zuständigen Behörde. Wir beschaffen alles und lassen übersetzen, was die Schweiz auf Deutsch braucht (bei fremdsprachigen Urkunden).</li>
          <li><strong>Abholung.</strong> Wir übernehmen die Urne persönlich beim Krematorium. Sie wird in einem versiegelten, zugelassenen Behälter transportiert.</li>
          <li><strong>Grenze.</strong> Am Zoll legen wir die Urkunden vor. Die Asche eines Verstorbenen ist keine Ware; Abgaben fallen nicht an.</li>
          <li><strong>Übergabe.</strong> In Zug händigen wir Ihnen die Urne persönlich aus und dokumentieren die Übergabe — für Sie und für jede Behörde, die später fragt.</li>
        </ol>
        <ol lang="ru">
          <li><strong>Подтверждение о принятии.</strong> Мы письменно подтверждаем крематорию, что принимаем урну и надлежащим образом храним или передаём её в Швейцарии.</li>
          <li><strong>Документы.</strong> Свидетельство о смерти, справка о кремации и — в зависимости от федеральной земли — форма соответствующего ведомства. Мы получаем всё и переводим то, что нужно Швейцарии на немецком языке (при иноязычных документах).</li>
          <li><strong>Получение.</strong> Мы лично принимаем урну в крематории. Она перевозится в опечатанном, допущенном контейнере.</li>
          <li><strong>Граница.</strong> На таможне мы предъявляем документы. Прах умершего не является товаром; пошлины не взимаются.</li>
          <li><strong>Передача.</strong> В Цуге мы лично вручаем вам урну и документируем передачу — для вас и для любого ведомства, которое спросит позже.</li>
        </ol>
        <div class="aside">
          <p lang="de"><strong>Was Sie selbst tun müssen:</strong> nichts, ausser uns anzurufen und eine Vollmacht zu unterschreiben. Das Krematorium, das Standesamt und die Behörden sprechen mit uns.</p>
          <p lang="ru"><strong>Что нужно сделать вам:</strong> ничего, кроме как позвонить нам и подписать доверенность. С крематорием, загсом и ведомствами общаемся мы.</p>
        </div>

        <h2 id="danach"><span lang="de">Was danach möglich ist</span><span lang="ru">Что возможно после</span></h2>
        <p lang="de">Sobald die Urne in der Schweiz ist, entscheiden Sie. Viele Familien wählen einen Ort, den sie mit dem Verstorbenen verbinden: einen Aussichtspunkt in den Bergen, das Ufer eines Sees, einen Wald. Andere behalten die Urne zu Hause, bis sich die Familie gemeinsam für einen Ort entschieden hat — es gibt keine Frist.</p>
        <p lang="ru">Как только урна в Швейцарии, решаете вы. Многие семьи выбирают место, которое связывают с умершим: смотровую площадку в горах, берег озера, лес. Другие оставляют урну дома, пока семья вместе не определится с местом — никаких сроков нет.</p>
        <p lang="de">Soll die Urne in die Heimat der Familie weiterreisen, organisieren wir das aus der Schweiz heraus: Luftfracht oder Kurier, konsularische Bescheinigungen, Einfuhrbestimmungen des Ziellandes, Übergabe an die Familie vor Ort. Wichtig zu wissen: Eine Rückkehr nach Deutschland ist nicht vorgesehen — dort gilt weiterhin der Friedhofszwang.</p>
        <p lang="ru">Если урна должна отправиться дальше на родину семьи, мы организуем это из Швейцарии: авиагруз или курьер, консульские справки, правила ввоза страны назначения, передача семье на месте. Важно знать: возвращение в Германию не предусмотрено — там по-прежнему действует обязательное захоронение.</p>

        <h2 id="vorsorge"><span lang="de">Vorsorge: die Bestattungsverfügung</span><span lang="ru">Планирование: распоряжение о погребении</span></h2>
        <p lang="de">Wer zu Lebzeiten festlegen möchte, dass die eigene Urne nicht auf einem deutschen Friedhof bleibt, hält das in einer <strong>Bestattungsverfügung</strong> fest. Sie ist formfrei, sollte aber eigenhändig unterschrieben und datiert sein und enthalten:</p>
        <p lang="ru">Кто хочет при жизни определить, что его урна не останется на немецком кладбище, фиксирует это в <strong>распоряжении о погребении</strong>. Форма свободная, но документ должен быть собственноручно подписан и датирован и содержать:</p>
        <ul lang="de">
          <li>den Wunsch nach Einäscherung,</li>
          <li>den Wunsch, die Urne in die Schweiz zu überführen — und was dort mit ihr geschehen soll,</li>
          <li>die Person, die das umsetzen soll (die sogenannte totenfürsorgeberechtigte Person),</li>
          <li>den Hinweis auf uns als beauftragtes Unternehmen samt Kontaktdaten.</li>
        </ul>
        <ul lang="ru">
          <li>желание быть кремированным,</li>
          <li>желание перевезти урну в Швейцарию — и что должно с ней произойти там,</li>
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
          <dd>Nein. Der Weg ist gesetzlich vorgesehen, dauert meist ein bis zwei Wochen und kostet bei uns 490 € zum Festpreis.</dd>
          <dt>„Ich brauche einen Bezug zur Schweiz.“</dt>
          <dd>Nein. Entscheidend ist nur, dass in der Schweiz eine zugelassene Stelle die Urne übernimmt — das tun wir.</dd>
        </dl>
        <dl class="qa" lang="ru">
          <dt>«После прощания я могу ненадолго взять урну домой».</dt>
          <dd>Нет. В Германии урна до захоронения остаётся у похоронного бюро или администрации кладбища.</dd>
          <dt>«Развеять в собственном саду — на это закрывают глаза».</dt>
          <dd>Нет. За пределами Бремена это административное правонарушение — а Бремен требует заявления, сделанного при жизни.</dd>
          <dt>«Вывоз за границу — это сложно и дорого».</dt>
          <dd>Нет. Путь предусмотрен законом, занимает обычно одну–две недели и стоит у нас 490 € по фиксированной цене.</dd>
          <dt>«Мне нужна связь со Швейцарией».</dt>
          <dd>Нет. Важно лишь, чтобы в Швейцарии урну приняла уполномоченная сторона — это делаем мы.</dd>
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
        <p lang="de">Wir geben Daten nur an Stellen weiter, die für die Überführung zwingend beteiligt sind: Krematorien, Standesämter und Behörden, Zoll, Transporteure und Bestattungsunternehmen im Zielland, Übersetzungsbüros für beglaubigte Übersetzungen. Eine Übermittlung ins Ausland erfolgt nur, soweit der Auftrag es verlangt — etwa bei einer Weiterreise der Urne in ein Drittland.</p>
        <p lang="ru">Мы передаём данные только тем сторонам, чьё участие в перевозке обязательно: крематориям, загсам и ведомствам, таможне, перевозчикам и похоронным предприятиям в стране назначения, бюро заверенных переводов. Передача за рубеж происходит только в той мере, в какой этого требует заказ — например, при дальнейшей перевозке урны в третью страну.</p>

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
      ('urne-ins-ausland-ueberfuehren.html', 'Urne ins Ausland überführen', 'Вывезти урну за границу', 'Ablauf & Kosten', 'Порядок и цена'),
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
  'Viele Angehörige möchten die Urne eines geliebten Menschen bei sich behalten. In Deutschland scheitert das am Friedhofszwang — in der Schweiz ist es selbstverständlich. Was gilt, was möglich ist und wie der Weg aussieht.',
  'Многие близкие хотят сохранить урну любимого человека у себя. В Германии это невозможно из-за обязательного захоронения — в Швейцарии это само собой разумеется. Что действует, что возможно и как выглядит путь.') + '''
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

        <h2><span lang="de">Der Weg: Überführung in die Schweiz</span><span lang="ru">Путь: перевозка в Швейцарию</span></h2>
        <p lang="de">Was in Deutschland verboten ist, ist über die Grenze erlaubt. Die deutschen Bestattungsgesetze gestatten die Überführung einer Urne ins Ausland, wenn dort eine zugelassene Stelle die Urne übernimmt. Die Seelenfrieden Urnenrückführung GmbH ist eine solche Stelle. Der Ablauf in Kürze:</p>
        <p lang="ru">То, что запрещено в Германии, разрешено за границей. Немецкие похоронные законы позволяют вывезти урну за рубеж, если там её принимает уполномоченная сторона. Seelenfrieden Urnenrückführung GmbH — такая сторона. Порядок вкратце:</p>
        <ol lang="de">
          <li>Sie rufen uns an. Wir klären Ausgangsort, Unterlagen und Zeitrahmen — zum Festpreis von 490 €.</li>
          <li>Wir bestätigen dem Krematorium die Übernahme und beschaffen Sterbeurkunde und Einäscherungsbescheinigung.</li>
          <li>Wir holen die Urne ab und bringen sie versiegelt über die Grenze.</li>
          <li>In Zug übergeben wir Ihnen die Urne persönlich — ab jetzt gehört sie zu Ihnen.</li>
        </ol>
        <ol lang="ru">
          <li>Вы звоните нам. Мы уточняем место, документы и сроки — по фиксированной цене 490 €.</li>
          <li>Мы подтверждаем крематорию принятие урны и получаем свидетельство о смерти и справку о кремации.</li>
          <li>Мы забираем урну и провозим её опечатанной через границу.</li>
          <li>В Цуге мы лично передаём вам урну — с этого момента она ваша.</li>
        </ol>

        <h2><span lang="de">Wo die Urne dann bleiben darf</span><span lang="ru">Где урна может находиться дальше</span></h2>
        <ul lang="de">
          <li><strong>Zu Hause in der Schweiz.</strong> Ohne Frist, ohne Bewilligung.</li>
          <li><strong>Im eigenen Garten.</strong> In den meisten Gemeinden ohne Formalitäten möglich.</li>
          <li><strong>In der Natur.</strong> Verstreuen am Berg, im Wald oder auf dem See — mit Rücksicht auf Dritte und Grundeigentümer.</li>
          <li><strong>In einem anderen Land.</strong> Wir organisieren die Weiterreise, wenn die Einfuhr dort erlaubt ist.</li>
        </ul>
        <ul lang="ru">
          <li><strong>Дома в Швейцарии.</strong> Без сроков, без разрешений.</li>
          <li><strong>В собственном саду.</strong> В большинстве общин без формальностей.</li>
          <li><strong>На природе.</strong> Развеять в горах, в лесу или на озере — с уважением к окружающим и владельцам земли.</li>
          <li><strong>В другой стране.</strong> Мы организуем дальнейшую перевозку, если ввоз там разрешён.</li>
        </ul>
        <div class="aside">
          <p lang="de"><strong>Ehrlich gesagt:</strong> Zurück nach Deutschland darf die Urne nicht — dort gilt weiterhin der Friedhofszwang. Wer in Deutschland lebt, wählt in der Regel einen Ort in der Schweiz, den er jederzeit besuchen kann, oder die Weiterreise in die Heimat.</p>
          <p lang="ru"><strong>Честно говоря:</strong> обратно в Германию урну везти нельзя — там по-прежнему действует обязательное захоронение. Кто живёт в Германии, обычно выбирает место в Швейцарии, которое можно посещать в любое время, или дальнейший путь на родину.</p>
        </div>
        <div class="aside">
          <p lang="de"><strong>Hinweis.</strong> Dieser Text ersetzt keine Rechtsberatung. Bestattungsrecht ist Länder- beziehungsweise Kantonssache; wir klären jeden Fall individuell.</p>
          <p lang="ru"><strong>Примечание.</strong> Этот текст не заменяет юридическую консультацию. Похоронное право относится к компетенции земель и кантонов; каждый случай мы проверяем индивидуально.</p>
        </div>
''' + ARTICLE_END + related('urne-zu-hause-aufbewahren.html') + CTA + '''
</main>
'''

# --------------------------------------------------------------- Ins Ausland
ausland_body = article_head(
  'Urne ins Ausland', 'Урна за границу', 'Ratgeber · Ablauf & Kosten', 'Справочник · Порядок и цена',
  'Urne ins Ausland überführen: Unterlagen, Dauer, Zoll und Kosten.',
  'Вывезти урну за границу: документы, сроки, таможня и стоимость.',
  'Eine Urne darf Deutschland verlassen — wenn der Weg stimmt. Hier steht, welche Papiere nötig sind, wie lange es dauert, was an der Grenze passiert und was es kostet.',
  'Урна может покинуть Германию — если путь правильный. Здесь описано, какие бумаги нужны, сколько это длится, что происходит на границе и сколько это стоит.') + '''
        <h2><span lang="de">Ist die Überführung einer Urne ins Ausland erlaubt?</span><span lang="ru">Разрешён ли вывоз урны за границу?</span></h2>
        <p lang="de">Ja. Die Bestattungsgesetze der Bundesländer sehen die Überführung von Urnen ins Ausland ausdrücklich vor. Voraussetzung ist, dass im Zielland eine zugelassene Stelle — ein Bestattungsunternehmen, eine Friedhofsverwaltung — die Urne übernimmt und dem deutschen Krematorium dies schriftlich bestätigt. Was danach im Zielland mit der Urne geschieht, richtet sich allein nach dessen Recht.</p>
        <p lang="ru">Да. Похоронные законы федеральных земель прямо предусматривают вывоз урн за границу. Условие — чтобы в стране назначения уполномоченная сторона (похоронное предприятие, администрация кладбища) приняла урну и письменно подтвердила это немецкому крематорию. Что происходит с урной дальше, определяется исключительно правом страны назначения.</p>

        <h2><span lang="de">Welche Unterlagen werden gebraucht?</span><span lang="ru">Какие документы нужны?</span></h2>
        <div class="table-scroll">
        <table lang="de">
          <thead><tr><th>Dokument</th><th>Wer stellt es aus</th><th>Wozu</th></tr></thead>
          <tbody>
            <tr><td>Sterbeurkunde</td><td>Standesamt des Sterbeorts</td><td>Nachweis des Todesfalls; wird an der Grenze und im Zielland verlangt</td></tr>
            <tr><td>Einäscherungsbescheinigung</td><td>Krematorium</td><td>Belegt, dass die Urne die Asche der genannten Person enthält</td></tr>
            <tr><td>Übernahmebestätigung</td><td>Wir</td><td>Bestätigt dem Krematorium die ordnungsgemässe Übernahme im Zielland</td></tr>
            <tr><td>Vollmacht</td><td>Sie</td><td>Berechtigt uns, in Ihrem Namen mit Krematorium und Behörden zu handeln</td></tr>
            <tr><td>Ausweiskopie</td><td>Sie</td><td>Identität der auftraggebenden Person</td></tr>
          </tbody>
        </table>
        <table lang="ru">
          <thead><tr><th>Документ</th><th>Кто выдаёт</th><th>Зачем</th></tr></thead>
          <tbody>
            <tr><td>Свидетельство о смерти</td><td>Загс по месту смерти</td><td>Подтверждение факта смерти; требуется на границе и в стране назначения</td></tr>
            <tr><td>Справка о кремации</td><td>Крематорий</td><td>Подтверждает, что в урне прах указанного лица</td></tr>
            <tr><td>Подтверждение о принятии</td><td>Мы</td><td>Подтверждает крематорию надлежащее принятие в стране назначения</td></tr>
            <tr><td>Доверенность</td><td>Вы</td><td>Даёт нам право действовать от вашего имени с крематорием и ведомствами</td></tr>
            <tr><td>Копия удостоверения</td><td>Вы</td><td>Личность заказчика</td></tr>
          </tbody>
        </table>
        </div>
        <p lang="de">Je nach Bundesland und Krematorium kommen einzelne Formulare hinzu. Wir kennen sie und beschaffen sie — Sie müssen bei keiner Behörde anrufen.</p>
        <p lang="ru">В зависимости от федеральной земли и крематория добавляются отдельные формы. Мы их знаем и получаем — вам не нужно звонить ни в одно ведомство.</p>

        <h2><span lang="de">Wie lange dauert es?</span><span lang="ru">Сколько это длится?</span></h2>
        <p lang="de">Meist ein bis zwei Wochen nach der Einäscherung. Die Zeit geht fast vollständig für Papiere drauf: Standesämter und Krematorien haben ihre eigenen Fristen. Die Fahrt selbst dauert einen Tag. Wenn es eilt — etwa weil Angehörige aus dem Ausland anreisen — sagen Sie es uns im ersten Gespräch; oft lässt sich etwas beschleunigen.</p>
        <p lang="ru">Обычно одна–две недели после кремации. Почти всё время уходит на бумаги: у загсов и крематориев свои сроки. Сама поездка занимает один день. Если спешно — например, потому что родственники приезжают из-за рубежа, — скажите нам в первом разговоре; часто что-то можно ускорить.</p>

        <h2><span lang="de">Was passiert an der Grenze?</span><span lang="ru">Что происходит на границе?</span></h2>
        <p lang="de">Die Asche eines Verstorbenen ist keine Ware. Es fallen keine Zollabgaben an. Am Grenzübergang legen wir Sterbeurkunde, Einäscherungsbescheinigung und Übernahmebestätigung vor; die Urne reist in einem versiegelten, zugelassenen Transportbehälter. Für die Weiterreise per Luftfracht in ein Drittland gelten zusätzlich die Vorschriften des Ziellandes und der Fluggesellschaft — auch das klären wir vorab.</p>
        <p lang="ru">Прах умершего — не товар. Таможенные пошлины не взимаются. На пограничном переходе мы предъявляем свидетельство о смерти, справку о кремации и подтверждение о принятии; урна перевозится в опечатанном, допущенном транспортном контейнере. Для дальнейшей авиаперевозки в третью страну дополнительно действуют правила страны назначения и авиакомпании — это мы также уточняем заранее.</p>

        <h2><span lang="de">Was kostet die Überführung?</span><span lang="ru">Сколько стоит перевозка?</span></h2>
        <p lang="de">Die Standard-Überführung Deutschland → Zug kostet bei uns <strong>490 € zum Festpreis</strong>: Erstgespräch, Unterlagen, Abholung beim Krematorium, Transportbehälter, Grenze, persönliche Übergabe. Nicht enthalten sind die Einäscherung selbst, amtliche Gebühren und beglaubigte Übersetzungen — die rechnen wir nach Aufwand ab, vorher angekündigt. Für die Weiterreise in ein anderes Land erhalten Sie innerhalb von 24 Stunden ein schriftliches Angebot.</p>
        <p lang="ru">Стандартная перевозка Германия → Цуг стоит у нас <strong>490 € по фиксированной цене</strong>: первая беседа, документы, получение урны в крематории, транспортный контейнер, граница, личная передача. Не включены сама кремация, государственные пошлины и заверенные переводы — их мы рассчитываем по фактическим затратам, предупредив заранее. Для дальнейшей перевозки в другую страну вы получите письменное предложение в течение 24 часов.</p>
        <p><a class="btn btn-text" href="index.html#festpreis"><span lang="de">Zum Festpreis im Detail</span><span lang="ru">Подробно о фиксированной цене</span></a></p>

        <h2><span lang="de">Was Sie selbst tun müssen</span><span lang="ru">Что нужно сделать вам</span></h2>
        <p lang="de">Anrufen. Eine Vollmacht unterschreiben. Die Urne in Zug in Empfang nehmen — oder uns sagen, wohin sie weiterreisen soll. Alles andere ist unsere Aufgabe.</p>
        <p lang="ru">Позвонить. Подписать доверенность. Принять урну в Цуге — или сказать нам, куда её везти дальше. Всё остальное — наша работа.</p>
        <div class="aside">
          <p lang="de"><strong>Hinweis.</strong> Dieser Text ersetzt keine Rechtsberatung. Vorschriften unterscheiden sich nach Bundesland, Kanton und Zielland; wir klären jeden Fall individuell.</p>
          <p lang="ru"><strong>Примечание.</strong> Этот текст не заменяет юридическую консультацию. Правила различаются по землям, кантонам и странам назначения; каждый случай мы проверяем индивидуально.</p>
        </div>
''' + ARTICLE_END + related('urne-ins-ausland-ueberfuehren.html') + CTA + '''
</main>
'''

# --------------------------------------------------------------- Bestattungsverfügung
verfuegung_body = article_head(
  'Bestattungsverfügung', 'Распоряжение о погребении', 'Ratgeber · Vorsorge', 'Справочник · Планирование',
  'Die Bestattungsverfügung: zu Lebzeiten festlegen, wo Sie ruhen.',
  'Распоряжение о погребении: определить при жизни, где вы будете покоиться.',
  'Wer nicht in ein Reihengrab will, sondern zur Familie, in die Berge oder nach Hause, kann das heute schon verbindlich regeln. Was in eine Bestattungsverfügung gehört, wie sie wirkt und wie wir sie hinterlegen.',
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
          <li><strong>Der Wunsch nach Überführung</strong> — «Meine Urne soll in die Schweiz überführt und dort meiner Familie ausgehändigt werden.» Nennen Sie, was danach geschehen soll: zu Hause bleiben, im Garten, an einem bestimmten Ort in der Natur, Weiterreise in ein bestimmtes Land.</li>
          <li><strong>Die verantwortliche Person</strong> — wer Ihre Verfügung umsetzt (in Deutschland «totenfürsorgeberechtigt»). Am besten mit Ersatzperson.</li>
          <li><strong>Das beauftragte Unternehmen</strong> — Seelenfrieden Urnenrückführung GmbH, Zug, mit unseren Kontaktdaten.</li>
          <li><strong>Datum und eigenhändige Unterschrift.</strong> Eine notarielle Beglaubigung ist nicht nötig, schadet aber nicht.</li>
        </ul>
        <ul lang="ru">
          <li><strong>Ваши личные данные</strong> — имя, дата рождения, адрес.</li>
          <li><strong>Вид погребения</strong> — кремация.</li>
          <li><strong>Желание перевозки</strong> — «Моя урна должна быть перевезена в Швейцарию и передана там моей семье». Укажите, что должно произойти дальше: остаться дома, в саду, в определённом месте на природе, дальнейшая перевозка в определённую страну.</li>
          <li><strong>Ответственное лицо</strong> — кто исполнит ваше распоряжение (в Германии «totenfürsorgeberechtigt»). Лучше с запасным лицом.</li>
          <li><strong>Уполномоченное предприятие</strong> — Seelenfrieden Urnenrückführung GmbH, Цуг, с нашими контактами.</li>
          <li><strong>Дата и собственноручная подпись.</strong> Нотариальное заверение не обязательно, но не повредит.</li>
        </ul>

        <h2><span lang="de">Wo die Verfügung liegen sollte</span><span lang="ru">Где должно храниться распоряжение</span></h2>
        <p lang="de">Nicht im Bankschliessfach und nicht im Testament — beides wird oft erst Wochen nach der Bestattung geöffnet. Besser: ein Exemplar bei der verantwortlichen Person, ein Exemplar bei uns, ein Hinweis in der Brieftasche. Wir hinterlegen Ihre Verfügung zusammen mit einer vorbereiteten Übernahmebestätigung, sodass im Ernstfall ein einziger Anruf genügt.</p>
        <p lang="ru">Не в банковской ячейке и не в завещании — и то и другое часто открывают лишь спустя недели после похорон. Лучше: один экземпляр у ответственного лица, один у нас, пометка в бумажнике. Мы храним ваше распоряжение вместе с заранее подготовленным подтверждением о принятии, чтобы в нужный момент хватило одного звонка.</p>

        <h2><span lang="de">Das Vorsorgegespräch</span><span lang="ru">Консультация по планированию</span></h2>
        <p lang="de">Wir helfen beim Formulieren, prüfen, ob Ihr Wunsch im Zielland umsetzbar ist, und besprechen die Kosten, die Ihre Angehörigen später erwarten — zum Festpreis, der heute schon gilt. Das Gespräch ist kostenlos und verpflichtet zu nichts. Auf Deutsch oder Russisch, bei uns in Zug, am Telefon oder per Video.</p>
        <p lang="ru">Мы помогаем с формулировкой, проверяем, осуществимо ли ваше желание в стране назначения, и обсуждаем расходы, которые ожидают ваших близких, — по фиксированной цене, действующей уже сегодня. Беседа бесплатна и ни к чему не обязывает. На немецком или русском, у нас в Цуге, по телефону или по видеосвязи.</p>
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
    'Warum in Deutschland eine Urne nicht nach Hause darf, wie die Schweiz es hält und wie die Überführung über die Grenze rechtlich und praktisch abläuft. Mit Bestattungsverfügung und häufigen Irrtümern.',
    'Почему в Германии урну нельзя забрать домой, как это устроено в Швейцарии и как проходит перевозка через границу. С распоряжением о погребении и распространёнными заблуждениями.',
    ratgeber_body, False,
    lambda path: article_ld(path, 'Der Friedhofszwang — und der Weg daran vorbei', 'Warum in Deutschland eine Urne nicht nach Hause darf, wie die Schweiz es hält und wie die Überführung über die Grenze abläuft.', PUB, PUB, 'Friedhofszwang')),
  'urne-zu-hause-aufbewahren.html': (
    'Urne zu Hause aufbewahren: In Deutschland verboten, in der Schweiz erlaubt',
    'Хранить урну дома: в Германии запрещено, в Швейцарии разрешено',
    'Darf man eine Urne zu Hause aufbewahren? In Deutschland nein, in der Schweiz ja. Was gilt, warum das für Familien wichtig ist und wie die Überführung in die Schweiz abläuft.',
    'Можно ли хранить урну дома? В Германии нет, в Швейцарии да. Что действует, почему это важно для семей и как проходит перевозка в Швейцарию.',
    zuhause_body, False,
    lambda path: article_ld(path, 'Urne zu Hause aufbewahren: in Deutschland verboten, in der Schweiz erlaubt', 'Darf man eine Urne zu Hause aufbewahren? In Deutschland nein, in der Schweiz ja — und so sieht der Weg aus.', PUB, PUB, 'Urne zu Hause aufbewahren')),
  'urne-ins-ausland-ueberfuehren.html': (
    'Urne ins Ausland überführen: Unterlagen, Dauer, Zoll, Kosten',
    'Вывезти урну за границу: документы, сроки, таможня, стоимость',
    'Eine Urne darf Deutschland verlassen. Welche Unterlagen nötig sind, wie lange es dauert, was an der Grenze passiert und was die Überführung in die Schweiz kostet: 490 € Festpreis.',
    'Урна может покинуть Германию. Какие документы нужны, сколько это длится, что происходит на границе и сколько стоит перевозка в Швейцарию: 490 € фиксированная цена.',
    ausland_body, False,
    lambda path: article_ld(path, 'Urne ins Ausland überführen: Unterlagen, Dauer, Zoll und Kosten', 'Welche Papiere nötig sind, wie lange es dauert, was an der Grenze passiert und was es kostet.', PUB, PUB, 'Urne ins Ausland überführen')),
  'bestattungsverfuegung.html': (
    'Bestattungsverfügung: Zu Lebzeiten festlegen, dass die Urne in die Schweiz darf',
    'Распоряжение о погребении: определить при жизни, что урна отправится в Швейцарию',
    'Wie Sie mit einer Bestattungsverfügung verbindlich festlegen, dass Ihre Urne in die Schweiz überführt wird: Inhalt, Wirkung, Aufbewahrung, kostenloses Vorsorgegespräch.',
    'Как распоряжением о погребении определить, что ваша урна будет перевезена в Швейцарию: содержание, действие, хранение, бесплатная консультация.',
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
for name in ['friedhofszwang.html', 'urne-zu-hause-aufbewahren.html', 'urne-ins-ausland-ueberfuehren.html', 'bestattungsverfuegung.html']:
    sitemap += url_entry(name, '0.8', 'yearly')
for name in ['impressum.html', 'datenschutz.html']:
    sitemap += url_entry(name, '0.2', 'yearly')
sitemap += '</urlset>\n'
with open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8') as f:
    f.write(sitemap)
print('wrote sitemap.xml')
