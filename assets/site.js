/* KTS · scripts partagés (accueil + pages destination) */
(function(){
  /* nav : devient fixe/claire après le hero */
  var nav=document.getElementById('nav');
  if(nav){
    var onScroll=function(){nav.classList.toggle('scrolled',scrollY>60)};
    addEventListener('scroll',onScroll,{passive:true});
    onScroll();
  }

  /* reveal au scroll */
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});

  /* menu overlay */
  var menu=document.getElementById('menuOverlay');
  function closeMenu(){if(menu){menu.classList.remove('open');menu.setAttribute('aria-hidden','true')}}
  function openMenu(e){if(e)e.preventDefault();if(menu){menu.classList.add('open');menu.setAttribute('aria-hidden','false');var sub=document.getElementById('subDest');var acc=document.getElementById('accDest');if(sub)sub.classList.add('open');if(acc){acc.classList.add('open');acc.setAttribute('aria-expanded','true')}}}
  var btnMenu=document.getElementById('btnMenu');
  if(btnMenu)btnMenu.addEventListener('click',openMenu);
  var btnMenuBar=document.getElementById('btnMenuBar');
  if(btnMenuBar)btnMenuBar.addEventListener('click',openMenu);
  var mc=document.getElementById('menuClose'); if(mc)mc.addEventListener('click',closeMenu);
  if(menu)menu.querySelectorAll('[data-menu]').forEach(function(a){a.addEventListener('click',closeMenu)});
  addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu()});

  /* recherche : focus le champ du hero si présent, sinon retour accueil */
  function goSearch(e){
    if(e)e.preventDefault();
    closeMenu();
    var input=document.getElementById('heroSearch');
    if(input){window.scrollTo({top:0,behavior:'smooth'});setTimeout(function(){input.focus()},450);}
    else{location.href='index.html#inspirations';}
  }
  var bs=document.getElementById('btnSearch'); if(bs)bs.addEventListener('click',goSearch);
  var ms=document.getElementById('menuSearch'); if(ms)ms.addEventListener('click',goSearch);

  /* menu : accordéon Destinations */
  var acc=document.getElementById('accDest');
  if(acc){
    acc.addEventListener('click',function(){
      var sub=document.getElementById('subDest');
      var open=acc.classList.toggle('open');
      if(sub)sub.classList.toggle('open',open);
      acc.setAttribute('aria-expanded',open);
    });
  }

  /* sélecteur de langue : liens réels (la langue active n'est pas cliquable) */
  document.querySelectorAll('.nav-lang a').forEach(function(a){
    a.addEventListener('click',function(e){ if(this.getAttribute('href')==='#') e.preventDefault(); });
  });

  /* diaporama hero : fondu enchaîné automatique (effet vidéo) */
  var slides=document.querySelectorAll('.hero-slide');
  if(slides.length>1){
    var i=0;
    setInterval(function(){
      slides[i].classList.remove('active');
      i=(i+1)%slides.length;
      slides[i].classList.add('active');
    },5000);
  }

  /* ===== Cookies / Google Analytics (consentement RGPD) ===== */
  var GA_ID='G-XXXXXXXXXX';                 /* <-- remplacer par l'identifiant GA4 réel */
  var CONFIGURED=GA_ID.indexOf('XXXX')===-1;
  var CKEY='kts-consent';
  var isFr=(document.documentElement.lang||'').toLowerCase().indexOf('fr')===0;
  function getConsent(){try{return localStorage.getItem(CKEY);}catch(e){return null;}}
  function setConsent(v){try{localStorage.setItem(CKEY,v);}catch(e){}}
  function loadGA(){
    if(!CONFIGURED||window.__gaLoaded)return;
    window.__gaLoaded=true;
    var s=document.createElement('script');s.async=true;
    s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;
    document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('js',new Date());
    window.gtag('config',GA_ID,{anonymize_ip:true});
  }
  function showBanner(){
    if(document.getElementById('ktsCookie'))return;
    var txt=isFr
      ?"Nous utilisons des cookies de mesure d'audience pour améliorer votre expérience."
      :"We use analytics cookies to improve your experience.";
    var more=isFr?"En savoir plus":"Learn more";
    var href=isFr?"cookies-fr.html":"cookies.html";
    var accept=isFr?"Accepter":"Accept";
    var refuse=isFr?"Refuser":"Decline";
    var b=document.createElement('div');
    b.className='cookie-banner';b.id='ktsCookie';b.setAttribute('role','dialog');b.setAttribute('aria-live','polite');
    b.innerHTML='<p>'+txt+' <a href="'+href+'">'+more+'</a></p>'+
      '<div class="cookie-actions">'+
      '<button type="button" class="cookie-refuse">'+refuse+'</button>'+
      '<button type="button" class="cookie-accept">'+accept+'</button></div>';
    document.body.appendChild(b);
    b.querySelector('.cookie-accept').addEventListener('click',function(){setConsent('granted');b.remove();loadGA();});
    b.querySelector('.cookie-refuse').addEventListener('click',function(){setConsent('denied');b.remove();});
  }
  /* permet de rouvrir le choix (ex. lien "Gestion des cookies") */
  window.ktsCookiePrefs=function(e){if(e)e.preventDefault();showBanner();};
  if(CONFIGURED){
    var c=getConsent();
    if(c==='granted')loadGA();
    else if(c!=='denied')showBanner();
  }
})();
