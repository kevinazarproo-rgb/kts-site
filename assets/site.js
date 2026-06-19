/* KTS · scripts partagés (accueil + pages destination) */
(function(){
  /* nav : devient fixe/claire après le hero */
  var nav=document.getElementById('nav');
  var heroEl=document.querySelector('.hero');
  if(nav){
    var threshold=function(){return (heroEl?heroEl.offsetHeight:window.innerHeight)-90;};
    addEventListener('scroll',function(){nav.classList.toggle('scrolled',scrollY>threshold())},{passive:true});
  }

  /* reveal au scroll */
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});

  /* menu overlay */
  var menu=document.getElementById('menuOverlay');
  function closeMenu(){if(menu){menu.classList.remove('open');menu.setAttribute('aria-hidden','true')}}
  function openMenu(e){if(e)e.preventDefault();if(menu){menu.classList.add('open');menu.setAttribute('aria-hidden','false')}}
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

  /* sélecteur de langue : FR actif, EN à venir */
  var fr=document.getElementById('langFr'); if(fr)fr.addEventListener('click',function(e){e.preventDefault()});
  var en=document.getElementById('langEn'); if(en)en.addEventListener('click',function(e){e.preventDefault()});

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
})();
