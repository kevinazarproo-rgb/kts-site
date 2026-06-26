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
  function buildFranceMap(){
    var el=document.getElementById('jrnyFrance');
    var cap=document.getElementById('jrnyFranceCap');
    var capDefault=FR?'Survolez une région · cliquez pour la sélectionner'
                     :'Hover a region · click to select it';
    if(cap)cap.innerHTML=capDefault;
    if(!el)return;
    function fallback(){
      el.className='chip-row';
      DESTS.forEach(function(it){
        var label=FR?it.fr:it.en;
        var b=document.createElement('button');b.type='button';b.className='chip';b.textContent=label;
        b.addEventListener('click',function(){selDests[label]=!selDests[label];if(!selDests[label])delete selDests[label];b.classList.toggle('on',!!selDests[label]);});
        el.appendChild(b);
      });
      resetDest=function(){el.querySelectorAll('.chip.on').forEach(function(c){c.classList.remove('on');});};
    }
    if(!(window.d3&&d3.geoConicConformal&&d3.geoPath)){fallback();return;}
    fetch('https://cdn.jsdelivr.net/gh/gregoiredavid/france-geojson@master/regions-version-simplifiee.geojson')
      .then(function(r){return r.json();})
      .then(function(geo){
        var W=520,H=500,NS='http://www.w3.org/2000/svg';
        var proj=d3.geoConicConformal().rotate([-3,0]).center([0,46.5]).parallels([44,49]);
        proj.fitExtent([[8,8],[W-8,H-8]],geo);
        var path=d3.geoPath().projection(proj);
        var svg=document.createElementNS(NS,'svg');
        svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.setAttribute('role','img');
        svg.setAttribute('aria-label',FR?'Carte des régions de France':'Map of French regions');
        var paths=[];
        geo.features.forEach(function(f){
          var p=document.createElementNS(NS,'path');
          p.setAttribute('d',path(f));p.setAttribute('class','fr-region');
          var nom=(f.properties&&(f.properties.nom||f.properties.name))||'';
          p.addEventListener('click',function(){
            selDests[nom]=!selDests[nom];if(!selDests[nom])delete selDests[nom];
            p.classList.toggle('on',!!selDests[nom]);
            if(cap)cap.innerHTML=selDests[nom]?('<b>'+nom+'</b>'):capDefault;
          });
          paths.push(p);svg.appendChild(p);
        });
        el.appendChild(svg);
        resetDest=function(){paths.forEach(function(p){p.classList.remove('on');});if(cap)cap.innerHTML=capDefault;};
      })
      .catch(function(){fallback();});
  }
  buildChips(document.getElementById('jrnyThemes'),THEMES,selThemes);
  buildFranceMap();
  buildChips(document.getElementById('jrnyDestExtra'),[{en:'Seychelles',fr:'Seychelles'}],selDests);
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
