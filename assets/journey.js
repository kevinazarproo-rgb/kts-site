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
    {en:'Paris',fr:'Paris',x:47,y:37},
    {en:'French Riviera',fr:"Côte d'Azur",x:79,y:74},
    {en:'Provence',fr:'Provence',x:67,y:72},
    {en:'Loire Valley',fr:'Val de Loire',x:41,y:47},
    {en:'Alsace',fr:'Alsace',x:80,y:33},
    {en:'Bordeaux',fr:'Bordeaux',x:30,y:64},
    {en:'Burgundy',fr:'Bourgogne',x:63,y:48},
    {en:'French Alps',fr:'Alpes',x:76,y:58},
    {en:'Corsica',fr:'Corse',x:88,y:90},
    {en:'Normandy',fr:'Normandie',x:33,y:30},
    {en:'Seychelles',fr:'Seychelles',offmap:true}
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
  function buildDestMap(){
    var listEl=document.getElementById('jrnyDestList');
    var pinsEl=document.getElementById('jrnyDestPins');
    if(!listEl)return;
    DESTS.forEach(function(it){
      var label=FR?it.fr:it.en;
      var li=document.createElement('button');li.type='button';
      li.innerHTML='<span class="dot"></span>'+label;
      listEl.appendChild(li);
      var pin=null;
      if(pinsEl&&typeof it.x==='number'){
        pin=document.createElement('button');pin.type='button';pin.className='fmap-pin';
        pin.style.left=it.x+'%';pin.style.top=it.y+'%';
        pin.innerHTML='<span class="lbl">'+label+'</span>';
        pinsEl.appendChild(pin);
      }
      function toggle(){
        selDests[label]=!selDests[label];
        li.classList.toggle('on',selDests[label]);
        if(pin)pin.classList.toggle('on',selDests[label]);
      }
      li.addEventListener('click',toggle);
      if(pin)pin.addEventListener('click',toggle);
    });
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
          form.querySelectorAll('.chip.on,.fmap-pin.on,.fmap-list button.on').forEach(function(c){c.classList.remove('on');});
        }else{throw new Error('fail');}
      })
      .catch(function(){if(statusEl){statusEl.className='cform-status err';statusEl.textContent=TXT.err;}})
      .finally(function(){if(btn){btn.disabled=false;btn.textContent=bl;}});
  });
})();
