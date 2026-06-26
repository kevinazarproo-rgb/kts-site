/* KTS · Compose your journey — moteur de suggestions (fallback local + crochet IA) */
(function(){
  var root=document.getElementById('jrnyPrefs');
  if(!root)return;
  var FR=(document.documentElement.lang||'').toLowerCase().indexOf('fr')===0;

  /* >>> Pour activer l'IA plus tard : coller ici l'URL du Worker Cloudflare (ex. https://kts-ia.xxx.workers.dev). Laisser vide = moteur local. */
  var AI_ENDPOINT='';

  var TXT=FR?{
    intro:"Voici quelques idées qui correspondent à vos envies. Ajoutez celles qui vous plaisent, puis envoyez-nous votre sélection.",
    none:"Aucune idée ne correspond exactement — décrivez votre projet ci-dessous, notre équipe composera tout sur mesure.",
    emptySel:"Votre sélection est vide. Ajoutez des expériences ci-dessus, ou décrivez simplement votre projet dans le message.",
    add:"Ajouter",added:"Ajouté ✓",thinking:"Recherche…",see:"Voir les suggestions",
    sending:"Envoi en cours…",ok:"Merci ! Votre projet de voyage a bien été envoyé — notre équipe vous répond sous un jour ouvré.",
    err:"Désolé, une erreur est survenue. Écrivez-nous directement à groups@ktstravel.com.",
    selected:"Expériences sélectionnées"
  }:{
    intro:"Here are a few ideas that match your wishes. Add the ones you like, then send us your selection.",
    none:"Nothing matched exactly — describe your project below and our team will craft it from scratch.",
    emptySel:"Your selection is empty. Add experiences above, or simply describe your project in the message.",
    add:"Add",added:"Added ✓",thinking:"Searching…",see:"See suggestions",
    sending:"Sending…",ok:"Thank you! Your journey request has been sent — our team will reply within one business day.",
    err:"Sorry, something went wrong. Please email us directly at groups@ktstravel.com.",
    selected:"Selected experiences"
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
    {id:'wellness',en:'Wellness',fr:'Bien-être'}
  ];
  var DESTS=[
    {id:'paris',en:'Paris',fr:'Paris',url:'paris'},
    {id:'riviera',en:'French Riviera',fr:"Côte d'Azur",url:'cote-azur'},
    {id:'provence',en:'Provence',fr:'Provence',url:'provence'},
    {id:'loire',en:'Loire Valley',fr:'Val de Loire',url:'val-de-loire'},
    {id:'alsace',en:'Alsace',fr:'Alsace',url:'alsace'},
    {id:'bordeaux',en:'Bordeaux',fr:'Bordeaux',url:'bordeaux'},
    {id:'burgundy',en:'Burgundy',fr:'Bourgogne',url:'bourgogne'},
    {id:'alps',en:'French Alps',fr:'Alpes',url:'mont-blanc'},
    {id:'seychelles',en:'Seychelles',fr:'Seychelles',url:'seychelles'},
    {id:'corsica',en:'Corsica',fr:'Corse',url:'corse'},
    {id:'normandy',en:'Normandy',fr:'Normandie',url:'normandie'}
  ];
  function img(p){return p;}
  var CAT=[
    {id:'paris-louvre',dest:'paris',th:['culture','art','vip'],img:'https://images.pexels.com/photos/32469438/pexels-photo-32469438.jpeg?auto=compress&cs=tinysrgb&w=600',en:'Private Louvre after hours',fr:'Louvre privatisé en nocturne',ben:'Walk the empty galleries with a curator, the Mona Lisa to yourselves.',bfr:'Parcourez les galeries désertes avec un conservateur, la Joconde rien que pour vous.'},
    {id:'paris-seine',dest:'paris',th:['romance','gastronomy'],img:'https://images.unsplash.com/photo-1526821799652-2dc51675628e?auto=format&fit=crop&w=600&q=70',en:'Seine dinner cruise',fr:'Dîner-croisière sur la Seine',ben:'A candlelit dinner gliding past a floodlit Eiffel Tower.',bfr:'Un dîner aux chandelles au fil de l\'eau, sous la Tour Eiffel illuminée.'},
    {id:'riviera-yacht',dest:'riviera',th:['beach','vip','romance'],img:'https://images.pexels.com/photos/27935944/pexels-photo-27935944.jpeg?auto=compress&cs=tinysrgb&w=600',en:'Private yacht day on the Riviera',fr:'Journée en yacht privé sur la Riviera',ben:'Cruise from Saint-Tropez to the Lérins islands, lunch on board.',bfr:'De Saint-Tropez aux îles de Lérins, déjeuner à bord.'},
    {id:'riviera-monaco',dest:'riviera',th:['vip','culture'],img:'https://images.pexels.com/photos/13136997/pexels-photo-13136997.jpeg?auto=compress&cs=tinysrgb&w=600',en:'Monaco glamour & casino',fr:'Monaco glamour & casino',ben:'Supercars, the Casino de Monte-Carlo and a harbour-view suite.',bfr:'Belles voitures, Casino de Monte-Carlo et suite avec vue sur le port.'},
    {id:'provence-lavender',dest:'provence',th:['nature','romance'],img:'https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=600&q=70',en:'Lavender fields & hilltop villages',fr:'Champs de lavande & villages perchés',ben:'Sunrise over the Valensole plateau, then Gordes and Roussillon.',bfr:'Lever de soleil sur le plateau de Valensole, puis Gordes et Roussillon.'},
    {id:'provence-rose',dest:'provence',th:['gastronomy'],img:'https://images.pexels.com/photos/2954929/pexels-photo-2954929.jpeg?auto=compress&cs=tinysrgb&w=600',en:'Rosé estate tasting',fr:'Dégustation dans un domaine de rosé',ben:'A private tasting at a Provence wine estate with the cellar master.',bfr:'Dégustation privée dans un domaine provençal avec le maître de chai.'},
    {id:'loire-chateaux',dest:'loire',th:['culture','history','family'],img:'https://images.unsplash.com/photo-1650869653858-1c2c0768014f?auto=format&fit=crop&w=600&q=70',en:'Royal châteaux of the Loire',fr:'Châteaux royaux de la Loire',ben:'Chambord and Chenonceau with private access before the crowds.',bfr:'Chambord et Chenonceau en accès privé, avant la foule.'},
    {id:'loire-balloon',dest:'loire',th:['romance','nature','family'],img:'https://images.pexels.com/photos/33890730/pexels-photo-33890730.jpeg?auto=compress&cs=tinysrgb&w=600',en:'Hot-air balloon over the valley',fr:'Montgolfière au-dessus de la vallée',ben:'Float over châteaux and vineyards at dawn, Champagne on landing.',bfr:'Survol des châteaux et vignobles à l\'aube, Champagne à l\'atterrissage.'},
    {id:'alsace-wineroute',dest:'alsace',th:['gastronomy','culture'],img:'https://images.unsplash.com/photo-1588365399397-f09fd8745464?auto=format&fit=crop&w=600&q=70',en:'Wine Route & Colmar',fr:'Route des Vins & Colmar',ben:'Half-timbered villages, grands crus and a stop in storybook Colmar.',bfr:'Villages à colombages, grands crus et halte dans le Colmar de carte postale.'},
    {id:'alsace-xmas',dest:'alsace',th:['family','culture'],img:'https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=600&q=70',en:'Christmas markets of Alsace',fr:'Marchés de Noël d\'Alsace',ben:'Strasbourg and Colmar aglow, mulled wine and artisan stalls.',bfr:'Strasbourg et Colmar illuminés, vin chaud et stands d\'artisans.'},
    {id:'bordeaux-grandcru',dest:'bordeaux',th:['gastronomy','vip'],img:'https://images.unsplash.com/photo-1493564738392-d148cfbd6eda?auto=format&fit=crop&w=600&q=70',en:'Grand Cru château tasting',fr:'Dégustation dans un château Grand Cru',ben:'Behind the gates of a classified Médoc estate, vertical tasting included.',bfr:'Derrière les grilles d\'un cru classé du Médoc, dégustation verticale incluse.'},
    {id:'bordeaux-oysters',dest:'bordeaux',th:['gastronomy','nature'],img:'https://images.pexels.com/photos/33890730/pexels-photo-33890730.jpeg?auto=compress&cs=tinysrgb&w=600',en:'Atlantic oysters & dunes',fr:'Huîtres de l\'Atlantique & dunes',ben:'Oysters at Arcachon, then the great Dune du Pilat at golden hour.',bfr:'Huîtres au bassin d\'Arcachon, puis la Dune du Pilat à l\'heure dorée.'},
    {id:'burgundy-cycling',dest:'burgundy',th:['gastronomy','nature'],img:'https://images.pexels.com/photos/2954929/pexels-photo-2954929.jpeg?auto=compress&cs=tinysrgb&w=600',en:'Grands Crus cycling route',fr:'Route des Grands Crus à vélo',ben:'Pedal the legendary vineyard road from Beaune, tastings along the way.',bfr:'La mythique route des vignes depuis Beaune, dégustations en chemin.'},
    {id:'burgundy-beaune',dest:'burgundy',th:['culture','history'],img:'https://images.unsplash.com/photo-1493564738392-d148cfbd6eda?auto=format&fit=crop&w=600&q=70',en:'Hospices de Beaune',fr:'Hospices de Beaune',ben:'The glazed-tile masterpiece and a private cellar beneath the town.',bfr:'Le chef-d\'œuvre aux tuiles vernissées et une cave privée sous la ville.'},
    {id:'alps-ski',dest:'alps',th:['mountain','vip'],img:'https://images.pexels.com/photos/34605838/pexels-photo-34605838.jpeg?auto=compress&cs=tinysrgb&w=600',en:'Ski in Courchevel',fr:'Ski à Courchevel',ben:'Private instructor, Michelin lunch on the slopes, ski-in chalet.',bfr:'Moniteur privé, déjeuner étoilé sur les pistes, chalet ski aux pieds.'},
    {id:'alps-montblanc',dest:'alps',th:['mountain','nature'],img:'https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&fit=crop&w=600&q=70',en:'Mont Blanc & Aiguille du Midi',fr:'Mont Blanc & Aiguille du Midi',ben:'Cable car to 3,842 m and the Mer de Glace, summits all around.',bfr:'Téléphérique à 3 842 m et la Mer de Glace, les sommets tout autour.'},
    {id:'alps-chalet',dest:'alps',th:['wellness','vip','mountain'],img:'https://images.pexels.com/photos/34605838/pexels-photo-34605838.jpeg?auto=compress&cs=tinysrgb&w=600',en:'Grand chalet & alpine spa',fr:'Grand chalet & spa alpin',ben:'A staffed chalet, private chef and a spa facing the peaks.',bfr:'Chalet avec personnel, chef privé et spa face aux sommets.'},
    {id:'sey-island',dest:'seychelles',th:['beach','vip','romance'],img:'https://images.unsplash.com/photo-1704317653969-0a8a5ea0dd10?auto=format&fit=crop&w=600&q=70',en:'Private island escape',fr:'Escapade sur une île privée',ben:'Your own slice of the Indian Ocean, villa and butler included.',bfr:'Votre coin d\'océan Indien, villa et majordome inclus.'},
    {id:'sey-snorkel',dest:'seychelles',th:['beach','nature'],img:'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=600&q=70',en:'Snorkeling the turquoise lagoons',fr:'Plongée dans les lagons turquoise',ben:'Granite coves, giant tortoises and reefs of Praslin and La Digue.',bfr:'Criques de granit, tortues géantes et récifs de Praslin et La Digue.'},
    {id:'corsica-coves',dest:'corsica',th:['beach','nature'],img:'https://images.unsplash.com/photo-1545129228-7a804588bf8e?auto=format&fit=crop&w=600&q=70',en:'Hidden coves by boat',fr:'Criques secrètes en bateau',ben:'A skippered day to the Lavezzi islands and Bonifacio cliffs.',bfr:'Une journée avec skipper aux îles Lavezzi et falaises de Bonifacio.'},
    {id:'corsica-gr20',dest:'corsica',th:['mountain','nature'],img:'https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=600&q=70',en:'Mountains meet the sea',fr:'La montagne rencontre la mer',ben:'From granite peaks to the shore — hiking and seaside in one trip.',bfr:'Des sommets de granit au rivage — randonnée et bord de mer réunis.'},
    {id:'normandy-msm',dest:'normandy',th:['culture','history','nature'],img:'https://images.pexels.com/photos/8430047/pexels-photo-8430047.jpeg?auto=compress&cs=tinysrgb&w=600',en:'Mont-Saint-Michel at low tide',fr:'Mont-Saint-Michel à marée basse',ben:'A guided barefoot crossing of the bay to the abbey.',bfr:'Une traversée guidée de la baie, pieds nus, jusqu\'à l\'abbaye.'},
    {id:'normandy-dday',dest:'normandy',th:['history','culture'],img:'https://images.unsplash.com/photo-1707209909974-8f0a3a3e2d3a?auto=format&fit=crop&w=600&q=70',en:'D-Day landing beaches',fr:'Plages du Débarquement',ben:'Omaha, the cemeteries and the batteries with an expert historian.',bfr:'Omaha, les cimetières et les batteries avec un historien expert.'},
    {id:'normandy-giverny',dest:'normandy',th:['art','romance','nature'],img:'https://images.unsplash.com/photo-1550948390-6eb7fa773072?auto=format&fit=crop&w=600&q=70',en:"Monet's garden at Giverny",fr:'Jardins de Monet à Giverny',ben:'The water-lily pond and the painter\'s house before opening hours.',bfr:'Le bassin aux nymphéas et la maison du peintre avant l\'ouverture.'}
  ];

  function L(o,a,b){return FR?o[a]:o[b];}
  function destName(id){for(var i=0;i<DESTS.length;i++){if(DESTS[i].id===id)return FR?DESTS[i].fr:DESTS[i].en;}return id;}
  function destUrl(id){for(var i=0;i<DESTS.length;i++){if(DESTS[i].id===id)return DESTS[i].url+(FR?'-fr':'')+'.html';}return '#';}
  function norm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}

  /* --- UI : construit les chips --- */
  var selThemes={},selDests={};
  var themeRow=document.getElementById('jrnyThemes'),destRow=document.getElementById('jrnyDests');
  THEMES.forEach(function(t){
    var b=document.createElement('button');b.type='button';b.className='chip';b.textContent=FR?t.fr:t.en;
    b.addEventListener('click',function(){selThemes[t.id]=!selThemes[t.id];b.classList.toggle('on',selThemes[t.id]);});
    themeRow.appendChild(b);
  });
  DESTS.forEach(function(d){
    var b=document.createElement('button');b.type='button';b.className='chip';b.textContent=FR?d.fr:d.en;
    b.addEventListener('click',function(){selDests[d.id]=!selDests[d.id];b.classList.toggle('on',selDests[d.id]);});
    destRow.appendChild(b);
  });

  /* --- moteur local --- */
  function localSuggest(text,themes,dests){
    var toks=norm(text).split(/\s+/).filter(Boolean);
    var any=themes.length||dests.length||toks.length;
    var scored=CAT.map(function(it){
      var s=0;
      themes.forEach(function(t){if(it.th.indexOf(t)!==-1)s+=3;});
      if(dests.indexOf(it.dest)!==-1)s+=4;
      var hay=norm((FR?it.fr+' '+it.bfr:it.en+' '+it.ben)+' '+it.th.join(' ')+' '+destName(it.dest));
      toks.forEach(function(tk){if(hay.indexOf(tk)!==-1)s+=1;});
      return {it:it,s:s};
    });
    if(!any){return CAT.slice(0,9);} /* rien de précisé : sélection par défaut */
    scored=scored.filter(function(x){return x.s>0;}).sort(function(a,b){return b.s-a.s;});
    return scored.slice(0,9).map(function(x){return x.it;});
  }

  /* --- rendu suggestions --- */
  var introEl=document.getElementById('jrnyIntro'),gridEl=document.getElementById('jrnyGrid'),resultsEl=document.getElementById('jrnyResults');
  var selection={};
  function cardHtml(it){
    var on=!!selection[it.id];
    return '<article class="jrny-exp"><img src="'+it.img+'" loading="lazy" onerror="this.onerror=null;this.src=\'assets/hero1.jpg\'" alt="'+L(it,'fr','en')+'">'+
      '<div class="b"><span class="dz">'+destName(it.dest)+'</span><h4>'+L(it,'fr','en')+'</h4>'+
      '<p>'+L(it,'bfr','ben')+'</p>'+
      '<button type="button" class="jrny-add'+(on?' on':'')+'" data-id="'+it.id+'">'+(on?TXT.added:('+ '+TXT.add))+'</button></div></article>';
  }
  function renderResults(list,intro){
    introEl.textContent=intro||(list.length?TXT.intro:TXT.none);
    gridEl.innerHTML=list.map(cardHtml).join('');
    resultsEl.hidden=false;
    gridEl.querySelectorAll('.jrny-add').forEach(function(btn){
      btn.addEventListener('click',function(){toggleSel(btn.getAttribute('data-id'));});
    });
    resultsEl.scrollIntoView({behavior:'smooth',block:'start'});
  }

  /* --- sélection --- */
  var selListEl=document.getElementById('jrnySelList'),selCountEl=document.getElementById('jrnyCount'),selHidden=document.getElementById('jrnySelected');
  function findCat(id){for(var i=0;i<CAT.length;i++){if(CAT[i].id===id)return CAT[i];}return null;}
  function toggleSel(id){
    selection[id]=!selection[id];
    if(!selection[id])delete selection[id];
    /* maj boutons visibles */
    gridEl.querySelectorAll('.jrny-add[data-id="'+id+'"]').forEach(function(b){
      var on=!!selection[id];b.classList.toggle('on',on);b.textContent=on?TXT.added:('+ '+TXT.add);
    });
    renderSelection();
  }
  function renderSelection(){
    var ids=Object.keys(selection);
    selCountEl.textContent=ids.length+(FR?(ids.length>1?' expériences':' expérience'):(ids.length>1?' experiences':' experience'));
    if(!ids.length){selListEl.innerHTML='<p class="jrny-empty">'+TXT.emptySel+'</p>';selHidden.value='';return;}
    selListEl.innerHTML=ids.map(function(id){var it=findCat(id);return '<div class="jrny-sel-item"><span>'+L(it,'fr','en')+'</span><span class="dz">'+destName(it.dest)+'</span><button type="button" class="jrny-sel-rm" data-id="'+id+'" aria-label="Remove">&times;</button></div>';}).join('');
    selListEl.querySelectorAll('.jrny-sel-rm').forEach(function(b){b.addEventListener('click',function(){toggleSel(b.getAttribute('data-id'));});});
    selHidden.value=ids.map(function(id){var it=findCat(id);return '• '+L(it,'fr','en')+' ('+destName(it.dest)+')';}).join('\n');
  }
  renderSelection();

  /* --- bouton "voir suggestions" --- */
  var goBtn=document.getElementById('jrnyGo'),taEl=document.getElementById('jrnyText');
  goBtn.addEventListener('click',function(){
    var text=taEl.value||'';
    var themes=Object.keys(selThemes).filter(function(k){return selThemes[k];});
    var dests=Object.keys(selDests).filter(function(k){return selDests[k];});
    if(AI_ENDPOINT){
      goBtn.disabled=true;goBtn.textContent=TXT.thinking;
      var payload={lang:FR?'fr':'en',text:text,themes:themes,destinations:dests,
        catalog:CAT.map(function(c){return {id:c.id,dest:c.dest,themes:c.th,title:FR?c.fr:c.en,blurb:FR?c.bfr:c.ben};})};
      fetch(AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
        .then(function(r){return r.json();})
        .then(function(res){
          var ids=(res&&res.ids)||[];
          var list=ids.map(findCat).filter(Boolean);
          if(!list.length)list=localSuggest(text,themes,dests);
          renderResults(list,res&&res.intro);
        })
        .catch(function(){renderResults(localSuggest(text,themes,dests));})
        .finally(function(){goBtn.disabled=false;goBtn.textContent=TXT.see;});
    }else{
      renderResults(localSuggest(text,themes,dests));
    }
  });

  /* --- envoi du formulaire (FormSubmit AJAX) --- */
  var f=document.getElementById('jrnyForm');
  if(f){
    var statusEl=document.getElementById('jrnyStatus');
    var sbtn=f.querySelector('button[type="submit"]');var sLabel=sbtn?sbtn.textContent:'';
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var honey=f.querySelector('[name="_honey"]');if(honey&&honey.value)return;
      var g=function(id){return (document.getElementById(id)||{}).value||'';};
      var who=(g('jf-first')+' '+g('jf-last')).trim();
      var data=new FormData();
      data.append('Name',who);
      data.append('email',g('jf-email'));
      data.append('Phone',g('jf-phone'));
      data.append(FR?'Dates':'Dates',g('jf-dates'));
      data.append(FR?'Voyageurs':'Travellers',g('jf-people'));
      data.append(TXT.selected,selHidden.value||(FR?'(aucune — à composer)':'(none — to be composed)'));
      data.append('Message',g('jf-msg'));
      data.append('Request type',FR?'Composez votre voyage':'Compose your journey');
      data.append('_subject',(FR?'Projet de voyage — ':'Journey request — ')+who);
      data.append('_template','table');data.append('_captcha','false');
      if(statusEl){statusEl.hidden=false;statusEl.className='cform-status';statusEl.textContent=TXT.sending;}
      if(sbtn){sbtn.disabled=true;sbtn.textContent=TXT.sending;}
      fetch('https://formsubmit.co/ajax/groups@ktstravel.com',{method:'POST',body:data,headers:{'Accept':'application/json'}})
        .then(function(r){return r.json();})
        .then(function(res){
          if(res&&(res.success===true||res.success==='true')){
            if(statusEl){statusEl.className='cform-status ok';statusEl.textContent=TXT.ok;}
            f.reset();selection={};renderSelection();
          }else{throw new Error('fail');}
        })
        .catch(function(){if(statusEl){statusEl.className='cform-status err';statusEl.textContent=TXT.err;}})
        .finally(function(){if(sbtn){sbtn.disabled=false;sbtn.textContent=sLabel;}});
    });
  }
})();
