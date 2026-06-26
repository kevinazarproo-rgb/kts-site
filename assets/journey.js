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
    {en:'Paris',fr:'Paris'},{en:'French Riviera',fr:"Côte d'Azur"},{en:'Provence',fr:'Provence'},
    {en:'Loire Valley',fr:'Val de Loire'},{en:'Alsace',fr:'Alsace'},{en:'Bordeaux',fr:'Bordeaux'},
    {en:'Burgundy',fr:'Bourgogne'},{en:'French Alps',fr:'Alpes'},{en:'Seychelles',fr:'Seychelles'},
    {en:'Corsica',fr:'Corse'},{en:'Normandy',fr:'Normandie'}
  ];

  var selThemes={},selDests={};
  function buildChips(row,items,store){
    if(!row)return;
    items.forEach(function(it){
      var label=FR?it.fr:it.en;
      var b=document.createElement('button');b.type='button';b.className='chip';b.textContent=label;
      b.addEventListener('click',function(){store[label]=!store[label];b.classList.toggle('on',store[label]);});
      row.appendChild(b);
    });
  }
  buildChips(document.getElementById('jrnyThemes'),THEMES,selThemes);
  buildChips(document.getElementById('jrnyDests'),DESTS,selDests);

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
    data.append('Destinations',dests.length?dests.join(', '):TXT.none);
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
          form.reset();selThemes={};selDests={};
          form.querySelectorAll('.chip.on').forEach(function(c){c.classList.remove('on');});
        }else{throw new Error('fail');}
      })
      .catch(function(){if(statusEl){statusEl.className='cform-status err';statusEl.textContent=TXT.err;}})
      .finally(function(){if(btn){btn.disabled=false;btn.textContent=bl;}});
  });
})();
