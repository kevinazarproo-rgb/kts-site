/* KTS · Compose your journey — formulaire simple (chips + texte -> email) */
(function(){
  var form=document.getElementById('jrnyForm');
  if(!form)return;
  var FR=(document.documentElement.lang||'').toLowerCase().indexOf('fr')===0;

  var TXT=FR?{
    sending:"Envoi en cours…",
    ok:"Merci ! Votre demande a bien été envoyée — notre équipe vous répond sous un jour ouvré.",
    err:"Désolé, une erreur est survenue. Écrivez-nous directement à groups@ktstravel.com.",
    none:"(aucune)"
  }:{
    sending:"Sending…",
    ok:"Thank you! Your request has been sent — our team will reply within one business day.",
    err:"Sorry, something went wrong. Please email us directly at groups@ktstravel.com.",
    none:"(none)"
  };

  var THEMES=[
    {id:'gastronomy',en:'Gastronomy & wine',fr:'Gastronomie & vin'},
    {id:'nature',en:'Nature & outdoors',fr:'Nature & grands espaces'},
    {id:'culture',en:'Culture & heritage',fr:'Culture & patrimoine'},
    {id:'beach',en:'Beaches & sea',fr:'Plages & mer'},
    {id:'mountain',en:'Mountains & ski',fr:'Montagne & ski'},
    {id:'romance',en:'Romance',fr:'Romantique'},
    {id:'family',en:'Family',fr:'Famille'},
    {id:'art',en:'Art & gardens',fr:'Art & jardins'},
    {id:'history',en:'History',fr:'Histoire'},
    {id:'vip',en:'VIP & luxury',fr:'VIP & luxe'},
    {id:'wellness',en:'Wellness & spa',fr:'Bien-être & spa'},
    {id:'gastro2',en:'Fine dining',fr:'Tables étoilées'},
    {id:'sailing',en:'Sailing & boats',fr:'Voile & bateau'},
    {id:'golf',en:'Golf',fr:'Golf'},
    {id:'adventure',en:'Sport & adventure',fr:'Sport & aventure'},
    {id:'shopping',en:'Shopping & fashion',fr:'Shopping & mode'},
    {id:'nightlife',en:'Nightlife',fr:'Vie nocturne'},
    {id:'photo',en:'Photography',fr:'Photographie'},
    {id:'festivals',en:'Festivals & events',fr:'Festivals & événements'},
    {id:'local',en:'Local life & markets',fr:'Vie locale & marchés'}
  ];
  var DESTS=[
    {en:'Paris',fr:'Paris',lat:48.85,lng:2.35},
    {en:'French Riviera',fr:"Côte d'Azur",lat:43.70,lng:7.27},
    {en:'Provence',fr:'Provence',lat:43.95,lng:4.81},
    {en:'Loire Valley',fr:'Val de Loire',lat:47.39,lng:0.69},
    {en:'Alsace',fr:'Alsace',lat:48.58,lng:7.75},
    {en:'Bordeaux',fr:'Bordeaux',lat:44.84,lng:-0.58},
    {en:'Burgundy',fr:'Bourgogne',lat:47.32,lng:5.04},
    {en:'French Alps',fr:'Alpes',lat:45.92,lng:6.87},
    {en:'Corsica',fr:'Corse',lat:42.04,lng:9.01},
    {en:'Normandy',fr:'Normandie',lat:49.18,lng:-0.37},
    {en:'Seychelles',fr:'Seychelles',lat:-4.62,lng:55.45}
  ];

  var TYPES=[
    {en:'Tailor-made journey',fr:'Séjour sur mesure'},
    {en:'Group travel',fr:'Voyage de groupe'},
    {en:'MICE & conventions',fr:'MICE & conventions'},
    {en:'Incentive',fr:'Incentive'},
    {en:'VIP travel',fr:'Voyage VIP'}
  ];

  var selThemes={},selDests={},selTypes={};
  function buildChips(row,items,store){
    if(!row)return;
    items.forEach(function(it){
      var label=FR?it.fr:it.en;
      var b=document.createElement('button');b.type='button';b.className='chip';b.textContent=label;
      b.addEventListener('click',function(){store[label]=!store[label];b.classList.toggle('on',store[label]);});
      row.appendChild(b);
    });
  }
  var resetDest=function(){};
  function buildDestMap(){
    var listEl=document.getElementById('jrnyDestList');
    if(!listEl)return;
    var pts=DESTS.map(function(it){return {lat:it.lat,lng:it.lng,label:FR?it.fr:it.en};});
    var liByLabel={},world=null;
    function toggle(label){
      selDests[label]=!selDests[label];if(!selDests[label])delete selDests[label];
      if(liByLabel[label])liByLabel[label].classList.toggle('on',!!selDests[label]);
      if(world)world.pointsData(pts);
    }
    DESTS.forEach(function(it){
      var label=FR?it.fr:it.en;
      var li=document.createElement('button');li.type='button';
      li.innerHTML='<span class="dot"></span>'+label;
      li.addEventListener('click',function(){
        toggle(label);
        if(world&&selDests[label])world.pointOfView({lat:it.lat,lng:it.lng,altitude:1.6},900);
      });
      liByLabel[label]=li;listEl.appendChild(li);
    });
    var gEl=document.getElementById('jrnyGlobe');
    if(gEl&&window.Globe){
      try{
        world=window.Globe()(gEl)
          .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
          .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
          .backgroundColor('rgba(0,0,0,0)')
          .pointsData(pts).pointLat('lat').pointLng('lng')
          .pointColor(function(d){return selDests[d.label]?'#7fb4ff':'#ffffff';})
          .pointAltitude(0.03).pointRadius(0.6)
          .pointLabel(function(d){return d.label;})
          .onPointClick(function(d){toggle(d.label);});
        var c=world.controls();c.autoRotate=true;c.autoRotateSpeed=0.7;c.enableZoom=false;
        var size=function(){world.width(gEl.clientWidth||400).height(gEl.clientHeight||360);};
        size();world.pointOfView({lat:30,lng:12,altitude:2.3});
        window.addEventListener('resize',size);
      }catch(e){world=null;}
    }
    resetDest=function(){
      Object.keys(liByLabel).forEach(function(k){liByLabel[k].classList.remove('on');});
      if(world)world.pointsData(pts);
    };
  }
  buildChips(document.getElementById('jrnyThemes'),THEMES,selThemes);
  buildDestMap();
  buildChips(document.getElementById('jrnyTypes'),TYPES,selTypes);

  function picked(store){return Object.keys(store).filter(function(k){return store[k];});}

  var statusEl=document.getElementById('jrnyStatus');
  var btn=form.querySelector('button[type="submit"]');var bl=btn?btn.textContent:'';
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var honey=form.querySelector('[name="_honey"]');if(honey&&honey.value)return;
    var g=function(id){return (document.getElementById(id)||{}).value||'';};
    var who=(g('jf-first')+' '+g('jf-last')).trim();
    var dests=picked(selDests),themes=picked(selThemes);
    var data=new FormData();
    data.append('Name',who);
    data.append('email',g('jf-email'));
    data.append('Phone',g('jf-phone'));
    var types=picked(selTypes);
    data.append('Destinations',dests.length?dests.join(', '):TXT.none);
    data.append(FR?'Type de voyage':'Trip type',types.length?types.join(', '):TXT.none);
    data.append(FR?'Centres d\'intérêt':'Interests',themes.length?themes.join(', '):TXT.none);
    data.append('Dates',g('jf-dates'));
    data.append(FR?'Voyageurs':'Travellers',g('jf-people'));
    data.append('Message',g('jf-text'));
    data.append('Request type',FR?'Composez votre voyage':'Compose your journey');
    data.append('_subject',(FR?'Projet de voyage — ':'Journey request — ')+who);
    data.append('_template','table');data.append('_captcha','false');
    if(statusEl){statusEl.hidden=false;statusEl.className='cform-status';statusEl.textContent=TXT.sending;}
    if(btn){btn.disabled=true;btn.textContent=TXT.sending;}
    fetch('https://formsubmit.co/ajax/groups@ktstravel.com',{method:'POST',body:data,headers:{'Accept':'application/json'}})
      .then(function(r){return r.json();})
      .then(function(res){
        if(res&&(res.success===true||res.success==='true')){
          if(statusEl){statusEl.className='cform-status ok';statusEl.textContent=TXT.ok;}
          form.reset();selThemes={};selDests={};selTypes={};
          form.querySelectorAll('.chip.on').forEach(function(c){c.classList.remove('on');});
          resetDest();
        }else{throw new Error('fail');}
      })
      .catch(function(){if(statusEl){statusEl.className='cform-status err';statusEl.textContent=TXT.err;}})
      .finally(function(){if(btn){btn.disabled=false;btn.textContent=bl;}});
  });
})();
