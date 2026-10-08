(() => {
  const cards = [...document.querySelectorAll('[data-product]')];
  const filters = document.querySelector('[data-filters]');
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if (filters) {
    const search = document.querySelector('#search');
    const language = document.querySelector('#language');
    const format = document.querySelector('#format');
    const update = () => {
      const term = normalize(search.value.trim()); let count = 0;
      cards.forEach(card => {
        const visible = normalize(card.dataset.search).includes(term) && (!language.value || card.dataset.language === language.value) && (!format.value || card.dataset.format === format.value);
        card.hidden = !visible; if (visible) count++;
      });
      document.querySelector('[data-results]').textContent = count + (count === 1 ? ' producto' : ' productos');
      document.querySelector('[data-empty]').hidden = count !== 0;
    };
    filters.hidden = false;
    search.addEventListener('input',update); language.addEventListener('change',update); format.addEventListener('change',update);
    document.querySelector('#reset-filters').addEventListener('click',()=>{search.value='';language.value='';format.value='';update();search.focus();});
  }
  const share = document.querySelector('[data-share]');
  if (share && (navigator.share || navigator.clipboard?.writeText)) {
    share.hidden = false;
    share.addEventListener('click',async()=>{
      const url = document.querySelector('link[rel="canonical"]').href;
      const status = document.querySelector('[data-share-status]');
      try {
        if(navigator.share) await navigator.share({title:share.dataset.share,url});
        else {await navigator.clipboard.writeText(url);status.textContent='Enlace copiado.';}
      } catch(error) {if(error.name !== 'AbortError') status.textContent='Podés usar el enlace permanente o enviarlo por email.';}
    });
  }
})();
