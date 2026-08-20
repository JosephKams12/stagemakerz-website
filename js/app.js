document.addEventListener("DOMContentLoaded",()=>{
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const header=$("#siteHeader"), nav=$("#mainNav"), menu=$(".menu-toggle");
  const portfolioTrack=$("#portfolioCarousel");
  const portfolioCategoryOrder={stage:0,exhibition:1,pos:2,lighting:3};
  $$(".work-card",portfolioTrack).sort((a,b)=>(portfolioCategoryOrder[a.dataset.category]??99)-(portfolioCategoryOrder[b.dataset.category]??99)).forEach(card=>portfolioTrack?.append(card));

  // Mobile navigation.
  menu?.addEventListener("click",()=>{
    const open=nav.classList.toggle("open");
    menu.setAttribute("aria-expanded",String(open));
  });
  const closeNav=()=>{
    nav?.classList.remove("open");
    menu?.setAttribute("aria-expanded","false");
  };
  $$(".nav-link").forEach(a=>a.addEventListener("click",closeNav));

  // Header shadow.
  const onScroll=()=>header.classList.toggle("scrolled",scrollY>12);
  window.addEventListener("scroll",onScroll,{passive:true}); onScroll();

  // Smooth section navigation + active page marker.
  const links=$$(".nav-link");
  const sections=links.map(a=>$(a.getAttribute("href"))).filter(Boolean);
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const id="#"+entry.target.id;
        links.forEach(l=>l.classList.toggle("active",l.getAttribute("href")===id));
      }
    });
  },{rootMargin:"-30% 0px -60% 0px",threshold:0});
  sections.forEach(s=>observer.observe(s));

  // Lightweight reveal animations. No animation library.
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");revealObserver.unobserve(e.target)}})
  },{threshold:.12});
  $$(".reveal").forEach(el=>revealObserver.observe(el));

  // Keep the hero image controls in sync with the six-second image rotation.
  const heroIndicators=$$(".hero-slide-indicator");
  const heroScenes=$$(".motion-scene");
  if(heroIndicators.length){
    let activeHeroSlide=0;
    const setActiveHeroSlide=index=>{
      activeHeroSlide=index;
      heroIndicators.forEach((indicator,indicatorIndex)=>{
        const isActive=indicatorIndex===activeHeroSlide;
        indicator.classList.toggle("active",isActive);
        indicator.setAttribute("aria-pressed",String(isActive));
      });
      heroScenes.forEach((scene,sceneIndex)=>scene.classList.toggle("active",sceneIndex===activeHeroSlide));
    };
    heroIndicators.forEach((indicator,index)=>indicator.addEventListener("click",()=>setActiveHeroSlide(index)));
    if(!matchMedia("(prefers-reduced-motion: reduce)").matches){
      window.setInterval(()=>setActiveHeroSlide((activeHeroSlide+1)%heroIndicators.length),6000);
    }
  }

  // Give the project cards a subtle, pointer-led depth response without a heavy animation library.
  const motionCards=$$(".service-card, .work-card, .why-card, .contact-details, .map-card");
  motionCards.forEach((card,index)=>{
    card.style.setProperty("--card-index",index);
    card.addEventListener("pointermove",event=>{
      if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect=card.getBoundingClientRect();
      card.style.setProperty("--pointer-x",`${((event.clientX-rect.left)/rect.width)*100}%`);
      card.style.setProperty("--pointer-y",`${((event.clientY-rect.top)/rect.height)*100}%`);
      card.style.setProperty("--tilt-x",`${((event.clientY-rect.top)/rect.height-.5)*-5}deg`);
      card.style.setProperty("--tilt-y",`${((event.clientX-rect.left)/rect.width-.5)*5}deg`);
    });
    card.addEventListener("pointerleave",()=>{
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
  });

  // Service horizontal slider on small screens.
  const track=$("#serviceTrack");
  const scrollCards=(dir)=>{
    if(!track) return;
    const card=track.querySelector(".service-card");
    track.scrollBy({left:dir*(card?.getBoundingClientRect().width+20||300),behavior:"smooth"});
  };
  $("[data-service-prev]")?.addEventListener("click",()=>scrollCards(-1));
  $("[data-service-next]")?.addEventListener("click",()=>scrollCards(1));

  // Service -> portfolio filtering.
  $$(".service-portfolio").forEach(btn=>btn.addEventListener("click",()=>{
    const selected=btn.dataset.serviceSelect;
    const filter=selected==="Stage Set Design"?"stage":selected==="Exhibition Stands"?"exhibition":selected==="Product Display Units"?"pos":"lighting";
    $$(".filter").forEach(f=>{
      const active=f.dataset.filter===filter;
      f.classList.toggle("active",active);
      f.setAttribute("aria-pressed",String(active));
    });
    $$(".work-card").forEach(card=>card.classList.toggle("hidden-filter",filter!=="all"&&card.dataset.category!==filter&&card.dataset.project!==filter));
    document.querySelector("#portfolio")?.scrollIntoView({behavior:"smooth"});
  }));

  // Portfolio filters.
  $$(".filter").forEach(btn=>btn.addEventListener("click",()=>{
    const filter=btn.dataset.filter;
    $$(".filter").forEach(f=>{
      const active=f===btn;
      f.classList.toggle("active",active);
      f.setAttribute("aria-pressed",String(active));
    });
    $$(".work-card").forEach(card=>card.classList.toggle("hidden-filter",filter!=="all"&&card.dataset.category!==filter&&card.dataset.project!==filter));
  }));

  // Accordion.
  $$(".accordion-item").forEach(item=>item.addEventListener("click",()=>{
    $$(".accordion-item").forEach(x=>{if(x!==item)x.classList.remove("active")});
    item.classList.toggle("active");
  }));

  // Chat assistant.
  const panel=$("#chatPanel"), launcher=$("#chatLauncher"), launcherButton=$("#chatLauncher button"), backdrop=$("#chatBackdrop");
  let chatOpener=null;
  const openChat=event=>{
    chatOpener=document.activeElement;
    panel.classList.add("open");panel.setAttribute("aria-hidden","false");backdrop.style.display="block";document.body.style.overflow="hidden";
    setTimeout(()=>$("#serviceChoice")?.focus(),120);
  };
  const closeChat=()=>{
    if(!panel?.classList.contains("open"))return;
    panel.classList.remove("open");panel.setAttribute("aria-hidden","true");backdrop.style.display="none";document.body.style.overflow="";
    (chatOpener instanceof HTMLElement?chatOpener:launcherButton)?.focus();
  };
  launcher?.addEventListener("click",openChat); $("#chatClose")?.addEventListener("click",closeChat); backdrop?.addEventListener("click",closeChat);
  $$("[data-estimate]").forEach(b=>b.addEventListener("click",openChat));

  const states=["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","FCT / Abuja"];
  const stateSelect=$("#stateChoice");
  states.forEach(state=>{const option=document.createElement("option");option.value=state;option.textContent=state;stateSelect?.appendChild(option)});
  const serviceConfig={
    "Stage Set Design":{requirements:["Complete stage design","Conference stage","Awards / gala stage","Concert / entertainment stage","Custom stage"],features:["LED screen","Branded backdrop","Podium","Stage riser","Set walls / scenic elements","Lighting integration","Other"]},
    "Exhibition Stands":{requirements:["Custom exhibition stand","Shell scheme enhancement","Open-side exhibition stand","Island stand","Branded booth"],features:["Display shelves","Counter","LED / digital screen","Storage","Furniture","Product showcase","Lighting","Other"]},
    "Product Display Units":{requirements:["Freestanding display","Retail display unit","Product counter","Branded display wall","Custom display unit"],features:["Shelving","Storage","Counter","Product lighting","Brand graphics","Digital screen","Other"]},
    "Lighting & Special Effects":{requirements:["Stage lighting","Architectural lighting","Event lighting","Special effects","Full lighting package"],features:["Moving lights","LED lighting","Uplighting","Follow spot","Smoke / haze","LED screen integration","Other"]}
  };
  const serviceChoice=$("#serviceChoice"), serviceOptions=$("#serviceOptions"), serviceRequirement=$("#serviceRequirement"), serviceFeature=$("#serviceFeature");
  const populateSelect=(select,items,placeholder)=>{if(!select)return;select.innerHTML=`<option value="">${placeholder}</option>`+items.map(x=>`<option>${x}</option>`).join("")};
  serviceChoice?.addEventListener("change",()=>{const config=serviceConfig[serviceChoice.value];if(!config){serviceOptions.hidden=true;return}serviceOptions.hidden=false;populateSelect(serviceRequirement,config.requirements,"Select a requirement");populateSelect(serviceFeature,config.features,"Select a preferred feature")});
  const getProject=()=>{const service=$("#serviceChoice").value.trim(),requirement=$("#serviceRequirement").value.trim(),feature=$("#serviceFeature").value.trim(),eventType=$("#eventType").value.trim(),state=$("#stateChoice").value.trim(),size=$("#projectSize").value.trim(),brief=$("#projectBrief").value.trim();return {service,requirement,feature,eventType,state,size,brief};};
  const validate=()=>{
    const p=getProject();
    if(!p.service){$("#chatStatus").textContent="Please choose a service first.";return false}
    if(!p.state){$("#chatStatus").textContent="Please select the project location/state.";return false}
    if(!p.brief){$("#chatStatus").textContent="Please describe the stage or event environment you want.";return false}
    $("#chatStatus").textContent="Great — your project details are ready.";
    return true;
  };
  $("#chatContinue")?.addEventListener("click",validate);
  $("#chatCall")?.addEventListener("click",()=>{
    if(!validate())return;
    window.location.href="tel:+2348033070460";
  });
  $("#chatWhatsApp")?.addEventListener("click",()=>{
    if(!validate())return;
    const p=getProject();
    const message=`Hello Stagemakerz, I would like a free estimate.%0A%0AService: ${encodeURIComponent(p.service)}%0ARequirement: ${encodeURIComponent(p.requirement||"Not specified")}%0APreferred feature: ${encodeURIComponent(p.feature||"Not specified")}%0AEvent/Occasion: ${encodeURIComponent(p.eventType||"Not specified")}%0AProject location: ${encodeURIComponent(p.state||"Not specified")}%0ASize/Venue: ${encodeURIComponent(p.size||"Not specified")}%0AProject details: ${encodeURIComponent(p.brief)}`;
    window.open(`https://wa.me/2348033070460?text=${message}`,"_blank","noopener");
  });

  // Selected works carousel.
  const portfolioCarousel=$("#portfolioCarousel");
  const portfolioProgress=$("#portfolioProgress");
  const portfolioStep=()=>Math.max(260,(portfolioCarousel?.querySelector(".work-card")?.getBoundingClientRect().width||300)+20);
  $("[data-portfolio-prev]")?.addEventListener("click",()=>portfolioCarousel?.scrollBy({left:-portfolioStep(),behavior:"smooth"}));
  $("[data-portfolio-next]")?.addEventListener("click",()=>portfolioCarousel?.scrollBy({left:portfolioStep(),behavior:"smooth"}));
  const updatePortfolioProgress=()=>{
    if(!portfolioCarousel||!portfolioProgress)return;
    const range=Math.max(1,portfolioCarousel.scrollWidth-portfolioCarousel.clientWidth);
    const progress=Math.min(100,Math.max(0,(portfolioCarousel.scrollLeft/range)*100));
    portfolioProgress.style.setProperty("--portfolio-progress",`${progress}%`);
    portfolioProgress.setAttribute("aria-valuenow",String(Math.round(progress)));
  };
  portfolioCarousel?.addEventListener("scroll",()=>requestAnimationFrame(updatePortfolioProgress),{passive:true});
  window.addEventListener("resize",updatePortfolioProgress);
  updatePortfolioProgress();

  // Selected work lightbox: click a card to bring the image forward with a focused, animated view.
  const lightbox=$("#galleryLightbox"), lightboxImage=$("#galleryImage"), lightboxCaption=$("#galleryCaption"), galleryCount=$("#galleryCount"), shareMenu=$("#galleryShareMenu");
  const galleryCards=$$(".work-card"), galleryItems=galleryCards.map(card=>({src:$("img",card).src,alt:$("img",card).alt,title:$("h3",card)?.textContent||"Selected work"}));
  let galleryIndex=0, galleryOpener=null;
  const syncShareLinks=()=>{
    const item=galleryItems[galleryIndex], page=encodeURIComponent(location.href), image=encodeURIComponent(item.src), title=encodeURIComponent(item.title);
    $("#shareFacebook").href=`https://www.facebook.com/sharer/sharer.php?u=${page}`;
    $("#shareInstagram").href=`https://www.instagram.com/?url=${image}`;
    $("#shareX").href=`https://twitter.com/intent/tweet?url=${page}&text=${title}`;
    $("#sharePinterest").href=`https://pinterest.com/pin/create/button/?url=${page}&media=${image}&description=${title}`;
    $("#galleryDownload").href=item.src;
  };
  const showGalleryItem=index=>{
    galleryIndex=(index+galleryItems.length)%galleryItems.length;
    const item=galleryItems[galleryIndex];
    lightboxImage.classList.remove("is-zoomed"); const zoomButton=$("#galleryZoom"); if(zoomButton){zoomButton.setAttribute("aria-pressed","false");zoomButton.setAttribute("aria-label","Zoom in");zoomButton.textContent="＋";}
    lightboxImage.classList.remove("is-visible");
    lightboxImage.src=item.src; lightboxImage.alt=item.alt; lightboxCaption.textContent=item.title;
    galleryCount.textContent=`${galleryIndex+1} / ${galleryItems.length}`;
    syncShareLinks();
    requestAnimationFrame(()=>lightboxImage.classList.add("is-visible"));
  };
  const openGallery=(index,opener)=>{galleryOpener=opener; lightbox.hidden=false; lightbox.classList.add("open"); lightbox.setAttribute("aria-hidden","false"); document.body.classList.add("gallery-open"); showGalleryItem(index); $("[data-gallery-close]",lightbox)?.focus();};
  const closeGallery=()=>{if(!lightbox?.classList.contains("open"))return;lightbox.classList.remove("open");lightbox.setAttribute("aria-hidden","true");lightbox.hidden=true;document.body.classList.remove("gallery-open");lightboxImage.classList.remove("is-zoomed");const zoomButton=$("#galleryZoom");if(zoomButton){zoomButton.setAttribute("aria-pressed","false");zoomButton.setAttribute("aria-label","Zoom in");zoomButton.textContent="＋";}shareMenu.hidden=true;$("#galleryShare")?.setAttribute("aria-expanded","false");galleryOpener?.focus();};
  galleryCards.forEach((card,index)=>{card.dataset.galleryIndex=index;card.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();openGallery(index,card)}})});
  // Delegation keeps card clicks reliable even when filters or carousel layout change.
  portfolioCarousel?.addEventListener("click",event=>{const card=event.target.closest(".work-card");if(!card||!portfolioCarousel.contains(card))return;openGallery(Number(card.dataset.galleryIndex),card)});
  $$("[data-gallery-close]").forEach(button=>button.addEventListener("click",closeGallery));
  $("#galleryPrev")?.addEventListener("click",()=>showGalleryItem(galleryIndex-1)); $("#galleryNext")?.addEventListener("click",()=>showGalleryItem(galleryIndex+1));
  $("#galleryShare")?.addEventListener("click",event=>{shareMenu.hidden=!shareMenu.hidden;event.currentTarget.setAttribute("aria-expanded",String(!shareMenu.hidden))});
  $("#galleryZoom")?.addEventListener("click",event=>{const zoomed=lightboxImage.classList.toggle("is-zoomed");event.currentTarget.setAttribute("aria-pressed",String(zoomed));event.currentTarget.setAttribute("aria-label",zoomed?"Zoom out":"Zoom in");event.currentTarget.textContent=zoomed?"−":"＋";});
  lightboxImage?.addEventListener("click",()=>$("#galleryZoom")?.click());
  $("#galleryFullscreen")?.addEventListener("click",()=>{if(!document.fullscreenElement)lightbox?.requestFullscreen?.();else document.exitFullscreen?.()});
  $("#shareInstagram")?.addEventListener("click",()=>{navigator.clipboard?.writeText(galleryItems[galleryIndex].src).then(()=>$("#galleryShareStatus").textContent="Image link copied — paste it into your Instagram post.").catch(()=>$("#galleryShareStatus").textContent="Save the image, then add it to your Instagram post.")});

  // Keyboard escape.
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){if(lightbox?.classList.contains("open")){closeGallery();return}closeChat();return}
    if(lightbox?.classList.contains("open")){if(e.key==="ArrowLeft")showGalleryItem(galleryIndex-1);if(e.key==="ArrowRight")showGalleryItem(galleryIndex+1);if(e.key==="+")$("#galleryZoom")?.click();return}
    if(e.key!=="Tab"||!panel?.classList.contains("open"))return;
    const focusable=$$("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",panel);
    if(!focusable.length)return;
    const first=focusable[0],last=focusable.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
});
