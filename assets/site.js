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

  /* ===== Recherche d'expérience (hero) ===== */
  (function(){
    var form=document.getElementById('heroForm');
    var input=document.getElementById('heroSearch');
    if(!form||!input)return;
    var fr=(document.documentElement.lang||'').toLowerCase().indexOf('fr')===0;
    var T={dest:fr?'Destination':'Destination',exp:fr?'Expérience':'Experience',serv:'Expertise',contact:'Contact'};
    var sfx=fr?'-fr':'';
    function u(base){return base+sfx+'.html';}
    var DATA=fr?[
      {l:'Paris',u:u('paris'),t:'dest',k:'paris ville tour eiffel seine louvre capitale'},
      {l:"Côte d'Azur",u:u('cote-azur'),t:'dest',k:'cote azur riviera nice cannes monaco saint tropez mer plage yacht'},
      {l:'Provence',u:u('provence'),t:'dest',k:'provence lavande marches vin rose luberon'},
      {l:'Val de Loire',u:u('val-de-loire'),t:'dest',k:'val loire chateaux jardins renaissance fleuve'},
      {l:'Alsace',u:u('alsace'),t:'dest',k:'alsace strasbourg colmar route des vins marches de noel colombages'},
      {l:'Bordeaux',u:u('bordeaux'),t:'dest',k:'bordeaux vin vignobles atlantique'},
      {l:'Bourgogne',u:u('bourgogne'),t:'dest',k:'bourgogne vin grands crus beaune dijon abbayes'},
      {l:'Alpes',u:u('mont-blanc'),t:'dest',k:'alpes mont blanc ski montagne chalet chamonix megeve courchevel val isere neige'},
      {l:'Seychelles',u:u('seychelles'),t:'dest',k:'seychelles iles plage lagon plongee'},
      {l:'Corse',u:u('corse'),t:'dest',k:'corse plage plongee montagne mer criques'},
      {l:'Normandie',u:u('normandie'),t:'dest',k:'normandie mont saint michel etretat debarquement giverny monet cidre fruits de mer'},
      {l:'Vignobles & dégustation',u:u('bordeaux'),t:'exp',k:'vin vignoble degustation oenologie cave chateau'},
      {l:'Ski & montagne',u:u('mont-blanc'),t:'exp',k:'ski snowboard montagne chalet neige randonnee'},
      {l:'Champs de lavande',u:u('provence'),t:'exp',k:'lavande champs provence ete'},
      {l:'Châteaux & jardins',u:u('val-de-loire'),t:'exp',k:'chateaux jardins renaissance loire'},
      {l:'Marchés de Noël',u:u('alsace'),t:'exp',k:'marche de noel alsace hiver'},
      {l:'Plages & îles',u:u('seychelles'),t:'exp',k:'plage ile lagon mer plongee snorkeling'},
      {l:'Plages du Débarquement',u:u('normandie'),t:'exp',k:'debarquement d-day histoire normandie plages'},
      {l:'Jardins de Monet à Giverny',u:u('normandie'),t:'exp',k:'monet giverny jardins impressionnisme nympheas'},
      {l:'Voyages VIP',u:u('expertise')+'#vip-travel',t:'serv',k:'vip luxe prive conciergerie'},
      {l:'MICE & conventions',u:u('expertise'),t:'serv',k:'mice convention seminaire entreprise evenement congres'},
      {l:'Voyages de groupe',u:u('expertise')+'#group-travel',t:'serv',k:'groupe voyage collectif'},
      {l:'Programmes incentive',u:u('expertise'),t:'serv',k:'incentive motivation entreprise recompense'},
      {l:'Demander un devis',u:u('contact'),t:'contact',k:'devis contact demande sur mesure'}
    ]:[
      {l:'Paris',u:u('paris'),t:'dest',k:'paris city eiffel seine louvre capital'},
      {l:'French Riviera',u:u('cote-azur'),t:'dest',k:'french riviera cote azur nice cannes monaco saint tropez sea beach yacht'},
      {l:'Provence',u:u('provence'),t:'dest',k:'provence lavender markets wine rose luberon'},
      {l:'Loire Valley',u:u('val-de-loire'),t:'dest',k:'loire valley chateaux castles gardens renaissance river'},
      {l:'Alsace',u:u('alsace'),t:'dest',k:'alsace strasbourg colmar wine route christmas markets'},
      {l:'Bordeaux',u:u('bordeaux'),t:'dest',k:'bordeaux wine vineyards atlantic'},
      {l:'Burgundy',u:u('bourgogne'),t:'dest',k:'burgundy bourgogne wine grands crus beaune dijon abbeys'},
      {l:'French Alps',u:u('mont-blanc'),t:'dest',k:'alps mont blanc ski mountain chalet chamonix megeve courchevel val isere snow'},
      {l:'Seychelles',u:u('seychelles'),t:'dest',k:'seychelles islands beach lagoon diving'},
      {l:'Corsica',u:u('corse'),t:'dest',k:'corsica corse beach diving mountains sea coves'},
      {l:'Normandy',u:u('normandie'),t:'dest',k:'normandy mont saint michel etretat d-day giverny monet cider seafood'},
      {l:'Wine & vineyards',u:u('bordeaux'),t:'exp',k:'wine vineyard tasting oenology cellar chateau'},
      {l:'Skiing & mountains',u:u('mont-blanc'),t:'exp',k:'ski snowboard mountain chalet snow hiking'},
      {l:'Lavender fields',u:u('provence'),t:'exp',k:'lavender fields provence summer'},
      {l:'Châteaux & gardens',u:u('val-de-loire'),t:'exp',k:'chateaux castles gardens renaissance loire'},
      {l:'Christmas markets',u:u('alsace'),t:'exp',k:'christmas markets alsace winter'},
      {l:'Beaches & islands',u:u('seychelles'),t:'exp',k:'beach island lagoon sea diving snorkeling'},
      {l:'D-Day beaches',u:u('normandie'),t:'exp',k:'d-day landing history normandy beaches'},
      {l:"Monet's garden at Giverny",u:u('normandie'),t:'exp',k:'monet giverny gardens impressionism water lilies'},
      {l:'VIP travel',u:u('expertise')+'#vip-travel',t:'serv',k:'vip luxury private concierge'},
      {l:'MICE & conventions',u:u('expertise'),t:'serv',k:'mice convention seminar corporate event congress'},
      {l:'Group travel',u:u('expertise')+'#group-travel',t:'serv',k:'group travel collective'},
      {l:'Incentive programmes',u:u('expertise'),t:'serv',k:'incentive motivation corporate reward'},
      {l:'Request a quote',u:u('contact'),t:'contact',k:'quote contact request tailor made'}
    ];
    function norm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
    DATA.forEach(function(d){d._h=norm(d.l+' '+d.k);});
    function search(q){
      q=norm(q).trim();if(!q)return [];
      var toks=q.split(/\s+/);
      var res=DATA.filter(function(d){return toks.every(function(t){return d._h.indexOf(t)!==-1;});});
      res.sort(function(a,b){
        var as=norm(a.l).indexOf(q)===0?0:1,bs=norm(b.l).indexOf(q)===0?0:1;
        if(as!==bs)return as-bs;return 0;
      });
      return res.slice(0,6);
    }
    var box=document.createElement('div');box.className='hero-ac';box.hidden=true;form.appendChild(box);
    var active=-1,current=[];
    function render(list){
      current=list;active=-1;
      if(!list.length){box.hidden=true;box.innerHTML='';return;}
      box.innerHTML=list.map(function(d,i){
        return '<a href="'+d.u+'" data-i="'+i+'"><span>'+d.l+'</span><span class="tag">'+T[d.t]+'</span></a>';
      }).join('');
      box.hidden=false;
    }
    function go(d){if(d)location.href=d.u;}
    input.addEventListener('input',function(){render(search(input.value));});
    input.addEventListener('focus',function(){if(input.value)render(search(input.value));});
    input.addEventListener('keydown',function(e){
      if(box.hidden)return;
      if(e.key==='ArrowDown'){e.preventDefault();active=Math.min(active+1,current.length-1);}
      else if(e.key==='ArrowUp'){e.preventDefault();active=Math.max(active-1,0);}
      else if(e.key==='Escape'){box.hidden=true;return;}
      else return;
      Array.prototype.forEach.call(box.children,function(a,i){a.classList.toggle('active',i===active);});
    });
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(active>=0&&current[active]){go(current[active]);return;}
      if(current.length){go(current[0]);return;}
      var insp=document.getElementById('inspirations');
      if(insp)insp.scrollIntoView({behavior:'smooth'});
    });
    document.addEventListener('click',function(e){if(!form.contains(e.target))box.hidden=true;});
  })();

  /* ===== Cookies / Google Analytics (consentement RGPD) ===== */
  var GA_ID='G-SEWDZPZHZH';                 /* identifiant GA4 KTS */
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
